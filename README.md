# fist-bump 👊

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

By default, the following keywords are supported:

| type    | keywords                       | bump               |
| ------- | ------------------------------ | ------------------ |
| `patch` | `fix`, `patch`                 | `1.0.0` -> `1.0.1` |
| `minor` | `feat`, `feature`, `config`    | `1.0.0` -> `1.1.0` |
| `major` | `breaking`, `major`, `release` | `1.0.0` -> `2.0.0` |

## configuration

To customize this `fist-bump`, all you have to do is add a `fistbump` property to your `package.json` file.

```json
{
 "fistbump": {
  "patch": ["fix", "patch"],
  "minor": ["feature", "config"],
  "major": ["breaking", "major"],
  "tagAtBeginning": true /* default: false */
 }
}
```

### `patch`, `minor`, `major`

The `patch`, `minor`, `major` properties are arrays of keywords that will be used to bump the version of your package.json. The keywords are case sensitive and will be matched against the `<keyword>:` or `[<keyword>]` pattern in your commit message.

> note: adding custom keywords to the types will override their default keywords, respectively.

### `tagAtBeginning`

The `tagAtBeginning` property is a boolean that will determine whether the version tag will be placed at the beginning of the commit message or at the end.

| tagAtBeginning | example commit message                |
| -------------- | ------------------------------------- |
| `false`        | `feature: added new feature (v1.1.0)` |
| `true`         | `(v1.1.0) feature: added new feature` |

## contributing

Want to contribute?

1. read the [contributing doc](./docs/contributing.md)
2. open an issue or submit a pull request with your changes

## security

If you discover a security vulnerability within this package, please send an e-mail to [hello@oliverrr.net](mailto:hello@oliverrr.net).
