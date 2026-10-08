# QRaura

Free QR platform: anyone can sign up, create unlimited QR codes that hide text, links, photos, files, WhatsApp, UPI etc., and download them (PNG/SVG). Scanning a QR opens a public page with everything inside (optional password lock).

Stack: static site (Cloudflare Pages) + Supabase (auth, Postgres, storage). No build step.

## Setup
1. Create a **new Supabase project**. Open SQL Editor and run `schema.sql`.
2. Supabase -> Authentication -> URL Configuration: set Site URL to your deployed domain. (Optional: disable "Confirm email" for faster testing.)
3. Put your project URL and anon/publishable key in `config.js`.
4. Deploy: Cloudflare Pages -> connect this GitHub repo -> framework: None, build command: empty, output directory: `/`.
   `_redirects` makes `/s/<code>` open the scan page.

## Files
- `index.html`, `style.css`, `app.js` - the app
- `qr-lib.js` - bundled QR generator (MIT, Kazuhiko Arase)
- `schema.sql` - tables, security rules, `qr_scan` / `qr_save` functions, storage bucket
