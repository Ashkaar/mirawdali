"use client";

import { useEffect, type ReactNode } from "react";
import type { Kind } from "@/lib/model";
import type { Translate } from "./copy";

type View = "home" | "tree" | "gallery" | "blog";
const icon = (children: ReactNode) => <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;

/** Step-by-step guides to using the archive. Each guide has a title, an intro and numbered steps from the copy file. */
const guides: { id: string; glyph: ReactNode; steps: number; action?: { label: string; view?: View; kind?: Kind } }[] = [
  { id: "browse", steps: 4, action: { label: "exploreTree", view: "tree" },
    glyph: icon(<><circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M12 7.5V12M6 16.5V12h12v4.5"/></>) },
  { id: "account", steps: 4,
    glyph: icon(<><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.4-3.8 4.2-5.5 7.5-5.5s6.1 1.7 7.5 5.5"/></>) },
  { id: "correct", steps: 4, action: { label: "suggest", kind: "suggestion" },
    glyph: icon(<><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></>) },
  { id: "photo", steps: 4, action: { label: "submitPhoto", kind: "photo" },
    glyph: icon(<><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5.5-5 4 3.5 3-2.5L21 18"/></>) },
  { id: "story", steps: 4, action: { label: "write", kind: "post" },
    glyph: icon(<><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/></>) },
  { id: "track", steps: 3,
    glyph: icon(<><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>) },
  { id: "profile", steps: 3,
    glyph: icon(<><circle cx="12" cy="9" r="3.5"/><circle cx="12" cy="12" r="9"/><path d="M6.2 18.6c1.3-2.2 3.3-3.3 5.8-3.3s4.5 1.1 5.8 3.3"/></>) },
  { id: "install", steps: 3,
    glyph: icon(<><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M12 7v7M9 11l3 3 3-3"/></>) },
];

export default function HowTo({ t, go, contribute }: { t: Translate; go: (view: View) => void; contribute: (kind: Kind) => void }) {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return <div className="home howto">
    <section className="home-section howto-intro">
      <p className="eyebrow">{t("howTo")}</p>
      <h2>{t("howtoTitle")}</h2>
      <p className="lead narrow">{t("howtoIntro")}</p>
      <nav className="howto-index" aria-label={t("howTo")}>
        {guides.map(guide => <a key={guide.id} href={"#guide-" + guide.id} onClick={event => {
          event.preventDefault();
          document.getElementById("guide-" + guide.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}>{guide.glyph}{t("guide_" + guide.id)}</a>)}
      </nav>
    </section>
    {guides.map(guide => <section key={guide.id} id={"guide-" + guide.id} className="home-section guide">
      <div className="guide-head">{guide.glyph}<div><h2>{t("guide_" + guide.id)}</h2><p className="hint">{t("guide_" + guide.id + "_intro")}</p></div></div>
      <ol className="guide-steps">
        {Array.from({ length: guide.steps }, (_, i) => <li key={i}>{t("guide_" + guide.id + "_" + (i + 1))}</li>)}
      </ol>
      {guide.action && <button className="outline" onClick={() => guide.action!.view ? go(guide.action!.view) : contribute(guide.action!.kind!)}>{t(guide.action.label)}</button>}
    </section>)}
    <section className="home-section guide">
      <div className="guide-head">{icon(<><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.2v.1"/></>)}
        <div><h2>{t("guide_help")}</h2><p className="hint">{t("guide_help_intro")}</p></div></div>
      <button className="outline" onClick={() => go("home")}>{t("backHome")}</button>
    </section>
  </div>;
}
