import { Barlow, Saira_Condensed } from "next/font/google";

// Shared by the root layout and Storybook, so both set the same type.
export const body = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const headline = Saira_Condensed({
  subsets: ["latin"],
  // No 500: medium is only ever set on Barlow. Each weight is one more preloaded file.
  weight: ["600", "700"],
  variable: "--font-headline",
});
