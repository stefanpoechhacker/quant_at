// ==UserScript==
// @name         YouTube — Hide Shorts
// @namespace    youtube-declutter
// @version      1.0.0
// @description  Hides the Shorts tab, Shorts shelves, and individual Shorts tiles on YouTube's mobile website. Lets a directly opened/shared Short play, but blocks swiping/scrolling onward into the next one.
// @author       you
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // YouTube's internal component tag names (ytd-* on the responsive/desktop
  // layout, ytm-* on the dedicated mobile site) drift less often than CSS
  // classes, so hiding is keyed off those plus href patterns. If Shorts
  // start slipping through, this is the file to edit — matching an extra
  // tag name here is harmless even if it never actually occurs on the page.
  // ---------------------------------------------------------------------

  const HIDE_CSS = `
    /* Shorts tab / pivot bar entry (links to exactly /shorts) */
    a[href="/shorts"], a[href="/shorts/"] { display: none !important; }

    /* Known Shorts shelf/tile component tags */
    ytd-reel-shelf-renderer,
    ytm-reel-shelf-renderer,
    ytd-rich-shelf-renderer[is-shorts],
    ytd-rich-section-renderer:has(ytd-reel-shelf-renderer),
    ytm-shorts-lockup-view-model,
    ytm-shorts-lockup-view-model-v2,
    ytd-shorts-lockup-view-model,
    [is-shorts] { display: none !important; }
  `;

  function injectCss() {
    const style = document.createElement("style");
    style.id = "yt-no-shorts-style";
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
  // JS pass: catches Shorts tiles mixed into the home feed / search results,
  // whose containing card has no Shorts-specific tag of its own — only the
  // inner link does.
  // ---------------------------------------------------------------------

  // Stop the ancestor walk as soon as we hit a component wrapper, instead of
  // hopping a fixed number of levels (a fixed hop count once hid an entire
  // Instagram nav bar instead of a single icon — same risk applies here).
  const COMPONENT_TAG_RE = /^(YTD|YTM)-.*(RENDERER|MODEL)$/;

  const NAV_SELECTOR =
    'ytm-pivot-bar-item-renderer, tp-yt-paper-tab, #guide, ytd-mini-guide-renderer, ytd-guide-entry-renderer, #masthead';

  function hideShortsLinks(root) {
    const links = root.querySelectorAll('a[href^="/shorts"]');
    for (const link of links) {
      const path = new URL(link.href, location.origin).pathname;
      if (!/^\/shorts(\/|$)/.test(path)) continue;

      const isTabLink = path === "/shorts" || path === "/shorts/";
      if (isTabLink || link.closest(NAV_SELECTOR)) {
        link.style.display = "none";
        link.setAttribute("data-yt-no-shorts-hidden", "true");
        continue;
      }

      // Individual Shorts tile: walk up to the enclosing component.
      let target = link;
      let hops = 0;
      while (target.parentElement && hops < 8) {
        target = target.parentElement;
        hops++;
        if (COMPONENT_TAG_RE.test(target.tagName)) break;
      }
      target.style.display = "none";
      target.setAttribute("data-yt-no-shorts-hidden", "true");
    }
  }

  // ---------------------------------------------------------------------
  // Playback policy: a Short you open directly (shared link, or one that
  // slipped through hiding) still plays. YouTube advances between Shorts by
  // swapping the URL under you via pushState as you swipe/scroll — so we
  // lock onto the first id seen and snap back if it changes.
  // ---------------------------------------------------------------------

  const SHORT_RE = /^\/shorts\/([^/?#]+)/i;
  let lockedShortId = null;

  function guardShortsNavigation() {
    const match = location.pathname.match(SHORT_RE);
    if (!match) {
      lockedShortId = null;
      return;
    }

    const id = match[1];
    if (lockedShortId === null) {
      lockedShortId = id;
    } else if (id !== lockedShortId) {
      if (history.length > 1) {
        history.back();
      } else {
        location.replace(`https://www.youtube.com/shorts/${lockedShortId}`);
      }
    }
  }

  function sweep() {
    hideShortsLinks(document);
    guardShortsNavigation();
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
