# Instagram — Hide Reels

A tiny, free userscript that hides the Reels tab, Reels tray, and individual
Reels posts on **instagram.com** when you use it in a mobile browser. It
doesn't touch your account, doesn't automate anything, and doesn't talk to
any server — it just hides UI elements client-side, the same way an ad
blocker hides ads.

It only works on the **mobile website** (instagram.com in Safari / Chrome /
Firefox), not the native iOS/Android app — apps can't be modified with a
userscript. If you're willing to browse Instagram in a mobile browser
instead of the app, this gets you a normal Instagram with no Reels tab.

## How it works

- Injects CSS that hides the Reels tab link and anything Instagram itself
  labels "Reels" / "Reel" / "Clips".
- Watches the page for new content (Instagram loads posts dynamically as
  you scroll) and hides any post/card that links to a `/reel/...` or
  `/reels/...` URL.
- The endless Reels tab/feed itself is always blocked — landing there bounces
  you back automatically.
- A single reel someone shares with you directly (a DM link, a profile post)
  still plays normally. The moment you try to swipe/scroll to the *next*
  reel from there, it snaps you back to the one you opened instead of
  letting you fall into the algorithmic feed.

## Setup — iPhone (Safari)

1. Install **Userscripts** by quoid from the App Store (free, open source:
   https://github.com/quoid/userscripts).
2. Go to **Settings → Safari → Extensions → Userscripts**, turn it on, and
   allow it for instagram.com (or "All Websites").
3. Open the Userscripts app, tap **+**, and paste in the contents of
   [`instagram-no-reels.user.js`](./instagram-no-reels.user.js).
4. Save, then open instagram.com in Safari — the Reels tab should be gone.

## Setup — Android

Chrome for Android doesn't support extensions, so use **Firefox for
Android** instead, which does:

1. Install **Firefox for Android** from the Play Store.
2. In Firefox, install the **Violentmonkey** or **Tampermonkey** add-on
   (Firefox → Settings → Add-ons).
3. Open the extension's dashboard, create a new script, and paste in the
   contents of [`instagram-no-reels.user.js`](./instagram-no-reels.user.js).
4. Save, then open instagram.com in Firefox.

## Getting a home-screen icon that still works

If you use iOS's built-in **"Add to Home Screen"** on instagram.com, it
creates a stripped-down web view that Safari extensions never run in — so
this script would silently stop working there. See
[`../youtube-declutter/README.md`](../youtube-declutter/README.md#getting-a-home-screen-icon-that-still-works)
for a Shortcuts-app-based workaround that gives you a tappable home-screen
icon without losing the extension.

## If it stops working

Instagram changes its markup fairly often. If the Reels tab reappears, open
`instagram-no-reels.user.js` — the selectors and tuning knobs are grouped
near the top of the file with comments explaining what each one does. The
CSS block and `ANCESTOR_HOPS` constant are the two places most likely to
need a tweak.
