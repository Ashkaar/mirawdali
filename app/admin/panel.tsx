"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AdminData, AdminEntry, AdminUser } from "@/lib/admin";
import { categoryKeys, sectionKeys, type Kind, type Member, type Section, type Status } from "@/lib/model";
import { translate, type Language, type Translate } from "@/app/ui/copy";
import { memberName, photoUrl } from "@/app/ui/tree";
import {
  deleteEntry, deleteMember, deleteUser, markSuggestionDone, publishEntry, saveMember, setEntryStatus,
  setUserBlocked, setUserSections, setVisibility, updateEntry,
} from "./actions";

type Result = { error?: string; success?: string };
type Action = (form: FormData) => Promise<Result>;
type Tab = "overview" | Section | "users" | "settings";
type Dialog = { type: "member"; member?: Member; suggestion?: AdminEntry } | { type: "entry"; kind: "post" | "photo"; entry?: AdminEntry };
type Perform = (event: FormEvent<HTMLFormElement>, action: Action, confirmText?: string) => void;

const allTabs: Tab[] = ["overview", "tree", "gallery", "blog", "users", "settings"];
const genders = ["unspecified", "female", "male", "other"] as const;
const sectionOf = (kind: Kind): Section => kind === "suggestion" ? "tree" : kind === "photo" ? "gallery" : "blog";
const statusLabels: Record<Status, string> = { pending: "statusPending", approved: "statusPublished", rejected: "statusRejected" };
const labelFor = (status: Status, kind: Kind) => kind === "suggestion" && status === "approved" ? "approved" : statusLabels[status];
const formatDate = (value: string | null, language: Language, t: Translate) => value
  ? new Date(value).toLocaleDateString(language === "ckb" ? "ckb-IQ" : "en-GB", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
  : t("never");

function Modal({ title, close, children, t }: { title: string; close: () => void; children: ReactNode; t: Translate }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);
  return <dialog ref={dialog} aria-labelledby="dialog-title" onClose={close}>
    <div className="dialog-head"><h2 id="dialog-title">{title}</h2><button className="icon" onClick={close}>{t("close")}</button></div>
    <div className="dialog-body">{children}</div>
  </dialog>;
}

/** A one-button form that runs an admin action for a single record. */
function ActionButton({ action, fields, label, className = "outline", confirmText, perform, busy }: {
  action: Action; fields: Record<string, string>; label: string; className?: string; confirmText?: string; perform: Perform; busy: boolean;
}) {
  return <form className="inline-form" onSubmit={event => perform(event, action, confirmText)}>
    {Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
    <button className={className} disabled={busy}>{label}</button>
  </form>;
}

export default function AdminPanel({ data, initialTab, editMemberId }: { data: AdminData; initialTab?: string; editMemberId?: string }) {
  const router = useRouter();
  const tabs = allTabs.filter(tab => tab === "overview" || (tab === "users" || tab === "settings" ? data.roles.owner : data.roles[tab]));
  const editTarget = data.roles.tree ? data.members.find(member => member.id === editMemberId) : undefined;
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState("light");
  const [tab, setTab] = useState<Tab>(() => editTarget ? "tree" : tabs.includes(initialTab as Tab) ? initialTab as Tab : "overview");
  const [dialog, setDialog] = useState<Dialog | null>(() => editTarget ? { type: "member", member: editTarget } : null);
  const [message, setMessage] = useState<Result>({});
  const [toast, setToast] = useState<Result>({});
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const t = translate(language);

  useEffect(() => {
    const doc = document.documentElement;
    setLanguage(doc.lang === "ckb" ? "ckb" : "en");
    setTheme(doc.dataset.theme === "dark" ? "dark" : "light");
  }, []);
  useEffect(() => {
    window.history.replaceState(null, "", tab === "overview" ? "/admin" : "/admin?tab=" + tab);
  }, [tab]);
  useEffect(() => {
    if (!toast.error && !toast.success) return;
    const timer = window.setTimeout(() => setToast({}), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function switchLanguage() {
    const next = language === "en" ? "ckb" : "en";
    setLanguage(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ckb" ? "rtl" : "ltr";
    try { localStorage.setItem("mir-lang", next); } catch {}
  }
  function switchTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("mir-theme", next); } catch {}
  }
  function open(next: Dialog | null) {
    setMessage({});
    setDialog(next);
  }
  const perform: Perform = async (event, action, confirmText) => {
    event.preventDefault();
    if (inFlight.current || (confirmText && !window.confirm(confirmText))) return;
    const form = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    const inDialog = Boolean(event.currentTarget.closest("dialog"));
    inFlight.current = true;
    setBusy(true);
    setMessage({});
    try {
      const result = await action(form);
      if (result.success) {
        if (inDialog) setDialog(null);
        setToast(result);
        router.refresh();
      } else if (inDialog) setMessage(result);
      else setToast(result);
    } catch {
      (inDialog ? setMessage : setToast)({ error: "saveFailed" });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const nameOf = (id: string | null) => {
    const member = data.members.find(item => item.id === id);
    return member ? memberName(member, language) : "";
  };
  const pending = (section: Section) => data.entries.filter(entry => entry.status === "pending" && sectionOf(entry.kind) === section).length;
  const roleList = data.roles.owner ? [t("owner")] : sectionKeys.filter(section => data.roles[section]).map(section => t(section));
  const shared = { data, t, language, busy, perform, open, nameOf };

  return <>
    <header className="admin-head">
      <div className="admin-top">
        <div className="actions">
          <button className="icon" onClick={switchLanguage} lang={language === "en" ? "ckb" : "en"}>{language === "en" ? "کوردی" : "English"}</button>
          <button className="icon" id="theme" aria-label={t(theme === "dark" ? "light" : "dark")} onClick={switchTheme}>{theme === "dark" ? "☀" : "☾"}</button>
          <a className="outline" href="/">{t("backToSite")}</a>
        </div>
      </div>
      <div className="admin-title">
        <div><p className="eyebrow">{t("adminTitle")}</p><h1>{t(tab === "tree" ? "familyTree" : tab)}</h1></div>
        <p className="hint">{t("yourAccess")} · {roleList.join(", ")}</p>
      </div>
      <nav className="admin-tabs" aria-label={t("adminTitle")}>
        {tabs.map(item => {
          const count = item === "tree" || item === "gallery" || item === "blog" ? pending(item) : 0;
          return <button key={item} aria-current={item === tab ? "page" : undefined} onClick={() => setTab(item)}>
            {t(item)}{count > 0 && <span className="count" aria-label={t("pendingCount") + " " + count}>{count}</span>}
          </button>;
        })}
      </nav>
    </header>
    <main className="admin-main">
      {data.failed && <p className="notice" role="alert">{t("loadError")}</p>}
      {tab === "overview" && <Overview {...shared} setTab={setTab} pending={pending} />}
      {tab === "tree" && <TreeTab {...shared} />}
      {tab === "gallery" && <EntryList {...shared} kind="photo" />}
      {tab === "blog" && <EntryList {...shared} kind="post" />}
      {tab === "users" && <UsersTab {...shared} />}
      {tab === "settings" && <SettingsTab {...shared} />}
    </main>
    {dialog && <Modal close={() => open(null)} t={t}
      title={dialog.type === "member" ? t(dialog.member ? "editMember" : "addMember") : t(dialog.entry ? "editEntry" : dialog.kind === "post" ? "addPost" : "addGalleryPhoto")}>
      {dialog.type === "member" ? <MemberForm {...shared} member={dialog.member} suggestion={dialog.suggestion} /> : <EntryForm {...shared} kind={dialog.kind} entry={dialog.entry} />}
      {(message.error || message.success) && <p className="action-status" role={message.error ? "alert" : "status"}>{t(message.error ?? message.success ?? "")}</p>}
    </Modal>}
    {(toast.error || toast.success) && <div className={"toast" + (toast.error ? " toast-error" : "")} role={toast.error ? "alert" : "status"}>{t(toast.error ?? toast.success ?? "")}</div>}
  </>;
}

type Shared = {
  data: AdminData; t: Translate; language: Language; busy: boolean; perform: Perform;
  open: (dialog: Dialog | null) => void; nameOf: (id: string | null) => string;
};

function Overview({ data, t, setTab, pending }: Shared & { setTab: (tab: Tab) => void; pending: (section: Section) => number }) {
  const published = (kind: Kind) => data.entries.filter(entry => entry.kind === kind && entry.status === "approved").length;
  const cards: { tab: Tab; label: string; stats: [string, number][] }[] = [];
  if (data.roles.tree) cards.push({ tab: "tree", label: t("familyTree"), stats: [[t("membersCount"), data.members.length], [t("pendingCount"), pending("tree")]] });
  if (data.roles.gallery) cards.push({ tab: "gallery", label: t("gallery"), stats: [[t("publishedCount"), published("photo")], [t("pendingCount"), pending("gallery")]] });
  if (data.roles.blog) cards.push({ tab: "blog", label: t("blog"), stats: [[t("publishedCount"), published("post")], [t("pendingCount"), pending("blog")]] });
  if (data.roles.owner) cards.push({ tab: "users", label: t("users"), stats: [[t("usersCount"), data.users.length], [t("blocked"), data.users.filter(user => user.blocked).length]] });
  const waiting = data.entries.filter(entry => entry.status === "pending").slice(0, 12);
  return <>
    <div className="stat-grid">
      {cards.map(card => <button key={card.tab} className="stat-card" onClick={() => setTab(card.tab)}>
        <strong>{card.label}</strong>
        {card.stats.map(([label, value]) => <span key={label}><b>{value}</b> {label}</span>)}
      </button>)}
    </div>
    <section className="admin-card">
      <div className="admin-bar"><h2>{t("pendingCount")}</h2></div>
      {waiting.length ? <ul className="admin-list">
        {waiting.map(entry => <li key={entry.id} className="admin-row">
          <div><strong>{entry.title}</strong><small>{t(entry.kind)} · {entry.author_email ?? t("unknownAuthor")}</small></div>
          <button className="outline" onClick={() => setTab(sectionOf(entry.kind))}>{t(sectionOf(entry.kind))}</button>
        </li>)}
      </ul> : <p className="admin-empty">{t("empty")}</p>}
    </section>
  </>;
}

function TreeTab(props: Shared) {
  const { data, t, language, busy, perform, open, nameOf } = props;
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const members = useMemo(() => [...data.members]
    .sort((a, b) => memberName(a, language).localeCompare(memberName(b, language)))
    .filter(member => !query || [member.name_en, member.name_ckb, member.birth_year].some(value => String(value ?? "").toLocaleLowerCase().includes(query))),
  [data.members, language, query]);
  return <>
    <section className="admin-card">
      <div className="admin-bar">
        <h2>{t("membersCount")} · {data.members.length}</h2>
        <div className="bar-actions">
          <input className="search" type="search" placeholder={t("search")} aria-label={t("search")} value={search} onChange={event => setSearch(event.target.value)} />
          <button className="primary" onClick={() => open({ type: "member" })}>{t("addMember")}</button>
        </div>
      </div>
      {members.length ? <div className="table-wrap"><table className="admin-table">
        <thead><tr><th>{t("member")}</th><th>{t("years")}</th><th>{t("parent")}</th><th>{t("actions")}</th></tr></thead>
        <tbody>{members.map(member => {
          const parents = data.parents.filter(edge => edge.child_id === member.id).map(edge => nameOf(edge.parent_id)).filter(Boolean);
          return <tr key={member.id}>
            <td><div className="who">
              {member.photo_path ? <img className="initial" src={photoUrl(member.photo_path)} alt="" loading="lazy" /> : <span className="initial" aria-hidden="true">{Array.from(memberName(member, language))[0]}</span>}
              <span><strong>{memberName(member, language)}</strong><small>{[language === "ckb" ? member.name_en : member.name_ckb, t(member.gender)].filter(Boolean).join(" · ")}</small></span>
            </div></td>
            <td>{[member.birth_year, member.death_year].filter(Boolean).join(" – ") || "—"}</td>
            <td>{parents.join(", ") || "—"}</td>
            <td><div className="row-actions">
              <button className="outline" onClick={() => open({ type: "member", member })}>{t("edit")}</button>
              <ActionButton action={deleteMember} fields={{ id: member.id }} label={t("delete")} className="outline danger" confirmText={t("confirmDeleteMember")} perform={perform} busy={busy} />
            </div></td>
          </tr>;
        })}</tbody>
      </table></div> : <p className="admin-empty">{t(data.members.length ? "noMatches" : "noMembers")}</p>}
    </section>
    <EntryList {...props} kind="suggestion" />
  </>;
}

function EntryList({ data, t, language, busy, perform, open, nameOf, kind }: Shared & { kind: Kind }) {
  const section = sectionOf(kind);
  const entries = data.entries.filter(entry => entry.kind === kind);
  const [status, setStatus] = useState<Status | "all">(() => entries.some(entry => entry.status === "pending") ? "pending" : "all");
  const [category, setCategory] = useState<string>("all");
  const shown = entries.filter(entry => (status === "all" || entry.status === status) && (category === "all" || entry.category === category));
  const button = (fields: Record<string, string>, action: Action, label: string, className?: string, confirmText?: string) =>
    <ActionButton action={action} fields={{ section, ...fields }} label={label} className={className} confirmText={confirmText} perform={perform} busy={busy} />;
  const statusButton = (entry: AdminEntry, next: Status, label: string, className?: string) => button({ id: entry.id, status: next }, setEntryStatus, label, className);
  return <section className="admin-card">
    <div className="admin-bar">
      <h2>{t(kind === "suggestion" ? "treeSuggestions" : kind === "photo" ? "gallery" : "blog")}</h2>
      {kind !== "suggestion" && <button className="primary" onClick={() => open({ type: "entry", kind })}>{t(kind === "post" ? "addPost" : "addGalleryPhoto")}</button>}
    </div>
    {kind === "suggestion" && <p className="hint admin-note">{t("treeAdminHint")}</p>}
    <div className="categories" role="group">
      {(["all", "pending", "approved", "rejected"] as const).map(key => <button key={key} className="outline" aria-pressed={status === key} onClick={() => setStatus(key)}>
        {t(key === "all" ? "statusAll" : labelFor(key, kind))} · {key === "all" ? entries.length : entries.filter(entry => entry.status === key).length}
      </button>)}
      {kind === "post" && <select aria-label={t("category")} value={category} onChange={event => setCategory(event.target.value)}>
        <option value="all">{t("all")}</option>{categoryKeys.map(key => <option key={key} value={key}>{t(key)}</option>)}
      </select>}
    </div>
    {shown.length ? <ul className={kind === "photo" ? "admin-grid" : "admin-list"}>
      {shown.map(entry => <li key={entry.id} className="admin-item">
        {entry.image_path && <img src={photoUrl(entry.image_path)} alt="" loading="lazy" />}
        <div className="admin-item-body">
          <p className="meta">
            <span className={"badge " + entry.status}>{t(labelFor(entry.status, kind))}</span>
            {entry.category && <span>{t(entry.category)}</span>}
            {entry.member_id && <span>{nameOf(entry.member_id)}</span>}
            {entry.applied_at && <span>{t("applied")}</span>}
          </p>
          <h3>{entry.title}</h3>
          {entry.body && <p className={kind === "post" ? "excerpt" : "entry-body"}>{entry.body}</p>}
          <small className="byline">{t("submittedBy")} {entry.author_email ?? t("unknownAuthor")} · {formatDate(entry.created_at, language, t)}</small>
          <div className="row-actions">
            {entry.status !== "approved" && statusButton(entry, "approved", t(kind === "suggestion" ? "approve" : "publish"), "primary")}
            {entry.status === "pending" && statusButton(entry, "rejected", t("reject"))}
            {entry.status === "approved" && kind !== "suggestion" && statusButton(entry, "rejected", t("unpublish"))}
            {entry.status === "rejected" && statusButton(entry, "pending", t("moveToPending"))}
            {kind === "suggestion" && entry.status === "approved" && !entry.applied_at && <>
              <button className="primary" disabled={busy} onClick={() => open({ type: "member", member: data.members.find(member => member.id === entry.member_id), suggestion: entry })}>{t("applyToTree")}</button>
              {button({ id: entry.id }, markSuggestionDone, t("markDone"))}
            </>}
            {kind !== "suggestion" && <button className="outline" disabled={busy} onClick={() => open({ type: "entry", kind, entry })}>{t("edit")}</button>}
            {button({ id: entry.id }, deleteEntry, t("delete"), "outline danger", t("confirmDelete"))}
          </div>
        </div>
      </li>)}
    </ul> : <p className="admin-empty">{t(kind === "suggestion" ? "noSuggestions" : "noEntries")}</p>}
  </section>;
}

function MemberForm({ data, t, language, busy, perform, member, suggestion }: Shared & { member?: Member; suggestion?: AdminEntry }) {
  const parents = data.parents.filter(edge => edge.child_id === member?.id).map(edge => edge.parent_id);
  const partners = data.partners.filter(edge => edge.first_id === member?.id || edge.second_id === member?.id)
    .map(edge => edge.first_id === member?.id ? edge.second_id : edge.first_id);
  const options = data.members.filter(item => item.id !== member?.id)
    .sort((a, b) => memberName(a, language).localeCompare(memberName(b, language)))
    .map(item => <option key={item.id} value={item.id}>{memberName(item, language)}{item.birth_year ? " (" + item.birth_year + ")" : ""}</option>);
  return <form key={member?.id ?? "new"} onSubmit={event => perform(event, saveMember)}>
    <input type="hidden" name="id" value={member?.id ?? ""} />
    {suggestion && <div className="review-item"><input type="hidden" name="suggestion" value={suggestion.id} /><strong>{suggestion.title}</strong><p className="entry-body">{suggestion.body}</p></div>}
    <label>{t("englishName")}<input name="name_en" dir="auto" maxLength={140} defaultValue={member?.name_en ?? ""} /></label>
    <label>{t("soraniName")}<input name="name_ckb" dir="auto" maxLength={140} defaultValue={member?.name_ckb ?? ""} /></label>
    <label>{t("gender")}<select name="gender" defaultValue={member?.gender ?? "unspecified"}>{genders.map(key => <option key={key} value={key}>{t(key)}</option>)}</select></label>
    <div className="form-row">
      <label>{t("birthYear")}<input name="birth_year" type="number" min={1} max={9999} defaultValue={member?.birth_year ?? ""} /></label>
      <label>{t("deathYear")}<input name="death_year" type="number" min={1} max={9999} defaultValue={member?.death_year ?? ""} /></label>
    </div>
    {member?.photo_path && <img className="gallery-image" src={photoUrl(member.photo_path)} alt="" />}
    <label>{t("addPhoto")}<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" /><small>{t("photoLimit")}</small></label>
    {options.length ? <>
      <p className="hint">{t("relationshipsHint")}</p>
      <div className="form-row">
        <label>{t("parent")}<select multiple name="parents" defaultValue={parents}>{options}</select></label>
        <label>{t("partnerField")}<select multiple name="partners" defaultValue={partners}>{options}</select></label>
      </div>
    </> : <p className="hint">{t("noRelatives")}</p>}
    <div className="choices"><button className="primary" disabled={busy}>{t("save")}</button></div>
  </form>;
}

function EntryForm({ t, busy, perform, kind, entry }: Shared & { kind: "post" | "photo"; entry?: AdminEntry }) {
  return <form onSubmit={event => perform(event, entry ? updateEntry : publishEntry)}>
    <input type="hidden" name="kind" value={kind} />
    <input type="hidden" name="section" value={sectionOf(kind)} />
    <input type="hidden" name="id" value={entry?.id ?? ""} />
    {entry?.image_path && <img className="gallery-image" src={photoUrl(entry.image_path)} alt="" />}
    <label>{t("postTitle")}<input name="title" maxLength={150} required defaultValue={entry?.title ?? ""} /></label>
    {kind === "post" && <label>{t("category")}<select name="category" defaultValue={entry?.category ?? "memories"}>{categoryKeys.map(key => <option key={key} value={key}>{t(key)}</option>)}</select></label>}
    {kind === "photo" && !entry && <label>{t("selectFile")}<input type="file" name="image" accept="image/jpeg,image/png,image/webp" required /><small>{t("photoLimit")}</small></label>}
    <label>{t(kind === "photo" ? "description" : "details")}<textarea name="body" maxLength={12000} required={kind === "post"} defaultValue={entry?.body ?? ""} /></label>
    <div className="choices"><button className="primary" disabled={busy}>{t(entry ? "save" : "publish")}</button></div>
  </form>;
}

function UsersTab({ data, t, language, busy, perform }: Shared) {
  return <section className="admin-card">
    <div className="admin-bar"><h2>{t("usersCount")} · {data.users.length}</h2></div>
    <p className="hint admin-note">{t("rolesNote")}</p>
    <ul className="admin-list">
      {data.users.map((user: AdminUser) => {
        const self = user.id === data.userId;
        return <li key={user.id} className="user-row">
          <div className="user-info">
            <strong dir="ltr">{user.email ?? user.id}</strong>
            <p className="meta">
              {user.is_owner && <span className="badge approved">{t("owner")}</span>}
              {self && <span className="badge">{t("you")}</span>}
              {user.blocked && <span className="badge rejected">{t("blocked")}</span>}
              {!user.confirmed && <span className="badge pending">{t("unconfirmed")}</span>}
              <span>{user.provider}</span>
            </p>
            <small>{t("joined")} {formatDate(user.created_at, language, t)} · {t("lastSignIn")} {formatDate(user.last_sign_in_at, language, t)} · {t("submissionsCount")} {user.submissions}</small>
          </div>
          {user.is_owner ? <p className="hint">{t("fullAccess")}</p> : <div className="user-controls">
            <form className="roles-form" onSubmit={event => perform(event, setUserSections)}>
              <input type="hidden" name="id" value={user.id} />
              <fieldset disabled={user.blocked || busy}>
                <legend>{t("adminOf")}</legend>
                {sectionKeys.map(section => <label key={section} className="check">
                  <input type="checkbox" name="sections" value={section} defaultChecked={user.sections.includes(section)} />{t(section)}
                </label>)}
                <button className="outline">{t("saveRoles")}</button>
              </fieldset>
            </form>
            <div className="row-actions">
              <ActionButton action={setUserBlocked} fields={{ id: user.id, block: String(!user.blocked) }} label={t(user.blocked ? "unblock" : "block")}
                confirmText={user.blocked ? undefined : t("confirmBlock")} perform={perform} busy={busy} />
              <ActionButton action={deleteUser} fields={{ id: user.id }} label={t("delete")} className="outline danger" confirmText={t("confirmDeleteUser")} perform={perform} busy={busy} />
            </div>
          </div>}
        </li>;
      })}
    </ul>
  </section>;
}

function SettingsTab({ data, t, busy, perform }: Shared) {
  return <section className="admin-card">
    <div className="admin-bar"><h2>{t("visibility")}</h2></div>
    <div className="admin-pad">
      <p className="hint">{t("visibilityHint")}</p>
      <form className="settings-form" onSubmit={event => perform(event, setVisibility)}>
        <select name="visibility" aria-label={t("visibility")} defaultValue={data.publicRead ? "public" : "private"}>
          <option value="public">{t("everyone")}</option><option value="private">{t("membersOnly")}</option>
        </select>
        <button className="primary" disabled={busy}>{t("save")}</button>
      </form>
      <p className="hint">{t("ownerNote")}</p>
      <p className="hint">{t("rolesNote")}</p>
    </div>
  </section>;
}
