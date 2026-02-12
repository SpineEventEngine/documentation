# Welcome to Spine Documentation repository

This repository serves for three purposes:

1. The [Wiki][spine-wiki] provides documentation for developers contributing to the framework, Commiters.
2. Gathering issues improving the documentation of the framework and tasks on writing articles at spine.io and other web resources.
3. Storing documentation files that are added as a Hugo module to the [spine.io][spine-repo] repository.

We have repository for the code of [spine.io](https://spine.io) site. 
Issues there are for improving the site features. 

Tasks for the content of the [spine.io](https://spine.io) site should belong 
to issues of _this_ repository.

This repository is made to be self-sustainable in terms of editing. 
A fully-fledged Hugo site has been set up for it. All the contents and links 
are working as intended. It allows making changes more convenient for authors.

## Prerequisites

1. JDK 8 (x86_64).
2. [Go][go] `1.12` or newer.
3. [Node.js][nodejs] `18+`.
4. [Hugo Extended][hugo-quick-start] in version `v0.150.0` or higher.

## Configuration

1. Install project dependencies from the `docs/_preview` directory by running `npm install`.

## Running the documentation locally

The project has two directories:

* `docs` – contains the documentation files along with all the necessary 
   page JS and images. This directory will be added to
  `SpineEventEngine/SpineEventEngine.github.io` as a Hugo Module.
* `docs/_preview` – contains the setup needed only to run the
   documentation locally.

To build and launch the site on the local server:

```shell
./gradlew :runSite
```

To build the site without running the server:

```shell
./gradlew :buildSite
```

Another way to run the site locally is to follow these steps:

1. Navigate to the `docs/_preview` folder.
2. Start the local server with this command:

   ```shell
   hugo server
   ```

If you receive a `permission denied` message, but you are sure that you have 
all the rights to the [required repositories](#prerequisites), try clearing 
the cache:

```shell
hugo mod clean --all
```

Then run the `hugo serve` again.

## Theme updates

This project uses components, layouts, and styles from the 
[`site-commons`][site-commons] Hugo theme.

Please note that if you update a theme with any critical changes, it must also
be updated in the main `spine.io` site repository.

To get theme updates:

1. Navigate to the `docs/_preview` directory.
2. Clean the module cache:

   ```shell
   hugo mod clean
   ```

3. Update the Hugo Modules:

   ```shell
   hugo mod get -u github.com/SpineEventEngine/site-commons
   ```

4. Commit and push changes from `go.mod` and `go.sum` files.
   In the `go.sum` file, keep only the two required entries for each theme to avoid file clutter.

## Other documentation modules

This repository is set up as a documentation aggregator.
That means it can pull documentation from other repositories and build 
everything together into one site with the common side-navigation.

### Add a new documentation module

1. Open `docs/hugo.toml`.
2. Add the module to the `module.imports` list.
3. Update `moduleOrder` to control how modules appear in the sidenav.
   By default, all modules are rendered in alphabetical order.

The config example:

```toml
[params]
  # Specifies the order of the sidenav modules.
  moduleOrder = ["framework", "validation", "compiler"]

[module]
  [[module.imports]]
    path = 'github.com/SpineEventEngine/validation/docs'
    disable = false
  [[module.imports]]
    path = 'github.com/SpineEventEngine/framework/docs'
    disable = false
  [[module.imports]]
    path = 'github.com/SpineEventEngine/compiler/docs'
    disable = false
```

Setting `disable = true` temporarily excludes a module from building without 
removing its config.

### Get documentation module updates

1. Navigate to the `docs/_preview` directory.
2. Update the needed module:
   ```shell
   hugo mod get -u github.com/SpineEventEngine/validation/docs
   ```

   or update all the modules recursively (including the `site-commons`):

   ```shell
   hugo mod get -u ./...
   ```

## Code samples

The code samples used in the framework documentation are added using
the [`embed-code`][embed-code] tool (Go version).

The code resides under the `docs/_code` directory. For instructions on embedding 
the code into the pages, please see the [`EMBEDDING.md`](EMBEDDING.md) file.

Please note that the following part of the script requires an ARM-based Mac.

To embed the code samples, run:

```shell
./gradlew :embedCode
```

To verify that the source code samples embedded into the pages are up-to-date, run:

```shell
./gradlew :checkSamples
```

## Product release

To release a new version of Spine documentation, see the [SPINE_RELEASE.md](SPINE_RELEASE.md).

## Authoring

For instructions on adding the content to the documentation, please see
the [`AUTHORING.md`][authoring-guide] file.

## Troubleshooting

1. If you are getting the terminal `prompts disabled error` when trying to get
   theme updates, make sure you have allowed 2FA to do its job. Also, if you have
   authentication issues during submodules update. You can resolve it with this
   command:

   ```shell
   git config --global --add url."git@github.com:".insteadOf "https://github.com/"
   ```

2. If you are getting the `unknown revision upgrade` error when trying to get
   theme updates, clean the module cache:

   ```shell
   hugo mod clean --all
   ```

[go]: https://go.dev/doc/install
[nodejs]: https://nodejs.org/en/download/current
[hugo-quick-start]: https://gohugo.io/getting-started/quick-start/#step-1-install-hugo
[site-commons]: https://github.com/SpineEventEngine/site-commons
[embed-code]: https://github.com/SpineEventEngine/embed-code-go
[authoring-guide]: https://github.com/SpineEventEngine/SpineEventEngine.github.io/blob/master/AUTHORING.md
[spine-repo]: https://github.com/SpineEventEngine/SpineEventEngine.github.io
[spine-wiki]: https://github.com/SpineEventEngine/documentation/wiki
