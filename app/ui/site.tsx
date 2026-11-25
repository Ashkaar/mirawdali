"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Archive, Category, Contribution, Kind, Member } from "@/lib/archive";
import { authAction, submitContribution } from "@/app/actions";
import { translate, type Language, type Translate } from "./copy";
import Tree, { memberName, photoUrl } from "./tree";

const views = ["tree","gallery","blog"] as const;
const categories = ["memories","history","news"] as const;
type View = typeof views[number];
type AuthMode = "login" | "signup" | "reset" | "newPassword";
type Panel = { type: "account" | "privacy" | "submissions" } |
  { type: "auth"; mode: AuthMode } | { type: "member"; member: Member } |
  { type: "entry"; entry: Contribution } |
  { type: "contribute"; kind: Kind; member?: Member };
type Result = { error?: string; success?: string };

function Dialog({ title, close, children, t }: { title: string; close: () => void; children: ReactNode; t: Translate }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);
  return <dialog ref={dialog} aria-labelledby="dialog-title" onClose={close}>
    <div className="dialog-head"><h2 id="dialog-title">{title}</h2><button className="icon" onClick={close}>{t("close")}</button></div>
    <div className="dialog-body">{children}</div>
  </dialog>;
}

const categoryOptions = (t: Translate) => categories.map(key => <option key={key} value={key}>{t(key)}</option>);

export default function Site({ archive, authResult }: { archive: Archive; authResult?: string }) {
  const router = useRouter();
  const [language,setLanguage] = useState<Language>("en");
  const [theme,setTheme] = useState("light");
  const [view,setView] = useState<View>("tree");
  const [filter,setFilter] = useState<Category | "all">("all");
  const [panel,setPanel] = useState<Panel | null>(null);
  const [message,setMessage] = useState<Result>({});
  const [toast,setToast] = useState("");
  const [busy,setBusy] = useState(false);
  const inFlight = useRef(false);
  const nextContribution = useRef<Panel | null>(null);
  const t = translate(language);
  const canBrowse = archive.publicRead || archive.signedIn;

  useEffect(() => {
    const doc = document.documentElement;
    setLanguage(doc.lang === "ckb" ? "ckb" : "en");
    setTheme(doc.dataset.theme === "dark" ? "dark" : "light");
    const syncView = () => {
      const current = location.hash.slice(1);
      setView(views.includes(current as View) ? current as View : "tree");
    };
    syncView();
    window.addEventListener("hashchange",syncView);
    return () => window.removeEventListener("hashchange",syncView);
  }, []);
  useEffect(() => {
    if (!authResult) return;
    if (authResult === "recovery" && archive.signedIn) setPanel({type:"auth",mode:"newPassword"});
    else if (authResult === "error") setToast("authError");
    else if (authResult === "ok") setToast("signedIn");
    window.history.replaceState(null,"",location.pathname+location.hash);
  }, [authResult,archive.signedIn]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""),4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function switchLanguage() {
    const next = language === "en" ? "ckb" : "en";
    setLanguage(next);
    const doc = document.documentElement;
    doc.lang = next;
    doc.dir = next === "ckb" ? "rtl" : "ltr";
    try { localStorage.setItem("mir-lang",next); } catch {}
  }
  function switchTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("mir-theme",next); } catch {}
  }
  function open(next: Panel | null) {
    setMessage({});
    setPanel(next);
  }
  function contribute(kind: Kind, member?: Member) {
    const next = {type:"contribute",kind,member} as const;
    if (archive.signedIn) open(next);
    else {
      nextContribution.current = next;
      open({type:"account"});
    }
  }
  async function perform(event: FormEvent<HTMLFormElement>, action: (data: FormData) => Promise<Result>, after?: (result: Result) => void) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = new FormData(event.currentTarget,(event.nativeEvent as SubmitEvent).submitter);
    inFlight.current = true;
    setBusy(true);
    setMessage({});
    try {
      const result = await action(form);
      setMessage(result);
      if (result.success) {
        router.refresh();
        after?.(result);
      }
    } catch {
      setMessage({error:"saveFailed"});
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  const closeWithToast = (result: Result) => {
    open(null);
    setToast(result.success ?? "");
  };

  const currentKind = {tree:"suggestion",gallery:"photo",blog:"post"}[view] as Kind;
  const actionLabel = {suggestion:"suggest",photo:"submitPhoto",post:"write"};
  const published = archive.published.filter(item => view === "gallery" ? item.kind === "photo" :
    item.kind === "post" && (filter === "all" || item.category === filter));

  function nameById(id: string) {
    const member = archive.members.find(item => item.id === id);
    return member ? memberName(member,language) : "";
  }
  function selectMemberOptions(exclude?: string) {
    return archive.members.filter(item => item.id !== exclude).map(item =>
      <option key={item.id} value={item.id}>{memberName(item,language)}</option>);
  }

  function renderPanel(active: Panel): { title: string; content: ReactNode } {
    if (active.type === "privacy") return {title:t("privacy"),content:<p>{t("privacyBody")}</p>};
    if (active.type === "account") return {
      title:t("account"),
      content: !archive.configured ? <p>{t("unavailable")}</p> : archive.signedIn ? <div className="choices">
        {archive.admin && <a className="primary" href="/admin">{t("manage")}</a>}
        <button className="outline" onClick={() => open({type:"submissions"})}>{t("status")}</button>
        <form onSubmit={event => perform(event,authAction,closeWithToast)}><input type="hidden" name="mode" value="logout" /><button className="outline" disabled={busy}>{t("logout")}</button></form>
      </div> : <div className="choices">
        <button className="primary" onClick={() => open({type:"auth",mode:"login"})}>{t("login")}</button>
        <button className="outline" onClick={() => open({type:"auth",mode:"signup"})}>{t("signup")}</button>
        <form action={async data => { const result = await authAction(data); setMessage(result); }}><input type="hidden" name="mode" value="google" /><button className="outline">{t("google")}</button></form>
      </div>
    };
    if (active.type === "auth") return {
      title:t(active.mode),
      content:<form onSubmit={event => perform(event,authAction,result => {
        if (result.success === "signedIn" && nextContribution.current) {
          open(nextContribution.current);
          nextContribution.current = null;
        } else if (result.success === "signedIn" || result.success === "passwordUpdated") closeWithToast(result);
      })}>
        <input type="hidden" name="mode" value={active.mode} />
        {active.mode !== "newPassword" && <label>{t("email")}<input type="email" name="email" autoComplete="email" maxLength={254} required /></label>}
        {active.mode !== "reset" && <label>{t("secret")}<input type="password" name="password" autoComplete={active.mode === "login" ? "current-password" : "new-password"} minLength={active.mode === "login" ? undefined : 8} maxLength={100} required /></label>}
        <div className="choices"><button className="primary" disabled={busy}>{t(active.mode)}</button>
          {active.mode === "login" && <button type="button" className="plain" onClick={() => open({type:"auth",mode:"reset"})}>{t("reset")}</button>}
          <button type="button" className="plain" onClick={() => open({type:"account"})}>{t("back")}</button></div>
      </form>
    };
    if (active.type === "contribute") return {
      title:t(actionLabel[active.kind]),
      content:<form onSubmit={event => perform(event,submitContribution,closeWithToast)}>
        <input type="hidden" name="kind" value={active.kind} />
        <label>{t("postTitle")}<input name="title" maxLength={150} required /></label>
        {active.kind === "post" && <label>{t("category")}<select name="category" defaultValue={filter === "all" ? "memories" : filter}>{categoryOptions(t)}</select></label>}
        {active.kind === "suggestion" && <label>{t("related")} · {t("optional")}<select name="member" defaultValue={active.member?.id ?? ""}><option value="">{t("none")}</option>{selectMemberOptions()}</select></label>}
        {active.kind === "photo" && <label>{t("selectFile")}<input type="file" name="image" accept="image/jpeg,image/png,image/webp" required /><small>{t("photoLimit")}</small></label>}
        <label>{t(active.kind === "photo" ? "description" : "details")}<textarea name="body" maxLength={12000} required={active.kind !== "photo"} /></label>
        <button className="primary" disabled={busy}>{t("send")}</button>
      </form>
    };
    if (active.type === "entry") return {
      title:active.entry.title,
      content:<>
        {active.entry.image_path && <img className="gallery-image" src={photoUrl(active.entry.image_path)} alt={active.entry.title} />}
        {active.entry.category && <p className="hint">{t(active.entry.category)}</p>}
        {active.entry.body && <p className="entry-body">{active.entry.body}</p>}
      </>
    };
    if (active.type === "member") {
      const m = active.member;
      const relationships = [
        ["parent",archive.parents.filter(edge => edge.child_id === m.id).map(edge => edge.parent_id)],
        ["children",archive.parents.filter(edge => edge.parent_id === m.id).map(edge => edge.child_id)],
        ["partnerField",archive.partners.filter(edge => edge.first_id === m.id || edge.second_id === m.id).map(edge => edge.first_id === m.id ? edge.second_id : edge.first_id)],
      ] as const;
      return {title:memberName(m,language),content:<>
        {m.photo_path && <img className="gallery-image" src={photoUrl(m.photo_path)} alt={memberName(m,language)} />}
        <p>{[t(m.gender),m.birth_year && t("born")+" "+m.birth_year,m.death_year && t("deceased")+" "+m.death_year].filter(Boolean).join(" · ")}</p>
        {relationships.map(([label,ids]) => ids.length > 0 && <p key={label}><strong>{t(label)}</strong> · {ids.map(nameById).filter(Boolean).join(", ")}</p>)}
        <div className="choices"><button className="outline" onClick={() => contribute("suggestion",m)}>{t("suggest")}</button>
          {archive.roles.tree && <a className="primary" href={"/admin?edit="+m.id}>{t("editMember")}</a>}</div>
      </>};
    }
    return {title:t("status"),content: archive.mine.length ? <ul className="submissions">
      {archive.mine.map(entry => <li key={entry.id}><strong>{entry.title}</strong> <span>{t(entry.kind)} · {t(entry.status)}</span></li>)}
    </ul> : <p>{t("noSubmissions")}</p>};
  }

  const currentPanel = panel ? renderPanel(panel) : null;
  return <>
    <header className="masthead">
      <div className="top">
        <a className="brand" href="#tree"><span className="crest" aria-hidden="true">M</span>{t("title")}</a>
        <nav className="tabs" aria-label={language === "en" ? "Main navigation" : "ڕێنیشاندەری سەرەکی"}>
          {views.map(tab => <button key={tab} onClick={() => {setView(tab);location.hash = tab;}} aria-current={tab === view ? "page" : undefined}>{t(tab)}</button>)}
        </nav>
        <div className="actions">
          <button className="icon" onClick={switchLanguage} lang={language === "en" ? "ckb" : "en"}>{language === "en" ? "کوردی" : "English"}</button>
          <button className="icon" id="theme" aria-label={t(theme === "dark" ? "light" : "dark")} onClick={switchTheme}>{theme === "dark" ? "☀" : "☾"}</button>
          <button className="outline" onClick={() => {nextContribution.current = null;open({type:"account"});}}>{t("account")}</button>
        </div>
      </div>
      <section className="intro"><div><p className="eyebrow">{t("archive")}</p><h1>{t("title")}</h1><p className="credit">{t("developed")} <strong>Ashkar Rashid</strong></p></div>
        {archive.configured && !archive.failed && canBrowse && <button className="primary" onClick={() => contribute(currentKind)}>{t(actionLabel[currentKind])}</button>}
      </section>
    </header>
    <main><section className="frame">
      {!archive.configured || archive.failed || !canBrowse ? <div className="bar"><div><h2>{t(view === "tree" ? "familyTree" : view)}</h2>
        <p>{t(!archive.configured ? "setup" : archive.failed ? "loadError" : "privateArchive")}</p></div>
        {archive.configured && !archive.failed && <button className="primary" onClick={() => open({type:"account"})}>{t("login")}</button>}</div> :
        view === "tree" ? <Tree archive={archive} language={language} t={t} onMember={member => open({type:"member",member})} /> : <>
          <div className="bar"><div><h2>{t(view)}</h2><p>{t(view === "blog" ? "blogHint" : "galleryHint")}</p></div></div>
          {view === "blog" && <div className="categories" role="group" aria-label={t("filter")}>
            {(["all",...categories] as const).map(category => <button key={category} className="outline" aria-pressed={category === filter} onClick={() => setFilter(category)}>{t(category)}</button>)}
          </div>}
          <div className="content" aria-live="polite">{published.length ? published.map(entry => entry.kind === "photo" ?
            <button key={entry.id} className="tile" onClick={() => open({type:"entry",entry})}>
              {entry.image_path && <img src={photoUrl(entry.image_path)} alt="" loading="lazy" />}
              <span className="tile-copy"><strong>{entry.title}</strong></span>
            </button> : <button key={entry.id} className="tile post" onClick={() => open({type:"entry",entry})}>
              {entry.category && <span className="category">{t(entry.category)}</span>}<strong>{entry.title}</strong>
              <p>{entry.body.length > 180 ? entry.body.slice(0,180)+"…" : entry.body}</p>
            </button>) : <p className="empty-posts">{t(view === "blog" ? "noPosts" : "noPhotos")}</p>}</div>
        </>}
    </section></main>
    <footer><span>Mirawdali · میراودەلی</span><button className="plain" onClick={() => open({type:"privacy"})}>{t("privacy")}</button></footer>
    {currentPanel && <Dialog title={currentPanel.title} close={() => open(null)} t={t}>
      {currentPanel.content}
      {(message.error || message.success) && <p className="action-status" role={message.error ? "alert" : "status"}>{t(message.error ?? message.success ?? "")}</p>}
    </Dialog>}
    {toast && <div className="toast" role="status">{t(toast)}</div>}
  </>;
}
