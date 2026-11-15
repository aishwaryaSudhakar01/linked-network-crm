# LinkedNetwork current app

## Plan for approval
- The uploaded brief's Pipeline removal, stage counts and migration, tracking, reminder preferences, message actions and starter-template protection are already implemented. Preserve these rather than rebuilding them.
- Keep the newer approved deadline behavior: show the day before, show “due” on the deadline, then “Overdue by {n} days.” afterward. Do not restore the uploaded brief's older thank-you wording.
- The outstanding proposed change is the narrowly scoped account-data cleanup listed below. Approving this plan authorizes only that listed cleanup, not deletion of any active account or any of your templates.
- Before deletion, recheck the listed owner IDs against active accounts and the proposed row counts. Stop and report any difference before proceeding. Delete in one transaction, restricted to the listed IDs and only where the account remains absent; abort if the expected counts differ.
- Afterward, verify your account, contact, six templates, profile, role and initialization record are unchanged, and the approved leftover rows are gone. Run focused existing reminder, stage and message tests without creating new accounts for this cleanup.
- Preserve Ink and Marigold, Inter, current layout, encryption and private notes. No AI, paid services, marketing copy or new Dormant behavior.

## Interface and privacy
- Ink and Marigold, Inter, MM/DD/YYYY dates, compact two-column contact pop-ups, desktop sidebar and mobile tabs.
- Lovable Cloud email/password accounts, owner-scoped data, encrypted notes/next steps/conversations, optional remembered unlock. Admins cannot read private contacts or recover notes.

## Implemented features
- Home with daily rule-based reminders, weekly outreach progress, stage summary, next-step dates and recent activity.
- Contacts with search, company/connection filters, clickable stage counts, table/card views, star/N shortcut hint, Quick add detail hint, contact pop-ups and inline editing.
- Stages: Not contacted, Reached out, Talking, Met, Keep in touch. Existing Dormant remains supported, not newly assignable. Pipeline navigation is removed; its old address redirects to Contacts.
- Reminders: initial outreach after 5 days, no reply after 7, Talking inactivity after 7, Keep in touch after 90 or contact cadence; all four defaults editable in Profile Settings. Explicit deadlines show the day before, due day and “Overdue by {n} days.” with a live count. Snooze pauses without changing deadlines.
- Existing/manual contacts are tracked; new CSV contacts require single or bulk Start tracking. Tracking activation restarts inactivity clocks.
- Separate conversations and sent outreach, editable history, derived last-contact dates and counted future follow-ups.
- Message window always shows Copy; saved chat/email/LinkedIn determine available destinations. Chat and LinkedIn copy first; Gmail stays prefilled. Existing-conversation layout and captions guide available choices; logging remains explicit confirmation.
- LinkedIn CSV and own-CSV uploads share encrypted save/merge; only own CSV offers a sample download.
- Templates remain owner-scoped; starter initialization is protected against repeats. Audit found six templates for each of seven accounts, not 42 for one account; no existing templates deleted.
- Profile Settings, setup reminders, feedback submission and authorized admin feedback/count review.
- Manual prefilled Google Calendar scheduling remains; automatic sync and analytics are not implemented. No AI or new paid services.

## Verification
- 98 tests passed, including all reminder day counts, stage mappings, tracking, clipboard/navigation ordering, owner privacy and starter initialization preserving edited/deleted templates.
- Temporary-account browser flow previously verified encrypted contact save/reload, messaging/clipboard, outreach history, CSV bulk activation, preference persistence, old Pipeline redirect and desktop/mobile themes. The current audit found leftover rows from older deleted accounts; complete cleanup is not yet verified.
- The requesting user's private notes remain locked in the verification browser; no passphrase was requested or private contact data accessed.
## Account audit and cleanup proposal
- Current active account list: one account, aishwaryasudhakar12@gmail.com; one contact, six templates, one profile, one role, one initialization record, zero feedback submissions. Preserve all of these.
- Active test accounts: zero. No accounts or data were deleted in this audit.
- The previous seven-template-owner count included the owner plus six identities whose sign-in accounts no longer exist. Their leftover data totals 18 contacts and 36 templates (three contacts and six templates each). Emails are no longer available, so individual attribution to test creation cannot be fully verified.
- Prior test scripts used privacy-* and tracking-* email addresses at example.com and deleted sign-in accounts. Two further deleted identities retain only one initialization marker each.
- Proposed cleanup, pending explicit approval: remove only the 18 contacts, 36 templates and two initialization markers whose owner ID no longer exists in auth.users; keep the owner's data unchanged. No cleanup code or migration has been executed.
- Six former template owners: 2dd2b1a2-9bb1-456f-a9db-6b684d4b69fe, 3c9ea30f-e0d4-4006-a366-714365931499, 86c42d42-e2cc-41d5-9924-2d7680049863, a5423313-cd26-4b27-8f91-ea6083454f79, b207a195-aa31-451d-8231-cc8a73074a29, f20a5923-7e05-4508-89cf-83760ff2ae5f.
- Marker-only former owners: 99a9fba1-c040-4e0e-824d-a750b8407b89, f43d7e03-6e28-4955-bf84-dee3bf600c46.
