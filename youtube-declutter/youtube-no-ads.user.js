// ==UserScript==
// @name         YouTube — Hide Ads
// @namespace    youtube-declutter
// @version      1.0.0
// @description  Hides display/banner ads on YouTube and auto-skips or fast-forwards through video ads. Client-side only — see the README for what this can't do.
// @author       you
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // This only acts on ads already delivered to the page/player — it can't
  // stop the ad request itself (that needs a real network-level content
  // blocker, see the README). Two things it does:
  //  1. CSS-hides known display/banner/overlay ad components.
  //  2. Watches the video player and skips or fast-forwards video ads.
  // ---------------------------------------------------------------------

  const HIDE_CSS = `
    ytd-display-ad-renderer,
    ytd-promoted-sparkles-web-renderer,
    ytd-promoted-video-renderer,
    ytd-in-feed-ad-layout-renderer,
    ytd-ad-slot-renderer,
    ytd-banner-promo-renderer,
    ytd-statement-banner-renderer,
    ytd-companion-slot-renderer,
    ytm-promoted-sparkles-web-renderer,
    ytm-companion-ad-renderer,
    #masthead-ad,
    .ytp-ad-overlay-container,
    .ytp-ad-text-overlay { display: none !important; }
  `;

  function injectCss() {
    const style = document.createElement("style");
    style.id = "yt-no-ads-style";
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
  // Video ad handling: click "Skip Ad" the instant it's clickable; for
  // non-skippable ads, jump the local video playback straight to the end
  // instead of sitting through it. Restores normal playback state once the
  // ad ends.
  // ---------------------------------------------------------------------

  let savedMuted = null;
  let savedRate = 1;

  function handleVideoAds() {
    const player = document.querySelector(".html5-video-player");
    const video = player && player.querySelector("video");
    if (!player || !video) return;

    const adShowing =
      player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting");

    if (adShowing) {
      if (savedMuted === null) {
        savedMuted = video.muted;
        savedRate = video.playbackRate;
      }

      const skipBtn = document.querySelector(
        ".ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-skip-button-modern"
      );
      if (skipBtn) {
        skipBtn.click();
      } else if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = video.duration;
      }
      video.muted = true;
      video.playbackRate = 16;
    } else if (savedMuted !== null) {
      video.muted = savedMuted;
      video.playbackRate = savedRate;
      savedMuted = null;
    }
  }

  // Ads are short, so poll fairly often rather than relying only on
  // mutation events (the skip button's appearance doesn't always trigger
  // an observable DOM mutation we'd otherwise catch promptly).
  setInterval(handleVideoAds, 250);

  const observer = new MutationObserver(() => handleVideoAds());
  function start() {
    handleVideoAds();
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
})();
