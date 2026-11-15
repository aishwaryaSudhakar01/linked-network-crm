# Simplify the conversation log

## Scope
Change only the shared log form and how its entry kind is supplied. Keep Ink and Marigold, Inter, encryption, existing history, and all dormant, follow-up, and reminder rules. No AI, paid services, or taglines.

## Form layout
- Remove **Activity** and **Outreach type** entirely.
- Show fields in this order: **Where**, **Date**, **Summary**, **Meeting notes**.
- Rename Conversation type to **Where**, retaining LinkedIn chat, Email, Coffee chat, Call, Meeting, Event, and Custom. Show the custom input directly below Where when selected.
- Preserve the calendar picker, date validation, prefilled details, and save/error states.

## Entry points and titles
- **Message window → Log this as sent? → Yes:** log a sent message. Derive outreach type from the selected template without exposing it in the form. Title: **Log sent message**, or **Log follow-up** when the contact is already Reached out.
- **Log conversation:** log a conversation. Title: **Log conversation**. Preserve the existing stage transitions, including Reached out/Dormant → Talking; do not alter other stage behavior.
- **Mark as Complete:** keep the prefilled conversation flow and clear only the captured next step after a successful save.
- Keep the contact name alongside the form title.

## Editing existing entries
- Allow editing Where, Date, Summary, and Meeting notes only.
- Preserve the entry's stored kind, outreach type, follow-up flag, and ID exactly, including absent metadata on legacy entries.
- Keep an edit-specific title and replace the same timeline entry without duplication or reclassifying it.
- Do not migrate or rewrite existing history.

## Technical approach
- Resolve immutable new-entry metadata from the entry point: sent drafts carry outreach metadata; ordinary logging and next-step completion create conversations.
- For edits, merge only the editable fields into the original entry rather than injecting default kind/outreach values.
- Continue using the existing log, edit, and completion helpers and encrypted save path; leave timing and eligibility logic untouched.

## Verification
- Add form tests proving Activity and Outreach type are absent and Where/Date/Summary/Meeting notes appear in order.
- Test ordinary logging creates a conversation and the sent-message confirmation creates outreach with template-derived outreach type.
- Test sent-message/follow-up titles and preserve conversation stage transitions.
- Test editing preserves stored kind, outreach type, follow-up flag, and legacy missing metadata without adding entries.
- Run existing message, completion, dormant, follow-up, and reminder tests.
- Check both entry-point flows and history editing in the browser on desktop/mobile. Use isolated data if private notes remain locked; report any unavailable private-account save/read-back separately.

## Approval boundary
Approval authorizes only these log-form changes and tests. No account cleanup, database changes, or changes to reminder rules.