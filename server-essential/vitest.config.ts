import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: "./src/tests/global-setup.ts",
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    include: ["src/tests/**/*.integration.test.ts"],
  },
});
