/* One direct analytics owner per brand; CCM19 is the sole consent authority. */
(() => {
  'use strict';
  const codariq = /^(www\.)?codariq\.de$/.test(location.hostname);
  const stack = /^(www\.)?stackwerkhaus\.de$/.test(location.hostname);
  if ((!codariq && !stack) || window.SiteTracking) return;
  // Existing optional embedding confirmed saved by the owner-side CCM19 session.
  const CODARIQ_GA_EMBEDDING_ID = '69fe4877844fd7fae405f521';
  const cfg = codariq
    ? {domain: 'codariq.de', prefix: 'codariq', ga: 'G-PV0P0WH6KY', clarity: 'zeppteq0b1',
       ids: {ga: CODARIQ_GA_EMBEDDING_ID, clarity: '6afca5017b271d470f072562'}}
    : {domain: 'stackwerkhaus.de', prefix: 'stackwerkhaus', ga: 'G-9WPXK6PNZ7', clarity: 'wmex88aqgx',
       ids: {ga: '69e4075064eadf05030fa073', clarity: '6a0139cef5c2593ea302ae5c'}};
  const loaderIds = codariq
    ? {ga: 'codariq-ga4-loader', clarity: 'codariq-clarity-loader'}
    : {ga: 'stackwerkhaus-ga4-loader', clarity: 'stackwerkhaus-clarity-loader'};
  const names = new Set(['page_view', 'growth_cta_view', 'growth_cta_click', 'growth_form_start',
    'growth_form_step', 'growth_form_error', 'growth_form_success', 'growth_scroll_25',
    'growth_scroll_50', 'growth_scroll_75', 'growth_scroll_90', 'website_check_cta_click',
    'website_check_form_start', 'website_check_form_submit', 'thank_you_page_view', 'booking_click_after_check']);
  const enums = {
    cta_id: new Set(['contact', 'website_check', 'booking', 'services', 'academy', 'blog']),
    form_id: new Set(['contact', 'website_check']),
    placement: new Set(['nav', 'nav_desktop', 'nav_mobile', 'hero', 'footer', 'contact_section',
      'blog_list_title', 'blog_list_cta', 'checker_hero_primary', 'checker_hero_secondary',
      'thank_you_direct_booking', 'thank_you_audit_offer', 'checker_audit_offer_after_form',
      'checker_audit_offer', 'contact_alt_cta', 'services_process', 'home_hero_primary']),
    step: new Set(['contact', 'website', 'url', 'current_state', 'goals', '0', '1', '2', '3']),
    error_code: new Set(['validation', 'network', 'rate_limited', 'rejected', 'server', 'invalid_response'])
  };
  let previous = {ga: false, clarity: false}, started = {ga: false, clarity: false};
  let revoking = false, lastPage = null;
  const denied = {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'};
  function consent() {
    const cmp = window.CCM;
    const selected = cmp?.consent === true && cmp.requiresConsentUpdate !== true ? cmp.acceptedEmbeddings : [];
    const has = kind => !revoking && !!cfg.ids[kind] && Array.isArray(selected) && selected.some(e => e.id === cfg.ids[kind]);
    return {ga: has('ga'), clarity: has('clarity')};
  }
  function cleanURL(value) {
    try {
      const u = new URL(value);
      if (!/^https?:$/.test(u.protocol)) return '';
      // Referrers outside our site contribute origin only, never private paths.
      return u.origin === location.origin && /^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]*$/.test(u.pathname)
        && !/\d{7}|[a-f0-9]{24}/i.test(u.pathname) ? u.origin + u.pathname : u.origin + '/';
    } catch { return ''; }
  }
  function event(name, params = {}) {
    if (!names.has(name) || !started.ga || !consent().ga) return false;
    const safe = {};
    for (const [key, value] of Object.entries(params)) {
      if (enums[key]?.has(String(value))) safe[key] = String(value);
      if (key === 'percent_scrolled' && [25, 50, 75, 90].includes(value)) safe[key] = value;
      if (key === 'goals_count' && Number.isInteger(value) && value >= 0 && value <= 20) safe[key] = value;
      if (key === 'newsletter_opt_in' && typeof value === 'boolean') safe[key] = value;
    }
    window.gtag('event', name, {...safe, send_to: cfg.ga,
      page_location: cleanURL(location.href), page_referrer: cleanURL(document.referrer)});
    return true;
  }
  const runtime = Object.freeze({consent, event});
  window.SiteTracking = runtime;
  if (stack) window.StackTracking = runtime;
  if (codariq) {
    window.CODARIQTracking = runtime;
    window.CODARIQConsent = Object.freeze({clarityAllowed: () => consent().clarity, gaAllowed: () => consent().ga});
    try { localStorage.removeItem('codariq:clarity-consent:v1'); } catch { /* storage blocked */ }
  }
  window['ga-disable-' + cfg.ga] = true;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', denied);
  function claritySignal(allow) {
    if (typeof window.clarity !== 'function') {
      const stub = function () { stub.q.push(arguments); }; stub.q = []; window.clarity = stub;
    }
    window.clarity('consentv2', {analytics_Storage: allow ? 'granted' : 'denied', ad_Storage: 'denied'});
  }
  function removeCookies(kind) {
    const names = document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(name =>
      kind === 'legacy' ? name === 'CookieConsent' : kind === 'ga' ? /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)|^_gac_/.test(name) : /^_cl(?:ck|sk)$/.test(name));
    const parts = location.pathname.split('/'), paths = new Set(['/']);
    while (parts.length > 1) { paths.add(parts.join('/')); paths.add(parts.join('/') + '/'); parts.pop(); }
    for (const name of names) for (const path of paths) for (const domain of new Set(['', location.hostname, '.' + location.hostname, cfg.domain, '.' + cfg.domain])) {
      document.cookie = name + '=; Max-Age=0; Path=' + path + (domain ? '; Domain=' + domain : '') + '; SameSite=Lax; Secure';
    }
  }
  removeCookies('legacy');
  function load(kind, src) {
    const id = loaderIds[kind];
    if (document.getElementById(id)) return;
    const script = document.createElement('script'); script.id = id; script.async = true; script.src = src;
    if (kind === 'clarity') script.dataset.clarityLoader = 'true';
    document.head.appendChild(script);
  }
  function pageView() {
    // GA4 pageChangesEnabled is disabled by the bounded admin setup;
    // this runtime owns initial and SPA views, once per actual pathname.
    if (!started.ga || !consent().ga || lastPage === location.pathname) return;
    lastPage = location.pathname;
    event('page_view');
  }
  function sync() {
    if (revoking || !window.CCM) return;
    const current = consent();
    if ((previous.ga && !current.ga) || (previous.clarity && !current.clarity)) {
      revoking = true;
      window['ga-disable-' + cfg.ga] = true;
      window.gtag('consent', 'update', denied);
      if (started.clarity) claritySignal(false);
      if (!current.ga) removeCookies('ga');
      if (!current.clarity) removeCookies('clarity');
      location.reload(); return;
    }
    if (!current.ga) removeCookies('ga');
    if (!current.clarity) removeCookies('clarity');
    if (current.ga && !started.ga) {
      started.ga = true; window['ga-disable-' + cfg.ga] = false;
      window.gtag('consent', 'update', {...denied, analytics_storage: 'granted'});
      window.gtag('js', new Date());
      window.gtag('config', cfg.ga, {send_page_view: false, allow_google_signals: false,
        allow_ad_personalization_signals: false, page_location: cleanURL(location.href), page_referrer: cleanURL(document.referrer)});
      load('ga', 'https://www.googletagmanager.com/gtag/js?id=' + cfg.ga); pageView();
    }
    if (current.clarity && !started.clarity) { started.clarity = true; claritySignal(true); load('clarity', 'https://www.clarity.ms/tag/' + cfg.clarity); }
    const changed = previous.ga !== current.ga || previous.clarity !== current.clarity;
    previous = current;
    if (changed) window.dispatchEvent(new Event('growth:consent'));
  }
  for (const name of ['ccm19WidgetLoaded', 'ccm19WidgetClosed', 'ccm19EmbeddingAccepted', 'ccm19WidgetOpened', 'pageshow']) window.addEventListener(name, sync);
  window.addEventListener('growth:navigation', pageView);
  window.addEventListener('popstate', pageView);
  document.addEventListener('click', e => {
    if (e.target instanceof Element && e.target.closest('[data-ccm19-settings]') && typeof window.CCM?.openWidget === 'function') {
      e.preventDefault(); window.CCM.openWidget();
    }
  });
  sync();
})();
