Release new version of the documentation
========

**Table of Contents**
* [Release new version](#release-new-version)
    * [Release steps](#release-steps)
    * [URLs](#urls)

## Release new version

This site supports documentation versioning. All links within the
documentation are rendered automatically.

The versions are managed in the `docs/data/versions.yml` file.

```yml
- version_id: "1"
  label: 1.9.0
  content_path: docs/1
  route_url: docs
  is_main: true
  switcher:
    visible: false
    item_visible: false
- version_id: "2-0-x"
  label: 2.0.x
  content_path: docs/2-0-x
  route_url: docs/2-0-x
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
    
The `switcher` component is under development.

The documentation content should be created under the `content/<version>/` directory.
Note that the current main version is also placed under its `version` directory.

```
content
└── docs
    ├── 1
    │   ├── client-libs
    │   ├── quick-start
    │   └── _index.md
    └── 2-0-x
        ├── client-libs
        ├── quick-start
        └── _index.md
```

Also, each version should have its own `sidenav` config inside 
the `data/docs/<version>` directory.

For modules with documentation, the config should live in `data/docs/<module>/<version>`.

```
data
└── docs
    ├── 1
    │   └── sidenav.yml
    └── 2-0-x
        └── sidenav.yml
```

### Release steps

1. Create a new directory for the documentation inside the `content/docs/<new-version>/`.
2. Create the `sidenav.yml` inside `data/docs/<new-version>/` directory.
3. Update the `data/versions.yml` config.

   For example, if you release the version `2-0-x` as the main version,
   the config should be updated as follows:
   
    ```yml
    - version_id: "1"
      label: 1.9.0
      content_path: docs/1
      route_url: docs            # Change the route from `docs` to `docs/1`.
      is_main: true              # Change the flag to `false` or delete the line.
      switcher:
        visible: false
        item_visible: false
    - version_id: "2-0-x"
      label: 2.0.x
      content_path: docs/2-0-x   # Change the content path to `docs` if the documentation will be copied to the root.
      route_url: docs/2-0-x      # Change the route from `docs/2-0-x` to `docs`.
      is_main: false             # Set `is_main` as `true`.
      switcher:
        visible: false
        item_visible: false
    ```

4. Commit and push the new version release.

Get updates into the main website:

1. Go to the [`SpineEventEngine.github.io`](https://github.com/SpineEventEngine/SpineEventEngine.github.io) 
   repository.
2. Get theme updates `hugo mod get -u github.com/SpineEventEngine/documentation/docs`.
3. Update the `config/_default/hugo.toml` to make the version `2` as main.

### URLs

All URLs inside `content/docs/<version>/` are automatically managed
according to the current documentation version.

Use links in documentation as follows, without including a version:

`[Requirements](docs/guides/requirements/)`.

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
* {{% version %}} adds the full version of the current page -> `1.9.0`, or `2.0.0`.

To provide a specific version for example in FAQ or Release Notes, use:

```markdown
{{% version "1" %}}
```

It will always render the latest “full” version of `1`, for example now it is `1.9.0`.
