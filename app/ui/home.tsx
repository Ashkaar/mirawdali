"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Archive, Contribution, Kind } from "@/lib/model";
import type { Language, Translate } from "./copy";
import { memberName, photoUrl } from "./tree";

type View = "home" | "tree" | "gallery" | "blog" | "howto";
type Props = {
  archive: Archive; language: Language; t: Translate;
  go: (view: View) => void; openEntry: (entry: Contribution) => void; contribute: (kind: Kind) => void;
};

const icon = (children: ReactNode) => <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
const icons = {
  tree: icon(<><circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M12 7.5V12M6 16.5V12h12v4.5"/></>),
  photo: icon(<><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5.5-5 4 3.5 3-2.5L21 18"/></>),
  story: icon(<><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/></>),
  explore: icon(<><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></>),
  account: icon(<><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.4-3.8 4.2-5.5 7.5-5.5s6.1 1.7 7.5 5.5"/></>),
  send: icon(<><path d="M20.5 3.5 3.5 10l7 3 3 7z"/><path d="m10.5 13 4-4"/></>),
  check: icon(<><circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.7 2.7L16.3 9.4"/></>),
};

/** Adds `is-visible` to [data-reveal] children as they scroll into view. */
function useReveal() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    element.classList.add("reveal-ready");
    const targets = element.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  return root;
}

// An illustrative family across seven generations. The names are examples, not real people.
type Person = { key: string; en: string; ckb: string; female?: boolean; parent?: string };
const sampleFamily: Person[][] = [
  [{ key: "a1", en: "Mam Rasul", ckb: "مام ڕەسووڵ" }, { key: "a2", en: "Khanzad", ckb: "خانزاد", female: true }],
  [{ key: "b1", en: "Mahmud", ckb: "مەحموود", parent: "a" }, { key: "b2", en: "Gulbahar", ckb: "گوڵبەهار", female: true, parent: "a" }, { key: "b3", en: "Qadir", ckb: "قادر", parent: "a" }],
  [{ key: "c1", en: "Aziz", ckb: "عەزیز", parent: "b1" }, { key: "c2", en: "Fatima", ckb: "فاتیمە", female: true, parent: "b1" }, { key: "c3", en: "Osman", ckb: "عوسمان", parent: "b3" }, { key: "c4", en: "Zarifa", ckb: "زەریفە", female: true, parent: "b3" }],
  [{ key: "d1", en: "Salih", ckb: "ساڵح", parent: "c1" }, { key: "d2", en: "Nergiz", ckb: "نێرگز", female: true, parent: "c1" }, { key: "d3", en: "Karim", ckb: "کەریم", parent: "c3" }, { key: "d4", en: "Amina", ckb: "ئامینە", female: true, parent: "c4" }],
  [{ key: "e1", en: "Mustafa", ckb: "مستەفا", parent: "d1" }, { key: "e2", en: "Shirin", ckb: "شیرین", female: true, parent: "d1" }, { key: "e3", en: "Ahmad", ckb: "ئەحمەد", parent: "d3" }, { key: "e4", en: "Peri", ckb: "پەری", female: true, parent: "d4" }],
  [{ key: "f1", en: "Jalal", ckb: "جەلال", parent: "e1" }, { key: "f2", en: "Pakhshan", ckb: "پەخشان", female: true, parent: "e1" }, { key: "f3", en: "Rauf", ckb: "ڕەئووف", parent: "e3" }, { key: "f4", en: "Bahar", ckb: "بەهار", female: true, parent: "e4" }],
  [{ key: "g1", en: "Kawa", ckb: "کاوە", parent: "f1" }, { key: "g2", en: "Nasrin", ckb: "نەسرین", female: true, parent: "f1" }, { key: "g3", en: "Soran", ckb: "سۆران", parent: "f3" }],
];
type Node = { key: string; x: number; y: number; name: string; female: boolean; row: number; parent?: string };

function TreePreview({ language, t, go }: Pick<Props, "language" | "t" | "go">) {
  const rows = sampleFamily.length;
  const nodes: Node[] = sampleFamily.flatMap((row, r) => row.map((person, i) => ({
    key: person.key, row: r, parent: person.parent, female: Boolean(person.female),
    name: language === "ckb" ? person.ckb : person.en,
    x: r === 0 ? [36, 64][i] : row.length === 1 ? 50 : 12 + 76 * i / (row.length - 1),
    y: 7 + 86 * r / (rows - 1),
  })));
  const at = new Map(nodes.map(item => [item.key, item]));
  // Branches are drawn in real pixels so strokes stay even and the draw-in animation works.
  const box = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 620 });
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const px = (x: number) => x * size.w / 100, py = (y: number) => y * size.h / 100;
  const couple = [at.get("a1")!, at.get("a2")!];
  const rowDelay = (row: number) => 0.15 + row * 0.22;
  return <button ref={box} className="tree-preview sample-tree" onClick={() => go("tree")} aria-label={t("exploreTree")}>
    <svg className="tree-preview-links" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
      <path className="couple" pathLength={1} style={{ transitionDelay: "0.1s" }} d={`M ${px(couple[0].x)} ${py(couple[0].y)} H ${px(couple[1].x)}`} />
      {nodes.filter(item => item.parent).map(item => {
        const from = item.parent === "a" ? { x: (couple[0].x + couple[1].x) / 2, y: couple[0].y } : at.get(item.parent!)!;
        const startX = px(from.x), endX = px(item.x), startY = py(from.y) + 15, endY = py(item.y) - 15, mid = (startY + endY) / 2;
        return <path key={item.key} pathLength={1} style={{ transitionDelay: rowDelay(item.row) - 0.1 + "s" }}
          d={`M ${startX} ${startY} C ${startX} ${mid}, ${endX} ${mid}, ${endX} ${endY}`} />;
      })}
    </svg>
    {nodes.map(item => <span key={item.key} className={"tree-chip row-" + Math.min(item.row, 2) + (item.female ? " female" : "")}
      style={{ left: item.x + "%", top: item.y + "%", transitionDelay: rowDelay(item.row) + "s" }}>
      <span className="chip-initial" aria-hidden="true">{Array.from(item.name)[0]}</span>
      <span className="chip-name" dir="auto">{item.name}</span>
    </span>)}
  </button>;
}

/** A strip of photos that glides continuously and loops; pauses on hover or touch. Static and scrollable with reduced motion. */
function PhotoCarousel({ photos, openEntry }: { photos: Contribution[]; t: Translate; openEntry: (entry: Contribution) => void }) {
  // Repeat short lists so the strip is always wider than the screen, then double it for a seamless loop.
  const base: Contribution[] = [];
  while (base.length < 8) base.push(...photos);
  const strip = [...base, ...base];
  const slide = (photo: Contribution, i: number) => <button key={photo.id + "-" + i} className="slide" onClick={() => openEntry(photo)}
    aria-hidden={i >= photos.length ? "true" : undefined} tabIndex={i >= photos.length ? -1 : undefined}>
    <span className="slide-frame">{photo.image_path && <img src={photoUrl(photo.image_path)} alt="" loading="lazy" />}</span>
    <span className="slide-caption"><strong dir="auto">{photo.title}</strong></span>
  </button>;
  return <div className="marquee" dir="ltr">
    <div className="marquee-track" style={{ animationDuration: base.length * 4.5 + "s" }}>{strip.map(slide)}</div>
  </div>;
}

function SectionHead({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action}</div>;
}

export default function Home({ archive, language, t, go, openEntry, contribute }: Props) {
  const root = useReveal();
  const photos = archive.published.filter(item => item.kind === "photo").slice(0, 12);
  const posts = archive.published.filter(item => item.kind === "post").slice(0, 6);
  const number = (value: number) => value.toLocaleString(language === "ckb" ? "ckb-IQ" : "en-GB");
  const stats: [string, string][] = [
    [t("familiesValue"), t("familiesStat")],
    [number(archive.members.length), t("membersCount")],
    [number(photos.length), t("photosCount")],
    [number(posts.length), t("postsCount")],
  ];
  const steps: [ReactNode, string, string][] = [
    [icons.explore, t("step1Title"), t("step1Body")],
    [icons.account, t("step2Title"), t("step2Body")],
    [icons.send, t("step3Title"), t("step3Body")],
    [icons.check, t("step4Title"), t("step4Body")],
  ];
  return <div className="home" ref={root}>
    <section className="home-section about" data-reveal>
      <div className="about-copy">
        <p className="eyebrow">{t("aboutEyebrow")}</p>
        <h2>{t("aboutTitle")}</h2>
        <p className="lead about-text" dir="auto">{(language === "ckb" ? archive.about.ckb : archive.about.en) ?? t("aboutBody")}</p>
      </div>
      <dl className="about-stats">
        {stats.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
    </section>

    <section className="home-section purpose" data-reveal>
      <SectionHead eyebrow={t("purposeEyebrow")} title={t("purposeTitle")} />
      <p className="lead narrow">{t("purposeBody")}</p>
      <div className="pillars">
        {([["tree", icons.tree, "pillarTree"], ["gallery", icons.photo, "pillarGallery"], ["blog", icons.story, "pillarStories"]] as const).map(([view, glyph, key], i) =>
          <button key={view} className="pillar" data-reveal style={{ transitionDelay: i * 0.1 + "s" }} onClick={() => go(view)}>
            {glyph}<strong>{t(view === "tree" ? "familyTree" : view)}</strong><span>{t(key)}</span>
          </button>)}
      </div>
    </section>

    <section className="home-section tree-section" data-reveal>
      <SectionHead eyebrow={t("familyTree")} title={t("treeTitle")} action={<button className="outline" onClick={() => go("tree")}>{t("exploreTree")}</button>} />
      <p className="hint">{t("treeBody")}</p>
      <TreePreview language={language} t={t} go={go} />
    </section>

    <section className="home-section photos-section" data-reveal>
      <SectionHead eyebrow={t("photosEyebrow")} title={t("photosTitle")} action={photos.length > 0 && <button className="outline" onClick={() => go("gallery")}>{t("viewGallery")}</button>} />
      {photos.length ? <PhotoCarousel photos={photos} t={t} openEntry={openEntry} /> : <p className="hint">{t("noPhotos")}</p>}
    </section>

    <section className="home-section stories-section" data-reveal>
      <SectionHead eyebrow={t("storiesEyebrow")} title={t("storiesTitle")} action={posts.length > 0 && <button className="outline" onClick={() => go("blog")}>{t("readBlog")}</button>} />
      {posts.length ? <div className="story-grid">
        {posts.map((post, i) => <button key={post.id} className={"story-card" + (i === 0 ? " featured" : "")} data-reveal style={{ transitionDelay: i * 0.08 + "s" }} onClick={() => openEntry(post)}>
          {post.category && <span className="story-category">{t(post.category)}</span>}
          <strong dir="auto">{post.title}</strong>
          <p dir="auto">{post.body.length > (i === 0 ? 320 : 160) ? post.body.slice(0, i === 0 ? 320 : 160) + "…" : post.body}</p>
          <span className="story-more">{t("readMore")} →</span>
        </button>)}
      </div> : <p className="hint">{t("noPosts")}</p>}
    </section>

    <section className="home-section how" data-reveal>
      <SectionHead eyebrow={t("howEyebrow")} title={t("howTitle")} action={<button className="outline" onClick={() => go("howto")}>{t("readGuide")}</button>} />
      <ol className="steps">
        {steps.map(([glyph, title, body], i) => <li key={title} className="step" data-reveal style={{ transitionDelay: i * 0.1 + "s" }}>
          <span className="step-number">{i + 1}</span>{glyph}<strong>{title}</strong><p>{body}</p>
        </li>)}
      </ol>
    </section>

    <section className="home-section collab" data-reveal>
      <p className="eyebrow">{t("collabEyebrow")}</p>
      <h2>{t("collabTitle")}</h2>
      <p className="lead narrow">{t("collabBody")}</p>
      <div className="collab-actions">
        <button className="primary" onClick={() => contribute("suggestion")}>{icons.tree}{t("suggest")}</button>
        <button className="primary" onClick={() => contribute("photo")}>{icons.photo}{t("submitPhoto")}</button>
        <button className="primary" onClick={() => contribute("post")}>{icons.story}{t("write")}</button>
      </div>
    </section>
  </div>;
}
