# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.36](https://github.com/Orange-Ember-Studios/website/compare/v0.0.35...v0.0.36) (2026-08-24)

### [0.0.35](https://github.com/Orange-Ember-Studios/website/compare/v0.0.34...v0.0.35) (2026-08-24)

### [0.0.34](https://github.com/Orange-Ember-Studios/website/compare/v0.0.33...v0.0.34) (2026-06-22)


### Features

* upgrade EmberKit to v0.11.0 with SSR and fix rendering issues ([90bc530](https://github.com/Orange-Ember-Studios/website/commit/90bc530aebc6820ae37cf6160d8f48d1a20d93a1))

### [0.0.33](https://github.com/Orange-Ember-Studios/website/compare/v0.0.32...v0.0.33) (2026-06-17)

### [0.0.32](https://github.com/Orange-Ember-Studios/website/compare/v0.0.31...v0.0.32) (2026-05-27)


### Bug Fixes

* **build:** bundle SQL migrations for Wrangler deploy ([32cdce1](https://github.com/Orange-Ember-Studios/website/commit/32cdce1b7f06f557f0b5aa750b79940d0bf92c07))

### [0.0.31](https://github.com/Orange-Ember-Studios/website/compare/v0.0.30...v0.0.31) (2026-05-27)


### Features

* **admin:** Editor.js toolbar, markdown paste, inline styles ([886a81f](https://github.com/Orange-Ember-Studios/website/commit/886a81f3ee6efef4f980b01a0f0727e0e94d5a82))

### [0.0.30](https://github.com/Orange-Ember-Studios/website/compare/v0.0.29...v0.0.30) (2026-05-27)


### Bug Fixes

* **portfolio:** refresh route when SSR grid stays empty ([a106b47](https://github.com/Orange-Ember-Studios/website/commit/a106b47660a04f1a47314df49df33d01bc7a98f2))
* rely on emberkitVitePlugin for dev API and sql raw ([b23b5d2](https://github.com/Orange-Ember-Studios/website/commit/b23b5d244d8ec26a1f120aee46fa7ddcb373342d))

### [0.0.29](https://github.com/Orange-Ember-Studios/website/compare/v0.0.28...v0.0.29) (2026-05-26)

### [0.0.28](https://github.com/Orange-Ember-Studios/website/compare/v0.0.27...v0.0.28) (2026-05-26)


### Features

* **admin:** Editor.js CMS and blog seed pipeline ([4297f89](https://github.com/Orange-Ember-Studios/website/commit/4297f895ebe43b1a59fb43351a2abc411d21e8f3))


### Bug Fixes

* **admin:** hide loader on new post editor page ([cbe0b80](https://github.com/Orange-Ember-Studios/website/commit/cbe0b805bfa00838f2b1052f68b398eccb70863b))

### [0.0.27](https://github.com/Orange-Ember-Studios/website/compare/v0.0.26...v0.0.27) (2026-05-17)


### Bug Fixes

* removed user validation in blog, only needed in cms ([f4fe6a6](https://github.com/Orange-Ember-Studios/website/commit/f4fe6a6ebce529cf50c5b9a6fe585fa75c0b15ee))

### [0.0.26](https://github.com/Orange-Ember-Studios/website/compare/v0.0.25...v0.0.26) (2026-05-17)


### Bug Fixes

* added missing fields in the post models ([7e256c4](https://github.com/Orange-Ember-Studios/website/commit/7e256c4b252a150eb88724dd9e55096567c6f6c1))

### [0.0.25](https://github.com/Orange-Ember-Studios/website/compare/v0.0.24...v0.0.25) (2026-05-17)


### Features

* added logs to trace better the api calls ([9243070](https://github.com/Orange-Ember-Studios/website/commit/924307079ed56acda1914cd42f4de91dcce621d7))

### [0.0.24](https://github.com/Orange-Ember-Studios/website/compare/v0.0.23...v0.0.24) (2026-05-17)


### Bug Fixes

* error in env vars ([a2ba8d0](https://github.com/Orange-Ember-Studios/website/commit/a2ba8d00d6d5f11ed8a40c562548be19cc64d519))

### [0.0.23](https://github.com/Orange-Ember-Studios/website/compare/v0.0.22...v0.0.23) (2026-05-17)


### Bug Fixes

* **api:** guard portfolio and blog list routes against DB errors ([f6d7f56](https://github.com/Orange-Ember-Studios/website/commit/f6d7f56b038c7514dccac853cea7a5df52709f0c))
* **deploy:** enable SPA fallback and align CSP for Cloudflare ([78db160](https://github.com/Orange-Ember-Studios/website/commit/78db160a8d5cf8da97339b8a67b5dae9c9b2948a))

### [0.0.22](https://github.com/Orange-Ember-Studios/website/compare/v0.0.21...v0.0.22) (2026-05-16)


### Bug Fixes

* **admin:** sync profile signals to DOM for password managers ([95300e0](https://github.com/Orange-Ember-Studios/website/commit/95300e025980e5a797a0c18c68c866c1405ef1fe))
* align post likes lookup with blog page visibility ([c9c06e2](https://github.com/Orange-Ember-Studios/website/commit/c9c06e2fca6455bcae44abd5b761254b39faf409))
* **api:** pass Turso credentials into post likes handlers ([9499e87](https://github.com/Orange-Ember-Studios/website/commit/9499e872a4012e87821ed217d84ef0770f9ea706))
* **contact:** use explicit Turnstile render and harden widget init ([09f3e9b](https://github.com/Orange-Ember-Studios/website/commit/09f3e9be3e47d73bcff17d53cb6fb6f999a65d25))
* **ui:** sync premium select label and bubble change events ([5f85d29](https://github.com/Orange-Ember-Studios/website/commit/5f85d294128a85435a29453024f7e9d3511a404e))
* updated dependencies ([a139861](https://github.com/Orange-Ember-Studios/website/commit/a13986199e7a71885d075d67abf3f2f12c2be467))
* use Cloudflare worker env for Turso DB credentials ([a20957e](https://github.com/Orange-Ember-Studios/website/commit/a20957e21ec4bc6d6886baf88b798ad7eacd5c5d))

### [0.0.21](https://github.com/Orange-Ember-Studios/website/compare/v0.0.20...v0.0.21) (2026-05-16)


### Bug Fixes

* **build:** bump EmberKit CLI, add vite.config shim ([13e8db8](https://github.com/Orange-Ember-Studios/website/commit/13e8db81c5206a8e7958e2d48abd592e7bfd1dd0))

### [0.0.20](https://github.com/Orange-Ember-Studios/website/compare/v0.0.19...v0.0.20) (2026-05-16)


### Features

* migrate Astro→EmberKit, rewrite CMS and public pages ([19e4ba1](https://github.com/Orange-Ember-Studios/website/commit/19e4ba1a7dfe95f41b9cfd37b61f435dc0a57b4b))

### [0.0.19](https://github.com/Orange-Ember-Studios/website/compare/v0.0.18...v0.0.19) (2026-05-16)

### [0.0.18](https://github.com/Orange-Ember-Studios/website/compare/v0.0.17...v0.0.18) (2026-05-15)

### [0.0.17](https://github.com/Orange-Ember-Studios/website/compare/v0.0.16...v0.0.17) (2026-05-15)


### Bug Fixes

* enable language selector functionality ([3abbc55](https://github.com/Orange-Ember-Studios/website/commit/3abbc5558915e5e339774089092c05f5f1abdbb4))
* gate all admin API fetches behind auth confirmation ([a79f24b](https://github.com/Orange-Ember-Studios/website/commit/a79f24b142e13e706b25dea6b904424fd240fcce))
* implement admin authentication protection ([b02c71a](https://github.com/Orange-Ember-Studios/website/commit/b02c71a7a93e4e827d9e3be323f9f271847d1eee))
* improve Cloudflare Turnstile integration ([d96bf72](https://github.com/Orange-Ember-Studios/website/commit/d96bf722626ff56892e86fbac6a1f7d24f13b347))
* repair admin page blank screen ([5ddec34](https://github.com/Orange-Ember-Studios/website/commit/5ddec34aa88b828dcd4377ed9e34b7720721a9ff))
* resolve Turnstile widget lifecycle conflicts ([dbece75](https://github.com/Orange-Ember-Studios/website/commit/dbece7595acacd8eaccd43cc1d0dbc4b7e7c45da))

### [0.0.16](https://github.com/Orange-Ember-Studios/website/compare/v0.0.15...v0.0.16) (2026-05-08)


### Features

* Added Donation button ([4f04888](https://github.com/Orange-Ember-Studios/website/commit/4f04888e4481128a161a11416cb85c149488e794))

### [0.0.15](https://github.com/Orange-Ember-Studios/website/compare/v0.0.13...v0.0.15) (2026-05-08)


### Features

* add opencode GitHub Actions workflow ([0ea635d](https://github.com/Orange-Ember-Studios/website/commit/0ea635da6a282373a57e0905daf358785475db51))

### [0.0.14](https://github.com/Orange-Ember-Studios/website/compare/v0.0.13...v0.0.14) (2026-05-08)

### [0.0.13](https://github.com/Orange-Ember-Studios/website/compare/v0.0.12...v0.0.13) (2026-04-25)

### [0.0.12](https://github.com/Orange-Ember-Studios/website/compare/v0.0.11...v0.0.12) (2026-04-22)


### Bug Fixes

* **husky:** removed first two lines for deprecations. ([159f859](https://github.com/Orange-Ember-Studios/website/commit/159f8595738a70f27fe4887fba53cf954677a2cb))

### [0.0.11](https://github.com/Orange-Ember-Studios/website/compare/v0.0.10...v0.0.11) (2026-04-22)


### Features

* **icons:** replace svgs with lucide icon library ([fc836fc](https://github.com/Orange-Ember-Studios/website/commit/fc836fc3d14d23812c20e383627d44cb565e83b0))

### [0.0.10](https://github.com/Orange-Ember-Studios/website/compare/v0.0.9...v0.0.10) (2026-04-22)


### Bug Fixes

* **blog:** use JavaScript regex engine for Shiki to fix Cloudflare WASM error ([af879e6](https://github.com/Orange-Ember-Studios/website/commit/af879e6cf8c7a199e84fcb84ef8d1e59b5a9a6df))

### [0.0.9](https://github.com/Orange-Ember-Studios/website/compare/v0.0.8...v0.0.9) (2026-04-22)


### Features

* **blog:** integrate Shiki for syntax highlighting and enhance code block styles ([323dd6a](https://github.com/Orange-Ember-Studios/website/commit/323dd6a9d3f11107b773ec3ec8ad1ffb5cca0eea))
* **cms:** replace EditorJS with Milkdown for Markdown support ([3692bb2](https://github.com/Orange-Ember-Studios/website/commit/3692bb217265ec0faf864331420cb04ee8f30dfd))

### [0.0.8](https://github.com/Orange-Ember-Studios/website/compare/v0.0.7...v0.0.8) (2026-04-19)

### [0.0.7](https://github.com/Orange-Ember-Studios/website/compare/v0.0.6...v0.0.7) (2026-04-19)

### [0.0.6](https://github.com/Orange-Ember-Studios/website/compare/v0.0.5...v0.0.6) (2026-04-19)

### [0.0.5](https://github.com/Orange-Ember-Studios/website/compare/v0.0.4...v0.0.5) (2026-04-19)

### [0.0.4](https://github.com/Orange-Ember-Studios/website/compare/v0.0.3...v0.0.4) (2026-04-19)


### Features

* integrate Shiki for syntax highlighting and add language selection to the EditorJS code block component ([923b259](https://github.com/Orange-Ember-Studios/website/commit/923b25926158961ec5c83c91a97deff5f00b2a52))

### [0.0.3](https://github.com/Orange-Ember-Studios/website/compare/v0.0.2...v0.0.3) (2026-04-19)

### 0.0.2 (2026-04-19)


### Features

* add ai.txt, implement multi-language support for admin interface, and update CMS dashboard localization ([2e4c179](https://github.com/Orange-Ember-Studios/website/commit/2e4c179495491c82760adb98e13d907eba782d16))
* add all topics tag translation to i18n files ([6e3a0d1](https://github.com/Orange-Ember-Studios/website/commit/6e3a0d12659a95237ab226a914ead5f1da2c9602))
* Add app ads verification ([d44d1b1](https://github.com/Orange-Ember-Studios/website/commit/d44d1b187b4e41a562a206e1edc7cb25a3580360))
* add Content-Security-Policy and Permissions-Policy meta tags to layout ([20a5f4d](https://github.com/Orange-Ember-Studios/website/commit/20a5f4dd34340410fca1001b1d93b268b5f4cc9c))
* add date sorting functionality and post count display to the blog page with localized labels ([454aa13](https://github.com/Orange-Ember-Studios/website/commit/454aa1310a85e44ceb4833cdb3d03a8e67d41f2d))
* add dynamic Open Graph and Twitter meta tags to Layout component ([b5a9e71](https://github.com/Orange-Ember-Studios/website/commit/b5a9e712da2b3d07274548619b5d6245f47a9c84))
* add Exact Slice project blog post in English, Spanish, and French ([24963a0](https://github.com/Orange-Ember-Studios/website/commit/24963a0d340ba283c97229519d5801f0e5ee5944))
* add Inverse Pulse postmortem blog post in English, Spanish, and French with supporting imagery ([9ec1ec0](https://github.com/Orange-Ember-Studios/website/commit/9ec1ec048888566ef9719439e29102c0cf1779ac))
* add micro-interactions blog post in multiple languages and update image assets to JPG format ([b007f7e](https://github.com/Orange-Ember-Studios/website/commit/b007f7e30c9b24ded8e44092198c578278a3223a))
* add mobile menu component and refactor ContactForm for code style consistency ([a6c10d2](https://github.com/Orange-Ember-Studios/website/commit/a6c10d261f2cf5de708cb1bcfd20b13e7b6104b2))
* add multilingual blog post about Astro Islands performance optimization ([58975a1](https://github.com/Orange-Ember-Studios/website/commit/58975a1aadb5c426973db727b9078a1ef52019f7))
* add og:logo meta tag to Layout and implement corresponding unit test with vitest configuration ([54456ae](https://github.com/Orange-Ember-Studios/website/commit/54456ae650146c734ca916cd675d89a2a4d1a0c8))
* add orange-ember-standards skill definition for TDD and development guidelines ([5765e55](https://github.com/Orange-Ember-Studios/website/commit/5765e550f13adeace1d1d0b095e12969d46e63ea))
* add project link to Easy Flags entry in Portfolio component ([be784b8](https://github.com/Orange-Ember-Studios/website/commit/be784b87e8d727b0506aee1b6d2445babd6221ef))
* configure astro output to server mode ([a0049b7](https://github.com/Orange-Ember-Studios/website/commit/a0049b7c50af7ecff9bb1cb6890c6d26d841f6c2))
* expand internationalization support for blog and footer components and update tag metadata translations ([a13e1fa](https://github.com/Orange-Ember-Studios/website/commit/a13e1fa7793053a74a4bf098a536d20ebb5941fd))
* implement About and Contact sections with Vue form integration and unit tests ([57a6b4c](https://github.com/Orange-Ember-Studios/website/commit/57a6b4cf4d0068b1ad73d40e9b55028ea3f5b0cf))
* implement automated semantic versioning via husky pre-push hook and fix fetch compatibility in database client ([cd9001d](https://github.com/Orange-Ember-Studios/website/commit/cd9001dbdfa2711c42b1f47dd7f50f8fce1617af))
* implement blog pagination logic with localized UI controls and progress tracking ([a4e0f34](https://github.com/Orange-Ember-Studios/website/commit/a4e0f3417ee37aeacc834cc73cc10b3f14caf8a8))
* implement blog system with multi-language support and content management integration ([bd1fdac](https://github.com/Orange-Ember-Studios/website/commit/bd1fdacb0b06a5ad71ff54d8015c7517e60d08b4))
* implement contact form submission API integration with validation, loading states, and unit tests ([928980f](https://github.com/Orange-Ember-Studios/website/commit/928980f15793285b3f7ce20faba6fa98f096cbde))
* implement dynamic tag styling system with color mapping and automated testing ([fa6f0af](https://github.com/Orange-Ember-Studios/website/commit/fa6f0af46c53a4eac617af4fb257578390c5575d))
* implement honeypot anti-spam for contact form and add security headers configuration ([8370100](https://github.com/Orange-Ember-Studios/website/commit/837010068df3d37b69c814316ada39b385472257))
* implement internationalization routing middleware and update contact form styling to ember theme ([3aab29b](https://github.com/Orange-Ember-Studios/website/commit/3aab29bc86e575bc6e7e66c78e1399d97f97d907))
* implement internationalization support across site components and add multi-language translation files ([7a69964](https://github.com/Orange-Ember-Studios/website/commit/7a69964a216bf8b8663d09d2601d6b8ce395a599))
* implement Portfolio and Services sections with unit tests and update landing page navigation ([49087c7](https://github.com/Orange-Ember-Studios/website/commit/49087c7520f17fdd7cbee9c7cb7438843b396ca1))
* implement privacy policy page with localized content, footer component, and associated tests ([abd5d3c](https://github.com/Orange-Ember-Studios/website/commit/abd5d3c8faafe0b59a61dd360679d75d795533d6))
* implement responsive navigation bar and add studio shield logo ([b23c0d2](https://github.com/Orange-Ember-Studios/website/commit/b23c0d21adfae5358b45349eb95da5e243670548))
* implement SEO enhancements, sitemap integration, and structured data while removing legacy planning documentation. ([1fbb1bf](https://github.com/Orange-Ember-Studios/website/commit/1fbb1bf1826e27f7003e12ea2e78e293ab6c3ee3))
* implement Turso database integration, admin authentication system, and CMS dashboard with Vue components ([0a2b3aa](https://github.com/Orange-Ember-Studios/website/commit/0a2b3aa896c1d8d1dda835c5c54caa17bc4458db))
* initialize project structure with Tailwind CSS, Vitest, and documentation for TDD workflows and user stories. ([7a25d62](https://github.com/Orange-Ember-Studios/website/commit/7a25d624e20e30053d07f8e53d856731a6224256))
* integrate Cloudflare Turnstile and update honeypot implementation for enhanced contact form security ([6bdbb7b](https://github.com/Orange-Ember-Studios/website/commit/6bdbb7b17dc066d9193d2362cb2883fdfef727b9))
* replace Taxi Bogotano Rush with Inverse Pulse and add Early Access status support ([326f6d4](https://github.com/Orange-Ember-Studios/website/commit/326f6d483765302143b6b71a8e50770ac4fc7ab4))
* update bubble level project status to available now ([7f56105](https://github.com/Orange-Ember-Studios/website/commit/7f56105d48a7824649a48ee85d95cb4a0c321d81))
* update favicon.svg with new branding assets and filters ([b112abb](https://github.com/Orange-Ember-Studios/website/commit/b112abbd29f11fa31b27bce1b9c215b28f809436))
* update portfolio project statuses, refactor UI components, and expand internationalization keys ([a9806be](https://github.com/Orange-Ember-Studios/website/commit/a9806be979a4d7452a1e57cfe9e5569ee906bc62))
* update portfolio projects with status badges, external links, and interactive card styling ([51dfe18](https://github.com/Orange-Ember-Studios/website/commit/51dfe18ba512db87e8ddeb35f22604c32819f87f))
* update X social link and handle in contact component ([62556d5](https://github.com/Orange-Ember-Studios/website/commit/62556d585f304eb564ec354d16fc1c3fa821d4d4))


### Bug Fixes

* inject global fetch into database client to bypass internal polyfill and update test expectations ([87c8793](https://github.com/Orange-Ember-Studios/website/commit/87c87937c15492258d0cf95496aed726188356fc))
* update Twitter icon to X and change contact link to anchor navigation ([b1200ce](https://github.com/Orange-Ember-Studios/website/commit/b1200cef0f81def66f4de476bcfd9c731ed236f4))
