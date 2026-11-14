/**
 * Cool Lyrics - In-Page Artistic Cinema Overlay Component
 * Features Kinetic Word Hero Mode & Genre-Responsive Aesthetics
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
    this.currentHeroWord = '';
    this.userOffset = 0;
    
    this.displayMode = 'hero'; // 'hero' (Kinetic Word) or 'waterfall' (Classic Scroll)
    this.currentVibe = 'kinetic'; // 'kinetic', 'cyber', 'dreamwave', 'velvet', 'waterfall'
    
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
            <button class="cl-vibe-pill active" data-vibe="kinetic">💥 Kinetic</button>
            <button class="cl-vibe-pill" data-vibe="cyber">⚡ Cyber</button>
            <button class="cl-vibe-pill" data-vibe="dreamwave">🌌 Dream</button>
            <button class="cl-vibe-pill" data-vibe="velvet">🖤 Velvet</button>
            <button class="cl-vibe-pill" data-vibe="waterfall">📜 Scroll</button>
          </div>

          <button class="cl-btn" id="cl-btn-mode" title="Toggle Display Mode (V)">
            <span id="cl-mode-icon">🎯</span> <span id="cl-mode-text">Word Hero</span>
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

      <!-- Stage 1: Kinetic Word Hero Display -->
      <main class="cl-hero-stage" id="cl-hero-stage">
        <div class="cl-hero-word-box">
          <div class="cl-hero-word" id="cl-hero-word">READY</div>
          <div class="cl-hero-context">
            <div class="cl-hero-line-track" id="cl-hero-line-track"></div>
            <div class="cl-hero-upcoming" id="cl-hero-upcoming"></div>
          </div>
        </div>
      </main>

      <!-- Stage 2: Fluid Waterfall Scroll Container -->
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
    this.heroStage = root.querySelector('#cl-hero-stage');
    this.heroWordEl = root.querySelector('#cl-hero-word');
    this.heroLineTrackEl = root.querySelector('#cl-hero-line-track');
    this.heroUpcomingEl = root.querySelector('#cl-hero-upcoming');
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

    // Display mode toggle (Hero Word vs Waterfall Scroll)
    this.modeBtn.addEventListener('click', () => this.toggleDisplayMode());

    // Vibe / Genre selector buttons
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

    // Scroll wheel pause
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

    // If waterfall was chosen, switch to waterfall mode
    if (vibe === 'waterfall') {
      this.setDisplayMode('waterfall');
    }
  }

  toggleDisplayMode() {
    this.setDisplayMode(this.displayMode === 'hero' ? 'waterfall' : 'hero');
  }

  setDisplayMode(mode) {
    this.displayMode = mode;
    if (mode === 'hero') {
      this.heroStage.style.display = 'flex';
      this.lyricsContainer.style.display = 'none';
      this.modeIcon.textContent = '🎯';
      this.modeText.textContent = 'Word Hero';
    } else {
      this.heroStage.style.display = 'none';
      this.lyricsContainer.style.display = 'flex';
      this.modeIcon.textContent = '📜';
      this.modeText.textContent = 'Waterfall';
      this.scrollToActiveLine(false);
    }
  }

  resetIdleTimer() {
    this.header.classList.remove('cl-idle-hidden');
    this.footer.classList.remove('cl-idle-hidden');
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.isVisible) {
        this.header.classList.add('cl-idle-hidden');
        this.footer.classList.add('cl-idle-hidden');
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

    // Auto-detect genre vibe
    if (typeof GenreDetector !== 'undefined') {
      const autoVibe = GenreDetector.detectVibe(track.artist, track.title);
      this.setVibe(autoVibe);
    }
  }

  updateLyrics(lyricsResult) {
    this.lyricsData = lyricsResult;
    this.lyricsContainer.innerHTML = '';
    this.activeLineIndex = -1;
    this.currentHeroWord = '';

    if (!lyricsResult || !lyricsResult.lines || lyricsResult.lines.length === 0) {
      const msg = lyricsResult && lyricsResult.instrumental
        ? '♪ Instrumental Track ♪'
        : 'No synchronized lyrics found';
      
      this.heroWordEl.textContent = msg;
      this.heroLineTrackEl.innerHTML = '';
      this.heroUpcomingEl.textContent = 'Enjoy the rhythm';

      this.lyricsContainer.innerHTML = `
        <div class="cl-status-view">
          <span style="font-size: 2rem;">✨</span>
          <span>${msg}</span>
        </div>
      `;
      return;
    }

    // Populate waterfall list
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

    // 1. Kinetic Word Hero update
    const activeWordObj = LrcParser.getActiveWord(this.lyricsData.lines, currentTime, this.userOffset);
    if (activeWordObj) {
      this.updateHeroDisplay(activeWordObj);
    }

    // 2. Waterfall active line update
    const newIndex = activeWordObj ? activeWordObj.lineIndex : LrcParser.getActiveIndex(this.lyricsData.lines, currentTime, this.userOffset);
    if (newIndex !== this.activeLineIndex) {
      this.setActiveLine(newIndex);
    }
  }

  updateHeroDisplay(activeWordObj) {
    const rawWord = activeWordObj.currentWord.trim();
    if (rawWord !== this.currentHeroWord) {
      this.currentHeroWord = rawWord;
      this.heroWordEl.textContent = rawWord;

      // Retrigger slam animation
      this.heroWordEl.classList.remove('cl-word-slam');
      void this.heroWordEl.offsetWidth; // reflow
      this.heroWordEl.classList.add('cl-word-slam');

      // Pulse radial backdrop aura
      if (this.radialGlow) {
        this.radialGlow.classList.remove('cl-glow-pulse');
        void this.radialGlow.offsetWidth;
        this.radialGlow.classList.add('cl-glow-pulse');
      }
    }

    // Render phrase tracker words
    const line = this.lyricsData.lines[activeWordObj.lineIndex];
    if (line && line.words) {
      this.heroLineTrackEl.innerHTML = '';
      line.words.forEach((w, idx) => {
        const span = document.createElement('span');
        span.className = 'cl-track-word';
        if (idx === activeWordObj.wordIndex) {
          span.classList.add('active');
        }
        span.textContent = w.word;
        this.heroLineTrackEl.appendChild(span);
      });
    }

    // Render upcoming line preview
    if (activeWordObj.nextLineText) {
      this.heroUpcomingEl.textContent = `Next: "${activeWordObj.nextLineText}"`;
    } else {
      this.heroUpcomingEl.textContent = '';
    }
  }

  setActiveLine(index) {
    const oldLine = this.lyricsContainer.querySelector(`.cl-line[data-index="${this.activeLineIndex}"]`);
    if (oldLine) oldLine.classList.remove('cl-active');

    this.activeLineIndex = index;
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
