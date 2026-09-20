// Injected into the app's WKWebView at document start. Same logic as
// ../instagram-no-reels.user.js, minus the Tampermonkey-specific bits
// (no @grant/GM_addStyle needed — this always has a real document).
//
// If Instagram changes its markup, this is the file to edit. Everything
// is expressed as CSS/href/aria-label patterns rather than generated
// class names, since IG's class names are obfuscated and rotate often
// but hrefs and aria-labels stay comparatively stable.

(function () {
  "use strict";

  const REEL_HREF_RE = /^\/reels?(\/|$)/i; // matches /reel/... and /reels/...

  const HIDE_CSS = `
    /* Bottom-nav / top-nav Reels tab links */
    a[href^="/reels/"] { display: none !important; }

    /* Any element explicitly labelled Reel/Reels/Clip by Instagram itself */
    [aria-label="Reels" i],
    [aria-label="Reel" i],
    [aria-label="Clips" i] { display: none !important; }
  `;

  function injectCss() {
    const style = document.createElement("style");
    style.id = "ig-no-reels-style";
    style.textContent = HIDE_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  if (document.head) {
    injectCss();
  } else {
    document.addEventListener("DOMContentLoaded", injectCss, { once: true });
  }

  // ---------------------------------------------------------------------
  // JS pass: catches things pure CSS can't (reel posts mixed into the
  // main feed / explore grid, whose *containing* card has no reel-specific
  // attribute of its own — only the inner link does).
  // ---------------------------------------------------------------------

  const ANCESTOR_HOPS = 6;

  function hideReelLinks(root) {
    const links = root.querySelectorAll('a[href*="/reel/"], a[href*="/reels/"]');
    for (const link of links) {
      const path = new URL(link.href, location.origin).pathname;
      if (!REEL_HREF_RE.test(path)) continue;

      // Nav-bar / tab links (href is exactly "/reels/", not an individual
      // post) pack several unrelated icons into shared wrapper elements a
      // few levels up — walking ancestors there risks hiding siblings like
      // the messages icon. Only hide the link itself in that case.
      const isIndividualReelPost = /^\/reel\/[^/]+\/?/.test(path);
      if (!isIndividualReelPost || link.closest('nav, [role="navigation"]')) {
        link.style.display = "none";
        link.setAttribute("data-ig-no-reels-hidden", "true");
        continue;
      }

      // Individual reel post embedded in feed/explore: walk up to the
      // containing card, stopping early at a semantically meaningful wrapper.
      let target = link;
      for (let i = 0; i < ANCESTOR_HOPS && target.parentElement; i++) {
        target = target.parentElement;
        if (target.tagName === "ARTICLE" || target.getAttribute("role") === "button") break;
      }
      target.style.display = "none";
      target.setAttribute("data-ig-no-reels-hidden", "true");
    }
  }

  // ---------------------------------------------------------------------
  // Reel viewing policy:
  //  - /reels/ (the endless algorithmic tab/feed) is always blocked.
  //  - /reel/<id>/ (a single reel, e.g. from a DM share) is allowed, but
  //    once you're on one, swiping/scrolling to a *different* reel id is
  //    blocked — IG advances by swapping the URL under you via pushState,
  //    so we detect that id change and snap back to the one you opened.
  // ---------------------------------------------------------------------

  const REELS_TAB_RE = /^\/reels\/?(?:$|[?#])/i;
  const REEL_POST_RE = /^\/reel\/([^/?#]+)/i;

  let lockedReelId = null;

  function guardReelNavigation() {
    if (REELS_TAB_RE.test(location.pathname)) {
      lockedReelId = null;
      bounceAway();
      return;
    }

    const match = location.pathname.match(REEL_POST_RE);
    if (!match) {
      lockedReelId = null; // not on a reel view at all
      return;
    }

    const id = match[1];
    if (lockedReelId === null) {
      lockedReelId = id; // first reel opened this visit - let it play
    } else if (id !== lockedReelId) {
      // Swiped/scrolled onto a different reel - snap back to the one you opened.
      if (history.length > 1) {
        history.back();
      } else {
        location.replace(`https://www.instagram.com/reel/${lockedReelId}/`);
      }
    }
  }

  function bounceAway() {
    if (history.length > 1) {
      history.back();
    } else {
      location.replace("https://www.instagram.com/");
    }
  }

  function sweep() {
    hideReelLinks(document);
    guardReelNavigation();
  }

  const observer = new MutationObserver(() => sweep());

  function start() {
    sweep();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }

  setInterval(sweep, 2000);
  window.addEventListener("popstate", sweep);
})();
