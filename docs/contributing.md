# Contributing

## project structure

- `src` - source code
  - `index.ts` - core logic
  - `cli.ts` - cli entry point
  - `config` - configuration details like keywords, etc
  - `utils` - utility functions
    - `log.ts` - logging utility
    - `shell.ts` - interface for executing shell commands (git, npm, etc)

## Some things to keep in mind

- code that is readable, easy to understand and maintainable > one-liners or magic variables

## getting started

1. clone the repo
2. build the project `npm run build`
3. make some changes to this README.md file, and commit them
4. run the tool `npm start`

If you want to try this tool on a real project after building it:

1. run `npm run preview` which will create a `.tgz` file in the root of the project
2. in your project, run `npm install --save-dev <path-to-tgz-file>`
3. make some changes to your project and commit them with the supported keywords
4. run `npx fistbump` to bump the version of your package.json
