Release new version of the documentation
========

**Table of Contents**
* [Release major version](#release-major-version)
    * [Release steps](#release-steps)
    * [URLs](#urls)

## Release major version

This site supports documentation versioning. All links within the
documentation are rendered automatically.

The versions are managed in the `docs/data/versions.yml` file.

```yml
- short: "1"
  full: 1.9.0
  path: docs
  is_main: true
  switcher:
    visible: false
    item_visible: false
- short: "2"
  full: 2.0.0
  path: docs/2
  switcher:
    visible: false
    item_visible: false
```

Where:

* `short` shows the major version number, which will be used primarily for the link generation.
* `full` the full version that will be visible in the version switcher.
* `path` will be used when generating links inside a documentation version.
* `is_main` the optional flag that marks the current main version.
* `switcher`:
    * `visible` specifies whether the version switcher will be visible on the page.
    * `item_visible` specifies whether the version will be available in the switcher dropdown.
    
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
    └── 2
        ├── client-libs
        ├── quick-start
        └── _index.md
```

Also, each version should have its own `sidenav` config inside 
the `data/docs/<version>` directory.

```
data
└── docs
    ├── 1
    │   └── sidenav.yml
    └── 2
        └── sidenav.yml
```

### Release steps

1. Create a new directory for the documentation inside the `content/docs/<new-version>/`.
2. Create the `sidenav.yml` inside `data/docs/<new-version>/` directory.
3. Update the `data/versions.yml` config.

   For example, if you release the version `2` as the main version,
   the config should be updated as follows:

    ```yml
    - short: "1"
      full: 1.9.0
      path: docs           # Change the path from `docs` to `docs/1`.
      is_main: true        # Change the flag to `false` or delete the line.
      switcher:
        visible: false
        item_visible: false
    - short: "2"
      full: 2.0.0-eap      # Change the version to `2.0.0` if needed.
      path: docs/2         # Change the path from `docs/2` to `docs`.
      is_main: false       # Set `is_main` as `true`.
      switcher:
        visible: false
        item_visible: false
    ```

4. Update the `site/config/_default/hugo.toml` to make the version `2` as main.

    - Navigate to the end of the file to the section "Version control config".
    - Find the `path` parameters and update as follows:
      ```
      path = '{/docs/1}' -> path = '{/docs/2}'
      path = '{/docs/1/**}' -> path = '{/docs/2/**}'
      ```

   Now the version `2` will be available at the `<domain>/docs/` URL and
   will be opened by default.

5. Commit and push the new version release.

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

[CoreJvm {{% version %}}]({{% get-site-data "spine.core_jvm_repo" %}}/index.html)
```

Will be rendered as:

```html
<a href="/1.9.0">CoreJvm</a>

<a href="https://github.com/SpineEventEngine/core-jvm" target="_blank">CoreJvm 1.9.0</a>
```

Where:

* {{% get-site-data "spine.core_jvm_repo" %}} will apply the `core_jvm_repo`
  from the `data/spine.yml` file.
* {{% version %}} adds the full version of the current page -> `1.9.0`, or `2.0.0`.

To provide a specific version for example in FAQ or Release Notes, use:

```markdown
{{% version "1" %}}
```

It will always render the latest “full” version of `1`, for example now it is `1.9.0`.
