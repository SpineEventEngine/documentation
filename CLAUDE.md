# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Hugo-based documentation source for [spine.io](https://spine.io). The `docs/` directory is consumed as a Hugo module by the `SpineEventEngine/SpineEventEngine.github.io` site. The `docs/_preview/` directory exists only to render the site locally — it is not shipped.

## Prerequisites

JDK 8 (x86_64), Go 1.22+ (per `docs/go.mod`), Node.js 18+, Hugo Extended `v0.150.0`+. The `embedCode` and `checkSamples` Gradle tasks hardcode `embed-code-macos` (ARM) from `docs/_bin/`; on an x86_64 Mac, invoke `embed-code-macos-x86_64` directly (see bypass snippet below) — the Gradle wrappers won't work. CI uses `embed-code-ubuntu` (the `check-samples` script branches on `$GITHUB_ACTIONS`).

## Common commands

Run from repo root:

```shell
./gradlew :runSite        # install deps + hugo server (local preview)
./gradlew :buildSite      # install deps + hugo build (no server)
./gradlew :embedCode      # update git submodules + embed code snippets into markdown
./gradlew :checkSamples   # verify embedded snippets match source (CI uses this)
./gradlew :buildAll       # build all included example projects via composite build
```

Bypassing Gradle (you must run the prerequisite steps yourself, or you'll skip what the Gradle tasks do):

```shell
# equivalent to :runSite — installDependencies runs npm install via docs/_script/install-dependencies
./docs/_script/install-dependencies && cd docs/_preview && hugo server

# equivalent to :embedCode — the script updates submodules before invoking the binary.
# Use ./embed-code-macos on ARM Macs, ./embed-code-macos-x86_64 on Intel Macs.
git submodule update --remote --merge --recursive
cd docs/_bin && ./embed-code-macos \
   -config-path="../_settings/v1.embed-code.yml" -mode="embed"
```

Each Gradle task is a thin wrapper around a script in `docs/_script/`. When debugging a task, read that script first.

## Architecture

### Two-directory split

- `docs/` — content shipped as a Hugo module. Has its own `go.mod` (`github.com/SpineEventEngine/documentation/docs`) and `hugo.toml`. Everything outside `docs/` is build tooling.
- `docs/_preview/` — local preview rig. Its `hugo.toml` imports `../..` (the repo root) plus `github.com/SpineEventEngine/site-commons`. Edit `docs/_preview/hugo.toml` to enable/disable other doc modules (validation, compiler, framework) when previewing aggregation locally.

### Theme and module aggregation

Layouts/components come from the `site-commons` Hugo theme (pulled via Hugo Modules, not git submodules). The site is also a **documentation aggregator**: it imports docs from sibling repos (`SpineEventEngine/validation/docs`, `compiler/docs`, etc.) and renders them under a unified sidenav. `params.moduleOrder` in `hugo.toml` controls sidenav order; `disable = true` on a module import excludes it from the build.

To pull theme/module updates: `cd docs/_preview && hugo mod clean && hugo mod get -u github.com/SpineEventEngine/site-commons` (or `./...` for all). Commit the resulting `go.mod`/`go.sum` changes — keep `go.sum` minimal (two entries per theme).

### Code embedding (`docs/_code/`)

Snippets in markdown pages are inserted by the [`embed-code-go`](https://github.com/SpineEventEngine/embed-code-go) tool, not written inline.

- `docs/_code/examples/` — full example projects, each a **git submodule** of a `spine-examples/*` repo (airport, blog, hello, kanban, todo-list). The composite build in `settings.gradle.kts` includes `airport`, `hello`, and the local `samples` build.
- `docs/_code/samples/` — a local Gradle subproject (included as a composite build via `includeBuild("./docs/_code/samples")`) whose Java/Proto sources under `src/main/` are embedded as snippets into pages. When adding new snippets here, you may also need to update `samples/build.gradle` and its build will run as part of `:buildAll`.
- `docs/_settings/v1.embed-code.yml` — embed-code config (paths into `docs/_code` and `docs/content/docs/1`).

Workflow: update snippet at source → `./gradlew :embedCode` → review the `.md`/`.html` diff → commit. After adding a new submodule under `docs/_code/examples/`, also register it in `settings.gradle.kts` (`includeBuild(...)`) and the project must expose a top-level `buildAll` Gradle task.

### Content versioning

Versions live side-by-side under `docs/content/docs/<version_id>/`, configured in `docs/data/versions.yml`. The `is_main` version may live at the root (`docs/content/docs/`) instead of in a `<version_id>/` subdir — switching the main version requires moving directories *and* updating `content_path`/`route_url` in `versions.yml`. Each version also needs a sidenav at `docs/data/docs/<version_id>/sidenav.yml`. Full procedure: see `SPINE_RELEASE.md`.

### Link conventions in markdown

- Internal links must **not** start with `/` and **must** end with `/` (avoids redirects). The versioning system rewrites them, e.g. `docs/guides/requirements/` → `/docs/1.9.0/guides/requirements/` for main, `/docs/2/guides/...` for version 2.
- For the version label inside a URL, use `{{% version %}}` (current page's version) or `{{% version "1" %}}` (specific). For repo URLs, use `{{% get-site-data "repositories.<key>" %}}` — pulls from `site-commons`' `data/repositories.yml`.

## Authoring guide

The user-facing content authoring guide lives in the `SpineEventEngine.github.io` repo (`AUTHORING.md`), not here.
