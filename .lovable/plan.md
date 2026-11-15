# Google Calendar integration (read-only, per-user)

Each user connects their own Google Calendar. Read-only access. Nobody — including the admin — can see another user's calendar. No AI, no new paid services, no change to encryption. Ink and Marigold + Inter stay as-is.

## What you must set up in Google Cloud (step by step)

No App User Connector client exists for Google Calendar in this workspace yet, so this one-time setup is required before anyone can connect:

1. Go to https://console.cloud.google.com and create a project (e.g. "LinkedNetwork").
2. **APIs & Services → Library** → search "Google Calendar API" → **Enable**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External** (or Internal if every user is in your Google Workspace).
   - App name "LinkedNetwork", your support email, your developer contact email.
   - Scopes: add `.../auth/calendar.readonly`, `.../auth/userinfo.email`, `.../auth/userinfo.profile` (read-only calendar only — no write access).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URI: `https://connector-gateway.lovable.dev/api/v1/app-users/oauth2/callback` (exactly this — do not add the app URL).
   - Copy the **Client ID** and **Client secret**.
5. **Audience**: while the app is in "Testing", Google revokes every connection after 7 days. Either add each user as a test user, or click **Publish app** (recommended).
6. In Lovable: **Workspace settings → App User Connectors → Google Calendar** → create a client with that Client ID and secret (requires workspace admin), with offline access enabled. I will then link it to this project with the connect tool.

**Secrets needed from you: none in chat.** The Client ID/secret go into the workspace connector form in step 6. Lovable then auto-provides `GOOGLE_CALENDAR_APP_USER_CONNECTOR_CLIENT_API_KEY` and the token-encryption key `APP_USER_CONNECTION_KEY_SECRET` to the server.

## 1. Connect and disconnect

- New server-only helper `src/integrations/lovable/appUserConnector.ts` (standard Lovable connector helpers) — never imported by browser code.
- Database migration: `public.app_user_connections` table (user_id, connector_id, encrypted connection key, timestamps; unique per user+connector). RLS enabled, **service_role only** — no anon/authenticated access, so even the admin cannot read tokens. Keys encrypted with the auto-provisioned secret before storing.
- Server functions (all require sign-in):
  - `startGoogleConnect` — starts OAuth in a popup with the read-only scopes.
  - `completeGoogleConnect` — exchanges the one-time code, encrypts and stores the token.
  - `disconnectGoogleCalendar` — revokes access with Google via the gateway, then deletes the stored token row.
  - `googleCalendarStatus` — returns connected/disconnected + the connected Google email.
- New unauthenticated return endpoint `src/routes/api/oauth/google/return.ts` (plain HTML that posts the one-time code back to the app window; the token itself never reaches the browser).
- Profile Settings: the "Google Calendar" section replaces "Coming soon" with **Connect Google Calendar**; once connected it shows the connected Google email and a **Disconnect** button.
- Not added to onboarding. Users who never connect see no calendar UI anywhere.

## 2. "This week" on Home (all users)

- The existing "This week" strip keeps listing next steps due this week.
- For connected users, a server function reads this week's events live from Google and matches them to contacts by **guest email** (case-insensitive) against saved contact emails. Event titles are never used for matching.
- Each item shows contact name, date and time, and opens the contact card.
- If a next step and a calendar event fall on the same contact on the same day, only one item is shown.

## 3. Schedule button

- The existing Schedule button still opens the prefilled Google Calendar draft.
- After scheduling, the chosen date is also saved as the contact's next step with the text "Meeting" — only if no next step exists. If one exists, a confirmation asks before replacing it.

## 4. Meetings tab (connected users only)

- The existing "Meetings" nav item and route become the real view; the nav item is **hidden** for users who haven't connected.
- Shows the next 4 weeks of events, grouped by day, read live from Google.
- Events matched to a contact (by guest email) show the contact's name and open the card.
- Unmatched events show a small "Is this with one of your contacts?" link; picking a contact links that event once. New table `calendar_event_links` stores **only** event ID + contact ID (owner-scoped RLS).
- No create, edit, or delete of calendar events anywhere.

## 5. Privacy and storage

- Events are read live from Google when Home or Meetings loads. Event titles, descriptions, guests, and times are **never** written to the database — they flow through the server function to the screen only.
- The only stored data: the encrypted connection token (`app_user_connections`) and manual event→contact links (`calendar_event_links`).

## 6. Cleanup

- Replace every "Calendar coming soon" label (Profile Settings section, Meetings view).
- Update roadmap.md.

## Tests

New tests for: matching events by guest email; no match on title alone; no duplicate item when a next step and an event coincide; Schedule saving the next step (and asking before replacing); Meetings nav hidden when not connected; disconnect removing the stored token; and that no event details are persisted. Existing 124 tests must keep passing.

## Technical notes

- TanStack Start server functions (`createServerFn`) with `requireSupabaseAuth`; the admin client is used only inside handlers for the token table.
- Calendar API calls go through the Lovable connector gateway server-side; tokens and gateway keys never reach the browser.
- If Google later reports the grant expired (e.g. app left in Testing mode), the UI shows a "Reconnect Google Calendar" state instead of failing silently.
