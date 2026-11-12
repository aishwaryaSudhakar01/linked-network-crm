import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  type Contact, RELATIONSHIPS, SOURCES, dueDate, daysUntil, reachOutSoon, logCatchUp,
  loadContacts, saveContacts, sampleContacts, today,
} from "@/lib/contacts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kindred — Your networking roster" },
      { name: "description", content: "A warm, simple roster of everyone you've met, with in-app reminders to reconnect." },
      { property: "og:title", content: "Kindred — Your networking roster" },
      { property: "og:description", content: "Remember conversations and follow up thoughtfully." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const TAG = ["blue", "green", "orange", "purple", "pink", "yellow", "brown", "red", "gray"];
const tagCls: Record<string, string> = {
  blue: "bg-tag-blue text-tag-blue-fg", green: "bg-tag-green text-tag-green-fg", orange: "bg-tag-orange text-tag-orange-fg",
  purple: "bg-tag-purple text-tag-purple-fg", pink: "bg-tag-pink text-tag-pink-fg", yellow: "bg-tag-yellow text-tag-yellow-fg",
  brown: "bg-tag-brown text-tag-brown-fg", red: "bg-tag-red text-tag-red-fg", gray: "bg-tag-gray text-tag-gray-fg",
};
function color(label: string) { let h = 0; for (const ch of label) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return TAG[h % TAG.length]; }
function Tag({ label, tone }: { label: string; tone?: string }) {
  return <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${tagCls[tone ?? color(label)]}`}>{label}</span>;
}
const fmt = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
function dueLabel(c: Contact) { const n = daysUntil(dueDate(c)); return n < 0 ? `${-n}d overdue` : n === 0 ? "Today" : `in ${n}d`; }

const input = "w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/40";
const btn = "rounded px-3 py-1.5 text-sm transition-colors";
const btnPrimary = `${btn} bg-primary text-primary-foreground hover:opacity-90`;
const btnGhost = `${btn} text-muted-foreground hover:bg-accent`;

function blank(): Contact {
  return { id: crypto.randomUUID(), name: "", email: "", phone: "", linkedin: "", company: "", title: "", relationship: "Alumni", sources: [], reconnectDays: 30, whereMet: "", interests: "", projects: "", nextSteps: "", notes: "", lastContact: today(), nextCheckIn: "", interactions: [] };
}

function Index() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");
  const [rel, setRel] = useState("");
  const [src, setSrc] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [logging, setLogging] = useState<Contact | null>(null);

  useEffect(() => { setContacts(loadContacts()); setReady(true); }, []);
  useEffect(() => { if (ready) saveContacts(contacts); }, [contacts, ready]);

  const upsert = (c: Contact) => setContacts((l) => l.some((x) => x.id === c.id) ? l.map((x) => x.id === c.id ? c : x) : [c, ...l]);
  const relOptions = useMemo(() => Array.from(new Set([...RELATIONSHIPS, ...contacts.map((c) => c.relationship)])), [contacts]);
  const filtered = contacts.filter((c) => {
    const hay = [c.name, c.company, c.title, c.whereMet, c.interests, c.notes, c.projects, c.nextSteps].join(" ").toLowerCase();
    return (!q || hay.includes(q.toLowerCase())) && (!rel || c.relationship === rel) && (!src || c.sources.includes(src));
  }).sort((a, b) => b.lastContact.localeCompare(a.lastContact));
  const soon = reachOutSoon(contacts);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-5xl">🤝</div>
        <h1 className="mt-3 font-serif text-4xl font-bold">Kindred</h1>
        <p className="mt-1 text-muted-foreground">Everyone I've spoken with — and when to say hello again.</p>

        <section className="mt-10">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">⏰ Reach out soon <span className="font-normal">· {soon.length}</span></h2>
          {soon.length === 0 ? <p className="rounded border border-border bg-muted p-4 text-sm text-muted-foreground">You're all caught up. 🌿</p> : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {soon.map((c) => (
                <div key={c.id} className="rounded-md border border-border bg-card p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <button className="text-left font-medium hover:underline" onClick={() => setOpen(c.id)}>{c.name}</button>
                    <Tag label={dueLabel(c)} tone={daysUntil(dueDate(c)) < 0 ? "red" : "yellow"} />
                  </div>
                  <p className="text-xs text-muted-foreground">{c.title}{c.company && ` · ${c.company}`}</p>
                  {c.nextSteps && <p className="mt-2 text-sm">→ {c.nextSteps}</p>}
                  <button className={`${btnGhost} mt-2 -ml-2 px-2 py-1 text-xs`} onClick={() => setLogging(c)}>✍️ Log catch-up</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-border pb-3">
            <h2 className="mr-auto text-sm font-semibold text-muted-foreground">📇 All contacts · {filtered.length}</h2>
            <input className={`${input} w-48`} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={`${input} w-auto`} value={rel} onChange={(e) => setRel(e.target.value)}>
              <option value="">All relationships</option>{relOptions.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select className={`${input} w-auto`} value={src} onChange={(e) => setSrc(e.target.value)}>
              <option value="">All sources</option>{SOURCES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className={btnPrimary} onClick={() => setEditing(blank())}>+ New</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-normal">Name</th><th className="pr-3 font-normal">Organization</th><th className="pr-3 font-normal">Tags</th><th className="pr-3 font-normal">Where we met</th><th className="pr-3 font-normal">Last contact</th><th className="font-normal">Next</th>
              </tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <Fragment key={c.id}>
                    <tr key={c.id} className="cursor-pointer border-t border-border hover:bg-muted" onClick={() => setOpen(open === c.id ? null : c.id)}>
                      <td className="py-2 pr-3 font-medium">{open === c.id ? "▾" : "▸"} {c.name}</td>
                      <td className="pr-3">{c.company}<div className="text-xs text-muted-foreground">{c.title}</div></td>
                      <td className="pr-3"><div className="flex flex-wrap gap-1"><Tag label={c.relationship} />{c.sources.map((s) => <Tag key={s} label={s} tone="gray" />)}</div></td>
                      <td className="pr-3 text-muted-foreground">{c.whereMet}</td>
                      <td className="whitespace-nowrap pr-3">{fmt(c.lastContact)}</td>
                      <td className="whitespace-nowrap text-muted-foreground">{dueLabel(c)}</td>
                    </tr>
                    {open === c.id && (
                      <tr key={c.id + "x"}><td colSpan={6} className="bg-muted p-4"><Profile c={c} onEdit={() => setEditing(c)} onLog={() => setLogging(c)} onDelete={() => { if (confirm(`Delete ${c.name}?`)) setContacts((l) => l.filter((x) => x.id !== c.id)); }} /></td></tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No contacts match.</p>}
          </div>
        </section>

        <footer className="mt-12 rounded-md border border-border bg-muted p-4 text-xs text-muted-foreground">
          🔒 Contacts are saved only in this browser on this device — nothing is sent anywhere, and reminders stay inside the app.
          <button className="ml-2 underline" onClick={() => { if (confirm("Replace everything with sample data?")) setContacts(sampleContacts()); }}>Reset sample data</button>
          <button className="ml-2 underline" onClick={() => { if (confirm("Remove all contacts?")) setContacts([]); }}>Clear all</button>
        </footer>
      </div>

      {editing && <EditDialog c={editing} relOptions={relOptions} onClose={() => setEditing(null)} onSave={(c) => { upsert(c); setEditing(null); setOpen(c.id); }} />}
      {logging && <LogDialog c={logging} onClose={() => setLogging(null)} onSave={(c) => { upsert(c); setLogging(null); }} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="whitespace-pre-wrap">{children || <span className="text-muted-foreground">—</span>}</div></div>;
}

function Profile({ c, onEdit, onLog, onDelete }: { c: Contact; onEdit: () => void; onLog: () => void; onDelete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className={btnPrimary} onClick={onLog}>✍️ Log catch-up</button>
        <button className={`${btn} border border-border bg-background hover:bg-accent`} onClick={onEdit}>Edit</button>
        <button className={`${btnGhost} ml-auto`} onClick={onDelete}>Delete</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="📧 Email">{c.email}</Field>
        <Field label="📞 Phone">{c.phone}</Field>
        <Field label="🔗 LinkedIn">{c.linkedin}</Field>
        <Field label="📅 Next check-in">{fmt(dueDate(c))} {c.nextCheckIn ? "(scheduled)" : `(every ${c.reconnectDays} days)`}</Field>
        <Field label="💡 Interests">{c.interests}</Field>
        <Field label="🛠 Current projects">{c.projects}</Field>
        <Field label="📍 Where we met">{c.whereMet}</Field>
        <Field label="➡️ Next steps">{c.nextSteps}</Field>
        <Field label="🧠 Brain dump">{c.notes}</Field>
      </div>
      <div>
        <div className="mb-1 text-xs text-muted-foreground">💬 Conversations</div>
        {c.interactions.length === 0 ? <p className="text-sm text-muted-foreground">No catch-ups logged yet.</p> : (
          <ul className="space-y-2">{c.interactions.map((i) => (
            <li key={i.id} className="rounded border border-border bg-background p-2"><div className="flex gap-2 text-xs text-muted-foreground">{fmt(i.date)} <Tag label={i.source} tone="gray" /></div><p className="mt-1 whitespace-pre-wrap">{i.note}</p></li>
          ))}</ul>
        )}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 p-4" onClick={onClose}>
      <div className="my-8 w-full max-w-xl rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 font-serif text-xl font-semibold">{title}</h3>{children}
      </div>
    </div>
  );
}

function EditDialog({ c, relOptions, onClose, onSave }: { c: Contact; relOptions: string[]; onClose: () => void; onSave: (c: Contact) => void }) {
  const [f, setF] = useState(c);
  const [custom, setCustom] = useState(!relOptions.includes(c.relationship));
  const set = <K extends keyof Contact>(k: K, v: Contact[K]) => setF({ ...f, [k]: v });
  const txt = (k: keyof Contact, label: string, area = false) => (
    <label className="block text-xs text-muted-foreground">{label}
      {area ? <textarea rows={2} className={`${input} mt-1`} value={f[k] as string} onChange={(e) => set(k, e.target.value as never)} />
        : <input className={`${input} mt-1`} value={f[k] as string} onChange={(e) => set(k, e.target.value as never)} />}
    </label>
  );
  return (
    <Modal title={c.name ? `Edit ${c.name}` : "New contact"} onClose={onClose}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (f.name.trim()) onSave(f); }}>
        <div className="grid grid-cols-2 gap-3">{txt("name", "Name *")}{txt("email", "Email")}{txt("company", "Company")}{txt("title", "Title")}{txt("phone", "Phone")}{txt("linkedin", "LinkedIn")}</div>
        <label className="block text-xs text-muted-foreground">How do I know them
          {custom ? <input className={`${input} mt-1`} placeholder="Type your own…" value={f.relationship} onChange={(e) => set("relationship", e.target.value)} /> : (
            <select className={`${input} mt-1`} value={f.relationship} onChange={(e) => e.target.value === "__custom" ? (setCustom(true), set("relationship", "")) : set("relationship", e.target.value)}>
              {relOptions.map((r) => <option key={r}>{r}</option>)}<option value="__custom">+ Add your own…</option>
            </select>)}
        </label>
        <div className="text-xs text-muted-foreground">Conversation source
          <div className="mt-1 flex flex-wrap gap-1">{SOURCES.map((s) => {
            const on = f.sources.includes(s);
            return <button type="button" key={s} onClick={() => set("sources", on ? f.sources.filter((x) => x !== s) : [...f.sources, s])} className={`rounded px-2 py-1 text-xs ${on ? tagCls.blue : "border border-border"}`}>{s}</button>;
          })}</div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-xs text-muted-foreground">Reconnect every (days)<input type="number" min={1} className={`${input} mt-1`} value={f.reconnectDays} onChange={(e) => set("reconnectDays", Math.max(1, Number(e.target.value) || 1))} /></label>
          <label className="block text-xs text-muted-foreground">Last contact<input type="date" className={`${input} mt-1`} value={f.lastContact} onChange={(e) => set("lastContact", e.target.value)} /></label>
          <label className="block text-xs text-muted-foreground">Scheduled check-in<input type="date" className={`${input} mt-1`} value={f.nextCheckIn} onChange={(e) => set("nextCheckIn", e.target.value)} /></label>
        </div>
        {txt("whereMet", "Where we met")}{txt("interests", "Shared interests", true)}{txt("projects", "Current projects", true)}{txt("nextSteps", "Next steps", true)}{txt("notes", "Brain dump", true)}
        <div className="flex justify-end gap-2 pt-2"><button type="button" className={btnGhost} onClick={onClose}>Cancel</button><button className={btnPrimary}>Save</button></div>
      </form>
    </Modal>
  );
}

function LogDialog({ c, onClose, onSave }: { c: Contact; onClose: () => void; onSave: (c: Contact) => void }) {
  const [date, setDate] = useState(today());
  const [source, setSource] = useState(c.sources[0] ?? "LinkedIn");
  const [note, setNote] = useState("");
  const [next, setNext] = useState(c.nextSteps);
  return (
    <Modal title={`Log catch-up with ${c.name}`} onClose={onClose}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave({ ...logCatchUp(c, { date, source, note }), nextSteps: next }); }}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-muted-foreground">Date<input type="date" className={`${input} mt-1`} value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label className="block text-xs text-muted-foreground">Via<select className={`${input} mt-1`} value={source} onChange={(e) => setSource(e.target.value)}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></label>
        </div>
        <label className="block text-xs text-muted-foreground">What did you talk about?<textarea autoFocus rows={4} className={`${input} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} /></label>
        <label className="block text-xs text-muted-foreground">Next steps<input className={`${input} mt-1`} value={next} onChange={(e) => setNext(e.target.value)} /></label>
        <p className="text-xs text-muted-foreground">Next reminder: in {c.reconnectDays} days.</p>
        <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={onClose}>Cancel</button><button className={btnPrimary}>Save</button></div>
      </form>
    </Modal>
  );
}
