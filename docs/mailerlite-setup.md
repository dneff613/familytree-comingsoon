# MailerLite signup integration

The actual HTML embed supplied by the owner is integrated locally. Publication is pending review. The public form endpoint and group IDs are not private credentials; no API token or custom subscriber database is used.

## Provider configuration

- Account/form: `2734755` / `202062547476547465`; embed instance `47493120`.
- `Subscribers` (`202062562161854094`) is the hidden launch-updates group, included on every request.
- `Alpha Testers` (`202062569642395128`) is optional and unchecked. These are the owner's actual MailerLite group names; they implement Launch Updates and Alpha Interest respectively.
- Double opt-in was visibly enabled in the owner's form Overview screenshot. Keep it enabled for this exact form. This is a MailerLite setting, not something the website can enforce by changing HTML.
- reCAPTCHA v2 is retained from the supplied embed. Its public site key is not a secret. The provider validates its token; the website never bypasses CAPTCHA or verifies it with a private key.

## Site behavior

`assets/signup.mjs` loads the supplied MailerLite webforms script and Google reCAPTCHA only after the visitor chooses **Enable secure signup**. Inputs are disabled until the provider and security widget initialize; no-JavaScript and blocked/failed service loads have clear guidance. There is no tracking/count request to `/takel`, external font import, universal MailerLite tracking snippet, or popup.

The official MailerLite script remains responsible for serialization, JSONP submission, and the success callback. The local wrapper adds native required email/consent validation, an unchecked optional alpha input, accessible feedback, an in-flight submission lock, provider error handling and a 20-second request timeout. Unknown/network outcomes ask users to check their inbox before retrying; requests are never automatically retried. MailerLite's generated JSONP transport uses a request URL internally; no email is added to KinDiscover's page URL, thank-you URL, or our own storage.

The library currently loads jQuery from `assets.mlcdn.com` and an input-mask dependency from `static.mailerlite.com`. It may create `ml_guid` browser storage; the privacy notice discloses this. Inspect requests/cookies again if MailerLite changes its script. The CSP permits the identified script origins and only Google reCAPTCHA frame origins. Inline script is not allowed; inline styles are permitted for provider widget compatibility. There is no API authentication secret anywhere in the client.

The `ml_webform_success_47493120` callback redirects to `/thank-you/` only for an accepted provider response and a pending submission. It does not represent completed double opt-in. Leave **Custom success page** off in MailerLite while using this site-managed callback; keep MailerLite's separate confirmation thank-you page enabled for the email confirmation step.

Duplicate clicks while pending are blocked. A successful submission locks the page until navigation. Duplicate email addresses, previous unsubscribes, and changes to an existing subscriber's groups are ultimately handled by MailerLite, not a separate site database. Verify these cases in the actual account; do not promise a new confirmation email for an already confirmed subscriber.

## Privacy

The owner supplied **Kin Discover**, **support@kindiscover.com**, and a retention preference of retaining active subscribers until unsubscribe. The owner confirmed the mailbox sends and receives mail. `/privacy/` now describes signup, consent, optional alpha, double opt-in, MailerLite, Google reCAPTCHA, technical processing/browser storage, unsubscribe versus deletion, and contact requests. Active subscriber information has no fixed expiry; suppression/consent/security records may remain after unsubscribe. No immediate-erasure promise is made.

No campaign settings have been changed. The notice acknowledges that email interaction records may be processed depending on campaign settings. Review open/click tracking before sending campaigns and disable unnecessary tracking. The notice is scoped to this coming-soon signup, not the main application.

## Validation and publication checklist

Local commands: `npm run check`, `npm test`, `npm run build`. Tests cover concurrent-submission blocking, accepted-response-only navigation, explicit retry after failure, and terminal success. Browser checks should use a server that applies `_headers`, since ordinary Python preview does not.

Still required before public activation:

1. Owner-authorized live signup tests with alpha unchecked and checked; inspect actual group membership, unconfirmed status, confirmation email delivery, confirmation link, and unsubscribe behavior.
2. Verify existing/duplicate addresses and previously unsubscribed addresses are handled as intended without erasing existing preferences. Confirm the alpha-unchecked path works.
3. Verify real provider/network errors, keyboard operation, narrow/desktop layouts, and security headers in the intended hosting environment.
4. Publish and verify the notice at `https://kindiscover.com/privacy` (including `/privacy/` redirects) before accepting public signup. Local verification is not public URL verification.
5. Obtain explicit approval for publication. Do not push to a production-connected branch or change DNS without it.

No real email address has been submitted by the implementation agent. CAPTCHA interaction or a real test subscription requires the user's involvement/authorization.

## Official references

- [HTML embed and hosted form options](https://www.mailerlite.com/help/how-to-add-a-form-to-your-website)
- [HTML/CSS customization](https://www.mailerlite.com/help/how-to-create-an-embedded-form)
- [Hidden and optional interest groups](https://www.mailerlite.com/help/how-to-use-interest-groups-inside-forms)
- [Double opt-in](https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers)
- [Form cookies/storage](https://www.mailerlite.com/help/which-cookies-are-used-by-mailerlite-forms)
- [MailerLite privacy](https://www.mailerlite.com/legal/privacy-policy)
- [Google reCAPTCHA v2 rendering/callbacks](https://developers.google.com/recaptcha/docs/display)
