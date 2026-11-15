# LinkedNetwork contact tracking and messaging

## Current app and boundaries
- Keep Ink and Marigold, Inter, compact two-column contact pop-ups, MM/DD/YYYY dates, and current hosting.
- Existing features: email/password accounts, private encrypted notes with optional remembered unlock, Contacts, Home, conversation history/editing, manual Google Calendar scheduling, LinkedIn and own-CSV import, templates, Profile Settings, and feedback/admin review.
- No AI, new paid services, taglines, or marketing copy. Do not change encryption or expose private notes. Calendar sync and analytics remain out of scope.
- This is a proposal only: do not change application code or saved data until approval.

## 1. Contacts and quick-add hints
- Under Contacts, show the small star/sparkles icon used on Home with “Press N to add a contact.” N remains the existing shortcut; Enter remains form submission, not a new add-contact shortcut.
- In Quick add, directly below Name and LinkedIn URL, show “Open the contact to add more details.”
- Remove the Pipeline page and its desktop/mobile navigation and command-palette entries. Its old address redirects to Contacts for existing links.
- Add clickable stage counts at the top of Contacts, including an All count; selecting a stage filters the existing list and combines with search and connection filters. Replace the redundant Stage dropdown. Home stage counts lead to the same Contacts filters; remove links to Pipeline.

## 2. Stages without data loss
- Selectable stages: Not contacted, Reached out, Talking, Met, Keep in touch.
- Migrate Replied to Talking and Ongoing to Keep in touch; preserve all other fields, IDs, dates, interactions, and encrypted values.
- Existing Dormant contacts retain their status and remain reachable through a conditional Dormant count/filter. Do not offer Dormant as a new assignment or introduce Dormant automation.
- Separate logging an outbound message/outreach from logging a conversation: additional outreach stays Reached out and increments follow-ups rather than incorrectly becoming Talking. Preserve history and derive last-contact date from it.

## 3. Rule-based reminders
Calculate elapsed calendar days live, including daily rollover while the app stays open. Never use AI or generated wording.

| Trigger | Default timing | Wording and behavior |
| --- | --- | --- |
| Not contacted | 5 days since added | “Added {n} days ago. Reach out.” |
| Reached out | 7 days since last logged outreach | “No reply in {n} days. Follow up.” |
| Reached out after follow-ups | 7 days since most recent outreach | “Followed up {x} time(s). No reply in {n} days.” Use correct singular/plural. Each logged outreach restarts the clock at zero. |
| Talking | 7 days since last activity | “Your turn. {n} days.” |
| Explicit next-step date | Day before, due date, and day after onward | “due in 1 day”, “due”, then “Log it and send a thank-you” with the live overdue-day count. |
| Keep in touch | 90 days since last activity, unless contact cadence is set | Use the existing cadence when set; show live elapsed days and keep the reminder until acted on. |

- Show stage and explicit-date reminders without silently hiding either when both apply; prioritize the next-step reminder on the card.
- Logging the relevant activity resets its reminder. Explicit due-date reminders remain until the next step is completed or its date is changed; logging alone must not erase the user's deadline.
- Preserve existing Snooze, but store its pause separately so it does not overwrite a next-step deadline or its underlying elapsed-day count.
- All existing contacts remain tracked, as confirmed. Manually added contacts start tracked. Future CSV-created contacts remain untracked until “Start tracking”; provide single and bulk actions. Importing into an existing tracked contact must not switch tracking off.
- Starting tracking uses that activation day for the initial inactivity clock so an old import does not immediately produce overdue reminders.
- Legacy outreach history has no explicit sent/reply markers: retain it, use its existing dates as a fallback, and avoid inventing historical follow-up counts. Record explicit outreach markers for future actions.

## 4. Reminder timing
- Add “Reminder timing” in Profile Settings with editable positive whole-day values for initial outreach (5), no reply (7), Talking inactivity (7), and Keep in touch (90).
- Save per account; use defaults when values are absent. Contact-specific cadence overrides Keep in touch timing.
- Add exactly one onboarding line, with no extra step: “Reminders use default timing. You can change it anytime in Settings.”

## 5. Message window
- Always display Copy. Keep current empty-message, length, and missing-variable protections.
- Hide unavailable destinations rather than disabling them. Validate all saved navigation links as HTTP(S).
- Open chat: saved chat link only; copy first, show “Message copied”, then open. Caption: “Go back to your existing conversation. Message is copied.”
- Open Gmail: saved email only; preserve the current prefilled draft. Caption: “Start a new email with this message filled in.”
- Open LinkedIn: saved profile URL only; copy first, show “Message copied”, then open. Caption: “Open their profile. Message is copied, ready to paste.”
- With no history and no chat link, show available Gmail/LinkedIn actions only, plus Copy.
- With history or a chat link, ask “Continue your existing conversation, or start a new thread?” Make Open chat the primary Continue action; place available Gmail/LinkedIn actions under New thread.
- If history exists without a chat link, show “Add a chat link to jump back into this conversation.” If nothing is saved, keep Copy and a hint to add an email or LinkedIn.
- Keep “Log this as sent?” after each successful action; record the destination actually chosen. Never log sending automatically. A failed copy must not open a copy-dependent destination; surface the error and allow retry.

## 6. Template audit and proposed deletions
**Deletion list: none.**

- Live inspection found 42 total rows across seven accounts, with six per account. There are no identical duplicates within any account.
- Each account has one of: LinkedIn connection request, Cold email, Coffee chat ask, Thank you after a chat, Follow-up after no reply, Referral ask.
- Account initialization creates these six once on signup; browser template reads are already owner-filtered. The total table count is not one user's template collection.
- Keep all 42 rows. Never deduplicate across accounts or delete edited variants. Recheck account-scoped results before implementation; any newly discovered deletion requires an exact proposed list and approval first.
- Make starter initialization explicitly idempotent without restricting user-created templates: a protected per-account initialization marker and guarded initialization prevent repeated seeding, while preserving edited/deleted starter templates and allowing intentional custom duplicates.

## Technical details
- Keep TanStack routing and browser Cloud operations with owner-scoped access. Use the existing network-store/encrypted save path for contact changes.
- Apply a stage-only Cloud migration to contact JSON; do not decrypt or rewrite sensitive payloads. Add per-user reminder timing and an initialization marker with appropriate grants and owner policies through the migration tool.
- Store optional tracking, outreach markers, and snooze metadata in contact JSON; maintain compatibility with legacy contacts and CSV merges.
- Centralize stage normalization, reminder calculation, and message-action rules in small tested helpers. Keep current shared dialogs, themed dropdowns, Button variants, and navigation safety checks.
- Update roadmap.md and architecture guidance to reflect the removed Pipeline view and new tracking rules; ensure remaining content pages retain unique app metadata.

## Verification after approval
- Tests for both stage mappings, unchanged Dormant/data, five selectable stages, manual/import tracking, single/bulk activation, and tracked duplicate merges.
- One concrete test per reminder rule: before threshold, at threshold, later day count, clock reset, follow-up count, explicit due-date days, settings overrides, cadence, snooze, and date/timezone boundaries.
- Tests for Message visibility across all data/history combinations; clipboard-before-open ordering, clipboard failure, actual sent channel, and confirmation rather than automatic logging.
- Tests for per-account starter idempotency and preservation of edited templates.
- Run all existing tests. Verify real signed-in contact add/save/reload, migration read-back, reminders, import tracking, settings persistence, messaging and logging; inspect desktop/mobile and both themes. If private notes are locked in the verification browser, report that blocker rather than claim private save/read-back passed.
- No application code or data has been changed during this planning review.