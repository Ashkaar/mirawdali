"use client";

import { useState } from "react";
import type { Member } from "@/lib/model";
import type { Translate } from "./copy";
import { memberName } from "./tree";

/** Chosen people shown as removable chips, with a dropdown to add more. Submits one hidden input per person. */
export default function PeoplePicker({ name, label, options, initial, language, t }: {
  name: string; label: string; options: Member[]; initial: string[]; language: string; t: Translate;
}) {
  const [chosen, setChosen] = useState(initial);
  const nameOf = (id: string) => {
    const member = options.find(item => item.id === id);
    return member ? memberName(member, language) + (member.birth_year ? " (" + member.birth_year + ")" : "") : "";
  };
  const available = options.filter(item => !chosen.includes(item.id))
    .sort((a, b) => memberName(a, language).localeCompare(memberName(b, language)));
  return <fieldset className="people-picker">
    <legend>{label}</legend>
    {chosen.map(id => <input key={id} type="hidden" name={name} value={id} />)}
    {chosen.length > 0 && <ul className="chips">
      {chosen.filter(nameOf).map(id => <li key={id} className="chip">
        <span dir="auto">{nameOf(id)}</span>
        <button type="button" aria-label={t("remove") + " " + nameOf(id)} onClick={() => setChosen(chosen.filter(item => item !== id))}>×</button>
      </li>)}
    </ul>}
    {available.length > 0 && <select aria-label={t("add") + " · " + label} value="" onChange={event => {
      if (event.target.value) setChosen([...chosen, event.target.value]);
    }}>
      <option value="">{t("add")}…</option>
      {available.map(item => <option key={item.id} value={item.id}>{memberName(item, language)}{item.birth_year ? " (" + item.birth_year + ")" : ""}</option>)}
    </select>}
  </fieldset>;
}
