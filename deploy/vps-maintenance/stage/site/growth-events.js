/* First-party interaction adapter. Only allowlisted action IDs, no visitor or form data. */
(() => {
  "use strict";
  if (window.__growthEventsInstalled) return;
  window.__growthEventsInstalled = true;
  const host = location.hostname;
  const stack = /^(www\.)?stackwerkhaus\.de$/.test(host);
  const codariq = /^(www\.)?codariq\.de$/.test(host);
  if (!stack && !codariq) return;
  const allowedIds = new Set(["contact", "website_check", "booking", "services", "academy", "blog"]);
  const placements = new Set(["nav_desktop", "nav_mobile", "nav", "hero", "footer", "contact_section",
    "blog_list_title", "blog_list_cta"]);
  const contactFormId = "contact";
  let path = location.pathname;
  let sent = new Set();
  function consent() {
    if (stack) {
      return window.StackTracking?.consent() || {ga: false, clarity: false};
    }
    return {ga: false, clarity: window.CODARIQConsent?.clarityAllowed() === true};
  }
  function syncPath() {
    if (path !== location.pathname) { path = location.pathname; sent = new Set(); }
  }
  function emit(name, params = {}, once = false) {
    syncPath();
    const c = consent();
    const identity = [name, params.cta_id || params.form_id, params.placement].filter(Boolean);
    const key = identity.join(":");
    if (c.ga && (!once || !sent.has("ga:" + key)) && window.StackTracking?.event?.(name, params)) {
      if (once) sent.add("ga:" + key);
    }
    if (c.clarity && typeof window.clarity === "function" && (!once || !sent.has("clarity:" + key))) {
      window.clarity("event", identity.join("_")); if (once) sent.add("clarity:" + key);
    }
  }
  let framePending = false;
  window.addEventListener("growth:navigation", () => { path = location.pathname; sent = new Set(); });
  window.addEventListener("popstate", syncPath);
  window.addEventListener("scroll", () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(() => {
      framePending = false; syncPath();
      const range = document.documentElement.scrollHeight - innerHeight;
      if (range <= 0) return;
      const depth = Math.max(0, Math.min(100, scrollY / range * 100));
      for (const threshold of [25, 50, 75, 90]) {
        if (depth >= threshold) emit("growth_scroll_" + threshold, {percent_scrolled: threshold}, true);
      }
    });
  }, {passive: true});
  document.addEventListener("click", event => {
    const element = event.target instanceof Element ? event.target.closest("[data-growth-cta]") : null;
    const id = element?.getAttribute("data-growth-cta");
    if (!allowedIds.has(id)) return;
    // Only explicitly marked CTAs; existing measured buttons stay unmarked.
    const placement = element.getAttribute("data-growth-placement");
    emit("growth_cta_click", {cta_id: id, ...(placements.has(placement) ? {placement} : {})});
  }, {passive: true});
  function formParams(form) {
    if (!(form instanceof HTMLFormElement) || form.dataset.growthForm !== contactFormId) return null;
    const placement = form.dataset.growthPlacement;
    return {form_id: contactFormId, ...(placements.has(placement) ? {placement} : {})};
  }
  document.addEventListener("input", event => {
    const params = formParams(event.target?.form);
    if (params && event.target.type !== "hidden" && event.target.tabIndex >= 0) {
      emit("growth_form_start", params, true);
    }
  }, {passive: true});
  // The site's existing handler dispatches on its marked form after backend acceptance.
  document.addEventListener("growth:form-accepted", event => {
    const params = formParams(event.target);
    if (params) emit("growth_form_success", params);
  });
})();
