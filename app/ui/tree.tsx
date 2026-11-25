"use client";

import { useMemo, useState } from "react";
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
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const members = useMemo(() => [...archive.members].sort((a,b) =>
    memberName(a,language).localeCompare(memberName(b,language))), [archive.members,language]);
  const rows = useMemo(() => generations(members,archive.parents), [members,archive.parents]);
  const query = search.trim().toLocaleLowerCase();
  const matches = new Set(members.filter(member =>
    [member.name_en,member.name_ckb,member.birth_year].some(value => String(value ?? "").toLocaleLowerCase().includes(query))
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

  const width = Math.max(585,...shown.map(row => row.length * 198 + 30));
  const height = Math.max(135, shown.length * 135);
  const points = new Map(shown.flatMap((row, depth) => row.map((member,index) => {
    const column = language === "ckb" ? row.length - index - 1 : index;
    return [member.id, {x: width/2 + (column-(row.length-1)/2)*198,y: depth*135+10}] as const;
  })));
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
      <div className="tree-canvas" tabIndex={0} aria-label={t("familyTree")}>
        <div className="live-tree" style={{width,height}}>
          <svg width={width} height={height} aria-hidden="true" className="tree-links">
            {archive.parents.map(edge => {
              const parent = points.get(edge.parent_id);
              const child = points.get(edge.child_id);
              if (!parent || !child || (collapsed.has(edge.parent_id) && !(query && matchingAncestors.has(edge.child_id)))) return null;
              return <path key={edge.parent_id+edge.child_id} d={`M ${parent.x} ${parent.y+97} V ${child.y-16} H ${child.x} V ${child.y}`} />;
            })}
            {archive.partners.map(edge => {
              const first = points.get(edge.first_id);
              const second = points.get(edge.second_id);
              if (!first || !second) return null;
              return <path key={edge.first_id+edge.second_id} className="partner-link" d={`M ${first.x} ${first.y+32} H ${second.x} V ${second.y+32}`} />;
            })}
          </svg>
          {shown.flat().map(member => {
            const name = memberName(member,language);
            const point = points.get(member.id)!;
            const children = archive.parents.filter(edge => edge.parent_id === member.id);
            const revealed = Boolean(query && children.some(edge => matchingAncestors.has(edge.child_id)));
            const expanded = !collapsed.has(member.id) || revealed;
            return <div key={member.id} className="tree-node" style={{left:point.x,top:point.y}}>
              <button className={`person ${query ? matches.has(member.id) ? "match" : "dim" : ""}`} onClick={() => onMember(member)}>
                {member.photo_path ? <img className="initial" src={photoUrl(member.photo_path)} alt="" loading="lazy" /> : <span className="initial" aria-hidden="true">{Array.from(name)[0]}</span>}
                <span><strong>{name}</strong><small>{[member.birth_year, t(member.gender)].filter(Boolean).join(" · ")}</small></span>
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
