# Vendor portal setup

One-time setup for the vendor portal's accounts. Do it first for a **development** project; repeat
for a separate **production** project before real vendors log in. Allow about 30 minutes, most of it
waiting for DNS.

## 1. Resend (email)

1. Create an account at [resend.com](https://resend.com).
2. **Domains → Add domain**: `wfbmarkets.org`. Resend shows a few DNS records (SPF, DKIM and an
   optional DMARC). Add them at your domain registrar and wait for **Verified**.
3. **API Keys → Create API key** with "Sending access". Copy it (shown once).
4. Choose the sender address, e.g. `vendors@wfbmarkets.org`.

## 2. Supabase project

1. Create an account at [supabase.com](https://supabase.com) and a **New project**
   (e.g. `wfb-portal-dev`), in the US region nearest you. Save the database password somewhere safe.
2. **Project Settings → API Keys**: copy the **Project URL**, the **publishable key**
   (`sb_publishable_…`) and a **secret key** (`sb_secret_…`).

### Authentication settings

**Authentication → URL Configuration**

- **Site URL**: `http://localhost:3000` for the dev project (`https://wfbmarkets.org` for production).
- **Redirect URLs**: add `http://localhost:3000/**` and `https://wfbmarkets.org/**`
  (plus your Vercel preview pattern if you use previews, e.g. `https://*-zeroclicklabs.vercel.app/**`).

**Authentication → Sign In / Providers → Email**

- Email provider: **on**. Allow new users to sign up: **on**. The portal itself only lets
  invited people and allowlisted admins create a login; anyone else gets nothing.
- Confirm email: off isn't needed; magic links confirm the address.
- Email OTP expiration: `3600` seconds (1 hour). Email OTP length: `6`.

**Authentication → Emails → SMTP Settings** (custom SMTP; required to customise the emails)

- Enable custom SMTP.
- Sender email: your Resend sender (e.g. `vendors@wfbmarkets.org`); sender name:
  `Whitefish Bay Farmers Market`.
- Host `smtp.resend.com`, port `465`, username `resend`, password: your Resend API key.

**Authentication → Emails → Templates → Magic link**

Subject: `Your vendor portal login`

```html
<h2>Log in to the vendor portal</h2>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Log in to the Whitefish Bay Farmers Market vendor portal</a></p>
<p>Or enter this code on the login page: <strong>{{ .Token }}</strong></p>
<p>The link and code work once and expire in an hour. If you didn't ask to log in, you can ignore this email.</p>
```

Use the same subject and body for the **Confirm signup** template: it's what Supabase sends the first
time someone logs in.

> `{{ .RedirectTo }}` is the portal's `/auth/confirm?next=…` address, set by the login form. Adding
> the `token_hash` means the link works even when the email is opened in a different browser from
> the one that asked for it (common on phones).

## 3. Connect the project

Add these to `.env.local` (and later to Vercel → Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
SUPABASE_SECRET_KEY=sb_secret_…
RESEND_API_KEY=re_…
PORTAL_EMAIL_FROM="Whitefish Bay Farmers Market <vendors@wfbmarkets.org>"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=<a long random string, e.g. from `openssl rand -hex 32`>
```

Then link the repo to the project and apply the database migrations:

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

`supabase login` opens your browser; `link` asks for the database password from step 2.

## 4. Make yourself an admin

In **SQL Editor**, add each admin's email (lowercase) to the allowlist **before** their first login:

```sql
insert into public.admin_allowlist (email) values ('you@example.com');
```

Then log in at `/login` with that address. Vendors never need this: they get access when an admin
adds them as a contact and sends an invite.

## 5. Event partners

Partners are people from another organisation who co-manage one event with you, like The Argo's
event manager for Christmas at The Argo. Add them in **Admin → Markets → (the market) → Event
partners** with their name, email and organisation, then press **Invite**. They log in at `/login`
like everyone else and land in `/partner`, where they see only that market:

- its dates, logistics and guides, which they can edit (times, load-in, location, day-of contact, notes);
- the vendor line-up with replies, stall numbers (which they can set) and vendors' contact details;
- updates to its vendors, and they can write their own (shown to vendors as "From The Argo");
- venue files they can add for vendors (floor plan, parking map);
- the task list and notes you share with them (on the market's admin page too).

They never see the vendor CRM (statuses, admin notes, applications), other markets, or anything
about fees and sales. **Remove access** on the same panel when the event is over.

The migrations `…_partner_role.sql` and `…_partner_access.sql` set this up; `supabase db push`
applies them with the others.
