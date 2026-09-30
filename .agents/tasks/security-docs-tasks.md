# Security section on spine.io

## Goal

Give consumers of the Spine Event Engine SDK one place for everything security-related:
**Documentation → Security** on spine.io, with three pages:

| Page | URL (proposed) | Source of the content |
|---|---|---|
| Security policy | `/docs/security/policy/` | `SpineEventEngine/.github` → `SECURITY.md` |
| Verifying artifacts | `/docs/security/verifying-artifacts/` | `config` README, "Verifying published artifacts" |
| Coordinated Vulnerability Disclosure Policy | `/docs/security/cvd-policy/` | the current https://spine.io/cvd-policy/ |

The old https://spine.io/cvd-policy/ URL redirects to the new CVD page. The org-wide
`SECURITY.md` gets a short section that points to "Verifying artifacts", and the `config`
README section shrinks to a pointer to the same page.

## Context

- `config` now publishes every JVM artifact through the reusable `publishing.yml` workflow,
  which attests all published files (JARs, POMs, Gradle module metadata, SPDX SBOMs) with
  SLSA v1.0 build provenance. This setup meets SLSA Build Level 3.
- Consumers verify the provenance with:

  ```bash
  gh attestation verify <file> \
    -R SpineEventEngine/<repository> \
    --signer-workflow SpineEventEngine/config/.github/workflows/publishing.yml \
    --source-ref refs/heads/<branch>
  ```

  Checked on 2026-09-30 against `spine-base-2.0.0-SNAPSHOT.443.jar` from
  `base-libraries`, without `--source-ref`; it passed.
- Other projects keep verification instructions in their docs, not in `SECURITY.md`. For
  example: Argo CD, "Verification of Argo CD Artifacts" (operator manual); Kubernetes,
  "Verify Signed Kubernetes Artifacts" (docs task page). Kyverno's `SECURITY.md` only links
  out to its security docs. We follow that pattern: the site holds the full text, and
  `SECURITY.md` points to it.
- Order matters: `SECURITY.md` and the `config` README should link to the site pages only
  after those pages are live.

## Plan

### 1. `documentation` repository

- [ ] **Create the Security section** under Documentation, with the three pages below in the
      section's navigation, in the order given in the table above.
- [ ] **Security policy page.** Decide during implementation between:
  - **Embed the content** of `.github/SECURITY.md`, pulled from that repository at build
    time or by a sync job, so `.github` stays the single source and the two can't drift.
    Headings and relative links need adapting to the site.
  - **A short page that links out**: one or two paragraphs on how to report a vulnerability,
    plus a link to `SECURITY.md` on GitHub. Nothing to sync, but readers leave the site.

  If we embed, don't let a copy edited by hand on the site become a second source.
- [ ] **Verifying artifacts page.** Adapt the `config` README section "Verifying published
      artifacts" for consumers, and leave out the internals that only maintainers need:
  - What is attested: every file of every Maven publication, SBOMs included. The provenance
    format is SLSA v1.0, built on GitHub-hosted runners by the reusable workflow in
    `config`, and meets Build Level 3.
  - What a successful verification means: the file was built by us, from the named
    repository and branch, and hasn't been modified since. What it doesn't mean: the file
    has no vulnerabilities (link to the Security policy page).
  - Prerequisite: the GitHub CLI (`gh`). The file must first be downloaded locally, from the
    Maven repository or the Gradle cache (`~/.gradle/caches/modules-2/files-2.1/...`).
  - The general command and the worked example (`spine-base-2.0.0-SNAPSHOT.443.jar`,
    `base-libraries`).
  - Why each flag is there:
    - `-R` names the repository the file was built from.
    - `--signer-workflow` pins the workflow that signed the provenance.
    - `--source-ref` pins the branch; the ref is matched exactly, one per check.
  - Values for `<branch>`:
    - `master` for the current line of development.
    - `v<major>.x` (e.g. `v2.x`) for releases of an earlier version family published from its
      release branch. Versions built on `master` before that branch was cut still verify with
      `master`.
  - Older versions:
    - Versions published before a repository got the attestation step have no provenance.
    - Versions attested by the older inline step pass with `-R` alone and fail with
      `--signer-workflow`, as intended.
  - Optional strict pinning with `--signer-digest <config commit>`.
  - Reword the maintainer-facing parts of the README text, such as re-running the `attest`
    job and `migrate`.
- [ ] **CVD policy page.** Move the content of https://spine.io/cvd-policy/ to
      `/docs/security/cvd-policy/` unchanged. It's a policy document, so a move shouldn't
      change its wording.
- [ ] **Redirect** https://spine.io/cvd-policy/ to https://spine.io/docs/security/cvd-policy/.
  - First find which repository serves `/cvd-policy/` today. It may be the main site
    repository rather than `documentation`. The redirect goes wherever the old page lives.
  - Prefer a permanent (301) redirect. If the site is on GitHub Pages, it can't send HTTP
    redirects; the usual fallback is a redirect page (e.g. Hugo `aliases`, which emits a
    `meta refresh` with a canonical link). Check that the result works for both the URL with
    a trailing slash and the one without.
  - Keep the redirect indefinitely: `/cvd-policy/` is referenced from `SECURITY.md` in every
    repository of the organization, and from outside.
- [ ] **Update internal links** on the site that point to `/cvd-policy/` (footer, other docs
      pages) to the new URL.

### 2. `.github` repository

To be merged after the site pages are live.

- [ ] **Add a "Verifying our artifacts" section** to `SECURITY.md`, after "Third-party
      components". It's a pointer, with no commands:

  ```markdown
  Verifying our artifacts
  -----------------------
  The artifacts we publish to Maven repositories carry signed build provenance: a record, in
  the [SLSA][slsa] format, of the repository, branch, and workflow that built them. This
  covers JARs, POMs, Gradle module metadata, and the SBOM published next to each module. The
  builds run on GitHub-hosted runners, in a reusable workflow that the building repository
  cannot modify, which meets SLSA v1.0 Build Level 3.

  With the provenance, you can check that a file you downloaded was built by us from a
  protected branch and has not changed since. It does not say that the artifact is free of
  vulnerabilities; to report one, please follow the instructions above.

  Artifacts published before a repository adopted this process carry no provenance, or
  provenance at a lower level. See [Verifying artifacts][verify] for the command and the
  versions it applies to.

  [slsa]: https://slsa.dev/spec/v1.0/levels
  [verify]: https://spine.io/docs/security/verifying-artifacts/
  ```

  Why it's worded this way:
  - It says "artifacts we publish to Maven repositories", not "Spine", so it stays true in
    repositories that publish nothing.
  - It says what provenance does not prove.
  - It ties "Build Level 3" to the mechanism rather than presenting it as a certification.
  - It covers legacy artifacts, so someone whose older JAR fails to verify isn't alarmed.
- [ ] **Update the `[cvd-policy]` link** in `SECURITY.md` to
      https://spine.io/docs/security/cvd-policy/. The redirect would cover the old link, but
      the file should point to the canonical URL.
- [ ] **Check the other files for `/cvd-policy/` links**: `CONTRIBUTING.md`, `README.md`,
      `profile/`, `workflow-templates/`.

### 3. `config` repository

After the "Verifying artifacts" page is live:

- [ ] **Shrink "Verifying published artifacts" in `README.md` to a pointer**: one or two
      sentences for maintainers (every `Publish` run attests through `publishing.yml`), plus
      a link to https://spine.io/docs/security/verifying-artifacts/. The site page becomes
      the only full text.
- [ ] **Keep maintainer-only notes in `config`**: re-running a failed `attest` job and the
      caller template's trigger. They belong next to `publishing.yml` (its comments already
      cover the recovery), not on the site.

## Preconditions for the wording to hold

These aren't tasks for the repositories above, but the published text depends on them:

- **Rulesets on `master`** in every repository that publishes artifacts: changes only
  through review, no force-push. Without these, "from a protected branch" in `SECURITY.md`
  and the `--source-ref` guidance are overstated.
- **Release branches.** When a repository starts publishing from a `v<major>.x` branch:
  - The ruleset must cover the `v*.x` pattern, including creating such branches.
  - The caller template `.github-workflows/publish.yml` in `config` needs `'v*.x'` added to
    its `push.branches` trigger. Today it's `[master]` only.

## Log

- 2026-09-30 — drafted from the `config` session on attestation verification. Decided:
  standalone task document; the Security policy page's embed-vs-link choice is left to
  implementation; the `config` README shrinks to a pointer once the site page exists; the
  repository serving `/cvd-policy/` is to be determined.
