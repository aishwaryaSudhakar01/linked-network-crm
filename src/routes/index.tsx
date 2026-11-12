import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MessageSquare, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  type Contact, RELATIONSHIPS, SOURCES, dueDate, daysUntil, reachOutSoon, logCatchUp,
  loadContacts, saveContacts, sampleContacts, today, chatHref,
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
function color(label: string) { let h = 0; for (const ch of label) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return TAG[h % TAG.length] ?? "gray"; }
function Tag({ label, tone }: { label: string; tone?: string }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${tagCls[tone ?? color(label)]}`}>{label}</span>;
}
const fmt = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
function dueLabel(c: Contact) { const n = daysUntil(dueDate(c)); return n < 0 ? `${-n}d overdue` : n === 0 ? "Today" : `in ${n}d`; }

const input = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/15";
const btn = "rounded-full px-4 py-2 text-sm font-medium transition-all";
const btnPrimary = `${btn} bg-primary text-primary-foreground shadow-card hover:-translate-y-px hover:shadow-float`;
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
  const selected = contacts.find((c) => c.id === open);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="bg-mesh absolute inset-x-0 -top-40 h-[30rem] origin-top-left -skew-y-6 opacity-90" />
        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-16 text-foreground">
          <div className="text-sm font-semibold tracking-wide text-muted-foreground">KINDRED</div>
          <h1 className="mt-4 max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-tight">Every conversation,<br />remembered.</h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">Everyone you've spoken with — and the right moment to say hello again.</p>
        </div>
      </div>
      <div className="relative mx-auto -mt-16 max-w-5xl px-6 pb-16">

        <section className="rounded-2xl bg-card p-6 shadow-float">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">Reach out soon <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">{soon.length}</span></h2>
          {soon.length === 0 ? <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">You're all caught up. 🌿</p> : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {soon.map((c) => (
                <div key={c.id} className="group rounded-xl border border-border bg-gradient-to-b from-card to-muted p-4 transition hover:-translate-y-0.5 hover:shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <Button variant="link" className="h-auto whitespace-normal p-0 text-left font-semibold text-foreground hover:text-primary" onClick={() => setOpen(c.id)}>{c.name}</Button>
                    <Tag label={dueLabel(c)} tone={daysUntil(dueDate(c)) < 0 ? "red" : "yellow"} />
                  </div>
                  <p className="text-xs text-muted-foreground">{c.title}{c.company && ` · ${c.company}`}</p>
                  {c.nextSteps && <p className="mt-3 text-sm text-foreground/80">{c.nextSteps}</p>}
                  <button className={`mt-3 text-xs font-semibold text-primary hover:underline`} onClick={() => setLogging(c)}>Log catch-up →</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl bg-card p-6 shadow-card">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="mr-auto flex items-center gap-2 text-base font-semibold">All contacts <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{filtered.length}</span></h2>
            <input className={input.replace("w-full", "w-48")} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={input.replace("w-full", "w-auto")} value={rel} onChange={(e) => setRel(e.target.value)}>
              <option value="">All relationships</option>{relOptions.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select className={input.replace("w-full", "w-auto")} value={src} onChange={(e) => setSrc(e.target.value)}>
              <option value="">All sources</option>{SOURCES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className={btnPrimary} onClick={() => setEditing(blank())}>+ New</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 font-normal">Name</th><th className="pr-3 font-normal">Organization</th><th className="pr-3 font-normal">Tags</th><th className="pr-3 font-normal">Where we met</th><th className="pr-3 font-normal">Last contact</th><th className="font-normal">Next</th>
              </tr></thead>
              <tbody>
                {filtered.map((c) => (
                    <tr key={c.id} className="cursor-pointer border-t border-border transition-colors hover:bg-accent/50" onClick={() => setOpen(c.id)}>
                      <td className="py-3 pr-3 font-semibold"><Button variant="link" className="h-auto whitespace-normal p-0 text-left font-semibold text-foreground" onClick={(e) => { e.stopPropagation(); setOpen(c.id); }}>{c.name}</Button></td>
                      <td className="pr-3">{c.company}<div className="text-xs text-muted-foreground">{c.title}</div></td>
                      <td className="pr-3"><div className="flex flex-wrap gap-1"><Tag label={c.relationship} />{c.sources.map((s) => <Tag key={s} label={s} tone="gray" />)}</div></td>
                      <td className="pr-3 text-muted-foreground">{c.whereMet}</td>
                      <td className="whitespace-nowrap pr-3">{fmt(c.lastContact)}</td>
                      <td className="whitespace-nowrap text-muted-foreground">{dueLabel(c)}</td>
                    </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No contacts match.</p>}
          </div>
        </section>

        <footer className="mt-8 px-2 text-center text-xs text-muted-foreground">
          Contacts are saved only in this browser on this device — nothing is sent anywhere, and reminders stay inside the app.
          <button className="ml-2 underline" onClick={() => { if (confirm("Replace everything with sample data?")) setContacts(sampleContacts()); }}>Reset sample data</button>
          <button className="ml-2 underline" onClick={() => { if (confirm("Remove all contacts?")) setContacts([]); }}>Clear all</button>
        </footer>
      </div>

      {selected && !editing && !logging && <Modal title={selected.name} onClose={() => setOpen(null)} profile>
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2"><p className="text-sm leading-relaxed text-foreground/75">{[selected.title, selected.company].filter(Boolean).join(" · ")}</p><Tag label={selected.relationship} tone="green" /></div>
        <Profile c={selected} onEdit={() => setEditing(selected)} onLog={() => setLogging(selected)} onDelete={() => { if (confirm(`Delete ${selected.name}?`)) { setContacts((l) => l.filter((x) => x.id !== selected.id)); setOpen(null); } }} />
      </Modal>}
      {editing && <EditDialog c={editing} relOptions={relOptions} onClose={() => setEditing(null)} onSave={(c) => { upsert(c); setEditing(null); setOpen(c.id); }} />}
      {logging && <LogDialog c={logging} onClose={() => setLogging(null)} onSave={(c) => { upsert(c); setLogging(null); }} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0"><div className="mb-1.5 text-xs font-medium leading-relaxed text-foreground/75">{label}</div><div className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">{children || <span className="text-muted-foreground">—</span>}</div></div>;
}

function Profile({ c, onEdit, onLog, onDelete }: { c: Contact; onEdit: () => void; onLog: () => void; onDelete: () => void }) {
  const linkedIn = chatHref(c.linkedin?.startsWith("http") ? c.linkedin : c.linkedin ? `https://${c.linkedin}` : undefined);
  const chat = chatHref(c.chatLink);
  return (
    <div className="text-sm leading-relaxed">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-6">
        <Button className="h-10 rounded-md px-4" onClick={onLog}><MessageSquare /> Log catch-up</Button>
        <Button variant="outline" className="h-10 rounded-md px-4" onClick={onEdit}><Pencil /> Edit</Button>
        {chat ? <Button asChild variant="link" className="h-10 px-2"><a href={chat} target="_blank" rel="noopener noreferrer">Open chat<ExternalLink /></a></Button> : <Button variant="link" className="h-10 px-2" onClick={onEdit}><ExternalLink /> Add chat link</Button>}
      </div>
      <div className="grid gap-7 border-b border-border py-6 sm:grid-cols-2 sm:gap-8">
        <div className="min-w-0 space-y-5 sm:border-r sm:border-border sm:pr-8">
          <Field label="Email">{c.email}</Field>
          {c.phone && <Field label="Phone">{c.phone}</Field>}
          <Field label="LinkedIn">{linkedIn ? <a className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" href={linkedIn} target="_blank" rel="noopener noreferrer">View LinkedIn profile<ExternalLink className="size-3.5" /></a> : null}</Field>
          <Field label="Where we met">{c.whereMet}</Field>
        </div>
        <div className="min-w-0 space-y-5">
          <Field label="Next check-in">{fmt(dueDate(c))}<span className="mt-1 block text-xs text-foreground/75">{c.nextCheckIn ? "Scheduled check-in" : `Every ${c.reconnectDays} days`}</span></Field>
          <Field label="Interests">{c.interests}</Field>
          <Field label="Next steps">{c.nextSteps}</Field>
        </div>
      </div>
      {c.projects && <div className="border-b border-border py-5"><Field label="Current projects">{c.projects}</Field></div>}
      <div className="border-b border-border py-5"><Field label="Notes">{c.notes}</Field></div>
      <div className="border-b border-border py-5">
        <h4 className="mb-3 text-xs font-medium text-foreground/75">Conversations</h4>
        {c.interactions.length === 0 ? <p className="text-sm text-muted-foreground">No catch-ups logged yet.</p> : (
          <ul className="space-y-4">{c.interactions.map((i) => (
            <li key={i.id}><div className="flex flex-wrap items-center gap-2 text-xs text-foreground/75">{fmt(i.date)} <span aria-hidden="true">·</span> {i.source}</div><p className="mt-1.5 whitespace-pre-wrap">{i.note}</p></li>
          ))}</ul>
        )}
      </div>
      <div className="pt-3"><Button variant="ghost" className="h-10 px-0 text-destructive hover:bg-transparent hover:text-destructive hover:underline" onClick={onDelete}>Delete contact</Button></div>
    </div>
  );
}

function Modal({ title, onClose, children, profile = false }: { title: string; onClose: () => void; children: React.ReactNode; profile?: boolean }) {
  return (
    <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent aria-describedby={undefined} className={`max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto bg-card shadow-float ${profile ? "max-w-[760px] gap-2 rounded-lg p-6 sm:p-8" : "max-w-2xl rounded-2xl p-6 sm:p-7"}`}>
        <DialogTitle className="pr-7 text-xl font-semibold leading-relaxed tracking-normal">{title}</DialogTitle>
        <div className="min-w-0 break-words">{children}</div>
      </DialogContent>
    </Dialog>
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
        <label className="block text-xs text-muted-foreground">Chat link
          <input type="url" pattern="https?://.*" className={`${input} mt-1`} placeholder="https://…" value={f.chatLink ?? ""} onChange={(e) => set("chatLink", e.target.value)} />
        </label>
        <label className="block text-xs text-muted-foreground">How do I know them
          {custom ? <input className={`${input} mt-1`} placeholder="Type your own…" value={f.relationship} onChange={(e) => set("relationship", e.target.value)} /> : (
            <select className={`${input} mt-1`} value={f.relationship} onChange={(e) => e.target.value === "__custom" ? (setCustom(true), set("relationship", "")) : set("relationship", e.target.value)}>
              {relOptions.map((r) => <option key={r}>{r}</option>)}<option value="__custom">+ Add your own…</option>
            </select>)}
        </label>
        <div className="text-xs text-muted-foreground">Conversation source
          <div className="mt-1 flex flex-wrap gap-1">{SOURCES.map((s) => {
            const on = f.sources.includes(s);
            return <button type="button" key={s} onClick={() => set("sources", on ? f.sources.filter((x) => x !== s) : [...f.sources, s])} className={`rounded-full px-3 py-1 text-xs font-medium transition ${on ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent"}`}>{s}</button>;
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
