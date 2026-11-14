/**
 * Cool Lyrics - Dedicated Standalone Instagram-Style Cinema Mode
 */

(function () {
  let activeTabId = null;
  let currentTrack = null;
  let lyricsData = null;
  let activeIndex = -1;
  let activeWordIndex = -1;
  let userOffset = 0;
  
  let currentVibe = 'reel';
  let displayMode = 'insta'; // 'insta' or 'waterfall'

  let isUserScrolling = false;
  let scrollResumeTimer = null;
  let idleTimer = null;

  // DOM Elements
  const instaStage = document.getElementById('cinema-insta-stage');
  const linePrevEl = document.getElementById('cinema-line-prev');
  const lineActiveEl = document.getElementById('cinema-line-active');
  const lineNextEl = document.getElementById('cinema-line-next');
  const radialGlow = document.getElementById('cinema-radial-glow');

  const stage = document.getElementById('lyrics-stage');
  const linesWrapper = document.getElementById('lines-wrapper');
  const emptyState = document.getElementById('empty-state');
  const topBar = document.querySelector('.cl-top-bar');
  const dock = document.querySelector('.cl-dock');
  const sourceBadge = document.getElementById('source-badge');

  const dockArt = document.getElementById('dock-art');
  const dockTitle = document.getElementById('dock-title');
  const dockArtist = document.getElementById('dock-artist');
  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');
  const scrubber = document.getElementById('scrubber');
  const scrubberFill = document.getElementById('scrubber-fill');

  const btnPrev = document.getElementById('btn-prev');
  const btnPlay = document.getElementById('btn-play');
  const btnNext = document.getElementById('btn-next');
  const playIcon = document.getElementById('play-icon');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  const btnModeToggle = document.getElementById('btn-mode-toggle');
  const cinemaModeIcon = document.getElementById('cinema-mode-icon');
  const cinemaModeLabel = document.getElementById('cinema-mode-label');

  const syncMinus = document.getElementById('sync-minus');
  const syncPlus = document.getElementById('sync-plus');
  const syncReset = document.getElementById('sync-reset');
  const syncVal = document.getElementById('sync-val');

  function init() {
    bindEvents();
    requestInitialState();
    listenForMessages();
    resetIdleTimer();
  }

  function bindEvents() {
    // Vibe buttons
    document.querySelectorAll('.cl-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setVibe(btn.dataset.vibe);
      });
    });

    // Display mode toggle (Insta vs Waterfall)
    btnModeToggle.addEventListener('click', toggleDisplayMode);

    // Fullscreen & Hotkeys
    btnFullscreen.addEventListener('click', toggleFullscreen);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'v' || e.key === 'V') {
        toggleDisplayMode();
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        sendMediaAction('TOGGLE_PLAY');
      }
    });

    // Playback buttons
    btnPlay.addEventListener('click', () => sendMediaAction('TOGGLE_PLAY'));
    btnPrev.addEventListener('click', () => sendMediaAction('PREV_TRACK'));
    btnNext.addEventListener('click', () => sendMediaAction('NEXT_TRACK'));

    // Scrubber click
    scrubber.addEventListener('click', (e) => {
      if (!currentTrack || !currentTrack.duration) return;
      const rect = scrubber.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetTime = pos * currentTrack.duration;
      sendMediaAction('SEEK', { time: targetTime });
    });

    // Offset tuner
    syncMinus.addEventListener('click', () => adjustOffset(-0.5));
    syncPlus.addEventListener('click', () => adjustOffset(0.5));
    syncReset.addEventListener('click', () => setOffset(0));

    // Manual scroll pause for waterfall
    stage.addEventListener('wheel', () => {
      isUserScrolling = true;
      clearTimeout(scrollResumeTimer);
      scrollResumeTimer = setTimeout(() => {
        isUserScrolling = false;
        scrollToActive(true);
      }, 3500);
    }, { passive: true });

    // Idle auto-hide
    window.addEventListener('mousemove', resetIdleTimer);
  }

  function resetIdleTimer() {
    topBar.classList.remove('idle-fade');
    dock.classList.remove('idle-fade');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      topBar.classList.add('idle-fade');
      dock.classList.add('idle-fade');
    }, 3000);
  }

  function setVibe(vibe) {
    currentVibe = vibe;
    document.body.className = `cl-vibe-${vibe}`;

    document.querySelectorAll('.cl-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.vibe === vibe);
    });

    if (vibe === 'classic') {
      setDisplayMode('waterfall');
    }
  }

  function toggleDisplayMode() {
    setDisplayMode(displayMode === 'insta' ? 'waterfall' : 'insta');
  }

  function setDisplayMode(mode) {
    displayMode = mode;
    if (mode === 'insta') {
      instaStage.style.display = 'flex';
      stage.style.display = 'none';
      cinemaModeIcon.textContent = '✨';
      cinemaModeLabel.textContent = 'Insta Mode';
    } else {
      instaStage.style.display = 'none';
      stage.style.display = 'flex';
      cinemaModeIcon.textContent = '📜';
      cinemaModeLabel.textContent = 'Waterfall';
      scrollToActive(false);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function adjustOffset(delta) {
    setOffset(Math.round((userOffset + delta) * 10) / 10);
  }

  function setOffset(val) {
    userOffset = val;
    syncVal.textContent = `${val > 0 ? '+' : ''}${val.toFixed(1)}s`;
    syncVal.style.color = val === 0 ? 'rgba(255,255,255,0.7)' : 'var(--accent-color)';
  }

  function requestInitialState() {
    chrome.runtime.sendMessage({ action: 'GET_ACTIVE_SESSION' }, (res) => {
      if (res && res.track) {
        handleTrackUpdate(res.track, res.lyrics);
      }
    });
  }

  function listenForMessages() {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'TRACK_CHANGED') {
        handleTrackUpdate(msg.track, msg.lyrics);
      } else if (msg.action === 'PLAYBACK_TICK') {
        handlePlaybackTick(msg.state);
      }
    });
  }

  function handleTrackUpdate(track, lyrics) {
    currentTrack = track;
    dockTitle.textContent = track.title || 'Unknown Title';
    dockArtist.textContent = track.artist || 'Unknown Artist';
    sourceBadge.textContent = track.platform ? `Playing from ${track.platform}` : 'Connected';

    if (track.artwork) {
      dockArt.src = track.artwork;
    }

    // Auto-detect Instagram vibe
    if (typeof GenreDetector !== 'undefined') {
      const autoVibe = GenreDetector.detectVibe(track.artist, track.title);
      setVibe(autoVibe);
    }

    if (lyrics) {
      lyricsData = lyrics;
      renderLyrics(lyrics);
    } else {
      fetchLyricsForTrack(track);
    }
  }

  async function fetchLyricsForTrack(track) {
    emptyState.style.display = 'flex';
    emptyState.querySelector('.cl-empty-title').textContent = 'Searching lyrics...';
    emptyState.querySelector('.cl-empty-subtitle').textContent = `${track.title} • ${track.artist}`;
    linesWrapper.innerHTML = '';
    lineActiveEl.innerHTML = '<span class="cl-word active">...</span>';

    try {
      const res = await LyricsAPI.fetchLyrics({
        track: track.title,
        artist: track.artist,
        duration: track.duration
      });

      if (res && res.syncedLyrics) {
        lyricsData = LrcParser.parse(res.syncedLyrics);
      } else if (res && res.plainLyrics) {
        lyricsData = LrcParser.parse(res.plainLyrics);
      } else {
        lyricsData = { lines: [], isSynced: false, instrumental: res?.instrumental || false };
      }

      renderLyrics(lyricsData);
    } catch (e) {
      renderLyrics(null);
    }
  }

  function renderLyrics(data) {
    linesWrapper.innerHTML = '';
    activeIndex = -1;
    activeWordIndex = -1;

    if (!data || !data.lines || data.lines.length === 0) {
      const msg = data && data.instrumental
        ? '♪ Instrumental Track ♪'
        : 'No lyrics available';
      emptyState.style.display = 'flex';
      emptyState.querySelector('.cl-empty-title').textContent = msg;
      emptyState.querySelector('.cl-empty-subtitle').textContent = 'Enjoy the rhythm';

      lineActiveEl.innerHTML = `<span class="cl-word active">${msg}</span>`;
      linePrevEl.textContent = '';
      lineNextEl.textContent = '';
      return;
    }

    emptyState.style.display = 'none';

    const frag = document.createDocumentFragment();
    data.lines.forEach((line, idx) => {
      const el = document.createElement('div');
      el.className = 'cl-line-item';
      el.dataset.index = idx;
      el.textContent = line.text;

      el.addEventListener('click', () => {
        sendMediaAction('SEEK', { time: line.time });
      });

      frag.appendChild(el);
    });

    linesWrapper.appendChild(frag);
  }

  function handlePlaybackTick(state) {
    if (!state) return;

    // Time & Scrubber
    timeCurrent.textContent = LrcParser.formatTime(state.currentTime);
    if (state.duration > 0) {
      timeTotal.textContent = LrcParser.formatTime(state.duration);
      const pct = Math.min(100, Math.max(0, (state.currentTime / state.duration) * 100));
      scrubberFill.style.width = `${pct}%`;
    }

    // Play/Pause icon
    if (state.isPaused) {
      playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    } else {
      playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    }

    if (!lyricsData || !lyricsData.lines || !lyricsData.isSynced) return;

    // 1. Instagram-Style Multi-Word Context Update
    const ctx = LrcParser.getLyricsContext(lyricsData.lines, state.currentTime, userOffset);
    if (ctx) {
      renderInstaCinemaLyrics(ctx);
    }

    // 2. Waterfall active line update
    const idx = ctx ? ctx.lineIndex : LrcParser.getActiveIndex(lyricsData.lines, state.currentTime, userOffset);
    if (idx !== activeIndex) {
      setActiveLine(idx);
    }
  }

  function renderInstaCinemaLyrics(ctx) {
    const { lineIndex, activeWordIndex: newWordIdx, currentLine, prevLine, nextLine } = ctx;

    // Line change
    if (lineIndex !== activeIndex) {
      activeIndex = lineIndex;
      activeWordIndex = -1;

      linePrevEl.textContent = prevLine ? prevLine.text : '';
      lineNextEl.textContent = nextLine ? nextLine.text : '';

      lineActiveEl.innerHTML = '';
      const words = currentLine.words || [{ word: currentLine.text, time: currentLine.time }];
      
      words.forEach((wObj, idx) => {
        const span = document.createElement('span');
        span.className = 'cl-word';
        span.dataset.index = idx;
        span.textContent = wObj.word;

        span.addEventListener('click', (e) => {
          e.stopPropagation();
          sendMediaAction('SEEK', { time: wObj.time });
        });

        lineActiveEl.appendChild(span);
      });
    }

    // Word change
    if (newWordIdx !== activeWordIndex) {
      activeWordIndex = newWordIdx;

      const spans = lineActiveEl.querySelectorAll('.cl-word');
      spans.forEach((span, idx) => {
        span.classList.remove('active', 'passed', 'upcoming');
        if (idx < newWordIdx) {
          span.classList.add('passed');
        } else if (idx === newWordIdx) {
          span.classList.add('active');
        } else {
          span.classList.add('upcoming');
        }
      });

      if (radialGlow) {
        radialGlow.classList.remove('cl-glow-pulse');
        void radialGlow.offsetWidth;
        radialGlow.classList.add('cl-glow-pulse');
      }
    }
  }

  function setActiveLine(idx) {
    const oldEl = linesWrapper.querySelector(`.cl-line-item[data-index="${activeIndex}"]`);
    if (oldEl) oldEl.classList.remove('active');

    if (idx < 0) return;

    const newEl = linesWrapper.querySelector(`.cl-line-item[data-index="${idx}"]`);
    if (newEl) {
      newEl.classList.add('active');
      if (displayMode === 'waterfall' && !isUserScrolling) {
        scrollToActive(true);
      }
    }
  }

  function scrollToActive(smooth = true) {
    if (activeIndex < 0) return;
    const target = linesWrapper.querySelector(`.cl-line-item[data-index="${activeIndex}"]`);
    if (target) {
      target.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'center'
      });
    }
  }

  function sendMediaAction(action, data = {}) {
    chrome.runtime.sendMessage({
      action: 'MEDIA_COMMAND',
      command: action,
      data
    });
  }

  init();
})();
