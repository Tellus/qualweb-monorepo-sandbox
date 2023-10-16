# Prepare scripts

The `prepare` script is run in several cases:

- `npm install` (when checked out via Git for development but NOT when used as a dependency)
- `npm cache add` (internal)
- `npm ci` ("clean install" - used by CI/CD)
- `npm diff`
- `npm pack`
- `npm publish`
- `npm rebuild`

For QualWeb, it looks like `prepare` is used to make sure that a package has been built before publishing. That makes a lot of sense. Using the `prepare` lifecycle hook, however, means that the build script is run at times when it is bound to fail.

For a monorepo, notably, the `prepare` scripts of each workspace is run before all depdendencies have been installed. Further, I don't think NPM has a notion of package precedence when installing all packages in a workspace, so you run the risk of scripts failing to run and the install process getting aborted.

Consider whether the current `prepare` scripts could be placed in a different lifecycle hook, perhaps `prepublish`?