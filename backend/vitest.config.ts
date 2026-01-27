import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/modules/**/**.service.ts"],
      exclude: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    },
    setupFiles: ["./src/test/setup.ts"],
  },
});
