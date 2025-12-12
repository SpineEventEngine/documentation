# Welcome to Spine Documentation repository

This repository serves for three purposes:

1. The [Wiki][spine-wiki] provides documentation for developers contributing to the framework, Commiters.
2. Gathering issues improving the documentation of the framework and tasks on writing articles at spine.io and other web resources.
3. Storing documentation files that are added as a submodule to the [spine.io][spine-repo] repository.

We have repository for the code of [spine.io](https://spine.io) site. 
Issues there are for improving the site features. 

Tasks for the content of the [spine.io](https://spine.io) site should belong 
to issues of _this_ repository.

This repository is made to be self-sustainable in terms of editing. 
A fully-fledged Hugo site has been set up for it. All the contents and links 
are working as intended. It allows making changes more convenient for authors.

## Prerequisites

1. Install [Go][go] at least version `1.12`.
2. Install [Node.js][nodejs]. Its version should be `18+`.
3. Install [Hugo Extended][hugo-quick-start] at least version `v0.145` or higher.
4. Get access to the [`site-commons`][site-commons] repository from the admins
   to be able to download the theme.
5. Make sure SSH is configured correctly and the passphrase is stored in the keychain.
   See the corresponding guide. TBD.

## Running the documentation locally

The project has two directories:

* `_hugo-theme` – contains the documentation files along with all the necessary
  JS and CSS files. This directory will be added to
  `SpineEventEngine/SpineEventEngine.github.io` as a Hugo Module.
* `_hugo-site` – contains the HTML and CSS files needed only to run the
  documentation locally.

To run the documentation locally:

1. Navigate to the `_hugo-site` directory.
2. Install project dependencies:

   ```shell
   npm install
   ```

3. Run the site locally:

   ```shell
   hugo server
   ```

If you receive a `permission denied` message, but you are sure that you have 
all the rights to the [required repositories](#prerequisites), try clearing 
the cache and run the `hugo serve` again:

```shell
hugo mod clean --all
```

## Theme updates

This project uses several components from the [`site-commons`][site-commons] 
Hugo theme.

Please note that if you update a theme with any critical changes, it must also
be updated in the main `spine.io` site repository.

To get theme updates:

1. Navigate to the `_hugo-site` directory.
2. Clean the module cache:

   ```shell
   hugo mod clean
   ```

3. Update the Hugo Modules:

   ```shell
   hugo mod get -u
   ```

4. Commit and push changes from `go.mod` and `go.sum` files.
   In the `go.sum` file keep only two last records to avoid file cluttering.

## Code samples

The code samples used in the framework documentation are added using
the [`embed-code`][embed-code] Go subcommand.

The code resides under the `_code` directory. For instructions on embedding 
the code into the pages, please see the [`EMBEDDING.md`](./_code/EMBEDDING.md) file.

## Product release

To release a new version of Spine documentation, see the [SPINE_RELEASE.md](SPINE_RELEASE.md).

## Authoring

For instructions on adding the content to the documentation, please see
the [`AUTHORING.md`][authoring-guide] file.

## Styles and assets

The documentation related styles are placed inside `_hugo-theme/assets/scss`.
There are two main import files:

* `docs-common.scss` — contains the common styles that are also necessary for
  the `SpineEventEngine/SpineEventEngine.github.io` repository. To not duplicate
  global variables and layout styles, import the file in the main repository 
  _at the top_ of the `main.scss`
* `docs.scss` — contains styles responsible for the appearance of the documentation. 
  Should be imported into the `main.scss` of the `spine.io` site as well.

Styles needed only for running the documentation locally are located 
in `_hugo-site/assets/scss`. They will not be available on `spine.io`.

The `_hugo-theme/static` directory will be automatically included in the main site.

## Troubleshooting

1. If you are getting the terminal `prompts disabled error` when trying to get
   theme updates, make sure you have allowed 2FA to do its job. Also if you have
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
[site-commons]: https://github.com/TeamDev-Ltd/site-commons
[embed-code]: https://github.com/SpineEventEngine/embed-code/tree/embed-code-go
[authoring-guide]: https://github.com/SpineEventEngine/SpineEventEngine.github.io/blob/master/AUTHORING.md
[spine-repo]: https://github.com/SpineEventEngine/SpineEventEngine.github.io
[spine-wiki]: https://github.com/SpineEventEngine/documentation/wiki
