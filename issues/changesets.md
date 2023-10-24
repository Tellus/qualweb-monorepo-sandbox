# Getting a handle on changesets in monorepos

Need to run some test scenarios to see how changesets version packages.

## Questions

- Do all workspaces need their own changeset conf or is a single conf in the root enough?
- How does changesets "know" which packages have seen changes? `semantic-release` for monorepos was path-based. Is this also path-based or does it need to be scoped in the changeset file itself?

# Scenarios

## Scenario 1

- Install changesets in root (I *assume* that's sufficient)
  - Make sure to config `updateInternalDependencies="patch"` (which seems to match the current usage - core gets updated with every update to @qualweb/evaluation, and not just in major/minor changes) and that @qualweb/core is set to depend on a version of @qualweb/evaluation that **is** in the workspace (currently not the case). If this isn't the case, I think maybe changesets won't force an updated dependency.
- Make a versioned changeset for a *direct* dependency of @qualweb/core (@qualweb/evaluation)
- Observe if changesets bumps versiong for @qualweb/core *and* @qualweb/evaluation.
- Observe if changesets automatically bumps the dependency @qualweb/core has on evaluations (`updateInternalDependencies`).
- Observe if changesets also bumps the version of @qualweb/core on its own. I'm hoping we don't need to put together tonnes of combos of linked packages for this.

## Scenario 2

- Install changesets in root (I *assume* that's sufficient)
  - Make sure to config `updateInternalDependencies="patch"` (which seems to match the current usage - core gets updated with every update to @qualweb/evaluation, and not just in major/minor changes) and that @qualweb/core is set to depend on a version of @qualweb/evaluation that **is** in the workspace (currently not the case). If this isn't the case, I think maybe changesets won't force an updated dependency.
- Make a versioned changeset for a *deep* dependency of @qualweb/core (@qualweb/act-rules)
- Observe if changesets bumps versiong for @qualweb/core *and* @qualweb/evaluation **and** @qualweb/act-rules.
- Observe if changesets automatically bumps the dependency @qualweb/core has on @qualweb/evaluation (and, further down, @qualweb/act-rules) (`updateInternalDependencies`).
- Observe if changesets also bumps the version of @qualweb/core on its own. I'm hoping we don't need to put together tonnes of combos of linked packages for this.

# Findings

Running with the *default* changeset settings seems to give us the exact result we want, so ignore the scenario write-ups above.

Running `npx changeset` asks you to pick which packages in the monorepo are part of the changeset you're creating, AND what kind of version bump each one needs. It automatically groups the choices into those with detected changes (commits in their directories) and those without changes - but you can still force (or prepare) a changeset for packages that haven't been updated.

Any dependents (packages that depend on the package you're updating) will have their version number patch bumped and their dependency on the package updated. This ensure that workspace packages will always depend on the newest local version (and be published with this change) without breaking versions previously published. This solves having to manage dependencies between workspace packages.

While trying this out, I noticed that changesets were complaining about version mismatches between what was available in the local workspace vs what the packages were requiring. This is probably just a result of not having access to the newest versions of package code on my end, but does need to be fixed when putting together the monorepo. If the versions aren't aligned, it looks like changesets will **not** bump versions, probably to avoid unintended breakages.