# Project: documentation

## Overview

This repository is the **documentation aggregator and content host** for the
Spine SDK. It owns the Hugo site setup that gathers documentation from sibling
SDK repos (currently `SpineEventEngine/validation`) as Hugo modules, and it
also stores original Markdown content under `docs/`. The repo additionally
serves as the GitHub Wiki source for committer-facing documentation about
contributing to the framework.

The public site at [spine.io](https://spine.io) is built from
`SpineEventEngine/SpineEventEngine.github.io`, which **imports this repo's
`docs/` directory as a Hugo module**. Edits made here flow to the public site
when `SpineEventEngine.github.io` bumps its module pin.

## Architecture

**Role in the org:** documentation aggregator + content host.

**Stack.** A Hugo + Node project at heart. Gradle is a thin task-runner
wrapper around Hugo, Node, and Go tooling — not a JVM build in any meaningful
sense, so JVM coding conventions do not apply here.

- `docs/` — published content, Hugo site root, exported as a Hugo module to
  `SpineEventEngine.github.io`.
- `docs/_preview/` — local-only Hugo setup for running the site during
  authoring (`./gradlew :runSite`, or `hugo server` from this directory).
- `docs/_code/examples/*` — git submodules pinned at
  `spine-examples/{airport, blog, hello, kanban, todo-list}`. These are the
  **canonical source of embedded code samples**; this repo does not modify
  them.
- `config/` — git submodule pointing at `SpineEventEngine/config`. Provides
  shared agent guidance, skills, and build config consumed across Spine SDK
  repos. Applied via the `Apply config` step.
- Theme: components, layouts, and styles come from the `site-commons` Hugo
  theme (`github.com/SpineEventEngine/site-commons`).

**Doc modules pulled in via `docs/hugo.toml`.** Currently only the
`validation` repo contributes docs as a Hugo module. The README lists
`framework` and `compiler` as examples of how to add more; they are not
wired in today.

**Key conventions and constraints (not obvious from the code):**

- **Theme changes mirror to spine.io.** Any non-trivial change to
  `site-commons` usage here must also be applied in the main `spine.io` site
  repo, or the live site will diverge from preview.
- **Embedded code must round-trip.** Code blocks in pages are generated from
  the `docs/_code` submodules by the [`embed-code`][embed-code] tool. Do not
  hand-edit embedded code blocks in Markdown; run `./gradlew :embedCode` and
  verify with `./gradlew :checkSamples`. See [`EMBEDDING.md`](../EMBEDDING.md).
- **Submodules are pinned.** `docs/_code/examples/*` and `config` are pinned
  intentionally — do not bump them as a side effect of unrelated work.
- **Link checking is required pre-PR.** Run the `check-links` skill before
  opening any PR that touches `docs/**` or `site/**`; CI runs the same check
  via `lychee.toml` against the rendered HTML.

[embed-code]: https://github.com/SpineEventEngine/embed-code-go
