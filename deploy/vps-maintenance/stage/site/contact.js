(() => {
  const dialog = document.getElementById('contact-dialog');
  const form = document.getElementById('contact-form');
  if (!dialog || !form) return;

  const status = document.getElementById('contact-status');
  const submit = document.getElementById('contact-submit');
  let openedAt = 0;
  let opener = null;
  let sending = false;

  document.querySelectorAll('[data-open-contact]').forEach(link => {
    link.addEventListener('click', event => {
      if (typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      opener = link;
      form.dataset.growthPlacement = link.dataset.growthPlacement;
      openedAt = Date.now();
      status.textContent = '';
      delete status.dataset.state;
      dialog.showModal();
    });
  });
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus());

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const values = new FormData(form);
    if (String(values.get('website') || '').trim()) return;
    if (Date.now() - openedAt < 3000) {
      status.textContent = 'Bitte nimm dir einen Moment Zeit, um das Formular auszufüllen.';
      status.dataset.state = 'error';
      return;
    }
    const payload = {
      name: String(values.get('name') || '').trim(),
      company: String(values.get('company') || '').trim(),
      email: String(values.get('email') || '').trim(),
      phone: String(values.get('phone') || '').trim(),
      message: String(values.get('message') || '').trim(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      source: 'final_cta',
      dataProcessingConsent: values.has('dataProcessingConsent'),
      newsletterConsent: values.has('newsletterConsent')
    };
    if (!payload.name || !payload.company || !payload.message) return;

    sending = true;
    submit.disabled = true;
    status.textContent = 'Anfrage wird gesendet …';
    delete status.dataset.state;
    try {
      const response = await fetch('/webhook-proxy.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(String(response.status));
      const receipt = await response.json().catch(() => null);
      if (receipt?.success === true) form.dispatchEvent(new Event("growth:form-accepted", {bubbles: true}));
      status.textContent = 'Danke! Deine Anfrage wurde gesendet.';
      status.dataset.state = 'success';
      form.reset();
    } catch (error) {
      status.textContent = error.message === '429'
        ? 'Zu viele Anfragen. Bitte versuche es später erneut.'
        : 'Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut oder schreibe an kontakt@codariq.de.';
      status.dataset.state = 'error';
    } finally {
      sending = false;
      submit.disabled = false;
    }
  });
})();
