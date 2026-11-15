# LinkedNetwork current app

## Interface and privacy
- Ink and Marigold, Inter, MM/DD/YYYY dates, compact two-column contact pop-ups, desktop sidebar and mobile tabs.
- Lovable Cloud email/password accounts, owner-scoped data, encrypted notes/next steps/conversations, optional remembered unlock. Admins cannot read private contacts or recover notes.

## Implemented features
- Home with daily rule-based reminders, weekly outreach progress, stage summary, next-step dates and recent activity.
- Contacts with search, company/connection filters, clickable stage counts, table/card views, star/N shortcut hint, Quick add detail hint, contact pop-ups and inline editing.
- Stages: Not contacted, Reached out, Talking, Met, Keep in touch. Existing Dormant remains supported, not newly assignable. Pipeline navigation is removed; its old address redirects to Contacts.
- Reminders: initial outreach after 5 days, no reply after 7, Talking inactivity after 7, Keep in touch after 90 or contact cadence; all four defaults editable in Profile Settings. Explicit deadlines show the day before, due day and overdue follow-up. Snooze pauses without changing deadlines.
- Existing/manual contacts are tracked; new CSV contacts require single or bulk Start tracking. Tracking activation restarts inactivity clocks.
- Separate conversations and sent outreach, editable history, derived last-contact dates and counted future follow-ups.
- Message window always shows Copy; saved chat/email/LinkedIn determine available destinations. Chat and LinkedIn copy first; Gmail stays prefilled. Existing-conversation layout and captions guide available choices; logging remains explicit confirmation.
- LinkedIn CSV and own-CSV uploads share encrypted save/merge; only own CSV offers a sample download.
- Templates remain owner-scoped; starter initialization is protected against repeats. Audit found six templates for each of seven accounts, not 42 for one account; no existing templates deleted.
- Profile Settings, setup reminders, feedback submission and authorized admin feedback/count review.
- Manual prefilled Google Calendar scheduling remains; automatic sync and analytics are not implemented. No AI or new paid services.

## Verification
- 98 tests passed, including all reminder day counts, stage mappings, tracking, clipboard/navigation ordering, owner privacy and starter initialization preserving edited/deleted templates.
- Temporary-account browser flow verified encrypted contact save/reload, messaging/clipboard, outreach history, CSV bulk activation, preference persistence, old Pipeline redirect and desktop/mobile themes; temporary data removed.
- The requesting user's private notes remain locked in the verification browser; no passphrase was requested or private contact data accessed.