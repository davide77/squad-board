import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The board logic is pure, so the tests run in Node with no DOM.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
