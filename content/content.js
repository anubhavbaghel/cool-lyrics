/**
 * Cool Lyrics - Universal Web Player Content Script
 * Supports Spotify Web, YouTube Music, YouTube, and HTML5 media elements.
 */

(function () {
  let overlay = null;
  let currentTrackId = '';
  let cachedTrackInfo = null;
  let cachedLyrics = null;
  let isFetchingLyrics = false;
  let pillElement = null;

  // Smoothing interpolation state for Spotify
  let lastReportedTime = 0;
  let lastReportedTimestamp = 0;
  let isPausedState = true;

  function init() {
    createFloatingPill();

    // Hotkey Alt + L
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        toggleOverlay();
      }
    });

    // Start playback tracker loop (every 300ms)
    setInterval(trackPlayback, 300);

    // Listen for extension commands & messages
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'TOGGLE_OVERLAY') {
        toggleOverlay();
        sendResponse({ success: true, isVisible: overlay ? overlay.isVisible : false });
      } else if (message.action === 'GET_PLAYBACK_STATE') {
        const state = getPlayerState();
        sendResponse({
          state,
          track: cachedTrackInfo,
          lyrics: cachedLyrics
        });
      } else if (message.action === 'SEEK') {
        seekPlayer(message.time);
        sendResponse({ success: true });
      } else if (message.action === 'TOGGLE_PLAY') {
        togglePlay();
        sendResponse({ success: true });
      } else if (message.action === 'NEXT_TRACK') {
        skipTrack(true);
        sendResponse({ success: true });
      } else if (message.action === 'PREV_TRACK') {
        skipTrack(false);
        sendResponse({ success: true });
      }
      return true;
    });
  }

  function getOverlay() {
    if (!overlay) {
      overlay = new LyricsOverlay({
        onSeek: (time) => seekPlayer(time),
        onTogglePlay: () => togglePlay(),
        onNext: () => skipTrack(true),
        onPrev: () => skipTrack(false),
        onOpenCinemaTab: () => {
          chrome.runtime.sendMessage({ action: 'OPEN_CINEMA_TAB' });
        }
      });
    }
    return overlay;
  }

  function toggleOverlay() {
    const ov = getOverlay();
    ov.toggle();
    if (ov.isVisible && cachedTrackInfo) {
      ov.updateTrackInfo(cachedTrackInfo);
      if (cachedLyrics) {
        ov.updateLyrics(cachedLyrics);
      }
    }
  }

  function createFloatingPill() {
    if (document.getElementById('cool-lyrics-floating-pill')) return;

    const pill = document.createElement('div');
    pill.id = 'cool-lyrics-floating-pill';
    pill.title = 'Open Pitch Black Cinema Lyrics (Alt+L)';
    pill.innerHTML = `
      <span class="cl-pill-dot"></span>
      <span>Cool Lyrics</span>
      <span style="opacity: 0.6; font-size: 11px; margin-left: 2px;">Alt+L</span>
    `;

    pill.addEventListener('click', () => {
      toggleOverlay();
    });

    document.body.appendChild(pill);
    pillElement = pill;
  }

  // --- Platform Detection & Extraction ---

  function parseTimeString(str) {
    if (!str || typeof str !== 'string') return 0;
    const parts = str.trim().split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }

  function getPlayerState() {
    const host = window.location.hostname;

    // 1. YouTube Music
    if (host.includes('music.youtube.com')) {
      const video = document.querySelector('video');
      const titleEl = document.querySelector('ytmusic-player-bar .title');
      const bylineLinks = document.querySelectorAll('ytmusic-player-bar .byline a');
      const artworkEl = document.querySelector('ytmusic-player-bar .image');

      let artist = '';
      if (bylineLinks.length > 0) {
        artist = Array.from(bylineLinks).map(a => a.textContent.trim()).join(', ');
      } else {
        const byline = document.querySelector('ytmusic-player-bar .byline');
        artist = byline ? byline.textContent.split('•')[0].trim() : '';
      }

      const rawTitle = titleEl ? titleEl.textContent.trim() : '';
      const cleaned = TitleCleaner.clean(rawTitle, artist);

      return {
        platform: 'YouTube Music',
        title: cleaned.cleanTitle || navigator.mediaSession?.metadata?.title || '',
        artist: cleaned.cleanArtist || navigator.mediaSession?.metadata?.artist || '',
        album: navigator.mediaSession?.metadata?.album || '',
        artwork: artworkEl ? artworkEl.src : (navigator.mediaSession?.metadata?.artwork?.[0]?.src || ''),
        currentTime: video ? video.currentTime : 0,
        duration: video ? video.duration : 0,
        isPaused: video ? video.paused : true
      };
    }

    // 2. Spotify Web
    if (host.includes('open.spotify.com')) {
      const titleEl = document.querySelector('[data-testid="context-item-info-title"] a') ||
                      document.querySelector('[data-testid="now-playing-widget"] [data-testid="context-item-link"]') ||
                      document.querySelector('[data-testid="context-item-info-title"]');
      const artistEl = document.querySelector('[data-testid="context-item-info-artist"] a') ||
                       document.querySelector('[data-testid="context-item-info-subtitles"]') ||
                       document.querySelector('[data-testid="context-item-info-artist"]');
      const artworkEl = document.querySelector('[data-testid="cover-art-image"]');

      const posEl = document.querySelector('[data-testid="playback-position"]');
      const durEl = document.querySelector('[data-testid="playback-duration"]');
      const playBtn = document.querySelector('[data-testid="control-button-playpause"]');

      const rawPos = parseTimeString(posEl ? posEl.textContent : '0:00');
      const rawDur = parseTimeString(durEl ? durEl.textContent : '0:00');

      // Check if paused via aria-label of play button
      const isPaused = playBtn ? playBtn.getAttribute('aria-label') === 'Play' : true;

      // Smooth interpolation for Spotify
      const now = performance.now();
      let currentSeconds = rawPos;
      if (rawPos === lastReportedTime && !isPaused && lastReportedTimestamp > 0) {
        const elapsed = (now - lastReportedTimestamp) / 1000;
        currentSeconds = Math.min(rawDur, rawPos + elapsed);
      } else {
        lastReportedTime = rawPos;
        lastReportedTimestamp = now;
      }
      isPausedState = isPaused;

      const rawTitle = titleEl ? titleEl.textContent.trim() : '';
      const rawArtist = artistEl ? artistEl.textContent.trim() : '';
      const cleaned = TitleCleaner.clean(rawTitle, rawArtist);

      return {
        platform: 'Spotify',
        title: cleaned.cleanTitle || navigator.mediaSession?.metadata?.title || '',
        artist: cleaned.cleanArtist || navigator.mediaSession?.metadata?.artist || '',
        album: navigator.mediaSession?.metadata?.album || '',
        artwork: artworkEl ? artworkEl.src : (navigator.mediaSession?.metadata?.artwork?.[0]?.src || ''),
        currentTime: currentSeconds,
        duration: rawDur,
        isPaused: isPaused
      };
    }

    // 3. YouTube (Standard)
    if (host.includes('youtube.com')) {
      const video = document.querySelector('video');
      const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
                      document.querySelector('#title h1 yt-formatted-string');
      const channelEl = document.querySelector('#channel-name #text a') ||
                        document.querySelector('#channel-name #text');

      const rawTitle = titleEl ? titleEl.textContent.trim() : (video ? document.title.replace(' - YouTube', '') : '');
      const rawArtist = channelEl ? channelEl.textContent.trim() : '';
      const cleaned = TitleCleaner.clean(rawTitle, rawArtist);

      return {
        platform: 'YouTube',
        title: cleaned.cleanTitle || '',
        artist: cleaned.cleanArtist || '',
        album: '',
        artwork: navigator.mediaSession?.metadata?.artwork?.[0]?.src || '',
        currentTime: video ? video.currentTime : 0,
        duration: video ? video.duration : 0,
        isPaused: video ? video.paused : true
      };
    }

    // 4. Fallback Generic HTML5 Audio/Video
    const mediaEl = document.querySelector('audio, video');
    if (mediaEl && !mediaEl.paused && mediaEl.duration > 0) {
      const metadata = navigator.mediaSession?.metadata;
      const rawTitle = metadata ? metadata.title : document.title;
      const rawArtist = metadata ? metadata.artist : '';
      const cleaned = TitleCleaner.clean(rawTitle, rawArtist);

      return {
        platform: 'Web Media',
        title: cleaned.cleanTitle || 'Playing Media',
        artist: cleaned.cleanArtist || '',
        album: metadata?.album || '',
        artwork: metadata?.artwork?.[0]?.src || '',
        currentTime: mediaEl.currentTime,
        duration: mediaEl.duration,
        isPaused: mediaEl.paused
      };
    }

    return null;
  }

  // --- Controls ---

  function seekPlayer(targetTime) {
    const host = window.location.hostname;

    if (host.includes('youtube.com')) {
      const video = document.querySelector('video');
      if (video) video.currentTime = targetTime;
      return;
    }

    if (host.includes('open.spotify.com')) {
      // Look for Spotify progressbar slider
      const progressBar = document.querySelector('[data-testid="playback-progressbar"]');
      if (progressBar && cachedTrackInfo && cachedTrackInfo.duration > 0) {
        const rect = progressBar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, targetTime / cachedTrackInfo.duration));
        const clickX = rect.left + rect.width * pct;
        const clickY = rect.top + rect.height / 2;

        const evtDown = new MouseEvent('mousedown', { bubbles: true, clientX: clickX, clientY: clickY });
        const evtUp = new MouseEvent('mouseup', { bubbles: true, clientX: clickX, clientY: clickY });
        const evtClick = new MouseEvent('click', { bubbles: true, clientX: clickX, clientY: clickY });

        progressBar.dispatchEvent(evtDown);
        progressBar.dispatchEvent(evtUp);
        progressBar.dispatchEvent(evtClick);
      }
    }
  }

  function togglePlay() {
    const host = window.location.hostname;
    if (host.includes('open.spotify.com')) {
      const btn = document.querySelector('[data-testid="control-button-playpause"]');
      if (btn) btn.click();
      return;
    }

    const video = document.querySelector('video');
    if (video) {
      if (video.paused) video.play();
      else video.pause();
    }
  }

  function skipTrack(isNext) {
    const host = window.location.hostname;
    if (host.includes('open.spotify.com')) {
      const selector = isNext
        ? '[data-testid="control-button-skip-forward"]'
        : '[data-testid="control-button-skip-back"]';
      const btn = document.querySelector(selector);
      if (btn) btn.click();
      return;
    }

    if (host.includes('music.youtube.com')) {
      const selector = isNext ? '.next-button' : '.previous-button';
      const btn = document.querySelector(selector);
      if (btn) btn.click();
      return;
    }

    if (host.includes('youtube.com')) {
      const selector = isNext ? '.ytp-next-button' : '.ytp-prev-button';
      const btn = document.querySelector(selector);
      if (btn) btn.click();
    }
  }

  // --- Playback Monitor Loop ---

  async function trackPlayback() {
    const state = getPlayerState();
    if (!state || !state.title) {
      if (pillElement) pillElement.style.display = 'none';
      return;
    }

    if (pillElement) pillElement.style.display = 'flex';

    const trackId = `${state.artist || ''} - ${state.title}`.toLowerCase();
    cachedTrackInfo = state;

    // Check if track changed
    if (trackId !== currentTrackId && !isFetchingLyrics) {
      currentTrackId = trackId;
      cachedLyrics = null;

      if (overlay) {
        overlay.updateTrackInfo(state);
        overlay.updateLyrics(null);
      }

      isFetchingLyrics = true;
      try {
        const rawResult = await LyricsAPI.fetchLyrics({
          track: state.title,
          artist: state.artist,
          duration: state.duration,
          album: state.album
        });

        if (rawResult && rawResult.syncedLyrics) {
          cachedLyrics = LrcParser.parse(rawResult.syncedLyrics);
        } else if (rawResult && rawResult.plainLyrics) {
          cachedLyrics = LrcParser.parse(rawResult.plainLyrics);
        } else {
          cachedLyrics = { lines: [], isSynced: false, instrumental: rawResult?.instrumental || false };
        }

        if (overlay) {
          overlay.updateLyrics(cachedLyrics);
        }

        // Notify background worker
        chrome.runtime.sendMessage({
          action: 'TRACK_CHANGED',
          track: state,
          lyrics: cachedLyrics
        }).catch(() => {});
      } catch (err) {
        console.warn('[CoolLyrics] Failed to fetch lyrics:', err);
      } finally {
        isFetchingLyrics = false;
      }
    }

    // Always update progress & sync position in overlay if visible
    if (overlay && overlay.isVisible) {
      overlay.updateProgress({
        currentTime: state.currentTime,
        duration: state.duration,
        isPaused: state.isPaused
      });
    }

    // Sync broadcast to background for cinema tabs/popup
    chrome.runtime.sendMessage({
      action: 'PLAYBACK_TICK',
      state: {
        currentTime: state.currentTime,
        duration: state.duration,
        isPaused: state.isPaused,
        title: state.title,
        artist: state.artist,
        artwork: state.artwork,
        trackId: currentTrackId
      }
    }).catch(() => {});
  }

  init();
})();
