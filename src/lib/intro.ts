/**
 * Set once the intro has played in this tab (the desktop loader, or the phone's "Tap to enter"). /events is a
 * separate root layout, so coming back to the home page is a full page load — after the first time the intro
 * is skipped. The head scripts in (home)/layout.tsx and (mobile)/m/layout.tsx read the same key and add
 * `html.seen` so the intro never flashes before hydration.
 */
const SEEN = "agni:intro-seen";

export function introSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN, "1");
  } catch {}
}
