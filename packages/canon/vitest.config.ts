import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Several test files ask the Alloy analyzer at once; each should start only a few processes.
    env: { CANON_ALLOY_JOBS: '2' }
  }
});
