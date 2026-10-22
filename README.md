# KinDiscover — Coming soon

Standalone, dependency-free static landing page for KinDiscover. Original vector artwork, system fonts, responsive CSS, and semantic HTML. No JavaScript runs in the visitor's browser; there are no accounts, databases, analytics, cookies, email forms, or third-party assets. This project does not depend on the main KinDiscover application.

## Local development

Requirements: Node.js 22 or later; Python 3 for the optional local server. No npm install is needed.

```sh
npm run check
npm run build
npm run preview
```

Open http://127.0.0.1:4321. `npm run dev` serves the source folder for editing. The build checks source structure, metadata, links, local asset references, required content, and absence of scripts/forms/remote requests, then copies only public files to `dist/`. These checks do not replace browser or assistive technology testing.

## Files

- `index.html`: copy, semantic sections, metadata, and decorative SVG artwork.
- `assets/styles.css`: brand palette, desktop/mobile layouts, focus and reduced-motion support.
- `assets/favicon.svg`: original brand mark.
- `_headers`: Cloudflare security headers, including a restrictive content security policy.
- `robots.txt`: permits indexing.
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
