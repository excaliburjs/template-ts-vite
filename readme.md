# Excalibur TypeScript & Vite template

Check out the full documentation @ https://excaliburjs.com

You can use the excalibur cli to generate this template

```sh
npm create excalibur
```

## Getting Started

1. [Generate a repository](https://github.com/excaliburjs/template-ts-vite/generate) from this template
2. Modify the `package.json` with your own details
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the Vite server!
5. Have fun!

## Testing

This template ships a Playwright visual-regression suite that boots the **built** game
(`vite preview`) and compares it against committed golden-master screenshots.

```sh
npm test                         # build, then run the snapshot suite
npm run test:integration-update  # re-record the baselines after an intentional visual change
```

The suite freezes Excalibur's clock (see `tests/determinism.ts`) so each snapshot is a pure
function of how much *simulated* game time has elapsed, rather than of how fast the machine is.
Baselines are committed for chromium/linux only, which is what CI runs.

Set `EX_E2E_PORT` to move the preview server off its default port, which is handy when running
several projects' suites at once:

```sh
EX_E2E_PORT=4300 npm test
```
