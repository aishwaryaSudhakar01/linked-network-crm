<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->
- Use browser Cloud queries with owner-scoped RLS and the network-store module for persistence; seal sensitive contact fields with the in-memory key before writes.
- Keep account names/preferences in profiles and admin roles in user_roles; database authorization protects feedback review and aggregate counts.
- Protected screens live under the client-only authenticated layout; the root redirects to account or Home without a landing page.
- Contact details use the shared accessible dialog rather than inline expansion, so editing and catch-up flows retain a consistent dismissible pop-up.
- Optional chat links support existing stored contacts; allow only HTTP(S) navigation to prevent executable URL schemes.

- Network UI modules share account/encryption context at the root; clear the key and query cache on sign-out to avoid retaining private state.
- Remembered unlock is opt-in IndexedDB storage of a non-exportable CryptoKey bound to account ID and verifier; restore only after account lookup, and erase on lock/sign-out without storing passphrases.
- Network screens are split per view (home.tsx, directory.tsx, pipeline.tsx, contact-view.tsx) with shared primitives in ui-kit.tsx; workspace.tsx owns the shell, shortcuts, command palette, and save/undo, so views stay presentational.
- Contact inline edits merge into a ref of the latest edited copy, because back-to-back saves otherwise overwrite each other with stale data.
- Track skipped optional setup steps and reminder dismissal in owner-scoped profiles, so setup resumes and completion persists across devices.
- Persist appearance in profiles and a local pre-paint theme mirror; theme mutations cancel stale profile reads so toggling cannot be overwritten.
- Keep calendar dates ISO in storage and use shared date formatting/input helpers with a Shadcn month/year calendar picker, so browser locale and timezones cannot change their meaning.
- Store optional contact booking URLs in the existing contact JSON and validate them with the shared HTTP(S) helper; account booking links remain separate for outbound templates.
- ContactLink renders compact validated outline buttons with separate inline editing; contact due dates use DateInput's inline variant beside Next step while sharing calendar validation. Conversation edits reuse the shared dialog and replace by interaction ID to preserve history and derive the last-contact date without duplicate entries.
- Both CSV sources use the shared parser and existing encrypted contact save/merge path; downloadable samples come from the parser module to keep examples compatible.
