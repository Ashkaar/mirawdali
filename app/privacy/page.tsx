import type { Metadata } from "next";
import { translate } from "@/app/ui/copy";

export const metadata: Metadata = { title: "Privacy Policy | Mirawdali" };

/** Standalone privacy policy, linkable from Google's sign-in settings. Shows English and Sorani together. */
export default function Privacy() {
  const en = translate("en"), ckb = translate("ckb");
  return <main className="privacy-page">
    <a className="outline" href="/">← Mirawdali</a>
    <article lang="en" dir="ltr">
      <h1>{en("privacy")}</h1>
      <p>{en("privacyBody")}</p>
      <p>{en("privacyGoogle")}</p>
    </article>
    <article lang="ckb" dir="rtl">
      <h1>{ckb("privacy")}</h1>
      <p>{ckb("privacyBody")}</p>
      <p>{ckb("privacyGoogle")}</p>
    </article>
  </main>;
}
