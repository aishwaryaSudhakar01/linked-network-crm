# Drop Google Calendar integration

## Changes after approval

1. Remove the entire Google Calendar section from Profile Settings and all Calendar coming-soon labels and placeholder copy.
2. Remove Meetings from desktop/mobile navigation and remove its placeholder content. Opening the old `/meetings` address redirects to `/home`, replacing the old address in browser history.
3. Remove the Calendar placeholder from account setup as well. New users skip that obsolete step; accounts already paused there continue to template review without a blank screen. Preserve the other setup steps and existing completion/skipped-step records.
4. Update `roadmap.md` to explicitly mark Google Calendar integration as dropped, remove its coming-soon commitment, and close the now-unneeded connector-cost research task. Leave PostHog and unrelated roadmap items unchanged.

## Schedule stays exactly as it is

- Keep the contact Schedule button's appearance and existing click behavior unchanged.
- It continues opening a prefilled Google Calendar draft in a new tab, using the current contact information and next-step date.
- No account connection, event syncing, automatic contact updates, or Calendar permissions are added.

## Technical scope

- Remove the Meetings navigation/view branch from `workspace.tsx` and unused imports.
- Replace the Meetings route's placeholder with the project's existing client-side redirect pattern, retaining appropriate redirect-page metadata.
- Remove the Calendar section from `settings.tsx` and the obsolete setup panel from `onboarding.tsx`; narrowly adjust the shared setup advancement to bypass its old step number without renumbering stored steps.
- No database migrations, connector changes, auth changes, contact-data changes, reminder changes, template changes, or visual redesign.
- Record the redirect/setup compatibility rule in `AGENTS.md` during implementation.

## Verification

- Add focused tests for advancing from About you directly to template review, resuming an account on the retired Calendar step, and preserving other setup records.
- Test the old Meetings address reaching Home.
- Verify Schedule still opens the same prefilled Calendar URL without writing contact data or requesting account access; do not create an event.
- Run the existing test suite and check the preview for errors.
- Check signed-in desktop/mobile navigation, Profile Settings, and setup for remaining Calendar placeholders.

Application code and the roadmap remain unchanged until this plan is approved.
