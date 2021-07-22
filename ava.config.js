export default {
  extensions: ['ts'],
  require: ['ts-node/register/transpile-only', './tests/globalHooks.ts'],
  files: ['tests/**/*.test.ts'],
}
