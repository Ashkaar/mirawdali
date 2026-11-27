"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Archive, Member, Parent } from "@/lib/archive";
import type { Translate } from "./copy";

export function memberName(member: Member, language: string) {
  return (language === "ckb" ? member.name_ckb || member.name_en : member.name_en || member.name_ckb) ?? "";
}
export const photoUrl = (path: string) => "/media/" + path.split("/").map(encodeURIComponent).join("/");

function generations(members: Member[], parents: Parent[]) {
  const known = new Set(members.map(item => item.id));
  const rows: Member[][] = [];
  const placed = new Set<string>();
  let next = members;
  while (next.length) {
    const row = next.filter(member => parents.every(edge => edge.child_id !== member.id || !known.has(edge.parent_id) || placed.has(edge.parent_id)));
    if (!row.length) { rows.push(next); break; }
    rows.push(row);
    row.forEach(member => placed.add(member.id));
    next = next.filter(member => !placed.has(member.id));
  }
  return rows;
}

export default function Tree({archive, language, t, onMember}: {
  archive: Archive; language: string; t: Translate; onMember: (member: Member) => void;
}) {
  const [search, setSearch] = useState("");
  const canvas = useRef<HTMLDivElement>(null);
  // On narrow screens the tree is wider than the view: start centred on the oldest generation.
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const offset = (element.scrollWidth - element.clientWidth) / 2;
    element.scrollLeft = getComputedStyle(element).direction === "rtl" ? -offset : offset;
  }, [language, archive.members.length]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const members = useMemo(() => [...archive.members].sort((a,b) =>
    memberName(a,language).localeCompare(memberName(b,language))), [archive.members,language]);
  const rows = useMemo(() => generations(members,archive.parents), [members,archive.parents]);
  const query = search.trim().toLocaleLowerCase();
  const matches = new Set(members.filter(member =>
    [member.name_en,member.name_ckb].some(value => String(value ?? "").toLocaleLowerCase().includes(query))
  ).map(member => member.id));
  const visible = new Set<string>();
  const matchingAncestors = new Set(matches);
  if (query) {
    for (const row of [...rows].reverse()) {
      for (const member of row) {
        if (matchingAncestors.has(member.id)) {
          for (const edge of archive.parents) if (edge.child_id === member.id) matchingAncestors.add(edge.parent_id);
        }
      }
    }
  }
  const shown = rows.map(row => row.filter(member => {
    const parents = archive.parents.filter(edge => edge.child_id === member.id && members.some(parent => parent.id === edge.parent_id));
    const show = !parents.length || parents.some(edge => visible.has(edge.parent_id) && !collapsed.has(edge.parent_id)) ||
      (Boolean(query) && matchingAncestors.has(member.id));
    if (show) visible.add(member.id);
    return show;
  })).filter(row => row.length);

  // Family layout: each person's children sit in a block directly beneath them, so branches never cross.
  const SLOT = 198, ROW = 135;
  const layout = useMemo(() => {
    const visibleIds = new Set(shown.flat().map(member => member.id));
    const depth = new Map(shown.flatMap((row, d) => row.map(member => [member.id, d] as const)));
    const hasParents = (id: string) => archive.parents.some(edge => edge.child_id === id && visibleIds.has(edge.parent_id));
    const byId = new Map(members.map(member => [member.id, member]));
    const age = (id: string) => byId.get(id)?.birth_year ?? 9999;
    const order = (a: string, b: string) => age(a) - age(b) || memberName(byId.get(a)!, language).localeCompare(memberName(byId.get(b)!, language));
    const parentsOf = (id: string) => archive.parents.filter(edge => edge.child_id === id && visibleIds.has(edge.parent_id)).map(edge => edge.parent_id);
    // A child hangs under its deepest visible parent.
    const primary = new Map<string, string>();
    for (const id of visibleIds) {
      const ps = parentsOf(id).sort((a, b) => (depth.get(b)! - depth.get(a)!) || order(a, b));
      if (ps.length) primary.set(id, ps[0]);
    }
    // Partners with no visible parents of their own sit beside their partner.
    const spouses = new Map<string, string[]>();
    const attached = new Set<string>();
    for (const edge of archive.partners) {
      for (const [a, b] of [[edge.first_id, edge.second_id], [edge.second_id, edge.first_id]]) {
        if (!visibleIds.has(a) || !visibleIds.has(b) || attached.has(b) || attached.has(a)) continue;
        // A partner with no parents of their own moves to their partner's row and sits beside them.
        if (!hasParents(b) && (hasParents(a) || order(a, b) < 0)) {
          spouses.set(a, [...(spouses.get(a) ?? []), b]); attached.add(b); depth.set(b, depth.get(a)!);
        }
      }
    }
    const kidsOf = (unit: string[]) => [...visibleIds].filter(id => unit.includes(primary.get(id) ?? "")).sort(order);
    const slot = new Map<string, number>();
    const place = (id: string, start: number): number => {
      const unit = [id, ...(spouses.get(id) ?? [])];
      const kids = kidsOf(unit);
      const widths = kids.map(kid => measure(kid));
      const childWidth = widths.reduce((sum, w) => sum + w, 0);
      const width = Math.max(unit.length, childWidth);
      unit.forEach((member, i) => slot.set(member, start + (width - unit.length) / 2 + i));
      let cursor = start + (width - childWidth) / 2;
      kids.forEach((kid, i) => { place(kid, cursor); cursor += widths[i]; });
      return width;
    };
    const memo = new Map<string, number>();
    function measure(id: string): number {
      if (memo.has(id)) return memo.get(id)!;
      const unit = [id, ...(spouses.get(id) ?? [])];
      const width = Math.max(unit.length, kidsOf(unit).reduce((sum, kid) => sum + measure(kid), 0));
      memo.set(id, width);
      return width;
    }
    const roots = [...visibleIds].filter(id => !primary.has(id) && !attached.has(id))
      .sort((a, b) => (depth.get(a)! - depth.get(b)!) || measure(b) - measure(a) || order(a, b));
    let cursor = 0;
    for (const root of roots) cursor += place(root, cursor);
    return { slot, depth, primary, spouses, slots: Math.max(cursor, 1) };
  }, [shown, members, archive.parents, archive.partners, language]);

  const width = Math.max(585, layout.slots * SLOT + 30);
  const height = Math.max(135, (Math.max(0, ...layout.depth.values()) + 1) * ROW);
  const points = new Map([...layout.slot].map(([id, s]) => {
    const x = 15 + (s + 0.5) * SLOT;
    return [id, { x: language === "ckb" ? width - x : x, y: layout.depth.get(id)! * ROW + 10 }] as const;
  }));
  // One connector per family: from the parent (or the middle of a couple) down to a short bar over that family's children.
  const families = new Map<string, string[]>();
  for (const [child, parent] of layout.primary) {
    if (!points.has(child)) continue;
    const others = archive.parents.filter(edge => edge.child_id === child && edge.parent_id !== parent).map(edge => edge.parent_id);
    const partner = [...(layout.spouses.get(parent) ?? []), ...[...layout.spouses].filter(([, list]) => list.includes(parent)).map(([id]) => id)]
      .find(id => others.includes(id));
    const key = partner ? [parent, partner].sort().join("+") : parent;
    families.set(key, [...(families.get(key) ?? []), child]);
  }
  const links = [...families].map(([key, kids]) => {
    const parentIds = key.split("+");
    const ps = parentIds.map(id => points.get(id)).filter(Boolean) as { x: number; y: number }[];
    if (!ps.length) return null;
    const couple = ps.length === 2;
    const originX = couple ? (ps[0].x + ps[1].x) / 2 : ps[0].x;
    const originY = couple ? ps[0].y + 32 : ps[0].y + 97;
    const childPoints = kids.map(id => points.get(id)!);
    const busY = childPoints[0].y - 18;
    const xs = [originX, ...childPoints.map(point => point.x)];
    const d = `M ${originX} ${originY} V ${busY} M ${Math.min(...xs)} ${busY} H ${Math.max(...xs)} ` +
      childPoints.map(point => `M ${point.x} ${busY} V ${point.y}`).join(" ");
    return <path key={key} d={d} />;
  });
  // A second parent who is not beside the child's family gets its own light line.
  const extraLinks = archive.parents.filter(edge => {
    const main = layout.primary.get(edge.child_id);
    if (!main || main === edge.parent_id || !points.has(edge.parent_id) || !points.has(edge.child_id)) return false;
    return ![...families.keys()].some(key => key.split("+").includes(edge.parent_id) && families.get(key)!.includes(edge.child_id));
  }).map(edge => {
    const parent = points.get(edge.parent_id)!, child = points.get(edge.child_id)!;
    const mid = (parent.y + 97 + child.y) / 2;
    return <path key={"x" + edge.parent_id + edge.child_id} className="second-parent-link"
      d={`M ${parent.x} ${parent.y + 97} C ${parent.x} ${mid}, ${child.x} ${mid}, ${child.x} ${child.y}`} />;
  });
  const toggle = (id: string) => setCollapsed(previous => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  return <>
    <div className="bar">
      <div><h2>{t("familyTree")}</h2><p>{t("treeHint")}</p></div>
      {members.length > 0 && <input className="search" type="search" aria-label={t("search")} placeholder={t("search")} value={search} onChange={event => setSearch(event.target.value)} />}
    </div>
    {!members.length ? <p className="archive-empty">{t("noMembers")}</p> : <>
      <div className="tree-canvas" ref={canvas} tabIndex={0} aria-label={t("familyTree")}>
        <div className="live-tree" style={{width,height}}>
          <svg width={width} height={height} aria-hidden="true" className="tree-links">
            {links}
            {extraLinks}
            {archive.partners.map(edge => {
              const first = points.get(edge.first_id);
              const second = points.get(edge.second_id);
              if (!first || !second) return null;
              return <path key={edge.first_id+edge.second_id} className="partner-link" d={`M ${first.x} ${first.y+32} H ${second.x} V ${second.y+32}`} />;
            })}
          </svg>
          {shown.flat().filter(member => points.has(member.id)).map(member => {
            const name = memberName(member,language);
            const point = points.get(member.id)!;
            const children = archive.parents.filter(edge => edge.parent_id === member.id);
            const revealed = Boolean(query && children.some(edge => matchingAncestors.has(edge.child_id)));
            const expanded = !collapsed.has(member.id) || revealed;
            return <div key={member.id} className="tree-node" style={{left:point.x,top:point.y}}>
              <button className={`person ${query ? matches.has(member.id) ? "match" : "dim" : ""}`} onClick={() => onMember(member)}>
                {member.photo_path ? <img className="initial" src={photoUrl(member.photo_path)} alt="" loading="lazy" /> : <span className="initial" aria-hidden="true">{Array.from(name)[0]}</span>}
                <span><strong>{name}</strong>{member.gender !== "unspecified" && <small>{t(member.gender)}</small>}</span>
              </button>
              {children.length > 0 && <div className="branch-control"><button className="branch-toggle" aria-expanded={expanded}
                disabled={revealed} aria-label={t(expanded ? "hide" : "show")+" "+name} onClick={() => toggle(member.id)}>{expanded ? "−" : "+"}</button></div>}
            </div>;
          })}
        </div>
      </div>
      <div className="tree-foot"><span role="status">{query ? matches.size ? t("searchCount")+" · "+matches.size : t("noMatches") : t("memberTotal")+" · "+members.length}</span><span>{t("branchHint")}</span></div>
    </>}
  </>;
}
