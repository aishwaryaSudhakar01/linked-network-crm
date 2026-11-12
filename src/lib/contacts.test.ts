import { describe, it, expect } from "vitest";
import { dueDate, reachOutSoon, logCatchUp, sampleContacts } from "./contacts";
const base = { ...sampleContacts()[0], lastContact: "2026-01-01", reconnectDays: 30, nextCheckIn: "" };
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
