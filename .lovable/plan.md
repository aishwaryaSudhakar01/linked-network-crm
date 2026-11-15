# Dormant contacts and follow-up workflow

## 1. One shared no-reply clock
- Only tracked **Reached out** contacts with a logged outreach can automatically become Dormant. Default: day 14; day 13 remains Reached out.
- The most recent logged outreach or follow-up restarts the clock. A logged reply/conversation moves Reached out or Dormant to Talking and ends the no-reply clock.
- Not contacted, Talking, Met, Keep in touch and untracked imports never automatically become Dormant. Reached out contacts without identifiable outreach history will not be automatically changed merely because they were added long ago.
- Calculate effective stages from calendar dates when contacts load and when the day changes, so reopening the app shows elapsed transitions immediately. Persist changed stages through the existing owner-scoped encrypted save path once notes are unlocked; no background access to private notes is introduced.
- Snooze does not postpone the Dormant date; it only suppresses reminder visibility while active.

## 2. Record outreach type
- Store **LinkedIn connection request** or **Message/email** on outreach history entries. Read it from the selected template in the Message window and offer the same editable choice in the manual log form.
- The latest outreach type determines eligibility: messages/emails become follow-up due after the user's no-reply interval; connection requests never do, but still become Dormant after the Dormant interval.
- Count only message/email follow-up entries, not connection requests. Preserve existing history; legacy outreach without a saved type is treated as Message/email because its original template cannot be recovered reliably.
- Show a Follow-up entry label for new outreach logged while already Reached out, without changing the stage or duplicating history.

## 3. Home counts and Contacts filters
- Replace individual Reached out **no-reply** cards with at most two linked lines under Today, hiding each when its count is zero:
  - “{n} people haven't replied in 7+ days. Follow up.”
  - “{n} people go dormant in 2 days. Review.”
- Use singular wording for one person. Use the user's configured no-reply threshold rather than always printing 7.
- The Going dormant heads-up starts two days before the Dormant date and remains until the transition: day 12 says “in 2 days,” day 13 says “in 1 day,” and day 14 moves to Dormant. Connection requests can appear in this count, never in Follow up due.
- A person may qualify for both counts. Today counts unique contacts requiring attention rather than double-counting them.
- Link each line to Contacts with **Follow up due** or **Going dormant** applied. Use the same shared eligibility rules in Home and Contacts.
- Show “No reply in {n} days” and, when nonzero, “Followed up {x} time(s)” in those filtered table rows and tiles.
- Keep explicit next-step reminders and other stages' reminders as cards; preserve “Overdue by {n} days.” Removing no-reply cards must not remove an independent next-step deadline.
- Dormant contacts receive no reminders, including next-step cards and upcoming-deadline listings; saved deadlines and notes remain intact.
- Keep the recently improved always-visible, evenly spaced tile icons.

## 4. Confirm sent, then review the log
- Keep Copy, destination visibility, copy-before-open and “Log this as sent?” behavior.
- Selecting Yes opens the shared log form instead of saving immediately. Prefill today's date, the channel actually used, the final message text, outreach activity and template-derived outreach type; all remain editable.
- Gmail maps to Email, LinkedIn to LinkedIn. For saved chat links, recognize LinkedIn/Gmail hosts where possible; otherwise use Other for the user to adjust. Copy alone does not reveal the sending destination, so prefill the template's channel and let the user correct it.
- Saving creates exactly one history entry, preserves Reached out, increments eligible follow-up counts and restarts the clock. Canceling writes nothing.

## 5. Dormant and revival controls
- Always show a Dormant count/filter in Contacts, including zero. Existing Dormant contacts retain their status.
- Add **Revive** for one Dormant contact and **Revive all shown** for a Dormant-filtered list. Return them to Reached out and start their clock from the revival day without fabricating a sent message or increasing follow-up counts.
- Preserve the most recent outreach type during revival; for legacy Dormant contacts with no typed history, use Message/email.
- Logging a reply/conversation revives into Talking.
- Offer **Move to Dormant** only for Reached out contacts; do not make Dormant a generally assignable stage for other contacts.

## 6. Profile Settings
- Add **Dormant after no reply (days)**, default 14, beside **No reply (days)**, default 7.
- Both must be positive whole days. Dormant must be at least three days greater than No reply; validate the pair in the form and in Lovable Cloud.
- Keep existing preferences. If an existing account has a no-reply interval above 11, initialize its new Dormant value to the greater of 14 or its no-reply value plus three, preserving its existing choice.
- Apply timing changes consistently to counts, filters and future automatic transitions. Already Dormant contacts stay Dormant until revived.

## Technical approach
- Extend the existing optional contact/history JSON metadata for outreach type, follow-up classification and a revival clock anchor; no contact schema replacement or history deletion.
- Centralize no-reply timing, effective stage, follow-up eligibility and counts in pure calendar-day helpers used by every view. Do not infer outreach from contact creation dates.
- Add the profile timing field and paired validation with an additive database change; retain owner-scoped permissions and existing privacy boundaries.
- Pass an editable new-entry draft to the shared conversation dialog separately from an existing interaction ID, so prefilled logging cannot accidentally edit an old entry.
- Use Contacts navigation state that consistently represents the two new filters and clears conflicting stage filters.
- Record structural decisions in AGENTS.md and update roadmap.md after implementation.

## Verification
- Add focused tests for day 13/14; follow-up clock restart; requests excluded from follow-up eligibility/counts; latest-type changes; every other stage/untracked exclusion; existing Dormant preservation; no-outreach safeguards; snooze; custom timing; paired validation; revival without invented activity; reply revival; and Dormant reminder suppression.
- Test both Home count/filter memberships, zero suppression through count data, singular/plural and live remaining-day values, and matching Contacts filter destinations.
- Test sent-message draft contents and save/cancel behavior, including channels, template type, editable date/body and no duplicate history.
- Run affected tests and verify Home → filtered Contacts → message → sent confirmation → editable log → saved history → refreshed counts, plus single/bulk revive on desktop and mobile.
- No new test accounts or deletion of existing data without separately listing and obtaining approval; private-contact checks require the user's notes to be unlocked.

## Unchanged
Ink and Marigold, Inter, MM/DD/YYYY, existing layout outside the requested controls, encryption, private notes, account isolation and manual Google Calendar scheduling. No AI, new paid services, taglines or marketing copy.