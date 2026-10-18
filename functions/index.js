// Cloudflare Pages Function for "/" only (functions/index.js ↔ the site root; every other path is served as a plain file).
//
// Phones get the phone edition at /m. The home page also does this itself, with a script in its <head> — but by the time
// that script runs, the browser has already started on the desktop page's stylesheet, fonts and ~40 preloaded images
// (measured: ~3.5 s on a throttled 4G phone before the switch). Deciding here instead sends phones straight to /m before
// any of the desktop page is downloaded. The in-page script stays as the fallback for whatever this misses (tablets,
// browsers that hide what they are), so the two must agree: `?desktop` keeps the full site, and the query string carries over.
// The #anchor is not sent to the server; browsers keep it across the redirect by themselves.

/** A phone, by Client Hints (Chrome, Edge, Samsung Internet send `Sec-CH-UA-Mobile: ?1`) or by its user agent. */
const isPhone = (request) => {
  if (request.headers.get("sec-ch-ua-mobile") === "?1") return true;
  const ua = request.headers.get("user-agent") ?? "";
  // "Mobi" covers iPhone/Android phones/Firefox mobile; Android tablets and iPads leave it out (the script handles those)
  return /Mobi|iPhone|iPod/i.test(ua);
};

/** @param {{ request: Request, next: () => Promise<Response> }} context */
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if ((request.method === "GET" || request.method === "HEAD") && !url.searchParams.has("desktop") && isPhone(request)) {
    url.pathname = "/m";
    return new Response(null, {
      status: 302,
      headers: {
        location: url.pathname + url.search,
        // the answer depends on the device, so no cache may hand one device's answer to another
        "cache-control": "private, no-store",
        vary: "User-Agent, Sec-CH-UA-Mobile",
      },
    });
  }
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.append("vary", "User-Agent, Sec-CH-UA-Mobile");
  return out;
}
