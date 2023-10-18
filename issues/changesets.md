# Getting a handle on changesets in monorepos

Need to run some test scenarios to see how changesets version packages.

## Questions

- Do all workspaces need their own changeset conf or is a single conf in the root enough?
- How does changesets "know" which packages have seen changes? `semantic-release` for monorepos was path-based. Is this also path-based or does it need to be scoped in the changeset file itself?

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