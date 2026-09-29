import { SiteHeader } from "../SiteHeader";
import { VoiceCta } from "./VoiceText";

export function LandingHeader() {
  return <SiteHeader onHome action={<VoiceCta size="small" />} />;
}
