# Mirawdali | میراودەلی

A bilingual family archive built with Next.js and Supabase. English is the default. Sorani uses right-to-left navigation and forms. The repository starts with an empty archive.

## Configure Supabase

1. Create a Supabase project for Mirawdali. Apply `supabase/migrations/202611250001_archive.sql` using the Supabase CLI or SQL editor.
2. Enable email and password with **Confirm email** enabled. Set up a production SMTP sender in Supabase. Set the Site URL to the canonical HTTPS origin. Add `https://YOUR-DOMAIN/auth/callback` and `https://YOUR-DOMAIN` to the redirect allowlist. Add the local counterparts for development when needed.
3. In the confirmation email template, link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. In the password-recovery template, link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`. These direct links let confirmation work when the user opens email in a different browser.
4. Enable the Google provider. Enter the OAuth client ID and secret in the Supabase dashboard. Add the callback URL shown by Supabase as an authorized redirect URI in Google Cloud.
5. Have the designated administrator register and verify their email. Look up the account UUID in Supabase Authentication and run this SQL with the actual UUID. The database allows one administrator.

   ```sql
   insert into public.archive_admin(user_id)
   values ('00000000-0000-0000-0000-000000000000');
   ```

Archive browsing starts public. The admin can switch browsing to signed-in accounts under **Account → Manage archive**. Approved image access follows the same policy. Pending images are visible to their submitter and the admin. The cover is a static page asset.

## Run and deploy

Copy `.env.example` to `.env.local` and set the Supabase URL, the publishable key, and `SITE_URL`. Keep service-role keys and OAuth secrets out of the app. For Vercel, set the three values in the project environment variables before deployment. `SITE_URL` and the Supabase Site URL should use the same canonical origin.

```sh
npm ci
npm run check
npm run build
npm run dev
```

Confirm your email and test Google sign-in on the canonical origin. In separate admin, contributor, and signed-out sessions, verify tree editing, submission review, published photos and posts, and both browsing access modes.
