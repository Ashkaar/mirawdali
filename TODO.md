# To do

1. ~~**Move the project to its own domain.**~~ Done: https://mirawdali.com (www redirects to it), with Vercel and Supabase both updated.
2. **Fix sign-up with Google.** Create the OAuth client in Google Cloud with JavaScript origin `https://mirawdali.com` and redirect URI `https://yyutjpgutpuvwcpgigil.supabase.co/auth/v1/callback`, then paste its Client ID and secret into Supabase (Authentication → Sign In / Providers → Google).
