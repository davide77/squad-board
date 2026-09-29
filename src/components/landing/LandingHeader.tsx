import Image from "next/image";
import Link from "next/link";
import { VISOR_MARK } from "@/constants/brand";
import { NAV } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { VoiceCta } from "./VoiceText";

export function LandingHeader() {
  return (
    <header className="landing-header">
      <div className="container is-flex is-flex-wrap is-align-center is-justify-between has-gap-3 has-py-3">
        <Link
          href={ROUTES.home}
          aria-label={NAV.home}
          className="is-inline-flex is-align-center has-gap-2 is-chalk has-font-headline has-font-bold text-2xl tracking-number"
        >
          <Image src={VISOR_MARK.src} alt="" width={VISOR_MARK.headerSize} height={VISOR_MARK.headerSize} priority />
          <span>{SITE.name}</span>
        </Link>
        <nav aria-label={NAV.label} className="is-flex is-flex-wrap is-align-center has-gap-5 text-md">
          {NAV.links.map((l) => (
            <a key={l.href} href={l.href} className="is-dim">
              {l.label}
            </a>
          ))}
          <VoiceCta size="small" />
        </nav>
      </div>
    </header>
  );
}
