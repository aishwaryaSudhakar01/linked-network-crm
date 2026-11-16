# LinkedNetwork

A networking CRM for students. Track the people you have talked to, see who to follow up with, and message them without losing context.

**Live app:** https://linked-network-crm.lovable.app

## What it does

- **Contacts.** Name, company, title, email, LinkedIn, where you met, connection types, notes, chat link, and next step with a due date.
- **Stages.** Not contacted, Reached out, Talking, Met, Keep in touch. Dormant is set by the app.
- **Reminders.** Each stage has a rule, such as 7 days after you reach out. Day counts are editable in Settings and show on Home.
- **Dormant.** A contact you reached out to who does not reply goes Dormant after 14 days by default. Revive one or many at once.
- **Message window.** Pick a template, edit it, then Copy, Continue chat, open a Gmail draft, or open their LinkedIn profile. Placeholders such as `{{first_name}}` fill in automatically, and `[bracketed]` lines must be completed before you can copy.
- **Log conversations.** Where, date, summary, and meeting notes, kept as a timeline on each contact.
- **Import.** LinkedIn export or your own CSV. Imported contacts get no reminders until you start tracking them.
- **Feedback.** An in-app Give feedback button, with an admin view for triage.

## What it does not do

- No AI-written messages.
- No automatic sending. Every message goes out from your own Gmail or LinkedIn.
- No access to your calendar or inbox.

## Privacy

Each account only reads and writes its own rows, enforced with row-level security in the database. The admin role manages feedback and cannot open another user's contacts.

## Stack

TanStack Start, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Lovable Cloud (Postgres), Vitest.

## Run locally

```sh
git clone https://github.com/aishwaryaSudhakar01/linked-network-crm.git
cd linked-network-crm
npm install
npm run dev
```

Run the tests with `npm test`.

## Roadmap

See [roadmap.md](roadmap.md) for what has shipped and what is still open.

## Built with

[Lovable](https://lovable.dev). Changes made in Lovable commit to this repository, and pushes to `main` sync back.
