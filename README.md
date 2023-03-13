# fist-bump 👊

> Bump the version of your package.json based on your commit messages

## features

- Bump the version of your package.json based on your commit messages
- Automatically ammend version update to the last commit

## installation

> Recommended to install as a dev dependency

```bash
npm install --save-dev fist-bump
```

## configuration

By default, the following keywords are supported:

| type | keywords | bump |
| --- | --- | --- |
| `patch` | `fix`, `patch` | `1.0.0` -> `1.0.1` |
| `minor` | `feat`, `feature`, `config` | `1.0.0` -> `1.1.0` |
| `major` | `breaking`, `major`, `release` | `1.0.0` -> `2.0.0` |

To customize the keywords, you can add a `fistbump` property to your `package.json` file and specify the keywords for each type of version bump.

```json
//package.json
{
 "fistbump": {
  "keywords": {
   "patch": ["fix", "patch"],
   "minor": ["feature", "config"],
   "major": ["breaking", "major"]
  }
 }
}
```

> note: adding a `fistbump` property to your `package.json` file will override the default keywords.

## usage

```bash
# prefixing a commit message with the supported keywords
git commit -m 'feature: add new feature'

# run fist bump to update the version of your package.json
npx fistbump

# square brackets are also supported
git commit -m '[feature]: add new feature'
```

## security

If you discover a security vulnerability within this package, please send an e-mail to [hello@oliverrr.net](mailto:hello@oliverrr.net).
