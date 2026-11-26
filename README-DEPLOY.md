# Lotto Champ: Deploy & Search Engine Checklist

## Deploy to Vercel
1. Unzip. `index.html` and `order.html` are at the top level.
2. Deploy the folder to the Vercel project behind `lottochamp.vercel.app` (e.g. `vercel --prod` from this folder, or drag and drop it in the dashboard). No build step; it is a static site. `vercel.json` sets up the redirects.
3. Check these after deploy:
   - https://lottochamp.vercel.app/ returns 200
   - https://lottochamp.vercel.app/order.html?package=lifetime shows the package card; "Buy Now" opens the affiliate checkout
   - https://lottochamp.vercel.app/go/lifetime → 302 to the affiliate URL (tracking intact)
   - https://lottochamp.vercel.app/go/anything-else → 404 (no open redirect)
   - https://lottochamp.vercel.app/key.txt returns exactly `fa95a9dd7899e5095a81ca94041aa7aa`
   - https://lottochamp.vercel.app/sitemap.xml and https://lottochamp.vercel.app/robots.txt load

## Order routing
- Every buy button on the site points to `/order.html?package=lifetime` on your own domain.
- The `order.html` Buy Now button links directly to your exact affiliate URL.
- `/go/lifetime` and `/go/1` do a server-side 302 to the same URL (allow-listed in `vercel.json`). Unknown IDs return a 404.
- `order.html` is set to `noindex, follow` and is left out of the sitemap.

## IndexNow
- Key file: `/key.txt`
- Automatic submission: after each deploy, run `node scripts/indexnow-submit.mjs` (Node 18+). It checks that the live key file matches, then submits only sitemap URLs whose files changed, with retries. Use `--all` for the first submission.
- Status 200/202 means the URL was received. It does not guarantee indexing.

## Bing Webmaster Tools
1. Sign in at bing.com/webmasters and add `https://lottochamp.vercel.app/` (or import from Google Search Console).
2. Verify with the meta tag or XML file method Bing gives you. Add the tag to `<head>` of index.html, or place the XML file at the site root, then redeploy.
3. Sitemaps → submit `https://lottochamp.vercel.app/sitemap.xml`.
4. URL Submission → paste the list from the chat summary.
5. Use URL Inspection on the homepage, the review page and the price page.
6. Check IndexNow insights, then crawl errors and the Search Performance report weekly.

## Google Search Console
Add the URL-prefix property `https://lottochamp.vercel.app/`, verify it, and submit the sitemap.
