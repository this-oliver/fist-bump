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

## usage

Prefix your commit messages with certain keywords will inform fist-bump to bump the version of your package.json.

- `feature:` or `config:` will bump the minor version (`1.0.0` -> `1.1.0`)
- `fix:` or `patch:` will bump the patch version (`1.1.0` -> `1.1.1`)

```bash
# prefixing a commit message with the supported keywords
git commit -m 'feature: add new feature'

# run fist bump to update the version of your package.json
npx fistbump
```

## security

If you discover a security vulnerability within this package, please send an e-mail to [hello@oliverrr.net](mailto:hello@oliverrr.net).
