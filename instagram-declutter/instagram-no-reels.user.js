// ==UserScript==
// @name         Instagram — Hide Reels
// @namespace    instagram-declutter
// @version      1.0.1
// @description  Hides the Reels tab, Reels tray, and individual Reels posts on the Instagram mobile website. Also bounces you away if you land on a /reel(s)/ URL directly.
// @author       you
// @match        https://www.instagram.com/*
// @match        https://instagram.com/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // If Instagram changes its markup, this is the file to edit. Everything
  // is expressed as CSS/href/aria-label patterns rather than generated
  // class names, since IG's class names are obfuscated and rotate often
  // but hrefs and aria-labels stay comparatively stable.
  // ---------------------------------------------------------------------

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

  if (typeof GM_addStyle === "function") {
    GM_addStyle(HIDE_CSS);
  } else if (document.head) {
    injectCss();
  } else {
    document.addEventListener("DOMContentLoaded", injectCss, { once: true });
  }

  // ---------------------------------------------------------------------
  // JS pass: catches things pure CSS can't (reel posts mixed into the
  // main feed / explore grid, whose *containing* card has no reel-specific
  // attribute of its own — only the inner link does).
  // ---------------------------------------------------------------------

  // How many ancestor levels to walk up from a matching <a> before hiding.
  // Feed/explore cards are usually a handful of wrapper divs up from the
  // link; tune this if reel cards stop disappearing or too much disappears.
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

  function sweep() {
    hideReelLinks(document);
    bounceIfOnReelPage();
  }

  function bounceIfOnReelPage() {
    if (REEL_HREF_RE.test(location.pathname)) {
      if (history.length > 1) {
        history.back();
      } else {
        location.replace("https://www.instagram.com/");
      }
    }
  }

  // Initial + ongoing sweeps: IG is a single-page app that streams content
  // in as you scroll, so a one-shot run at load isn't enough.
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

  // Belt-and-suspenders: also re-check periodically and on SPA navigation,
  // since some route changes don't trigger a DOM mutation we catch.
  setInterval(sweep, 2000);
  window.addEventListener("popstate", sweep);
})();
