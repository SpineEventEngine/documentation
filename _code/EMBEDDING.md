Embedding code
======

We use the [embed-code][embed-code-repo] tool (Go version) to embed code snippets
to markdown pages. Take a look on its [README][embed-code-readme] file to know 
how it works.

## Prerequisites

### Obtain `embed-code` executable

Firstly, we need to download the last available executable of `embed-code`.
Originally, this tool was written as a plugin for Jekyll, but now it is also
available as a binary executable written in Go.

1. Open [embed-code][embed-code-repo] repository.
2. Switch to `embed-code-go` branch.
3. Go to `embed-code-go/bin` and download an executable suitable for you OS.
4. Put it to `_code` directory of this repository.

### Download code snippets

The `_code` directory contains the source code, which is embedded into the pages 
of the spine.io documentation:

* `examples` — contains examples selected from the repositories under `spine-examples`
  organization. These repositories are added to this project as Git submodules.

To get the latest version of the code snippets, update the submodules:

```shell
git submodule update --remote
```

### Config files

As for now, there is the `_code/config-v1.yml` config file for Spine v1.

## Usage patterns

First, update the code snippets, and then migrate the updated snippets 
to the documentation files using the tool. The most important points here are:

1. Choose the correct config file (or create / modify one).
2. Check out the correct branch in the repository with snippets.
3. Make sure the used Spine version in snippets matches your expectations.
4. After code embedding, please always review the changes made to `.md` 
   or `.html` files.

### How to update an existing code snippet?

1. Update the snippet in the appropriate repository.
2. Make sure it builds successfully: `./gradlew build`.
3. Go to `SpineEventEngine/documentation` project.
4. Navigate to the `_code` directory.
5. Execute the binary based on your operating system and architecture: 
   `./embed-code-<os> -config-path="config-of-your-choice.yml" -mode="embed"`.

   For example:
   ```shell
   ./embed-code-macos -config-path="config-v1.yml" -mode="embed"
   ```

### How to add a new code snippet?

1. Add a new snippet in the appropriate repository.
2. Make sure it builds successfully: `./gradlew build`.
3. Go to `SpineEventEngine/documentation` project and insert code 
   embedding directives where needed.
4. Navigate to `_code` directory.
5. Execute: `./embed-code -config-path="config-of-your-choice.yml" -mode="embed"`.

   For example:
   ```shell
   ./embed-code-macos -config-path="config-v1.yml" -mode="embed"
   ```

### How to remove a code snippet?

1. Remove the snippet in the appropriate repository.
2. Remove its code embeddings in the markdown files.
3. Make sure there are no embeddings of the removed snippet anymore:
   `./embed-code-<os> -config-path="config-of-your-choice.yml" -mode="check"`.

   For example:
   ```shell
   ./embed-code-macos -config-path="config-v1.yml" -mode="check"
   ```

## Troubleshooting

If you encounter an error indicating that the executable file cannot be run,
it likely does not have execution permissions. To grant execution rights 
on Linux or macOS, run the following command from the `_code` directory:

```shell
chmod +x embed-code-macos
```

[embed-code-repo]: https://github.com/SpineEventEngine/embed-code
[embed-code-readme]: https://github.com/SpineEventEngine/embed-code/blob/embed-code-go/embed-code-go/README.md
