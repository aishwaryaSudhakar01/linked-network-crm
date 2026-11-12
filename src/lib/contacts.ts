export type Interaction = { id: string; date: string; source: string; note: string };
export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  chatLink?: string;
  company: string;
  title: string;
  relationship: string;
  sources: string[];
  reconnectDays: number;
  whereMet: string;
  interests: string;
  projects: string;
  nextSteps: string;
  notes: string;
  lastContact: string; // YYYY-MM-DD
  nextCheckIn: string; // optional scheduled date, "" = use reconnect timing
  interactions: Interaction[];
};

export const RELATIONSHIPS = ["Alumni", "LinkedIn cold outreach", "Guest lecturer", "Client", "Investor", "Other"];
export const SOURCES = ["LinkedIn", "Email", "Coffee chat", "Phone", "Event", "Zoom"];

const DAY = 86400000;
const toDate = (s: string) => new Date(s + "T00:00:00");
export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const today = () => iso(new Date());

export function dueDate(c: Contact): string {
  if (c.nextCheckIn) return c.nextCheckIn;
  return iso(new Date(toDate(c.lastContact).getTime() + c.reconnectDays * DAY));
}
export function daysUntil(date: string, from = today()): number {
  return Math.round((toDate(date).getTime() - toDate(from).getTime()) / DAY);
}
/** Contacts overdue or due within `windowDays`, soonest first. */
export function reachOutSoon(list: Contact[], from = today(), windowDays = 7): Contact[] {
  return list
    .filter((c) => daysUntil(dueDate(c), from) <= windowDays)
    .sort((a, b) => dueDate(a).localeCompare(dueDate(b)));
}
/** Logging a catch-up sets last contact and clears any one-off scheduled check-in. */
export function logCatchUp(c: Contact, i: Omit<Interaction, "id">): Contact {
  return {
    ...c,
    lastContact: i.date > c.lastContact ? i.date : c.lastContact,
    nextCheckIn: "",
    sources: c.sources.includes(i.source) ? c.sources : [...c.sources, i.source],
    interactions: [{ ...i, id: crypto.randomUUID() }, ...c.interactions],
  };
}

const ago = (n: number) => iso(new Date(Date.now() - n * DAY));
export const sampleContacts = (): Contact[] => [
  { id: "1", name: "Priya Raman", email: "priya.raman@example.com", phone: "", linkedin: "linkedin.com/in/priyaraman", company: "McKinsey & Company", title: "Engagement Manager", relationship: "Alumni", sources: ["LinkedIn", "Coffee chat"], reconnectDays: 30, whereMet: "Anderson alumni mixer, Korn Hall", interests: "Trail running, healthcare strategy, Bollywood dance", projects: "Leading a hospital ops transformation in Phoenix", nextSteps: "Send my updated resume before recruiting opens", notes: "Class of '19. Very generous with time. Suggested I talk to her colleague Jake in the LA office.", lastContact: ago(34), nextCheckIn: "", interactions: [{ id: "a", date: ago(34), source: "Coffee chat", note: "Talked case prep and office culture. She offered a mock case." }] },
  { id: "2", name: "Marcus Lee", email: "marcus@example.com", phone: "", linkedin: "", company: "Netflix", title: "Senior Product Manager", relationship: "LinkedIn cold outreach", sources: ["LinkedIn"], reconnectDays: 45, whereMet: "Cold LinkedIn message about PM roles", interests: "Basketball, sci‑fi novels, recommendation systems", projects: "Personalization for live events", nextSteps: "Share the article on live-sports UX he asked about", notes: "Prefers short messages. Mentioned an APM-style rotation might open in spring.", lastContact: ago(20), nextCheckIn: ago(-3), interactions: [{ id: "b", date: ago(20), source: "Zoom", note: "30-min chat on PM career paths." }] },
  { id: "3", name: "Dr. Elena Torres", email: "etorres@example.com", phone: "", linkedin: "", company: "Sequoia Capital", title: "Partner", relationship: "Guest lecturer", sources: ["Email"], reconnectDays: 90, whereMet: "Guest lecture in Entrepreneurial Finance", interests: "Climate tech, ceramics", projects: "New climate fund", nextSteps: "Follow up after finishing my climate startup project", notes: "Said to email her with the final deck.", lastContact: ago(60), nextCheckIn: "", interactions: [] },
  { id: "4", name: "Sam Okafor", email: "sam.okafor@example.com", phone: "(310) 555-0142", linkedin: "", company: "Riot Games", title: "Strategy Associate", relationship: "Alumni", sources: ["Email", "Coffee chat"], reconnectDays: 21, whereMet: "Anderson Entertainment Business Association panel", interests: "Esports, cooking, Lakers", projects: "Market entry analysis for SE Asia", nextSteps: "Ask about summer internship timeline", notes: "Super warm. Offered referral when apps open.", lastContact: ago(25), nextCheckIn: "", interactions: [] },
  { id: "5", name: "Hannah Kim", email: "hannah@example.com", phone: "", linkedin: "", company: "Google", title: "Program Manager", relationship: "Other", sources: ["LinkedIn"], reconnectDays: 60, whereMet: "Friend of a classmate", interests: "Pottery, travel to Japan", projects: "AI developer tools launch", nextSteps: "", notes: "", lastContact: ago(5), nextCheckIn: "", interactions: [] },
];

const KEY = "kindred.contacts.v1";
export function chatHref(link: string | undefined): string | undefined {
  if (!link) return undefined;
  try {
    const url = new URL(link);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch { return undefined; }
}
export function loadContacts(): Contact[] {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch {}
  return sampleContacts();
}
export function saveContacts(c: Contact[]) { localStorage.setItem(KEY, JSON.stringify(c)); }
