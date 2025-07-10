# fist-bump 👊

> [!NOTE] Use [googleapis/release-please](https://github.com/googleapis/release-please) instaed. It's time tested and maintained unlike this hobby project ;)

> Bump the version of your package.json based on your commit messages

## features

- [x] Bump the version of your package.json based on your commit messages
- [x] Automatically ammend version update to the last commit
- [ ] Integrate with git hooks (coming soon)

## installation

> Recommended to install as a dev dependency

```bash
npm install --save-dev fist-bump
```

## usage

```bash
# current version: 1.0.0

# prefixing a commit message with the supported keywords
git commit -m 'feature: added new feature'

# run fist bump to update the version of your package.json
npx fistbump

# the new version => 1.1.0
# the updated commit message => '[1.1.0] feature: added new feature'
```

*good to know:* `fist-bump` will skip any commits that have '[skip]' and '[wip]' or an existing version tag in the commit message.

## configuration

To customize this `fist-bump`, all you have to do is add a `fistbump` property to your `package.json` file.

```json
{
 "fistbump": {
  "patch": [ "fix", "patch" ], // `1.0.0` -> `1.0.1`
  "minor": [ "feature", "config", "minor" ], // `1.0.0` -> `1.1.0`
  "major": [ "breaking", "release", "major" ], // `1.0.0` -> `2.0.0`
  "position": "start" // `(v1.1.0) feature: added new feature`
 }
}
```

> Note: the example above shows the configuration values

### versioning keywords

The `patch`, `minor`, `major` properties represent the type of version bump that will be applied to your package.json (see [semantic versioning](https://docs.npmjs.com/about-semantic-versioning) for more details):

| type    | default keywords               | version bump       | description                               |
| ------- | ------------------------------ | ------------------ | ----------------------------------------- |
| `patch` | `fix`, `patch`                 | `1.0.0` -> `1.0.1` | bug fix, backwards compatible             |
| `minor` | `feature`, `config`, `minor`   | `1.0.0` -> `1.1.0` | new feature, backwards compatible         |
| `major` | `breaking`, `release`, `major` | `1.0.0` -> `2.0.0` | breaking change, not backwards compatible |

The keywords are case sensitive and will be matched against the following pattern in your commit message: `<keyword>:` or `[<keyword>]`. For example, the following commit messages will be matched against the `patch` keyword:

- `fix: fixed a bug` => the keyword is `fix` which belongs to the `patch` version type
- `feature|major: a whole new way to do stuff` => the keyword is `feature` which belongs to the `minor` version type even though it also matches the `major` keyword

> Note: adding custom keywords to will completely override their default keywords, respectively. in other words, if you add a custom `patch` keyword, the default `fix` and `patch` keywords will no longer be supported.

### configuring the tag position - `position`

The `position` property determins where the version tag will be placed in the commit message.

| position | example commit message                |
| -------- | ------------------------------------- |
| `start`  | `(v1.1.0) feature: added new feature` |
| `end`    | `feature: added new feature (v1.1.0)` |

## contributing

Want to contribute?

1. read the [contributing doc](./docs/contributing.md)
2. open an issue or submit a pull request with your changes

## changelog

To see what has changed between versions, check out the [changelog](./docs/changelog.md).

## security

If you discover a security vulnerability, feel free to open an issue at [github.com/this-oliver/fist-bump/issues](https://github.com/this-oliver/fist-bump/issues). All security vulnerabilities will be promptly addressed.
