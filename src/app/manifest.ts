import type { MetadataRoute } from "next";
import { APP_ICONS, THEME_COLOUR } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: ROUTES.board,
    display: "standalone",
    background_color: THEME_COLOUR,
    theme_color: THEME_COLOUR,
    icons: [...APP_ICONS],
  };
}
