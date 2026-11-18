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
    "blog_list_title", "blog_list_cta", "checker_hero_primary", "checker_hero_secondary",
    "thank_you_direct_booking", "thank_you_audit_offer", "checker_audit_offer_after_form",
    "checker_audit_offer", "contact_alt_cta", "services_process", "home_hero_primary"]);
  const contactFormId = "contact";
  let path = location.pathname;
  let sent = new Set();
  function consent() {
    if (stack) {
      return window.StackTracking?.consent() || {ga: false, clarity: false};
    }
    return window.SiteTracking?.consent() || {ga: false, clarity: window.CODARIQConsent?.clarityAllowed() === true};
  }
  function syncPath() {
    if (path !== location.pathname) { path = location.pathname; sent = new Set(); }
  }
  function emit(name, params = {}, once = false) {
    syncPath();
    const c = consent();
    const identity = [name, params.cta_id || params.form_id, params.placement, params.step, params.error_code].filter(Boolean);
    const key = identity.join(":");
    if (c.ga && (!once || !sent.has("ga:" + key)) && (window.SiteTracking || window.StackTracking)?.event?.(name, params)) {
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
      emit("growth_form_step", {...params, step: "contact"}, true);
    }
  }, {passive: true});
  // The site's existing handler dispatches on its marked form after backend acceptance.
  document.addEventListener("growth:form-accepted", event => {
    const params = formParams(event.target);
    if (params) emit("growth_form_success", params);
  });
  const errorCodes = new Set(["validation", "network", "rate_limited", "rejected", "server", "invalid_response"]);
  document.addEventListener("growth:form-error", event => {
    const params = formParams(event.target);
    const code = event.detail?.code;
    if (params && errorCodes.has(code)) emit("growth_form_error", {...params, error_code: code});
  });
  document.addEventListener("invalid", event => {
    const params = formParams(event.target?.form);
    if (params) emit("growth_form_error", {...params, error_code: "validation"}, true);
  }, true);
  // A view means >=50% of a marked CTA was visible for >=1 second while
  // consent was active. It is not proof of reading or a user-level funnel.
  const observed = new WeakSet(), visible = new Set(), timers = new Map();
  function scheduleView(element) {
    if (timers.has(element) || document.visibilityState !== "visible") return;
    const c = consent(); if (!c.ga && !c.clarity) return;
    timers.set(element, setTimeout(() => {
      timers.delete(element);
      if (!element.isConnected || !visible.has(element) || document.visibilityState !== "visible") return;
      const id = element.dataset.growthCta || element.dataset.growthView;
      const placement = element.dataset.growthPlacement;
      if (allowedIds.has(id) && placements.has(placement)) emit("growth_cta_view", {cta_id: id, placement}, true);
    }, 1000));
  }
  const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) { visible.add(entry.target); scheduleView(entry.target); }
      else { visible.delete(entry.target); clearTimeout(timers.get(entry.target)); timers.delete(entry.target); }
    }
  }, {threshold: [0, 0.5]}) : null;
  function scan() {
    if (!observer) return;
    for (const element of document.querySelectorAll("[data-growth-cta], [data-growth-view]")) {
      if (!observed.has(element)) { observed.add(element); observer.observe(element); }
    }
    for (const element of visible) {
      if (element.isConnected) scheduleView(element); else visible.delete(element);
    }
  }
  const resetViews = () => { for (const timer of timers.values()) clearTimeout(timer); timers.clear(); scan(); };
  window.addEventListener("growth:consent", resetViews);
  window.addEventListener("growth:navigation", resetViews);
  document.addEventListener("visibilitychange", resetViews);
  new MutationObserver(records => {
    if (records.some(r => [...r.addedNodes].some(n => n instanceof Element &&
      (n.matches("[data-growth-cta],[data-growth-view]") || n.querySelector("[data-growth-cta],[data-growth-view]"))))) scan();
  }).observe(document.documentElement, {childList: true, subtree: true});
  scan();
})();
