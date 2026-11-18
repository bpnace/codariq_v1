/* CODARIQ: CCM19 is the only consent authority and UI. No fallback banner. */
(() => {
  "use strict";
  if (window.CODARIQConsent) return;
  if (!/^(www\.)?codariq\.de$/.test(location.hostname)) return;
  let started = false;
  let revoking = false;
  function clarityAllowed() {
    const cmp = window.CCM;
    return !revoking && cmp?.consent === true && cmp.requiresConsentUpdate !== true &&
      Array.isArray(cmp.acceptedEmbeddings) && cmp.acceptedEmbeddings.some(
        embedding => embedding?.name === "Microsoft Clarity"
      );
  }
  window.CODARIQConsent = Object.freeze({clarityAllowed});
  // The old site's separate consent is deliberately not imported into CCM19.
  try { localStorage.removeItem("codariq:clarity-consent:v1"); } catch { /* storage may be blocked */ }
  function signal(analytics) {
    if (typeof window.clarity !== "function") {
      const stub = function () { stub.q.push(arguments); };
      stub.q = [];
      window.clarity = stub;
    }
    window.clarity("consentv2", {analytics_Storage: analytics, ad_Storage: "denied"});
  }
  function sync() {
    if (revoking) return;
    if (clarityAllowed()) {
      if (started) return;
      signal("granted");
      started = true;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.clarity.ms/tag/zeppteq0b1";
      script.dataset.clarityLoader = "true";
      document.head.appendChild(script);
    } else if (started) {
      // Stop the current vendor runtime as well as our own event adapter.
      revoking = true;
      signal("denied");
      location.reload();
    }
  }
  for (const event of ["ccm19WidgetLoaded", "ccm19WidgetClosed", "ccm19EmbeddingAccepted", "ccm19WidgetOpened", "pageshow"]) {
    window.addEventListener(event, sync);
  }
  document.addEventListener("click", event => {
    const button = event.target instanceof Element ? event.target.closest("[data-ccm19-settings]") : null;
    if (button && typeof window.CCM?.openWidget === "function") {
      event.preventDefault();
      window.CCM.openWidget();
    }
  });
  sync();
})();
