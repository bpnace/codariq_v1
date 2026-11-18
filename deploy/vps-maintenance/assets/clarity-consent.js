(function () {
  'use strict';

  var STORAGE_KEY = 'codariq:clarity-consent:v1';
  var VERSION = 1;
  var CLARITY_URL = 'https://www.clarity.ms/tag/zeppteq0b1';
  var fallbackChoice = null;
  var clarityStarted = false;
  var banner = document.getElementById('analytics-consent');
  var bannerHeading = document.getElementById('analytics-consent-heading');
  var settingsButtons = document.querySelectorAll('[data-clarity-settings]');
  var lastOpener = null;

  if (!banner) return;

  function addSixMonths(timestamp) {
    var date = new Date(timestamp);
    date.setMonth(date.getMonth() + 6);
    return date.getTime();
  }

  function readChoice() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      var record = JSON.parse(raw);
      if (
        !record ||
        record.version !== VERSION ||
        (record.choice !== 'allow' && record.choice !== 'deny') ||
        typeof record.expiresAt !== 'number' ||
        record.expiresAt <= Date.now()
      ) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return record.choice;
    } catch (error) {
      return null;
    }
  }

  function currentChoice() {
    return fallbackChoice || readChoice();
  }

  function saveChoice(choice) {
    var record = {
      version: VERSION,
      choice: choice,
      expiresAt: addSixMonths(Date.now())
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      fallbackChoice = null;
    } catch (error) {
      // Keep the explicit choice for this page only when browser storage is unavailable.
      fallbackChoice = choice;
    }
  }

  function setExpanded(isExpanded) {
    settingsButtons.forEach(function (button) {
      button.setAttribute('aria-expanded', String(isExpanded));
    });
  }

  function showBanner(opener, shouldFocus) {
    if (opener) lastOpener = opener;
    banner.hidden = false;
    setExpanded(true);
    if (shouldFocus && bannerHeading) bannerHeading.focus();
  }

  function hideBanner(restoreFocus) {
    banner.hidden = true;
    setExpanded(false);

    if (!restoreFocus) {
      lastOpener = null;
      return;
    }

    var target = lastOpener;
    if (!target || !target.isConnected) {
      target = document.querySelector('[data-clarity-settings]');
    }
    if (target && typeof target.focus === 'function') target.focus();
    lastOpener = null;
  }

  function queueConsent(analyticsStorage, adStorage) {
    if (typeof window.clarity !== 'function') {
      var clarityStub = function () {
        clarityStub.q.push(arguments);
      };
      clarityStub.q = [];
      window.clarity = clarityStub;
    }

    window.clarity('consentv2', {
      analytics_Storage: analyticsStorage,
      ad_Storage: adStorage
    });
  }

  function startClarity() {
    if (clarityStarted || currentChoice() !== 'allow') return;

    // Queue the consent decision before the vendor script can execute.
    queueConsent('granted', 'denied');
    clarityStarted = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = CLARITY_URL;
    script.setAttribute('data-clarity-loader', 'true');
    document.head.appendChild(script);
  }

  function revokeAndReload() {
    if (typeof window.clarity === 'function') {
      queueConsent('denied', 'denied');
    }
    window.location.reload();
  }

  function applyStoredChoice(choice) {
    if (choice === 'allow') {
      hideBanner(false);
      startClarity();
      return;
    }

    if (choice === 'deny') {
      hideBanner(false);
      return;
    }

    showBanner(null, false);
  }

  settingsButtons.forEach(function (button) {
    button.setAttribute('aria-controls', 'analytics-consent');
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', function () {
      showBanner(button, true);
    });
  });

  banner.querySelector('[data-clarity-deny]').addEventListener('click', function () {
    var wasGranted = currentChoice() === 'allow';
    saveChoice('deny');

    if (wasGranted || clarityStarted) {
      revokeAndReload();
      return;
    }

    hideBanner(true);
  });

  banner.querySelector('[data-clarity-allow]').addEventListener('click', function () {
    saveChoice('allow');
    hideBanner(true);
    startClarity();
  });

  window.addEventListener('storage', function (event) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;

    var choice = readChoice();
    if (clarityStarted && choice !== 'allow') {
      fallbackChoice = choice;
      revokeAndReload();
      return;
    }

    fallbackChoice = null;
    applyStoredChoice(choice);
  });

  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;

    var choice = currentChoice();
    if (clarityStarted && choice !== 'allow') {
      fallbackChoice = choice;
      revokeAndReload();
      return;
    }

    fallbackChoice = null;
    applyStoredChoice(choice);
  });

  applyStoredChoice(currentChoice());
})();
