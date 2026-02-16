# Post-launch checklist (Step 4 – Polish)

After the site is live, use this list as needed.

## Email templates (Supabase)

1. **Supabase Dashboard** → **Authentication** → **Email Templates**.
2. **Confirm signup:** set **Subject** and **Body** (HTML) in Hebrew (or your language). Use `{{ .ConfirmationURL }}` for the confirmation link.
3. **Reset password:** same if you use password reset.
4. **Save** each template.

## Avoid Supabase project pause

- Free-tier Supabase projects can be paused after a period of inactivity.
- **Options:** use the project regularly (e.g. log in, run a query), or upgrade the plan.
- If paused: open Supabase Dashboard and **Restore project**; data is kept.

## Emails not going to spam (optional)

- Supabase’s default email can land in spam. For better deliverability:
1. **Supabase** → **Project Settings** → **Authentication** → **SMTP Settings**.
2. Configure **Custom SMTP** (e.g. [Resend](https://resend.com), [SendGrid](https://sendgrid.com), [Mailgun](https://mailgun.com)).
3. Add the SMTP credentials and sender address.
4. For your domain: set **SPF** and **DKIM** records at your DNS provider (your SMTP provider will give the values).

## Other

- **Google Places API:** if you use a custom domain, add it to the API key’s HTTP referrer restrictions in Google Cloud Console.
- **Monitoring:** optional – add Google Analytics or similar via a script in `index.html`.
