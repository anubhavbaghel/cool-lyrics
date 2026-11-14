/**
 * Cool Lyrics - In-Page Systematic Constellation Scatter & Cinema Overlay
 * Spreads words across the screen systematically while smoothly fading older words.
 */

class LyricsOverlay {
  constructor(options = {}) {
    this.onSeek = options.onSeek || (() => {});
    this.onTogglePlay = options.onTogglePlay || (() => {});
    this.onNext = options.onNext || (() => {});
    this.onPrev = options.onPrev || (() => {});
    this.onOpenCinemaTab = options.onOpenCinemaTab || (() => {});

    this.isVisible = false;
    this.currentTrack = null;
    this.lyricsData = null;
    this.activeLineIndex = -1;
    this.activeWordIndex = -1;
    this.currentWordText = '';
    this.userOffset = 0;
    
    this.displayMode = 'scatter'; // 'scatter' (Constellation Canvas) or 'waterfall' (Classic Scroll)
    this.currentVibe = 'reel';    // 'reel', 'slanted', 'editorial', 'cyber', 'classic'
    
    // Constellation history: array of { el, word, time, age, zoneIdx }
    this.scatterWords = [];
    this.lastZoneIndices = [];
    this.MAX_ACTIVE_WORDS = 7;

    this.idleTimer = null;
    this.isUserScrolling = false;
    this.userScrollResumeTimer = null;

    this.initDOM();
  }

  initDOM() {
    if (document.getElementById('cool-lyrics-root')) return;

    const root = document.createElement('div');
    root.id = 'cool-lyrics-root';
    root.className = `cl-vibe-${this.currentVibe}`;
    root.innerHTML = `
      <div class="cl-bg-layer">
        <div class="cl-bg-glow" id="cl-radial-glow"></div>
      </div>

      <!-- Header -->
      <header class="cl-header">
        <div class="cl-track-info">
          <img class="cl-artwork" src="" alt="Album Art" style="display: none;" />
          <div class="cl-track-meta">
            <span class="cl-track-title">Ready for music...</span>
            <span class="cl-track-artist">Play a song to see lyrics</span>
          </div>
        </div>

        <div class="cl-header-actions">
          <!-- Vibe Selector -->
          <div class="cl-vibe-pill-group" id="cl-vibe-selector">
            <button class="cl-vibe-pill active" data-vibe="reel">📸 Reel</button>
            <button class="cl-vibe-pill" data-vibe="slanted">💥 Drill</button>
            <button class="cl-vibe-pill" data-vibe="editorial">🍷 Vinyl</button>
            <button class="cl-vibe-pill" data-vibe="cyber">⚡ Matrix</button>
            <button class="cl-vibe-pill" data-vibe="classic">📜 Scroll</button>
          </div>

          <button class="cl-btn" id="cl-btn-mode" title="Toggle Display Mode (V)">
            <span id="cl-mode-icon">🌌</span> <span id="cl-mode-text">Scatter Canvas</span>
          </button>
          <button class="cl-btn cl-btn-icon" id="cl-btn-popout" title="Standalone Window">
            <span>⧉</span>
          </button>
          <button class="cl-btn cl-btn-icon" id="cl-btn-fullscreen" title="Fullscreen (F)">
            <span>⛶</span>
          </button>
          <button class="cl-btn cl-btn-icon" id="cl-btn-close" title="Close (Esc or Alt+L)">
            <span>✕</span>
          </button>
        </div>
      </header>

      <!-- Stage 1: Systematic Constellation Scatter Stage -->
      <main class="cl-constellation-stage" id="cl-constellation-stage"></main>

      <!-- Bottom Linear Context Subbar -->
      <div class="cl-sentence-subbar" id="cl-sentence-subbar">
        <span class="cl-sentence-badge">NOW</span>
        <span id="cl-subbar-text">Play a song to start lyrics</span>
      </div>

      <!-- Stage 2: Classic Waterfall Scroll Container -->
      <main class="cl-lyrics-container" id="cl-lyrics-scroll" style="display: none;">
        <div class="cl-status-view">
          <div class="cl-spinner"></div>
          <span>Waiting for track to start...</span>
        </div>
      </main>

      <!-- Footer Dock -->
      <footer class="cl-footer">
        <div class="cl-progress-wrapper">
          <span class="cl-time-label" id="cl-current-time">00:00</span>
          <div class="cl-progress-track" id="cl-progress-bar">
            <div class="cl-progress-fill" id="cl-progress-fill"></div>
          </div>
          <span class="cl-time-label" id="cl-duration">00:00</span>
        </div>

        <div class="cl-controls-row">
          <div class="cl-offset-tuner">
            <span>Sync:</span>
            <button class="cl-offset-btn" id="cl-offset-minus">-0.5s</button>
            <span id="cl-offset-val">0.0s</span>
            <button class="cl-offset-btn" id="cl-offset-plus">+0.5s</button>
            <button class="cl-offset-btn" id="cl-offset-reset" title="Reset offset">↺</button>
          </div>

          <div class="cl-media-buttons">
            <button class="cl-btn cl-btn-icon" id="cl-btn-prev" title="Previous Track">⏮</button>
            <button class="cl-play-btn" id="cl-btn-play" title="Play/Pause">▶</button>
            <button class="cl-btn cl-btn-icon" id="cl-btn-next" title="Next Track">⏭</button>
          </div>

          <div style="font-size: 0.8rem; color: rgba(255,255,255,0.4);">
            <kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">V</kbd> Mode &nbsp;•&nbsp; <kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">Esc</kbd> Exit
          </div>
        </div>
      </footer>
    `;

    document.body.appendChild(root);
    this.root = root;

    // Elements
    this.header = root.querySelector('.cl-header');
    this.footer = root.querySelector('.cl-footer');
    this.constellationStage = root.querySelector('#cl-constellation-stage');
    this.sentenceSubbar = root.querySelector('#cl-sentence-subbar');
    this.subbarText = root.querySelector('#cl-subbar-text');
    this.radialGlow = root.querySelector('#cl-radial-glow');

    this.lyricsContainer = root.querySelector('#cl-lyrics-scroll');
    this.artworkImg = root.querySelector('.cl-artwork');
    this.titleEl = root.querySelector('.cl-track-title');
    this.artistEl = root.querySelector('.cl-track-artist');
    this.currentTimeEl = root.querySelector('#cl-current-time');
    this.durationEl = root.querySelector('#cl-duration');
    this.progressBar = root.querySelector('#cl-progress-bar');
    this.progressFill = root.querySelector('#cl-progress-fill');
    this.playBtn = root.querySelector('#cl-btn-play');
    this.offsetVal = root.querySelector('#cl-offset-val');
    this.modeBtn = root.querySelector('#cl-btn-mode');
    this.modeIcon = root.querySelector('#cl-mode-icon');
    this.modeText = root.querySelector('#cl-mode-text');

    this.bindEvents();
  }

  bindEvents() {
    this.root.querySelector('#cl-btn-close').addEventListener('click', () => this.hide());
    this.root.querySelector('#cl-btn-popout').addEventListener('click', () => this.onOpenCinemaTab());
    this.root.querySelector('#cl-btn-fullscreen').addEventListener('click', () => this.toggleFullscreen());

    // Playback buttons
    this.playBtn.addEventListener('click', () => this.onTogglePlay());
    this.root.querySelector('#cl-btn-prev').addEventListener('click', () => this.onPrev());
    this.root.querySelector('#cl-btn-next').addEventListener('click', () => this.onNext());

    // Mode toggle
    this.modeBtn.addEventListener('click', () => this.toggleDisplayMode());

    // Vibe buttons
    this.root.querySelectorAll('.cl-vibe-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setVibe(btn.dataset.vibe);
      });
    });

    // Offset tuner
    this.root.querySelector('#cl-offset-minus').addEventListener('click', () => this.adjustOffset(-0.5));
    this.root.querySelector('#cl-offset-plus').addEventListener('click', () => this.adjustOffset(0.5));
    this.root.querySelector('#cl-offset-reset').addEventListener('click', () => this.setOffset(0));

    // Progress bar seeking
    this.progressBar.addEventListener('click', (e) => {
      if (!this.currentTrack || !this.currentTrack.duration) return;
      const rect = this.progressBar.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.onSeek(pos * this.currentTrack.duration);
    });

    // Manual scroll pause for waterfall
    this.lyricsContainer.addEventListener('wheel', () => {
      this.isUserScrolling = true;
      clearTimeout(this.userScrollResumeTimer);
      this.userScrollResumeTimer = setTimeout(() => {
        this.isUserScrolling = false;
        this.scrollToActiveLine(true);
      }, 3500);
    }, { passive: true });

    // Idle auto-hide
    this.root.addEventListener('mousemove', () => this.resetIdleTimer());

    // Hotkeys inside overlay
    window.addEventListener('keydown', (e) => {
      if (!this.isVisible) return;
      if (e.key === 'Escape') {
        this.hide();
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        this.onTogglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      } else if (e.key === 'v' || e.key === 'V') {
        this.toggleDisplayMode();
      }
    });
  }

  setVibe(vibe) {
    this.currentVibe = vibe;
    this.root.className = `cl-visible cl-vibe-${vibe}`;

    this.root.querySelectorAll('.cl-vibe-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.vibe === vibe);
    });

    if (vibe === 'classic') {
      this.setDisplayMode('waterfall');
    }
  }

  toggleDisplayMode() {
    this.setDisplayMode(this.displayMode === 'scatter' ? 'waterfall' : 'scatter');
  }

  setDisplayMode(mode) {
    this.displayMode = mode;
    if (mode === 'scatter') {
      this.constellationStage.style.display = 'block';
      this.sentenceSubbar.style.display = 'flex';
      this.lyricsContainer.style.display = 'none';
      this.modeIcon.textContent = '🌌';
      this.modeText.textContent = 'Scatter Canvas';
    } else {
      this.constellationStage.style.display = 'none';
      this.sentenceSubbar.style.display = 'none';
      this.lyricsContainer.style.display = 'flex';
      this.modeIcon.textContent = '📜';
      this.modeText.textContent = 'Waterfall';
      this.scrollToActiveLine(false);
    }
  }

  resetIdleTimer() {
    this.header.classList.remove('cl-idle-hidden');
    this.footer.classList.remove('cl-idle-hidden');
    this.sentenceSubbar.style.opacity = '1';
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.isVisible) {
        this.header.classList.add('cl-idle-hidden');
        this.footer.classList.add('cl-idle-hidden');
        this.sentenceSubbar.style.opacity = '0';
      }
    }, 2800);
  }

  show() {
    this.isVisible = true;
    this.root.classList.add('cl-visible');
    this.resetIdleTimer();
    if (this.displayMode === 'waterfall') {
      this.scrollToActiveLine(false);
    }
  }

  hide() {
    this.isVisible = false;
    this.root.classList.remove('cl-visible');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.root.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  adjustOffset(delta) {
    this.setOffset(Math.round((this.userOffset + delta) * 10) / 10);
  }

  setOffset(val) {
    this.userOffset = val;
    this.offsetVal.textContent = `${val > 0 ? '+' : ''}${val.toFixed(1)}s`;
    this.offsetVal.style.color = val === 0 ? 'rgba(255,255,255,0.6)' : 'var(--cl-accent)';
  }

  updateTrackInfo(track) {
    this.currentTrack = track;
    if (!track) return;

    this.titleEl.textContent = track.title || 'Unknown Title';
    this.artistEl.textContent = track.artist || 'Unknown Artist';

    if (track.artwork) {
      this.artworkImg.src = track.artwork;
      this.artworkImg.style.display = 'block';
    } else {
      this.artworkImg.style.display = 'none';
    }

    this.durationEl.textContent = LrcParser.formatTime(track.duration || 0);

    if (typeof GenreDetector !== 'undefined') {
      const autoVibe = GenreDetector.detectVibe(track.artist, track.title);
      this.setVibe(autoVibe);
    }
  }

  updateLyrics(lyricsResult) {
    this.lyricsData = lyricsResult;
    this.lyricsContainer.innerHTML = '';
    this.constellationStage.innerHTML = '';
    this.scatterWords = [];
    this.lastZoneIndices = [];
    this.activeLineIndex = -1;
    this.activeWordIndex = -1;
    this.currentWordText = '';

    if (!lyricsResult || !lyricsResult.lines || lyricsResult.lines.length === 0) {
      const msg = lyricsResult && lyricsResult.instrumental
        ? '♪ Instrumental Track ♪'
        : 'No synchronized lyrics found';

      this.subbarText.textContent = msg;
      this.lyricsContainer.innerHTML = `
        <div class="cl-status-view">
          <span style="font-size: 2rem;">✨</span>
          <span>${msg}</span>
        </div>
      `;
      return;
    }

    // Populate waterfall scroll
    const fragment = document.createDocumentFragment();
    lyricsResult.lines.forEach((line, idx) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'cl-line';
      lineEl.dataset.index = idx.toString();
      lineEl.dataset.time = line.time.toString();
      lineEl.textContent = line.text;

      lineEl.addEventListener('click', () => {
        this.onSeek(line.time);
      });

      fragment.appendChild(lineEl);
    });

    this.lyricsContainer.appendChild(fragment);
  }

  updateProgress({ currentTime, duration, isPaused }) {
    this.currentTimeEl.textContent = LrcParser.formatTime(currentTime || 0);
    if (duration > 0) {
      const pct = Math.min(100, Math.max(0, (currentTime / duration) * 100));
      this.progressFill.style.width = `${pct}%`;
      this.durationEl.textContent = LrcParser.formatTime(duration);
    }

    this.playBtn.textContent = isPaused ? '▶' : '⏸';

    if (!this.lyricsData || !this.lyricsData.lines || !this.lyricsData.isSynced) return;

    // Fetch multi-line & word context
    const ctx = LrcParser.getLyricsContext(this.lyricsData.lines, currentTime, this.userOffset);
    if (ctx) {
      this.renderConstellationWord(ctx);
    }

    // Waterfall active line update
    const lineIdx = ctx ? ctx.lineIndex : LrcParser.getActiveIndex(this.lyricsData.lines, currentTime, this.userOffset);
    if (lineIdx !== this.activeLineIndex) {
      this.setActiveLine(lineIdx);
    }
  }

  /**
   * Systematic Constellation Scatter Engine:
   * Selects an aesthetic non-colliding zone across the full screen,
   * adds organic jitter, and smoothly fades older words into the dark abyss.
   */
  renderConstellationWord(ctx) {
    const { currentWord, currentLine, activeWordIndex, lineIndex } = ctx;
    const cleanWord = currentWord.trim();
    if (!cleanWord) return;

    // Word key to avoid re-triggering during the same word's duration
    const wordKey = `${lineIndex}:${activeWordIndex}:${cleanWord}`;
    if (wordKey === this.currentWordText) return;
    this.currentWordText = wordKey;

    // Update bottom linear phrase subbar
    this.subbarText.textContent = currentLine.text;

    // 1. Age existing words on screen and fade them out progressively
    for (let i = this.scatterWords.length - 1; i >= 0; i--) {
      const item = this.scatterWords[i];
      item.age += 1;
      item.el.className = `cl-scatter-word age-${Math.min(5, item.age)}`;

      // Slight natural drift as words fade
      const currentRot = item.rot || 0;
      const driftY = item.age * 6;
      item.el.style.transform = `translateY(${driftY}px) rotate(${currentRot}deg)`;

      // If word has reached age 5, remove from DOM
      if (item.age >= 5) {
        setTimeout(() => {
          if (item.el.parentNode) item.el.remove();
        }, 800);
        this.scatterWords.splice(i, 1);
      }
    }

    // 2. Systematic Zone Selection across the full 100vw x 100vh canvas
    // 14 carefully balanced spatial anchor zones that cover the full screen
    const ZONES = [
      { x: 14, y: 22 }, { x: 38, y: 19 }, { x: 62, y: 23 }, { x: 82, y: 21 },
      { x: 20, y: 38 }, { x: 45, y: 35 }, { x: 74, y: 39 },
      { x: 12, y: 55 }, { x: 36, y: 54 }, { x: 60, y: 56 }, { x: 84, y: 53 },
      { x: 22, y: 72 }, { x: 48, y: 70 }, { x: 76, y: 72 }
    ];

    // Filter out recently used zones to avoid awkward stacking
    const availableIndices = [];
    for (let i = 0; i < ZONES.length; i++) {
      if (!this.lastZoneIndices.includes(i)) {
        availableIndices.push(i);
      }
    }

    const pool = availableIndices.length > 0 ? availableIndices : [0, 1, 2, 3, 4, 5];
    const pickedIdx = pool[Math.floor(Math.random() * pool.length)];

    this.lastZoneIndices.push(pickedIdx);
    if (this.lastZoneIndices.length > 4) {
      this.lastZoneIndices.shift();
    }

    const baseZone = ZONES[pickedIdx];

    // Add organic human jitter: +/- 4% on X, +/- 3% on Y, and slight rotation (-4° to +4°)
    const jitterX = (Math.random() - 0.5) * 8;
    const jitterY = (Math.random() - 0.5) * 6;
    const finalX = Math.max(8, Math.min(84, baseZone.x + jitterX));
    const finalY = Math.max(18, Math.min(76, baseZone.y + jitterY));
    const rotation = (Math.random() - 0.5) * 8;

    // 3. Create the new Age-0 word element
    const wordEl = document.createElement('div');
    wordEl.className = 'cl-scatter-word age-0';
    wordEl.textContent = cleanWord;
    wordEl.style.left = `${finalX}vw`;
    wordEl.style.top = `${finalY}vh`;
    wordEl.style.transform = `rotate(${rotation.toFixed(1)}deg)`;

    // Click to seek to that word
    const wordTime = currentLine.words && currentLine.words[activeWordIndex] ? currentLine.words[activeWordIndex].time : currentLine.time;
    wordEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onSeek(wordTime);
    });

    this.constellationStage.appendChild(wordEl);

    // 4. Smoothly shift ambient radial aura behind the newest word
    if (this.radialGlow) {
      this.radialGlow.style.left = `${finalX}vw`;
      this.radialGlow.style.top = `${finalY}vh`;
      this.radialGlow.classList.remove('cl-glow-pulse');
      void this.radialGlow.offsetWidth;
      this.radialGlow.classList.add('cl-glow-pulse');
    }

    // Track active scatter item
    this.scatterWords.unshift({
      el: wordEl,
      word: cleanWord,
      time: wordTime,
      age: 0,
      rot: rotation,
      zoneIdx: pickedIdx
    });
  }

  setActiveLine(index) {
    const oldLine = this.lyricsContainer.querySelector(`.cl-line[data-index="${this.activeLineIndex}"]`);
    if (oldLine) oldLine.classList.remove('cl-active');

    if (index === -1) return;

    const newLine = this.lyricsContainer.querySelector(`.cl-line[data-index="${index}"]`);
    if (newLine) {
      newLine.classList.add('cl-active');
      if (this.displayMode === 'waterfall' && !this.isUserScrolling) {
        this.scrollToActiveLine(true);
      }
    }
  }

  scrollToActiveLine(smooth = true) {
    if (this.activeLineIndex < 0) return;
    const activeEl = this.lyricsContainer.querySelector(`.cl-line[data-index="${this.activeLineIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'center'
      });
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LyricsOverlay;
}
