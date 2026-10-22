# KinDiscover — Coming soon

Standalone, dependency-free static landing page for KinDiscover. Original vector artwork, system fonts, responsive CSS, and semantic HTML. Email signup uses the owner's MailerLite form, with optional alpha interest, double opt-in configured in MailerLite, and Google reCAPTCHA. Signup services load only after the visitor chooses to enable them. No custom database, API credentials, or separate analytics service is used. Third-party form/security services may use technical data and browser storage, as explained in the signup privacy notice. This project does not depend on the main KinDiscover application.

## Local development

Requirements: Node.js 22 or later; Python 3 for the optional local server. No npm install is needed.

```sh
npm run check
npm test
npm run build
npm run preview
```

Open http://127.0.0.1:4321. `npm run dev` serves the source folder for editing. The build checks source structure, metadata, links, local asset references, required content, and signup group/consent configuration, then copies only public files to `dist/`. These checks do not replace browser or assistive technology testing.

## Files

- `index.html`: copy, semantic sections, metadata, and decorative SVG artwork.
- `assets/styles.css`: brand palette, desktop/mobile layouts, focus and reduced-motion support.
- `assets/favicon.svg`: original brand mark.
- `_headers`: Cloudflare security headers, including a restrictive content security policy.
- `robots.txt`: permits indexing; the privacy and thank-you pages separately request noindex.
- `thank-you/index.html`: post-submission destination at `/thank-you/`, with double-opt-in confirmation instructions; the provider success callback redirects here.
- `privacy/index.html`: signup privacy notice with organization/contact and provider-processing information.
- `docs/mailerlite-setup.md`: integration options, provider configuration, outstanding facts, and activation checks.
- `scripts/`: dependency-free check and build commands.
- `dist/`: generated output; excluded from version control.

## Cloudflare Pages deployment — only after deployment approval

This repository contains the standalone coming-soon site. The supplied GitHub repository was empty at implementation time. Publishing source code to GitHub does not authorize a Cloudflare deployment or DNS change.

Source repository: https://github.com/dneff613/familytree-comingsoon.git. Do not upload the repository root as the published artifact. Follow the steps below only after deployment approval.

In Cloudflare's dashboard, create a **Pages** project under Workers & Pages, connect that GitHub repository, and use:

| Setting | Value |
| --- | --- |
| Production branch | The branch approved for publication (usually `main`) |
| Framework preset | None |
| Root directory | Repository root |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION=22` |

No secrets, bindings, database, authentication, or functions are required. Cloudflare Pages will serve the generated HTML and apply `_headers`. Git integration can automatically deploy subsequent pushes; review branch/deployment controls before connecting the repository.

Alternatively, after approval, build locally and use Cloudflare Pages Direct Upload with the contents of `dist/`. Choose the intended project type first: Direct Upload and Git integration have different workflows.

Review the generated `pages.dev` URL on desktop and mobile before attaching a custom domain. Custom-domain setup and DNS changes require separate approval. Once the final production URL is confirmed, add a matching canonical URL and `og:url`; no domain has been guessed here. A sitemap is optional for this single-page site. Update the static footer copyright year as needed.

Official references:
- [Static HTML on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)

## Verification before launch

Run the checks/build, inspect desktop and mobile layouts, navigate with a keyboard, verify the button scrolls to the three pillars, confirm asset responses, and confirm security headers on the actual Cloudflare preview (Python's server does not apply `_headers`). Check the final production URL metadata after the domain is approved.

## Early-access signup

The form appears immediately below “A new chapter. Coming soon.” MailerLite’s supplied endpoint receives the email and group preferences. The hidden Subscribers group receives all signups; Alpha Testers is optional and unchecked. The user must agree to email updates and complete reCAPTCHA before submission. A pending request blocks duplicate clicks. Accepted submissions redirect to `/thank-you/`, which asks the subscriber to confirm their email.

The owner has confirmed double opt-in is enabled in MailerLite. The local privacy notice is at `/privacy/` and names Kin Discover with support@kindiscover.com as the privacy contact. Before public signup opens, verify it at the intended public URL and complete real provider delivery/group/duplicate-address tests. The implementation agent has not submitted a live test subscription, deployed the site, or changed DNS.

See [MailerLite integration and launch requirements](docs/mailerlite-setup.md). The provider-hosted script uses JSONP and loads its own dependencies; the security headers allow those specific origins. Local preview via Python does not apply Cloudflare's `_headers`, so hosted header verification is still necessary.
