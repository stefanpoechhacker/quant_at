# Instagram — Reels-free wrapper app (personal build)

A tiny SwiftUI app: a full-screen `WKWebView` pointed at instagram.com, with
the same Reels-blocking JavaScript from `../instagram-no-reels.user.js`
injected automatically. It behaves like a normal Instagram "app" icon on
your home screen, minus Reels — and unlike the Safari-extension setup, it
works even if you don't route through Safari at all.

**This is for installing on your own device only**, via Xcode + a free
Apple ID. It is *not* set up for App Store distribution (see the note at
the bottom for why).

## What you need

- A Mac with **Xcode** installed (free, from the Mac App Store).
- Your Apple ID signed into Xcode (Xcode → Settings → Accounts) — a free
  personal account is enough, no paid Developer Program required.
- Your iPhone, connected by cable or on the same Wi-Fi as your Mac.

## Setup

1. **Create the project.** In Xcode: File → New → Project → iOS → **App**.
   - Product Name: e.g. `ReelsFree`
   - Interface: **SwiftUI**, Language: **Swift**
   - Uncheck "Use Core Data" and "Include Tests" (not needed)
   - Save it anywhere.

2. **Replace `ContentView.swift`.** Xcode generates a default
   `ContentView.swift` — open it and replace its entire contents with
   [`ContentView.swift`](./ContentView.swift) from this folder. Leave the
   other auto-generated file (`ReelsFreeApp.swift` or similar) untouched —
   its default `WindowGroup { ContentView() }` is already exactly what's
   needed.

3. **Add the script file.** Drag [`ReelsBlocker.js`](./ReelsBlocker.js) from
   this folder into Xcode's project navigator (drop it next to
   `ContentView.swift`). In the dialog that appears, make sure **"Copy
   items if needed"** is checked and your app target is checked under **"Add
   to targets."**

4. **Set signing.** Click the project name at the top of the navigator →
   select your app target → **Signing & Capabilities** tab → under
   **Team**, choose your Apple ID (Xcode offers to create a free "Personal
   Team" the first time).

5. **Run it on your phone.** Plug in your iPhone (or select it over Wi-Fi),
   choose it as the run destination in Xcode's toolbar, and press **▶ Run**.
   The first time, your phone will refuse to open the app until you go to
   **Settings → General → VPN & Device Management** and trust your
   developer certificate.

You now have an app icon that opens straight into Instagram with no Reels
tab, no Reels in your feed, and no swiping from a shared reel into the
endless feed — same behavior as the Safari userscript, but as a real app.

## Things to know

- **Free-account apps expire after 7 days.** Without a paid ($99/yr) Apple
  Developer account, Xcode-installed apps stop opening after a week and
  need to be re-run from Xcode to reinstall. This is an Apple restriction
  on free accounts, not a bug in the app.
- **Login is separate from Safari.** This app has its own cookie storage,
  so you'll need to log into Instagram once inside it — it won't reuse your
  Safari session.
- **If Reels start showing up again,** Instagram changed its markup — open
  `ReelsBlocker.js` and update it the same way you would the userscript
  (the relevant knobs are commented at the top of the file).

## Why this isn't set up for the App Store

Publishing an app that repackages and modifies a third-party service like
Instagram runs into two real problems: Apple's App Store guidelines reject
thin wrapper apps around someone else's existing service (4.7/5.2.3), and
Instagram's own Terms of Service prohibit unauthorized modified/derivative
clients of their app — which is the kind of thing that draws a takedown or
trademark complaint, and can put an Apple Developer account at risk. Keeping
this as a personal sideload avoids all of that; if you want to share it with
others later, the free-to-copy userscript version is the lower-risk way to
do that.
