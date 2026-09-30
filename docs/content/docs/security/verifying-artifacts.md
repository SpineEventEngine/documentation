---
title: Verifying artifacts
headline: Documentation
description: How to check that a Spine Event Engine artifact was built by us, from the repository and branch you expect, and has not changed since.
---

# Verifying artifacts

{{% note-block class="lead" %}}
The artifacts we publish to Maven repositories carry signed build provenance. This page shows
how to check it for a file you downloaded.
{{% /note-block %}}

## What is attested

Every file of every Maven publication is attested: the JARs, the POM, the Gradle module
metadata, and the software bill of materials (SBOM, `*.spdx.json`) published next to each
module.

The attestation is a build provenance record in the format of [SLSA][slsa-provenance]
(Supply-chain Levels for Software Artifacts) v1.0, signed with [Sigstore][sigstore] and stored
on GitHub. It names the repository, the branch, and the workflow that built the file, together
with the file's digest.

The builds run on GitHub-hosted runners, in a reusable workflow kept in
the [`config`][config] repository. The repository that builds an artifact calls this workflow
but cannot change its steps. The job that signs the provenance runs none of that repository's
code. Together, these properties meet [SLSA v1.0 Build Level 3][slsa-levels].

## What a successful check means

When the check passes, you know that:

- the file was built by our workflow, in the repository you named, from the branch you named;
- the file has not been modified since it was built.

A passing check does not mean that the artifact is free of vulnerabilities. To report
a vulnerability, please follow the [“Security policy”](docs/security/policy/).

## Before you start

1. Install the [GitHub CLI][gh] and sign in with `gh auth login`. The check fetches
   the attestation through the GitHub API.
2. Get the file you want to check. Download it from the Maven repository that hosts it, or
   take it from the Gradle cache, where Gradle keeps the files your build resolved:

   ```text
   ~/.gradle/caches/modules-2/files-2.1/<group>/<artifact>/<version>/<hash>/<file>
   ```

   A file from the cache is the exact file your build used.

## Running the check

```bash
gh attestation verify <file> \
  -R SpineEventEngine/<repository> \
  --signer-workflow SpineEventEngine/config/.github/workflows/publishing.yml \
  --source-ref refs/heads/<branch>
```

Where:

- `<file>` is the path to the downloaded file.
- `<repository>` is the GitHub repository that built the artifact. The `<scm>` section of
  the artifact's POM names it.
- `<branch>` is the branch the artifact was built from.
  See [“Choosing the branch”](#choosing-the-branch).

For example, to check `spine-base-2.0.0-SNAPSHOT.443.jar`, which is built in
the `base-libraries` repository:

```bash
gh attestation verify spine-base-2.0.0-SNAPSHOT.443.jar \
  -R SpineEventEngine/base-libraries \
  --signer-workflow SpineEventEngine/config/.github/workflows/publishing.yml \
  --source-ref refs/heads/master
```

When the check passes, the command reports that the verification succeeded and exits with
status 0. Otherwise, it prints the reason and exits with a non-zero status.
See [“If the check fails”](#if-the-check-fails).

## Why each flag is there

- `-R` (`--repo`) names the repository the file was built from. An attestation made in any
  other repository does not pass.
- `--signer-workflow` pins the workflow that signed the attestation: the reusable workflow in
  `config`, which defines the steps of the build.
- `--source-ref` pins the branch. The workflow fixes the steps of the build, but not the code
  they build: a caller workflow added to an unreviewed branch could run the same reusable
  workflow over that branch's code and get an attestation signed the same way. Pinning
  a branch whose changes go through review closes that gap. The value is compared exactly,
  and each check accepts one ref.

## Choosing the branch

- `master` is the current line of development. Most artifacts are built from it.
- `v<major>.x`, e.g. `v2.x`, is the release branch of an earlier version family, in
  repositories that maintain one. Releases of that family published from the branch verify with
  `refs/heads/v2.x`. Versions of the family built on `master` before the branch was cut still
  verify with `refs/heads/master`.

When unsure, check with `master` first.

## If the check fails

A check fails for one of these reasons:

- **The branch does not match.** An artifact built from a release branch fails a check with
  `master`, and the other way around. Check with the other branch.
- **The version has no attestation.** Versions published before their repository started
  attesting its artifacts carry none. Their check fails whatever the flags, with
  an `HTTP 404: Not Found` error: GitHub has no attestation for the file.
- **The version was attested by an earlier workflow.** Versions published before their
  repository moved to the reusable workflow were attested by the repository's own workflow.
  They pass with `-R` and `--source-ref`, and fail with `--signer-workflow`. That is the check
  working as intended: the building repository could change the steps that built them.

If none of these explains the failure (say, a recently published version fails with
`HTTP 404`), the file may have been modified since it was built. Please do not use it, and
report the failure as described in the [“Security policy”](docs/security/policy/), rather
than in a public issue.

## Stricter pinning

`--signer-workflow` accepts the reusable workflow at any commit of `config`. To pin the exact
commit that built the file, add `--signer-digest <commit>`. The commit is the one named in
the `uses:` line of the building repository's `.github/workflows/publish.yml` at the time
the version was published.

[slsa-provenance]: https://slsa.dev/spec/v1.0/provenance
[slsa-levels]: https://slsa.dev/spec/v1.0/levels
[sigstore]: https://www.sigstore.dev/
[gh]: https://cli.github.com/
[config]: https://github.com/SpineEventEngine/config
