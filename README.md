# Welcome to Spine Documentation repository

This repository serves for three purposes:

1. The [Wiki](https://github.com/SpineEventEngine/documentation/wiki) provides documentation for developers contributing to the framework, Commiters.
2. Gathering issues improving the documentation of the framework and tasks on writing articles at spine.io and other web resources.
3. Storing documentation files that are added as a submodule to the [spine.io](https://github.com/SpineEventEngine/spine.io) repository.

We have repository for the code of [spine.io](https://spine.io) site. Issues there are for improving the site features. 

Tasks for the content of the [spine.io](https://spine.io) site should belong to issues of _this_ repository.

This repository is made to be self-sustainable in terms of editing. A fully-fledged Jekyll site
has been set up for it. All the contents and links are working as intended. It allows making 
changes more convenient for authors. To make it all possible this repository has its
own `docs` folder — otherwise all links would be broken.

# Prerequisites

1. Install Ruby.
2. Install the `bundler` tool.
3. Install the project dependencies by running `bundle install`.

Now you should be able to run the documentation locally.

# Running the documentation locally

To build and launch the site on the local server:
```
bundle exec jekyll serve
```

# Code samples

The code samples used in the framework documentation are added using
the [`embed-code`](https://github.com/SpineEventEngine/embed-code) Jekyll subcommand.

The code resides under the `_code` directory. For instructions on embedding the code into the pages,
please see the [`EMBEDDING.md`](https://github.com/SpineEventEngine/spine.io/blob/master/_code/EMBEDDING.md) file.

# Authoring

For instructions on adding the content to the documentation, please see
the [`AUTHORING.md`](https://github.com/SpineEventEngine/spine.io/blob/master/AUTHORING.md) file.

# Styles and assets

Styles were placed inside the `_sass` folder. And were separated into two import files:
- `docs.scss` — contains styles responsible for the appearance of the documentation. 
Should be imported into the main spine.io site.
- `docs-common.scss` — contains styles that should only be used to build this site. 
They are responsible for the common site layout and should not be imported into 
the main spine.io site to not override or duplicate styles there.

The `_css`, `_favicons`, and `_fonts` have been configured not to be built in the main repository.

The images should be placed inside `img/docs` folder to be automatically included in the main site 
and avoid accidental overrides for files with the same name.
