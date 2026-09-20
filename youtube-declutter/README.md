# YouTube — Hide Shorts & Ads

Two independent userscripts for **youtube.com** in a mobile browser, same
idea as the Instagram Reels blocker. Install either or both.

## youtube-no-shorts.user.js

Hides the Shorts tab, Shorts shelves in your feed/search results, and
individual Shorts tiles. A Short someone sends you directly still plays —
but swiping/scrolling onward into the next one is blocked, snapping you
back to the one you opened.

## youtube-no-ads.user.js

Hides display/banner/overlay ads, auto-clicks "Skip Ad" the instant it's
available, and fast-forwards through non-skippable video ads instead of
making you sit through them.

**Honest limitation:** this is client-side only — it acts on ads YouTube
has already sent to your browser, it can't stop the ad request itself (that
needs a real network-level content blocker, e.g. a Safari content-blocker
app like AdGuard's free tier). YouTube also actively detects ad blockers and
may show a "this violates YouTube's Terms of Service" prompt or throttle
playback after repeated skips. This script does what's achievable from a
userscript; it's not a guarantee of a fully ad-free experience the way
Reels/Shorts hiding is.

Both scripts only work on the **website**, not the native YouTube app.

## Setup

If you already set up the Instagram script, you're most of the way there —
same extension, just add another script (repeat per script you want):

**iPhone (Safari):** open the Userscripts app → **+** → paste in the
contents of the `.user.js` file → save. Then open youtube.com in Safari.

**Android (Firefox + Violentmonkey/Tampermonkey):** open the extension's
dashboard → create a new script → paste in the contents of the `.user.js`
file → save. Then open youtube.com in Firefox.

(Full first-time setup instructions, if you haven't installed Userscripts /
Violentmonkey yet, are in [`../instagram-declutter/README.md`](../instagram-declutter/README.md).)

## Getting a home-screen icon that still works

Using iOS's built-in **"Add to Home Screen"** on youtube.com (or
instagram.com) creates a stripped-down web view that Safari extensions never
run in — so these scripts (and Userscripts entirely) would silently stop
working. That's an iOS platform restriction, not something a script can work
around.

The fix: build the home-screen icon with the **Shortcuts** app instead, so
it opens real Safari (extensions intact) rather than a bare webclip:

1. Open the **Shortcuts** app (pre-installed, no download needed).
2. Tap **+** (new shortcut) → **Add Action** → search **"Open URLs"** → add it.
3. Tap the URL field and enter `https://www.youtube.com/` (use
   `https://www.instagram.com/` for the other one).
4. Tap the shortcut's name at the top to rename it (e.g. "YouTube") and tap
   the icon to pick a color/glyph so it looks like a normal app icon.
5. Tap the **Share** icon → **Add to Home Screen** → **Add**.

Tapping that icon briefly opens Shortcuts, then hands off straight into
Safari with the page loaded — extensions active the whole time. Delete any
old "Add to Home Screen" icons you made directly from Safari, since those
are the broken kind.

## If it stops working

YouTube changes its internal component names periodically.

- Shorts reappearing: open `youtube-no-shorts.user.js` — the CSS block and
  `COMPONENT_TAG_RE` near the top are the pieces most likely to need an
  update, the same way `ANCESTOR_HOPS`/selectors were for the Instagram
  script.
- Ads slipping through or the skip button not firing: open
  `youtube-no-ads.user.js` and check the `HIDE_CSS` selector list and the
  `.ytp-ad-skip-button` selectors in `handleVideoAds` — YouTube occasionally
  renames these.
