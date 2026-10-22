import { createSubmissionState } from './signup-state.mjs';

const form = document.querySelector('#signup-form');
const fields = document.querySelector('#signup-fields');
const email = document.querySelector('#signup-email');
const consent = document.querySelector('#signup-consent');
const submit = document.querySelector('#signup-submit');
const enable = document.querySelector('#signup-enable');
const status = document.querySelector('#signup-status');
const captchaHost = document.querySelector('#signup-captcha');
let ready = false;
let pending = false;
let widget;
let providerHooked = false;
let completed = false;
const scripts = new Map();

function announce(message, error = false) {
  status.textContent = message;
  status.classList.toggle('field-error', error);
  if (error) status.focus();
}

const submission = createSubmissionState((state, message) => {
  pending = state === 'pending';
  completed = state === 'success';
  form.setAttribute('aria-busy', String(pending));
  submit.disabled = pending || completed;
  submit.textContent = pending ? 'Joining…' : 'Join the Early-Access List';
  announce(message, state === 'idle');
}, () => {
  // Only the provider's accepted-response callback reaches this destination.
  window.location.assign('/thank-you/');
});

window.ml_webform_success_47493120 = () => submission.succeed();

function resetCaptcha() {
  if (widget !== undefined && window.grecaptcha) window.grecaptcha.reset(widget);
}

function fail(message) {
  submission.fail(message);
  resetCaptcha();
}

function loadScript(url) {
  if (scripts.has(url)) return scripts.get(url);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    const timer = setTimeout(() => reject(new Error('Script load timed out')), 15000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      scripts.delete(url);
      reject(new Error('Script blocked or unavailable'));
    };
    document.head.append(script);
  });
  scripts.set(url, promise);
  return promise;
}

function providerReady() {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const interval = setInterval(() => {
      const $ = window.ml_jQuery;
      if ($?.ajaxPrefilter && !providerHooked) {
        providerHooked = true;
        // Keep MailerLite's generated JSONP submission flow. Only augment its
        // failure feedback and timeout; never turn a failed response into success.
        $.ajaxPrefilter((options) => {
          if (!options.url.startsWith(form.action)) return;
          options.timeout = 20000;
          const originalSuccess = options.success;
          const originalError = options.error;
          options.success = function (response, ...args) {
            if (completed) return;
            if (response?.success === true) {
              originalSuccess?.call(this, response, ...args);
            } else {
              $(form).data('loading', false);
              fail('We couldn’t complete your signup. Check your email address and security check, then try again. If you already subscribe, you can contact support for help.');
            }
          };
          options.error = function (...args) {
            originalError?.apply(this, args);
            // A timed-out request may still have reached MailerLite: do not
            // automatically retry or claim the address was not registered.
            fail('We couldn’t confirm your signup. Check your inbox before trying again, or contact support@kindiscover.com.');
          };
        });
      }
      // The generated handler sets this attribute during initialization and
      // binds submit synchronously in the same task. Keep controls locked until then.
      if (providerHooked && email.hasAttribute('aria-invalid')) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - started > 15000) {
        clearInterval(interval);
        reject(new Error('Provider did not initialize'));
      }
    }, 100);
  });
}

function renderCaptcha() {
  if (widget !== undefined) return;
  widget = window.grecaptcha.render(captchaHost, {
    sitekey: '6Lf1KHQUAAAAAFNKEX1hdSWCS3mRMv4FlFaNslaD',
    size: 'compact',
    callback: () => announce('Security check complete. You can join the early-access list.'),
    'expired-callback': () => announce('The security check expired. Please complete it again.', true),
    'error-callback': () => announce('The security check could not load. Check your connection and reload this page to try again.', true),
  });
}
window.kinDiscoverCaptchaReady = renderCaptcha;

enable.disabled = false;
enable.addEventListener('click', async () => {
  enable.disabled = true;
  announce('Loading secure signup…');
  try {
    await Promise.all([
      loadScript('https://groot.mailerlite.com/js/w/webforms.min.js?v83147fa8ce2d95cb73ece7f28b469519').then(providerReady),
      loadScript('https://www.google.com/recaptcha/api.js?onload=kinDiscoverCaptchaReady&render=explicit'),
    ]);
    if (widget === undefined) throw new Error('Security check unavailable');
    ready = true;
    fields.disabled = false;
    enable.hidden = true;
    announce('Enter your email, choose your preferences, and complete the security check.');
    email.focus();
  } catch {
    // Reloading avoids re-running MailerLite initialization and binding its
    // submit handler twice after a partial third-party load.
    enable.hidden = true;
    announce('Secure signup is unavailable. Please reload this page to try again, or contact support@kindiscover.com.', true);
  }
});

function fieldError(input, id) {
  const invalid = !input.validity.valid;
  document.querySelector(id).hidden = !invalid;
  input.setAttribute('aria-invalid', String(invalid));
  return invalid;
}

for (const [input, id] of [[email, '#email-error'], [consent, '#consent-error']]) {
  input.addEventListener('invalid', () => fieldError(input, id));
  input.addEventListener('input', () => fieldError(input, id));
}

// Capture before MailerLite's handler, so rapid clicks and invalid requests
// never reach the provider. Browser validity also runs for keyboard submission.
form.addEventListener('submit', (event) => {
  // Never navigate to the provider directly, even if its handler fails.
  event.preventDefault();
  if (!ready || pending || completed) {
    event.preventDefault(); event.stopImmediatePropagation(); return;
  }
  email.value = email.value.trim();
  const invalidEmail = fieldError(email, '#email-error');
  const invalidConsent = fieldError(consent, '#consent-error');
  if (invalidEmail || invalidConsent || !form.reportValidity()) {
    event.preventDefault(); event.stopImmediatePropagation();
    (invalidEmail ? email : consent).focus();
    return;
  }
  if (!window.grecaptcha.getResponse(widget)) {
    event.preventDefault(); event.stopImmediatePropagation();
    announce('Please complete the security check before submitting.', true);
    return;
  }
  if (!submission.begin()) {
    event.preventDefault(); event.stopImmediatePropagation();
  }
}, true);

// The library also validates locally. Surface a readable error if it rejects
// before making a request, and release our in-flight lock for a deliberate retry.
new MutationObserver(() => {
  if (pending && form.querySelector('.ml-error')) {
    fail('Please check your email address, consent, and security check, then try again.');
  }
}).observe(form, { subtree: true, attributes: true, attributeFilter: ['class'] });
