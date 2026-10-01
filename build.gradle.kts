/*
 * Copyright 2026 CodeMatters, Lda.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

/**
 * Builds and runs the site locally.
 */
task<Exec>("runSite") {
    dependsOn("installDependencies")
    commandLine("./docs/_script/hugo-serve")
}

/**
 * Builds the site without starting the server.
 */
task<Exec>("buildSite") {
    dependsOn("installDependencies")
    commandLine("./docs/_script/hugo-build")
}

/**
 * Installs the Node.js dependencies required for building the site.
 */
task<Exec>("installDependencies") {
    commandLine("./docs/_script/install-dependencies")
}

/**
 * Embeds the code samples into pages of the site.
 */
task<Exec>("embedCode") {
    commandLine("./docs/_script/embed-code")
}

/**
 * Verifies that the source code samples embedded into the pages are up-to-date.
 */
task<Exec>("checkSamples") {
    commandLine("./docs/_script/check-samples")
}

/**
 * Builds all included projects via depending on the top-level "buildAll" tasks
 * declared in these projects.
 *
 * See also:
 *  * [Composite build to build subprojects](https://discuss.gradle.org/t/defining-a-composite-build-only-to-build-all-subprojects/25070/6)
 *  * [Gradlew composite build example](https://github.com/AlexMAS/gradle-composite-build-example)
 *  * [Composite builds](https://docs.gradle.org/current/userguide/composite_builds.html)
 */
tasks.register("buildAll") {
    dependsOn(gradle.includedBuilds.map { it.task(":buildAll") })
}
