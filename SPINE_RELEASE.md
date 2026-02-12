Release new version of the documentation
========

**Table of Contents**
* [Version configuration](#version-configuration)
  * [Content](#content)
  * [Sidenav](#sidenav)
* [Release new version](#release-new-version)
  * [Change the current main version](#change-the-current-main-version)
* [URLs](#urls)

## Version configuration

This site supports documentation versioning. All links within the documentation
are rendered automatically.

Each documentation module manages its versions in its own `docs/data/versions.yml` file.
The structure is the same for all modules, but the top-level key must match the module name.

In the current repository, versions are defined under the `docs` key:

```yml
docs:
  - version_id: "1"
    label: 1.9.0
    content_path: docs
    route_url: docs
    is_main: true
    switcher:
      visible: false
      item_visible: false

  - version_id: "2"
    label: 2.0.0
    content_path: docs/2
    route_url: docs/2
    switcher:
      visible: false
      item_visible: false
```

In the `validation` repository:

```yml
validation:
  - version_id: "2-0-0-snapshot"
    label: 2.0.0-SNAPSHOT
    content_path: docs/validation
    route_url: docs/validation
    is_main: true
    switcher:
      visible: false
      item_visible: false

  - version_id: "2-0-x"
    label: 2.0.x
    content_path: docs/validation/2-0-x
    route_url: docs/validation/2-0-x
    switcher:
      visible: false
      item_visible: false
```

Where:

* `version_id` – a major or minor version identifier used to generate the correct side navigation structure.
* `label` – the full version label displayed in the version switcher and available via the `{{< version >}}` shortcode.
* `content_path` – the relative path (from the `content/` directory) to the documentation files for this version.
* `route_url` – the base URL used when generating internal links within this documentation version.
* `is_main` – optional flag indicating that this version is the main documentation version.
* `switcher`:
    * `visible` – specifies whether the version switcher will be visible on the page.
    * `item_visible` – specifies whether the version will be available in the switcher dropdown.

### Content

The documentation content should be placed under `content/docs/<version>/` directory.

For the main version, content can either be under its version directory or at
the root – this is controlled by the `content_path`.

For example if the main version is in the root:

```
content
└── docs
    ├── client-libs
    ├── quick-start
    ├── _index.md
    └── 2
        ├── client-libs
        ├── quick-start
        └── _index.md
```

In the `validation` repository:

```
content
└── docs
    └── validation
        ├── client-libs
        ├── _index.md
        └── 2-0-x
            ├── client-libs
            └── _index.md
```

### Sidenav

Each version should have its own sidenav configuration file, located either in:
- `data/docs/<version>/sidenav.yml` for this repository; 
- `data/docs/<module>/<version>/sidenav.yml` for documentation modules in their corresponding repositories.

## Release new version

1. Create a new directory for the documentation inside the `content/docs/<new-version>/`.
2. Create the `sidenav.yml` inside `data/docs/<new-version>/` directory.
3. Add the new version to `data/versions.yml` config.

### Change the current main version

This flow applies to the current documentation repository. For modules, the same
steps must be done in the corresponding repository using the appropriate paths
for that module.

This example shows how to switch from version 1 to version 2.

The current main version can be located either in the root folder or in its
versioned folder and configured via `module.mounts`.

1. If the main version is in the root, we also need to manually adjust folder 
   structures and move:
   - `content/docs/*` -> `content/docs/1/`
   - `content/docs/2` -> `content/docs`

2. Update the version configuration in `docs/data/versions.yml`:

   ```yml
   docs:
     - version_id: "1"
       label: 1.9.0
       content_path: docs     # Change the path from `docs` to `docs/1`.
       route_url: docs        # Change the route from `docs` to `docs/1`.
       is_main: true          # Change the flag to `false` or delete the line.
       switcher:
         visible: false
         item_visible: false
     - version_id: "2"
       label: 2.0.0
       content_path: docs/2   # Change the content path to `docs` if the documentation will be copied to the root.
       route_url: docs/2      # Change the route from `docs/2` to `docs`.
       is_main: false         # Set `is_main` as `true`.
       switcher:
         visible: false
         item_visible: false
   ```

Now the version 2 will be available at the `https://spine.io/docs/` URL.

Get updates into the main website:

1. Go to the [`SpineEventEngine.github.io`](https://github.com/SpineEventEngine/SpineEventEngine.github.io) 
   repository.
2. Get theme updates `hugo mod get -u github.com/SpineEventEngine/documentation/docs`.

## URLs

All URLs inside `content/docs/<version>/` are automatically managed
according to the current documentation version.

Use links in documentation as follows, without including a version.

For this repository: `[Requirements](docs/guides/requirements/)`.

In the `validation` repository: `[Requirements](docs/validation/guides/requirements/)`.

Please note:

* All internal links **must not** start with a slash.
* Each link should **end with a slash** to prevent unnecessary redirects.

The link above will be automatically rendered as:

- `"<baseurl>/docs/guides/requirements/"` – for main version.
- `"<baseurl>/docs/2/guides/requirements/"` – for the version `2`.
- `"<baseurl>/docs/3/guides/requirements/"` – for the version `3`.

To render the current documentation full version inside API URL,
use `{{% version %}}` shortcode:

```markdown
[CoreJvm]({{% version %}})

[CoreJvm {{% version %}}]({{% get-site-data "repositories.core_jvm_repo" %}}/index.html)
```

Will be rendered as:

```html
<a href="/1.9.0">CoreJvm</a>

<a href="https://github.com/SpineEventEngine/core-jvm" target="_blank">CoreJvm 1.9.0</a>
```

Where:

* {{% get-site-data "repositories.core_jvm_repo" %}} will apply the `core_jvm_repo`
  from the `site-commons` -> `data/repositories.yml` file.
* {{% version %}} adds the full version label of the current page -> `1.9.0`, or `2.0.0`.

To provide a specific version for example in FAQ or Release Notes, use:

```markdown
{{% version "1" %}}
```

It will always render the latest “full” label version of `1`, for example now it is `1.9.0`.
