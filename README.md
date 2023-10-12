# QualWeb monorepo sandbox

This repository is an *example* of how a monorepo for the QualWeb ecosystem could look. The git history will be messy, and several changes might be made to packages in order for the monorepo to function.

## Steps to (re)create

### Create empty repo

Create a new empty git repo as base for the monorepo. Add an empty file (suggestion: run `npm init` and commit the package.json file) and make an initial commit.

### Clone all incoming repos

Clone all repositories that need to be part of the new monorepo.

With the Fish shell and using the repos.txt file:

```bash
for i in (cat repos.txt); git clone https://github.com/qualweb/$i; end;
```

### Rewrite git histories

For each repo, rewrite the git history so all paths that refer to the root of the package will point to the future location of the monorepo. For example, `@qualweb/core` should reside in "packages/core" in future, `@qualweb/act-rules` in "packages/act-rules", and so on.

To rewrite, use [git-filter-repo](https://github.com/newren/git-filter-repo/): `git filter-repo --source SOURCE_DIR --target TARGET_DIR --to-subdirectory-filter packages/REPO_NAME --tag-rename '':'REPO_NAME-`

- SOURCE_DIR is the original location of the cloned repo.
- TARGET_DIR should be an exact copy of the cloned repo. You can run the command to change the git history in-place, but then you need to re-clone if you have to re-do a step.
- REPO_NAME is the name of the package - probably the same as the directory ("@qualweb/act-rules" by default gets put into a directory called "act-rules").

The command will rewrite the entire git history of the repo, making it look like all changes happened in a subdirectory "packages/REPO_NAME" rather than the root. This makes it fit for merging directly into the monorepo.

Example: assume that all single repos are in a separate directory:

```bash
for i in (ls -D -1); cp -R $i $i-rewrite; git filter-repo --source $i --target $i-rewrite --to-subdirectory-filter packages/$i --tag-rename '':"$i-"; end;
```

### Merge changes into monorepo

In the monorepo, for each repo you want to add:

```bash
# Add the local rewritten repo as a remote.
git remote add REPO_NAME_local PATH_TO_REPO
# Update references
git fetch REPO_NAME_local
# Merge in the entire history. Since the monorepo and single repos have nothing in common, the flag is necessary.
git merge --allow-unrelated-histories REPO_NAME_local/DEFAULT_BRANCH
```

"DEFAULT_BRANCH" is the name of the default/main branch of the repo. In newer Git repos, this is "main". In older repos, it is probably "master". (Looks like the only repo using "main" is "locale").

In the commit message, make sure to clarify that this merge commit imports a separate repo's history.

Example: using the results from the previous example (rewrites):

```bash
for i in (ls -D -1 ../github_repos/ | grep "\\-rewrite"); git remote add $i_local ../github_repos/$i; git fetch $i_local
```

Individually, run `git merge --allow-unrelated-histories $i_local/master` (replace "master" with "main")... just because it's almost more work to filter out the branch name.

### Configure NPM workspace

In the monorepo's `package.json` (in the root), the following changes should be made:

Set `private: true` so NPM will always refuse to publish the package. Since this is a "meta" package of sorts, this is a good safety precaution.

Add a `workspaces` field. Its value is an array where each member points to a single underlying repo. Example:

```json
{
  "workspaces": [
    "packages/core",
    "packages/act-rules",
    "packages/qw-element"
  ]
}
```

### Fix up everything else

You now have a *barebones* monorepo for the QualWeb ecosystem. run `npm i` in the root to install dependencies for the entire monorepo. It will likely fail to due conflicting dependency versions and failling post-install scripts.

### Using workspaces

See NPM's [documentation](https://docs.npmjs.com/cli/v10/using-npm/workspaces) for more info, but a quick primer:

To run a command for a specific workspace, you can run `npm` from within the workspace's folder (packages/some-repo) or from the root with `npm -w some-repo`.

`npx` should be usable in the same way.

NPM "should" be able to figure out when a package depends on another package in the monorepo, and link them up transparently in node_modules. This also means that they will use their own local code when run in a dev environment - useful for iterating across several packages.