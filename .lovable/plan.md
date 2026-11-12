# LinkedNetwork rebuild

## Confirmed direction
- Rename the app LinkedNetwork and remove sample data and Kindred references, including the old storage key.
- Keep the current hosting, colors, font, and conversation-first contact pop-up.
- Use the user's external auth/data project; do not enable Lovable Cloud.
- Email/password accounts only, without additional display-name/avatar profiles.
- Designated admin: aishwaryasudhakar12@gmail.com. Assign the role to the verified account's stable ID, not a client-side email check.

## Build
1. Add signup, login, logout, forgot-password, and password-recovery screens. Protect contact and admin views; auth and recovery screens remain accessible while signed out.
2. Add per-user encryption setup/unlock. Display the exact irrecoverability warning. Keep the derived key in memory only and clear it on logout.
3. Replace browser-only contacts with owner-scoped persistent contacts and interactions. Include all fields and options in the supplied brief, plus the existing exact chat link.
4. Add quick add, full profile editing, conversation logging, due-first reminders, and the updated filters/company search.
5. Add LinkedIn CSV preview with search, selection, header detection, mapping, and duplicate merging that fills only blank fields.
6. Add persistent feedback access and an admin page with feedback status management and total user count, never contact data.
7. Add privacy-safe PostHog events after its public project token and region/host are supplied. Disable automatic capture, session recording, and contact-field transmission.

## Technical details
- Retain TanStack routing; perform application data operations in the browser against the external project, secured by database grants and row-level security.
- Store admin roles separately. Restrict admin feedback updates and aggregate user counts through database authorization; never expose account listings or privileged keys to the browser.
- Each table carries an owner user ID. Ordinary reads/writes are owner-only; admins get the explicit feedback-review exception, not contact access.
- Use Web Crypto PBKDF2 with 310,000 iterations and a per-user random salt, then AES-GCM with a fresh nonce per encryption. Encrypt notes, next steps, and interaction summaries before persistence.
- Store an encrypted verification value to detect incorrect passphrases without storing the passphrase or key.
- Derive last contact from the latest interaction. Logging clears only past scheduled dates and advances initial outreach stages.

## Verification
- Tests for CSV mappings, duplicate precedence/blank-only merging, encryption round-trip/wrong-passphrase handling, ownership/admin rules, and concrete reminder/stage rules.
- Exercise signup/recovery, unlock, contact save/reload, CSV import, conversation history, and feedback on desktop and mobile once the external service is accessible.

## Pending prerequisites
- Connect the external project in Settings → General → External Supabase. The current app has no visible connection yet.
- PostHog public project token and host/region are not provided; analytics can remain pending without blocking the contact features.
- Confirm the designated admin account exists before assigning its stable-ID role.