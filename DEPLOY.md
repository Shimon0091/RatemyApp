# Deploy Dirgon to production (Netlify + domain)

## Prerequisites

- GitHub account
- Netlify account (free at [netlify.com](https://netlify.com))
- Domain (e.g. from Namecheap, GoDaddy) – optional; Netlify provides a free subdomain

## 1. Git and GitHub

From the project root:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Create the repository on GitHub first if needed (empty repo, no README).

## 2. Netlify

1. Log in at [app.netlify.com](https://app.netlify.com).
2. **Add new site** → **Import an existing project** → **GitHub** → authorize and select your repo.
3. **Build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty)
4. **Environment variables** (Site settings → Environment variables → Add):
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_GOOGLE_PLACES_API_KEY` = your Google Places API key
5. **Deploy site.** Note the URL (e.g. `https://something.netlify.app`).

## 3. Custom domain (optional)

1. **Netlify** → your site → **Domain settings** → **Add custom domain**.
2. Enter your domain and follow the steps (Netlify will show DNS records).
3. At your domain registrar, add the DNS records (usually CNAME or A record as shown by Netlify).
4. Wait for DNS to propagate (up to 48 hours, often minutes).

## 4. Supabase URL configuration

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**.
2. **Site URL:** set to your live site (e.g. `https://your-domain.com` or `https://something.netlify.app`).
3. **Redirect URLs:** add `https://your-domain.com/**` and/or `https://something.netlify.app/**`.
4. **Save.**

## 5. Google OAuth (if using Google sign-in)

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**.
2. Open your **OAuth 2.0 Client ID** (Web application).
3. **Authorized JavaScript origins:** add `https://your-domain.com` and `https://something.netlify.app` (your real URLs).
4. **Authorized redirect URIs:** keep `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
5. **Save.**

## 6. Test

- Open the site in an incognito window.
- Sign up / Sign in (email and Google).
- Write a review and open Admin (with an admin account).
- Confirm address autocomplete works if you use a production domain and added the Places key in Netlify env.

## Notes

- Do not commit `.env`; it is in `.gitignore`. All secrets go in Netlify environment variables.
- After changing env vars in Netlify, trigger a new deploy (Deploys → Trigger deploy).
- If Supabase pauses the project after inactivity, restore it from the Supabase dashboard.
