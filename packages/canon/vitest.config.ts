import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Most tests run the checker as a process of its own. Alone that takes well under a second, but beside the
    // other packages' suites and the Alloy analyzer, as `pnpm -w test` runs them, it can take several.
    testTimeout: 30_000
  }
});
