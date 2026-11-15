/**
 * Cool Lyrics - In-Page Pitch Black Cinema Overlay Component
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
    this.lyricsData = null; // { lines: [], isSynced: boolean }
    this.activeLineIndex = -1;
    this.userOffset = 0; // seconds
    this.theme = 'pure-black'; // 'pure-black', 'ambient', 'neon'
    this.idleTimer = null;
    this.isUserScrolling = false;
    this.userScrollResumeTimer = null;

    this.initDOM();
  }

  initDOM() {
    if (document.getElementById('cool-lyrics-root')) return;

    const root = document.createElement('div');
    root.id = 'cool-lyrics-root';
    root.innerHTML = `
      <div class="cl-bg-layer">
        <div class="cl-bg-glow"></div>
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
          <div class="cl-wiz-wrapper" style="position: relative;">
            <button class="cl-btn" id="cl-btn-wiz" title="Philips WiZ Smart Bulb Sync">
              <span class="cl-wiz-status-dot" id="cl-overlay-wiz-dot"></span>
              <span>💡 WiZ Light</span>
            </button>

            <!-- WiZ Floating Popover Panel -->
            <div class="cl-wiz-popover" id="cl-overlay-wiz-popover" style="display: none;">
              <div class="cl-wiz-header">
                <span class="cl-wiz-title">💡 WiZ Room Sync</span>
                <span class="cl-wiz-chip" id="cl-overlay-wiz-status">Checking...</span>
              </div>

              <div class="cl-wiz-row">
                <span>Enable Sync</span>
                <label class="cl-switch">
                  <input type="checkbox" id="cl-overlay-wiz-enable">
                  <span class="cl-slider"></span>
                </label>
              </div>

              <div class="cl-wiz-row">
                <span>Lighting Mode</span>
                <select id="cl-overlay-wiz-mode" class="cl-select">
                  <option value="album">🎨 Album Art Vibrant</option>
                  <option value="neon">⚡ Cyber Neon</option>
                  <option value="aurora">🌌 Aurora Emerald</option>
                  <option value="warm">🕯️ Cozy Warm Studio</option>
                </select>
              </div>

              <div class="cl-wiz-row">
                <span>Brightness</span>
                <input type="range" id="cl-overlay-wiz-brightness" min="10" max="100" value="85" class="cl-range">
                <span id="cl-overlay-wiz-brightness-val" style="font-size: 11px; width: 28px; text-align: right;">85%</span>
              </div>

              <div class="cl-wiz-row">
                <span>Lyric Beat Pulse</span>
                <label class="cl-switch">
                  <input type="checkbox" id="cl-overlay-wiz-pulse" checked>
                  <span class="cl-slider"></span>
                </label>
              </div>

              <div class="cl-wiz-footer">
                <button class="cl-wiz-action-btn" id="cl-overlay-btn-wiz-test">✨ Test Flash</button>
                <button class="cl-wiz-action-btn" id="cl-overlay-btn-wiz-scan">🔍 Scan</button>
              </div>
            </div>
          </div>

          <button class="cl-btn" id="cl-btn-theme" title="Cycle visual theme">
            <span>✨</span> <span id="cl-theme-name">Pitch Black</span>
          </button>
          <button class="cl-btn cl-btn-icon" id="cl-btn-popout" title="Open in Standalone Cinema Window">
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

      <!-- Center Lyrics Scroll Container -->
      <main class="cl-lyrics-container" id="cl-lyrics-scroll">
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
            <kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">Esc</kbd> Exit
          </div>
        </div>
      </footer>
    `;

    document.body.appendChild(root);
    this.root = root;

    // Cache elements
    this.header = root.querySelector('.cl-header');
    this.footer = root.querySelector('.cl-footer');
    this.lyricsContainer = root.querySelector('#cl-lyrics-scroll');
    this.artworkImg = root.querySelector('.cl-artwork');
    this.titleEl = root.querySelector('.cl-track-title');
    this.artistEl = root.querySelector('.cl-track-artist');
    this.currentTimeEl = root.querySelector('#cl-current-time');
    this.durationEl = root.querySelector('#cl-duration');
    this.progressBar = root.querySelector('#cl-progress-bar');
    this.progressFill = root.querySelector('#cl-progress-fill');
    this.playBtn = root.querySelector('#cl-btn-play');
    this.themeName = root.querySelector('#cl-theme-name');
    this.offsetVal = root.querySelector('#cl-offset-val');

    this.bindEvents();
  }

  bindEvents() {
    // Close & Popout
    this.root.querySelector('#cl-btn-close').addEventListener('click', () => this.hide());
    this.root.querySelector('#cl-btn-popout').addEventListener('click', () => this.onOpenCinemaTab());

    // Fullscreen
    this.root.querySelector('#cl-btn-fullscreen').addEventListener('click', () => this.toggleFullscreen());

    // Playback buttons
    this.playBtn.addEventListener('click', () => this.onTogglePlay());
    this.root.querySelector('#cl-btn-prev').addEventListener('click', () => this.onPrev());
    this.root.querySelector('#cl-btn-next').addEventListener('click', () => this.onNext());

    // Theme cycle
    this.root.querySelector('#cl-btn-theme').addEventListener('click', () => this.cycleTheme());

    // WiZ Smart Light Controls
    this.initWizOverlayControls();

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

    // Handle manual scrolling pause/resume
    this.lyricsContainer.addEventListener('wheel', () => {
      this.isUserScrolling = true;
      clearTimeout(this.userScrollResumeTimer);
      this.userScrollResumeTimer = setTimeout(() => {
        this.isUserScrolling = false;
        this.scrollToActiveLine(true);
      }, 3500);
    }, { passive: true });

    // Auto-hide controls when mouse is idle
    this.root.addEventListener('mousemove', () => this.resetIdleTimer());

    // Keyboard shortcuts inside overlay
    window.addEventListener('keydown', (e) => {
      if (!this.isVisible) return;
      if (e.key === 'Escape') {
        this.hide();
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        this.onTogglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      }
    });
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
    this.scrollToActiveLine(false);
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

  cycleTheme() {
    const themes = ['pure-black', 'ambient', 'neon'];
    const names = {
      'pure-black': 'Pitch Black',
      'ambient': 'Aurora Glow',
      'neon': 'Cyber Neon'
    };
    const nextIdx = (themes.indexOf(this.theme) + 1) % themes.length;
    this.theme = themes[nextIdx];

    this.root.classList.remove('cl-theme-ambient', 'cl-theme-neon');
    if (this.theme === 'ambient') this.root.classList.add('cl-theme-ambient');
    if (this.theme === 'neon') this.root.classList.add('cl-theme-neon');

    this.themeName.textContent = names[this.theme];
  }

  adjustOffset(delta) {
    this.setOffset(Math.round((this.userOffset + delta) * 10) / 10);
  }

  setOffset(val) {
    this.userOffset = val;
    this.offsetVal.textContent = `${val > 0 ? '+' : ''}${val.toFixed(1)}s`;
    this.offsetVal.style.color = val === 0 ? 'rgba(255,255,255,0.6)' : '#00f0ff';
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

    // WiZ Smart Light ambient track sync
    if (typeof wizClient !== 'undefined') {
      wizClient.syncTrack(track, this.artworkImg);
    }
  }

  updateLyrics(lyricsResult) {
    this.lyricsData = lyricsResult;
    this.lyricsContainer.innerHTML = '';
    this.activeLineIndex = -1;

    if (!lyricsResult || !lyricsResult.lines || lyricsResult.lines.length === 0) {
      const msg = lyricsResult && lyricsResult.instrumental
        ? '♪ Instrumental Track ♪'
        : 'No synchronized lyrics found for this song';
      this.lyricsContainer.innerHTML = `
        <div class="cl-status-view">
          <span style="font-size: 2rem;">✨</span>
          <span>${msg}</span>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    lyricsResult.lines.forEach((line, idx) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'cl-line';
      lineEl.dataset.index = idx.toString();
      lineEl.dataset.time = line.time.toString();
      lineEl.textContent = line.text;

      // Click to seek to that line!
      lineEl.addEventListener('click', () => {
        this.onSeek(line.time);
      });

      fragment.appendChild(lineEl);
    });

    this.lyricsContainer.appendChild(fragment);
  }

  updateProgress({ currentTime, duration, isPaused }) {
    // Update labels and scrubber
    this.currentTimeEl.textContent = LrcParser.formatTime(currentTime || 0);
    if (duration > 0) {
      const pct = Math.min(100, Math.max(0, (currentTime / duration) * 100));
      this.progressFill.style.width = `${pct}%`;
      this.durationEl.textContent = LrcParser.formatTime(duration);
    }

    // Play/Pause icon
    this.playBtn.textContent = isPaused ? '▶' : '⏸';

    // Update active lyric line
    if (!this.lyricsData || !this.lyricsData.lines || !this.lyricsData.isSynced) return;

    const newIndex = LrcParser.getActiveIndex(this.lyricsData.lines, currentTime, this.userOffset);
    if (newIndex !== this.activeLineIndex) {
      this.setActiveLine(newIndex);
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
      if (!this.isUserScrolling) {
        this.scrollToActiveLine(true);
      }
      // Gentle pulse accent on WiZ smart bulb on line change
      if (typeof wizClient !== 'undefined') {
        wizClient.pulseActiveLine();
      }
    }
  }

  initWizOverlayControls() {
    if (typeof wizClient === 'undefined') return;

    const btnToggle = this.root.querySelector('#cl-btn-wiz');
    const popover = this.root.querySelector('#cl-overlay-wiz-popover');
    const wizDot = this.root.querySelector('#cl-overlay-wiz-dot');
    const statusBadge = this.root.querySelector('#cl-overlay-wiz-status');
    const enableToggle = this.root.querySelector('#cl-overlay-wiz-enable');
    const modeSelect = this.root.querySelector('#cl-overlay-wiz-mode');
    const brightnessSlider = this.root.querySelector('#cl-overlay-wiz-brightness');
    const brightnessVal = this.root.querySelector('#cl-overlay-wiz-brightness-val');
    const pulseToggle = this.root.querySelector('#cl-overlay-wiz-pulse');
    const btnTest = this.root.querySelector('#cl-overlay-btn-wiz-test');
    const btnScan = this.root.querySelector('#cl-overlay-btn-wiz-scan');

    if (!btnToggle || !popover) return;

    // Toggle popover visibility
    btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = popover.style.display !== 'none';
      popover.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) wizClient.checkBridge();
    });

    this.root.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && e.target !== btnToggle) {
        popover.style.display = 'none';
      }
    });

    // Handle Enable Switch
    enableToggle.addEventListener('change', () => {
      wizClient.isEnabled = enableToggle.checked;
      wizClient.saveSettings();
      if (wizClient.isEnabled && this.currentTrack) {
        wizClient.syncTrack(this.currentTrack, this.artworkImg);
      }
    });

    // Handle Mode Select
    modeSelect.addEventListener('change', () => {
      wizClient.mode = modeSelect.value;
      wizClient.saveSettings();
      if (wizClient.isEnabled && this.currentTrack) {
        wizClient.syncTrack(this.currentTrack, this.artworkImg);
      }
    });

    // Handle Brightness Slider
    brightnessSlider.addEventListener('input', () => {
      const val = parseInt(brightnessSlider.value, 10);
      brightnessVal.textContent = `${val}%`;
      wizClient.brightness = val;
      wizClient.saveSettings();
      if (wizClient.isEnabled) {
        wizClient.sendPilot({ dimming: val });
      }
    });

    // Handle Pulse Toggle
    pulseToggle.addEventListener('change', () => {
      wizClient.pulseOnLyric = pulseToggle.checked;
      wizClient.saveSettings();
    });

    // Test Button
    btnTest.addEventListener('click', async () => {
      btnTest.textContent = 'Flashing...';
      await wizClient.testFlash();
      setTimeout(() => { btnTest.textContent = '✨ Test Flash'; }, 1200);
    });

    // Scan Button
    btnScan.addEventListener('click', async () => {
      btnScan.textContent = 'Scanning...';
      await wizClient.triggerDiscovery();
      btnScan.textContent = '🔍 Scan';
    });

    // Listen to WiZ client status updates
    wizClient.addListener((state) => {
      enableToggle.checked = state.isEnabled;
      modeSelect.value = state.mode;
      brightnessSlider.value = state.brightness;
      brightnessVal.textContent = `${state.brightness}%`;
      pulseToggle.checked = state.pulseOnLyric;

      if (state.isBridgeOnline && state.activeBulb) {
        statusBadge.textContent = state.activeBulb;
        statusBadge.className = 'cl-wiz-chip online';
        statusBadge.title = `WiZ bulb connected at ${state.activeBulb}`;
        wizDot.className = state.isEnabled ? 'cl-wiz-status-dot active-sync' : 'cl-wiz-status-dot online';
      } else if (state.isBridgeOnline) {
        statusBadge.textContent = 'Bulb offline';
        statusBadge.className = 'cl-wiz-chip';
        wizDot.className = 'cl-wiz-status-dot';
      } else {
        statusBadge.textContent = 'Bridge offline';
        statusBadge.className = 'cl-wiz-chip';
        wizDot.className = 'cl-wiz-status-dot';
        statusBadge.title = 'Run "node bridge/wiz-bridge.js" or start-bridge.bat';
      }
    });
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
