"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Archive, Contribution, Kind, Member } from "@/lib/model";
import type { Language, Translate } from "./copy";
import { memberName, photoUrl } from "./tree";

type View = "home" | "tree" | "gallery" | "blog";
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

type Node = { key: string; x: number; y: number; name: string; photo: string | null; row: number };

/** A small three-generation slice of the real tree, starting from the root with the most descendants. */
function usePreview(archive: Archive, language: Language, t: Translate) {
  return useMemo(() => {
    const { members, parents, partners } = archive;
    const byId = new Map(members.map(member => [member.id, member]));
    const childrenOf = (id: string) => parents.filter(edge => edge.parent_id === id && byId.has(edge.child_id)).map(edge => edge.child_id);
    const countDescendants = (id: string, seen = new Set<string>()): number => {
      if (seen.has(id)) return 0;
      seen.add(id);
      return childrenOf(id).reduce((total, child) => total + 1 + countDescendants(child, seen), 0);
    };
    const year = (member?: Member) => member?.birth_year ?? 9999;
    const roots = members.filter(member => !parents.some(edge => edge.child_id === member.id && byId.has(edge.parent_id)));
    const root = [...roots].sort((a, b) => countDescendants(b.id) - countDescendants(a.id) || year(a) - year(b))[0];
    const node = (member: Member, x: number, row: number): Node =>
      ({ key: member.id, x, y: [16, 50, 84][row], row, name: memberName(member, language), photo: member.photo_path ? photoUrl(member.photo_path) : null });
    if (!root || members.length < 2) {
      // Illustration for an empty archive
      const sample = (key: string, x: number, row: number, label: string): Node => ({ key, x, y: [16, 50, 84][row], row, name: label, photo: null });
      const nodes = [sample("g1", 40, 0, t("sampleGrandparents")), sample("g2", 60, 0, t("sampleGrandparents")),
        sample("p1", 28, 1, t("sampleParents")), sample("p2", 72, 1, t("sampleParents")),
        sample("c1", 16, 2, t("sampleChildren")), sample("c2", 40, 2, t("sampleChildren")), sample("c3", 72, 2, t("sampleChildren"))];
      return { sample: true, nodes, links: [["g1", "p1"], ["g2", "p2"], ["p1", "c1"], ["p1", "c2"], ["p2", "c3"]] as [string, string][], couple: ["g1", "g2"] as [string, string] };
    }
    const partnerId = partners.map(edge => edge.first_id === root.id ? edge.second_id : edge.second_id === root.id ? edge.first_id : null)
      .find(id => id && byId.has(id) && !childrenOf(root.id).includes(id)) ?? null;
    const partner = partnerId ? byId.get(partnerId) : undefined;
    const kids = [...new Set([...childrenOf(root.id), ...(partner ? childrenOf(partner.id) : [])])]
      .map(id => byId.get(id)!).sort((a, b) => year(a) - year(b)).slice(0, 4);
    const nodes: Node[] = partner ? [node(root, 42, 0), node(partner, 58, 0)] : [node(root, 50, 0)];
    const links: [string, string][] = [];
    const spread = (count: number, index: number, from = 10, to = 90) => count === 1 ? (from + to) / 2 : from + (to - from) * index / (count - 1);
    kids.forEach((kid, index) => {
      nodes.push(node(kid, spread(kids.length, index), 1));
      links.push([root.id, kid.id]);
    });
    const grandkids = kids.flatMap(kid => childrenOf(kid.id).slice(0, 2).map(id => [kid, byId.get(id)!] as const)).slice(0, 5);
    grandkids.forEach(([kid, grandkid], index) => {
      nodes.push(node(grandkid, spread(grandkids.length, index, 8, 92), 2));
      links.push([kid.id, grandkid.id]);
    });
    return { sample: false, nodes, links, couple: partner ? [root.id, partner.id] as [string, string] : null };
  }, [archive, language, t]);
}

function TreePreview({ archive, language, t, go }: Pick<Props, "archive" | "language" | "t" | "go">) {
  const { sample, nodes, links, couple } = usePreview(archive, language, t);
  const at = new Map(nodes.map(item => [item.key, item]));
  const visibleLinks = links.filter(([from, to]) => at.has(from) && at.has(to));
  const rows = new Set(nodes.map(item => item.row)).size;
  // Draw branches in real pixels so strokes stay even and the draw-in animation works.
  const box = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 430 });
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const px = (x: number) => x * size.w / 100, py = (y: number) => y * size.h / 100;
  return <button ref={box} className={"tree-preview rows-" + rows + (sample ? " sample" : "")} onClick={() => go("tree")} aria-label={t("exploreTree")}>
    <svg className="tree-preview-links" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
      {couple && at.get(couple[0]) && at.get(couple[1]) && <path className="couple" pathLength={1}
        d={`M ${px(at.get(couple[0])!.x)} ${py(at.get(couple[0])!.y)} H ${px(at.get(couple[1])!.x)}`} />}
      {visibleLinks.map(([from, to], index) => {
        const a = at.get(from)!, b = at.get(to)!;
        const startX = px(couple && from === couple[0] ? 50 : a.x), endX = px(b.x);
        const startY = py(a.y) + 16, endY = py(b.y) - 16, mid = (startY + endY) / 2;
        return <path key={from + to} pathLength={1} style={{ transitionDelay: 0.25 + index * 0.08 + "s" }}
          d={`M ${startX} ${startY} C ${startX} ${mid}, ${endX} ${mid}, ${endX} ${endY}`} />;
      })}
    </svg>
    {nodes.map((item, index) => <span key={item.key} className={"tree-chip row-" + item.row} style={{ left: item.x + "%", top: item.y + "%", transitionDelay: 0.1 + index * 0.07 + "s" }}>
      {item.photo ? <img src={item.photo} alt="" loading="lazy" /> : <span className="chip-initial" aria-hidden="true">{sample ? "" : Array.from(item.name)[0]}</span>}
      <span className="chip-name" dir="auto">{item.name}</span>
    </span>)}
  </button>;
}

function PhotoCarousel({ photos, t, openEntry }: { photos: Contribution[]; t: Translate; openEntry: (entry: Contribution) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const show = (next: number) => {
    const slide = track.current?.children[(next + photos.length) % photos.length] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };
  // Track which slide is centred as the visitor swipes or the carousel advances.
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const centre = element.getBoundingClientRect().left + element.clientWidth / 2;
      let best = 0, bestDistance = Infinity;
      Array.from(element.children).forEach((child, i) => {
        const box = child.getBoundingClientRect();
        const distance = Math.abs(box.left + box.width / 2 - centre);
        if (distance < bestDistance) { best = i; bestDistance = distance; }
      });
      setIndex(best);
    };
    element.addEventListener("scroll", update, { passive: true });
    return () => element.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // Gentle auto-advance while on screen, unless paused or the visitor prefers less motion.
  useEffect(() => {
    if (!visible || paused || photos.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => show(index + 1), 5000);
    return () => window.clearInterval(timer);
  });
  return <div className="carousel" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    <div className="carousel-track" ref={track}>
      {photos.map(photo => <button key={photo.id} className="slide" onClick={() => openEntry(photo)}>
        <span className="slide-frame">{photo.image_path && <img src={photoUrl(photo.image_path)} alt="" loading="lazy" />}</span>
        <span className="slide-caption"><strong dir="auto">{photo.title}</strong>{photo.body && <small dir="auto">{photo.body}</small>}</span>
      </button>)}
    </div>
    {photos.length > 1 && <div className="carousel-controls">
      <button className="carousel-arrow" onClick={() => show(index - 1)} aria-label={t("previousPhoto")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6"/></svg></button>
      <div className="carousel-dots">{photos.map((photo, i) => <button key={photo.id} aria-label={t("goToPhoto") + " " + (i + 1)} aria-current={i === index ? "true" : undefined} onClick={() => show(i)} />)}</div>
      <button className="carousel-arrow" onClick={() => show(index + 1)} aria-label={t("nextPhoto")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6"/></svg></button>
    </div>}
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
        <p className="lead">{t("aboutBody")}</p>
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
      <TreePreview archive={archive} language={language} t={t} go={go} />
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
      <SectionHead eyebrow={t("howEyebrow")} title={t("howTitle")} />
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
