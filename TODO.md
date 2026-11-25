# To do

1. **Move the project to its own domain.** Point the domain at Vercel, then update `SITE_URL` in Vercel and the Site URL and Redirect URLs in Supabase (Authentication → URL Configuration).
2. **Fix sign-up with Google.** Create the OAuth client in Google Cloud (redirect URI `https://yyutjpgutpuvwcpgigil.supabase.co/auth/v1/callback`), then paste its Client ID and secret into Supabase (Authentication → Sign In / Providers → Google). Do this after step 1 so the Google settings use the final domain.
