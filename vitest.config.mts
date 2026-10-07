import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        // The board logic is pure, so its tests run in Node with no DOM.
        resolve: { alias: { "@": src } },
        test: { name: "unit", environment: "node", include: ["src/**/*.test.ts"] },
      },
      {
        // Every story is a test: it renders in a real browser, runs its play function, then axe.
        plugins: [storybookTest({ configDir: fileURLToPath(new URL("./.storybook", import.meta.url)) })],
        test: {
          name: "storybook",
          browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: "chromium" }] },
        },
      },
    ],
  },
});
