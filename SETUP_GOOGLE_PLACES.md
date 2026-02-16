# Google Places API – Address autocomplete setup

The "Write review" form uses Google Places API for address autocomplete. Follow these steps to enable it.

## 1. Get an API key

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Select your project (or create one).
3. **APIs & Services** → **Library** → search for **Places API** → **Enable**.
4. **APIs & Services** → **Credentials** → **+ CREATE CREDENTIALS** → **API key**.
5. Copy the key.

## 2. Add the key to your project

In the project root, edit `.env`:

```env
VITE_GOOGLE_PLACES_API_KEY=AIzaSy...your-real-key...
```

Restart the dev server (`npm run dev`).

## 3. Restrict the key (recommended)

1. In **Credentials**, click the API key you created.
2. **Application restrictions** → **HTTP referrers**.
3. Add:
   - `http://localhost:5173/*` (development)
   - `https://your-domain.com/*` (production, when you have a domain)
4. **API restrictions** → **Restrict key** → select **Places API**.
5. **Save**.

## 4. Test

1. Run `npm run dev`.
2. Go to **Write review** (כתוב דירגון).
3. In the street field, type at least 3 characters (e.g. a street name in Israel).
4. Address suggestions should appear below the field.

## Notes

- Free tier: Google provides credit; check [pricing](https://developers.google.com/maps/billing-and-pricing).
- If autocomplete does not work, check the browser console (F12) for errors and ensure Places API is enabled and the key is correct in `.env`.
