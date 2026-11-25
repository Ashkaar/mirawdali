"use client";

import type { Language, Translate } from "./copy";

// 21-ray sun for the Kurdistan flag, precomputed so server and client render the same markup.
const sunRays = Array.from({ length: 21 }, (_, ray) => {
  const point = (angle: number, radius: number) =>
    (15 + radius * Math.sin(angle)).toFixed(2) + "," + (10 - radius * Math.cos(angle)).toFixed(2);
  const centre = (ray / 21) * 2 * Math.PI;
  const half = Math.PI / 21;
  return point(centre - half, 2.3) + " " + point(centre, 4.6) + " " + point(centre + half, 2.3);
});

function KurdistanFlag() {
  return <svg className="flag" viewBox="0 0 30 20" aria-hidden="true">
    <rect width="30" height="20" fill="#fff" />
    <rect width="30" height="6.67" fill="#ed2024" />
    <rect y="13.33" width="30" height="6.67" fill="#278e43" />
    <g fill="#febd11">{sunRays.map(points => <polygon key={points} points={points} />)}<circle cx="15" cy="10" r="2.6" /></g>
  </svg>;
}

function EnglishFlag() {
  return <svg className="flag" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <clipPath id="flag-uk-clip"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#flag-uk-clip)" stroke="#c8102e" strokeWidth="4" />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
  </svg>;
}

/** Language and theme switches. The language button names the language it switches to: as a flag on phones, in its own script elsewhere. */
export default function Preferences({ language, theme, onLanguage, onTheme, t }: {
  language: Language; theme: string; onLanguage: () => void; onTheme: () => void; t: Translate;
}) {
  const next = language === "en" ? "ckb" : "en";
  const nextName = next === "ckb" ? "کوردی" : "English";
  return <div className="actions prefs">
    <button className="icon lang-button" onClick={onLanguage} lang={next} aria-label={nextName}>
      {next === "ckb" ? <KurdistanFlag /> : <EnglishFlag />}
      <span className="lang-name">{nextName}</span>
    </button>
    <button className="icon" id="theme" aria-label={t(theme === "dark" ? "light" : "dark")} onClick={onTheme}>{theme === "dark" ? "☀" : "☾"}</button>
  </div>;
}
