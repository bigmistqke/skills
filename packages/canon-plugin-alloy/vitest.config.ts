import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Several test files ask the Alloy analyzer at once; each should start only a few processes.
    env: { CANON_ALLOY_JOBS: '2' },
    // A test that checks a whole canon, or runs the checker as a process of its own, can take several seconds beside
    // the other packages' suites, as `pnpm -w test` runs them.
    testTimeout: 30_000
  }
});
