import { describe, it, expect } from "vitest";
import { type Contact, dueDate, reachOutSoon, logCatchUp, sampleContacts, chatHref, loadContacts, saveContacts } from "./contacts";
const sample = sampleContacts()[0];
if (!sample) throw new Error("Sample contact missing");
const base: Contact = { ...sample, lastContact: "2026-01-01", reconnectDays: 30, nextCheckIn: "" };
describe("contact chat links", () => {
  it("saves and reloads the exact LinkedIn conversation URL", () => {
    const chatLink = "https://www.linkedin.com/messaging/thread/abc123/?detail=hello";
    saveContacts([{ ...base, chatLink }]);
    expect(loadContacts()[0]?.chatLink).toBe(chatLink);
    localStorage.clear();
  });
  it("preserves a Gmail thread URL", () => {
    expect(chatHref("https://mail.google.com/mail/u/0/#inbox/abc123")).toBe("https://mail.google.com/mail/u/0/#inbox/abc123");
  });
  it("accepts old contacts without a chat link", () => expect(chatHref(base.chatLink)).toBeUndefined());
  it("rejects executable links", () => expect(chatHref("javascript:alert(1)")).toBeUndefined());
});
describe("reconnect rules", () => {
  it("uses each contact's own reconnect days", () => expect(dueDate(base)).toBe("2026-01-31"));
  it("scheduled check-in overrides default timing", () => expect(dueDate({ ...base, nextCheckIn: "2026-01-10" })).toBe("2026-01-10"));
  it("reach out soon includes overdue and within 7 days only", () => {
    const list = [base, { ...base, id: "x", lastContact: "2026-01-20" }];
    expect(reachOutSoon(list, "2026-01-25").map((c) => c.id)).toEqual([base.id]);
  });
  it("logging a catch-up updates last contact", () => {
    const c = logCatchUp({ ...base, nextCheckIn: "2026-01-05" }, { date: "2026-02-01", source: "Email", note: "hi" });
    expect(c.lastContact).toBe("2026-02-01"); expect(c.nextCheckIn).toBe(""); expect(c.interactions.length).toBe(base.interactions.length + 1);
  });
});
