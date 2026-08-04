# Open Decisions

Decisions that have not yet been made. Must be resolved before the relevant feature is implemented.

---

| # | Decision | Impact | Status |
|---|---|---|---|
| 1 | Company branding (name, logo, colors) | Public website, invoices, email templates | Open |
| 2 | VAT rules (flat rate vs. item-level, VAT number) | Quote builder, invoices | Open |
| 3 | Default VAT rate (e.g., 20% UK) | Invoice calculations | Open |
| 4 | Pricing model (fixed per service, hourly, custom quote only) | Booking form, service management | Open |
| 5 | Email provider (Resend, SendGrid, Supabase built-in) | Notification setup | Open |
| 6 | WhatsApp Business API provider (Twilio, 360dialog) | Post-MVP notifications | Post-MVP |
| 7 | Customer portal (login to view history) vs. token-only access | Architecture decision | Post-MVP |
| 8 | Photo retention policy (how long to keep before/after photos) | Storage costs, GDPR | Open |
| 9 | Hosting provider (Vercel, Fly.io, self-hosted) | Deployment config | Open |
| 10 | Supabase project region | GDPR (data residency for UK clients) | Open |
| 11 | Invoice due date (days after issue) | Invoice generation | Open (suggest: 7 days) |
| 12 | Cleaner payment details (tracking what is owed to cleaners) | Out of scope MVP? | Open |
| 13 | CSP headers and security headers configuration | Production readiness | Pre-launch |
| 14 | MFA for admin accounts | Security | Post-MVP |
| 15 | Rate limiting provider (Upstash, Vercel built-in) | Spam protection | Pre-launch |

---

## How to Resolve

When a decision is made:

1. Update this file: move status from "Open" to "Resolved" and add the resolution
2. If the decision changes the implementation, update the relevant doc (plan.md, database-schema.md, etc.)
3. Log the decision in `docs/decisions.md` with the reasoning

---

## Resolved Decisions

*(None yet — add here as decisions are confirmed)*
