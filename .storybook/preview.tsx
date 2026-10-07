import type { Preview } from "@storybook/nextjs-vite";
import { body, headline } from "../src/app/fonts";
import "../src/styles/main.scss";

// The layout puts the font variables on <html>, so the stories do the same.
document.documentElement.classList.add(body.variable, headline.variable);
document.documentElement.lang = "en-GB";

const preview: Preview = {
  parameters: {
    layout: "padded",
    // An accessibility violation fails the story's test, the same as a failed assertion.
    a11y: { test: "error" },
  },
};

export default preview;
