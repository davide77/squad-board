import type { MetadataRoute } from "next";
import { THEME_COLOUR } from "@/constants/brand";
import { SITE } from "@/constants/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: THEME_COLOUR,
    theme_color: THEME_COLOUR,
  };
}
