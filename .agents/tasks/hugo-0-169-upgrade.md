---
slug: hugo-0-169-upgrade
branch: hugo-0.169
owner: claude
status: in-review
started: 2026-10-30
---

## Goal

`docs/_preview` builds and runs on Hugo v0.169.0 with the latest `site-commons`,
and CI checks links with the same Hugo version.

## Context

- #89 — upgrade Hugo to v0.169.0 (meta-issue; also `site-commons`, `spine.io`).
- #92 — Hugo v0.162.0+ rejects `text/html` content files. The full-screen
  architecture diagram is one. Fix: option A from the issue, allow HTML content
  in the project config (`security` is ignored when set in a module config).
- #93 — pick up `site-commons` with the bundled code-highlighting palettes
  (SpineEventEngine/site-commons#37, merged). That theme declares
  `module.hugoVersion.min = '0.169.0'` and uses relative partial paths
  (Hugo v0.167.0+), so it cannot land without the Hugo bump.
- `.github/workflows/check-links.yml` comes from `config`, which still pins
  `HUGO_VERSION: 0.161.1`. Bumping it here is needed for CI; `config` needs
  the same bump, or the next `./config/pull` reverts it.

## Plan

- [x] Allow HTML content in `docs/_preview/hugo.toml` (#92).
- [x] `hugo mod get -u github.com/SpineEventEngine/site-commons` in
  `docs/_preview` (#93).
- [x] Bump `HUGO_VERSION` in `check-links.yml` to `0.169.0` (#89).
- [x] Update Hugo and Go prerequisites in `README.md` (#89).
- [x] Build `docs/_preview` with v0.169.0: no errors, no new warnings.
- [x] Check the full-screen diagram page: URL, back link, JS, PDF link.
- [x] Check the code-theme toggle in the preview (#93).
- [x] Check that `spine.io` builds with the same `security` setting (local only).
- [ ] Run link check.

## Log

- 2026-10-30 — drafted and started (autonomous run requested by the user).
- 2026-10-30 — the preview builds on v0.169.0; pages change only as
  site-commons#37 intends. Full-screen diagram and code-theme toggle checked
  in the browser. A clone of `spine.io` fails on v0.169.0 without
  `allowContent` and builds with it (`--minify`, updated theme).
