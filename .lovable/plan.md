# Starter templates and safe message preparation

## Scope
Use the uploaded text verbatim for six independent starter templates for **new accounts only**. Preserve existing users' saved templates, except the explicitly approved unchanged originals in your account. No AI or new paid services.

## New-account starter set
| Name | Type | Subject |
| --- | --- | --- |
| LinkedIn connection request (under 300 characters) | LinkedIn connection request | Empty |
| Cold email | Email | `{{my_school}} student, a question about {{company}}` |
| Coffee chat ask | Email | `20 minutes in the next few weeks?` |
| Follow-up after no reply | Email | `Following up` |
| Thank you after a chat (send within 24 hours) | Email | `Thank you` |
| Referral ask (only after a real conversation) | Email | `Applied for [role] at {{company}}` |

Use the names exactly as supplied, including the parenthetical guidance. The upload does not explicitly label the five other types; retain **Email**, matching the existing starter set. Bodies retain all supplied paragraphs, `{{variables}}`, and square-bracket fill-in prompts.

Keep the protected once-per-account initialization marker. Changing the starter source must not reseed existing accounts or restore deleted templates.

## Your account: proposed replacements
Compared your six current templates with the original starter definitions, including name, type, subject, and body.

**Five unchanged originals will change:**
1. **Cold email** — new subject and body.
2. **Coffee chat ask** — new subject and body.
3. **Follow-up after no reply** — new body; subject stays “Following up.”
4. **Thank you after a chat** — new body and name “Thank you after a chat (send within 24 hours)”; subject stays “Thank you.”
5. **Referral ask** — new name “Referral ask (only after a real conversation),” subject, and body.

**One template will stay untouched:**
- **LinkedIn connection request** — its body already matches your uploaded replacement, but differs from the original starter. Treat it as edited and preserve its current name, type, subject, and body.

Immediately before updating, recheck the exact original values and update only the five reviewed template IDs owned by your account. If anything changed after this review, skip it rather than overwrite an edit. Preserve IDs; do not delete or duplicate templates. No other existing user's stored templates change.

## Square-bracket prompts in the Message window
- Highlight remaining square-bracket text, such as `[topic]` or `[one thing they said]`, with the existing missing-field appearance.
- Include prompts in both the message and the email subject. Preserve their text until the user edits it; never silently strip it.
- Before **Copy**, **Add new email**, **Continue**, or **LinkedIn profile**, inspect the final message and, when email is available, its subject.
- If a fill-in prompt remains, show exactly **“Fill in the highlighted text first”**. Do not copy, open a destination, or offer a sent-log confirmation for that attempt.
- Keep the existing missing `{{variable}}` checks separate, preserving their current field-specific errors. Keep editing, Escape/click-outside retention, Reset, reviewed template updates, copy-before-open, editable sent-log confirmation, and destination visibility.
- Keep the 300-character connection-request limit on the final filled message and existing template editors/storage.

## Real line breaks
**Confirmed:** your five original email bodies contain literal backslash-plus-`n` text, not newline characters. The current starter function stores the same literal sequences.

- Store the replacement starter bodies with actual paragraph/newline characters.
- Normalize legacy literal `\n` and `\r\n` sequences into real line breaks when templates are loaded and saved; normalize real CRLF consistently without doubling blank lines.
- Apply the same shared handling to template display/editing, placeholder filling, clipboard output, and Gmail's encoded body so existing templates display and send correctly without bulk rewriting other users' stored content.
- Save your five replacements with actual newlines and verify the stored values directly.

## Technical approach
- Replace the protected starter-seeding function through a database migration, retaining its initialization and execution permissions. No historical migration rewrites.
- Perform the approved five-account-template updates separately as guarded data changes, not as a data-only migration.
- Keep newline normalization and bracket detection in shared template helpers and use them in the existing Message window and template persistence paths.
- Preserve owner-only database access; do not give app administrators access to other accounts' templates.

## Tests and verification
- Bracket detection covers short/long prompts, multiple prompts, subject-only prompts, resolved prompts, and existing missing-field markers.
- Each of the four Message actions is blocked when unresolved bracket text remains; no clipboard, navigation, save, or sent-log side effect occurs. Editing away the prompts restores the action.
- Line-break tests cover literal `\n`, literal `\r\n`, actual LF/CRLF, blank paragraphs, and repeated normalization. Verify clipboard text and decoded Gmail body contain real line breaks.
- Test the five-original replacement predicate: edited name, type, subject, or body prevents replacement; your edited connection request is excluded.
- Retain and run connection-length, destination, placeholder restoration, and account-isolation regression tests.
- Verify stored starter function text and your replacement rows; confirm the preserved connection template and other accounts' saved templates are unchanged.
- Check the Message window's highlighted body/subject, error, correction, copy, and Gmail destination on desktop and mobile. No live email is sent during verification.

## Approval
Approval authorizes the new-account starter change, the five listed unchanged templates in your account, and the Message-window/line-break safeguards. No application code or database data has been changed during this review.