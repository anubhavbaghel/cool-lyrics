/**
 * Cool Lyrics - WiZ Smart Bulb Client
 * Communicates with local WiZ Bridge daemon (http://127.0.0.1:3737) to synchronize lighting.
 */

class WizClient {
  constructor() {
    this.bridgeUrl = 'http://127.0.0.1:3737';
    this.isBridgeOnline = false;
    this.activeBulb = null;
    this.bulbs = [];
    
    // User preferences
    this.isEnabled = false;
    this.mode = 'album'; // 'album', 'neon', 'aurora', 'warm', 'custom'
    this.brightness = 85;
    this.pulseOnLyric = true;

    this.currentColor = { r: 0, g: 240, b: 255 };
    this.lastSentTime = 0;
    this.throttleTimeout = null;
    this.listeners = [];

    this.loadSettings();
    this.checkBridge();
    
    // Heartbeat check every 10 seconds
    setInterval(() => this.checkBridge(), 10000);
  }

  loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['wizEnabled', 'wizMode', 'wizBrightness', 'wizPulseOnLyric'], (res) => {
        if (res.wizEnabled !== undefined) this.isEnabled = res.wizEnabled;
        if (res.wizMode) this.mode = res.wizMode;
        if (res.wizBrightness) this.brightness = res.wizBrightness;
        if (res.wizPulseOnLyric !== undefined) this.pulseOnLyric = res.wizPulseOnLyric;
        this.notifyListeners();
      });
    }
  }

  saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        wizEnabled: this.isEnabled,
        wizMode: this.mode,
        wizBrightness: this.brightness,
        wizPulseOnLyric: this.pulseOnLyric
      });
    }
    this.notifyListeners();
  }

  addListener(fn) {
    this.listeners.push(fn);
    fn(this.getState());
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(fn => {
      try { fn(state); } catch (e) {}
    });
  }

  getState() {
    return {
      isBridgeOnline: this.isBridgeOnline,
      activeBulb: this.activeBulb,
      bulbs: this.bulbs,
      isEnabled: this.isEnabled,
      mode: this.mode,
      brightness: this.brightness,
      pulseOnLyric: this.pulseOnLyric,
      currentColor: this.currentColor
    };
  }

  async checkBridge() {
    try {
      const res = await fetch(`${this.bridgeUrl}/status`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        const prevStatus = this.isBridgeOnline;
        this.isBridgeOnline = true;
        this.activeBulb = data.activeBulb;
        this.bulbs = data.bulbs || [];
        if (!prevStatus) {
          console.log('[WiZ Client] Connected to local bridge! Active bulb:', this.activeBulb);
        }
        this.notifyListeners();
        return true;
      }
    } catch (e) {
      this.isBridgeOnline = false;
    }
    this.notifyListeners();
    return false;
  }

  async triggerDiscovery() {
    try {
      const res = await fetch(`${this.bridgeUrl}/discover`, {
        method: 'POST',
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        this.isBridgeOnline = true;
        this.activeBulb = data.activeBulb;
        this.bulbs = data.bulbs || [];
        this.notifyListeners();
        return data;
      }
    } catch (e) {}
    return null;
  }

  async setBulbIp(ip) {
    try {
      const res = await fetch(`${this.bridgeUrl}/set-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      if (res.ok) {
        const data = await res.json();
        this.activeBulb = data.activeBulb;
        this.notifyListeners();
        return true;
      }
    } catch (e) {}
    return false;
  }

  /**
   * Synchronize bulb with the current playing track
   */
  async syncTrack(track, artworkImg) {
    if (!this.isEnabled || !this.isBridgeOnline || !this.activeBulb) return;

    if (this.mode === 'warm') {
      return this.sendPilot({ temp: 2700, dimming: this.brightness, state: true });
    }

    if (this.mode === 'neon') {
      // Pick electric cyan or magenta based on title
      const color = (track.title && track.title.length % 2 === 0)
        ? { r: 0, g: 240, b: 255 }
        : { r: 255, g: 0, b: 128 };
      this.currentColor = color;
      return this.sendPilot({ ...color, dimming: this.brightness, state: true });
    }

    if (this.mode === 'aurora') {
      const color = { r: 16, g: 235, b: 150 }; // Emerald green
      this.currentColor = color;
      return this.sendPilot({ ...color, dimming: this.brightness, state: true });
    }

    // Default 'album' mode: Extract vibrant color
    const fallbackStr = `${track.title || ''} ${track.artist || ''}`;
    const color = await ColorExtractor.extractFromImage(artworkImg, fallbackStr);
    this.currentColor = color;
    this.sendPilot({ ...color, dimming: this.brightness, state: true });
  }

  /**
   * Pulse/accent effect when a new lyric line becomes active
   */
  pulseActiveLine() {
    if (!this.isEnabled || !this.isBridgeOnline || !this.pulseOnLyric || !this.activeBulb) return;

    // Small subtle dimming dip or boost to breathe with the vocal line
    const dipBrightness = Math.max(25, this.brightness - 22);
    this.sendPilot({ dimming: dipBrightness });

    setTimeout(() => {
      if (this.isEnabled) {
        this.sendPilot({ dimming: this.brightness });
      }
    }, 280);
  }

  /**
   * Sends pilot command to local bridge with throttle control
   */
  sendPilot(params) {
    const now = Date.now();
    const timeSinceLast = now - this.lastSentTime;

    if (timeSinceLast < 180) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = setTimeout(() => {
        this.executeSend(params);
      }, 180 - timeSinceLast);
      return;
    }

    this.executeSend(params);
  }

  async executeSend(params) {
    this.lastSentTime = Date.now();
    try {
      await fetch(`${this.bridgeUrl}/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          ip: this.activeBulb
        })
      });
    } catch (e) {}
  }

  /**
   * Test light with a lively celebratory flash sequence
   */
  async testFlash() {
    if (!this.isBridgeOnline) return false;

    // Cyan -> Magenta -> Warm Glow
    await this.executeSend({ r: 0, g: 240, b: 255, dimming: 100, state: true });
    setTimeout(async () => {
      await this.executeSend({ r: 255, g: 0, b: 128, dimming: 100, state: true });
      setTimeout(async () => {
        if (this.isEnabled) {
          this.executeSend({ ...this.currentColor, dimming: this.brightness, state: true });
        } else {
          this.executeSend({ temp: 2700, dimming: 100, state: true });
        }
      }, 500);
    }, 500);
    return true;
  }
}

// Global instance
const wizClient = new WizClient();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WizClient;
}
