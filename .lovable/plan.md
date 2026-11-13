# LinkedNetwork rebuild

## Confirmed direction
- Rename the app LinkedNetwork and remove sample data and the old brand/storage references.
- Keep current hosting, Google Sans, and the conversation-first pop-up; use the updated green-accent design.
- Use the Lovable Cloud connection enabled at the user's request.
- Email/password accounts with first and last name profiles, as specified in the updated Phase 1 brief.
- Designated admin: aishwaryasudhakar12@gmail.com. Assign the role to the verified account's stable ID, not a client-side email check.

## Build
1. Add signup, login, logout, forgot-password, and password-recovery screens. Protect contact and admin views; auth and recovery screens remain accessible while signed out.
2. Add per-user encryption setup/unlock. Display the exact irrecoverability warning. Keep the derived key in memory only and clear it on logout.
3. Replace browser-only contacts with owner-scoped persistent contacts and interactions. Include all fields and options in the supplied brief, plus the existing exact chat link.
4. Add quick add, full profile editing, conversation logging, due-first reminders, and the updated filters/company search.
5. Add LinkedIn CSV preview with search, selection, header detection, mapping, and duplicate merging that fills only blank fields.
6. Add persistent feedback access and an admin page with feedback status management and total user count, never contact data.
7. Build Phase 1 onboarding, templates, messaging, and pipeline; do not start Calendar sync or PostHog until Phase 2 is authorized.

## Technical details
- Retain TanStack routing; perform application data operations in the browser against Cloud, secured by database grants and row-level security.
- Store admin roles separately. Restrict admin feedback updates and aggregate user counts through database authorization; never expose account listings or privileged keys to the browser.
- Each table carries an owner user ID. Ordinary reads/writes are owner-only; admins get the explicit feedback-review exception, not contact access.
- Use Web Crypto PBKDF2 with 310,000 iterations and a per-user random salt, then AES-GCM with a fresh nonce per encryption. Encrypt notes, next steps, and interaction summaries before persistence.
- Store an encrypted verification value to detect incorrect passphrases without storing the passphrase or key.
- Derive last contact from the latest interaction. Logging clears only past scheduled dates and advances initial outreach stages.

## Verification
- Tests for CSV mappings, duplicate precedence/blank-only merging, encryption round-trip/wrong-passphrase handling, ownership/admin rules, and concrete reminder/stage rules.
- Exercise signup/recovery, unlock, contact save/reload, CSV import, conversation history, and feedback on desktop and mobile.

## Pending prerequisites
- Cloud is connected. Phase 2 requires explicit authorization; PostHog additionally requires its public token and host.
- Confirm the designated admin account exists before assigning its stable-ID role.