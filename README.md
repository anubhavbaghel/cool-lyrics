# 🎤 Cool Lyrics (v1.5)
> **Distraction-Free, Pitch-Black Synchronized Lyrics for Chrome**

**Cool Lyrics** turns your web music experience into a distraction-free, cinematic visualizer on a pure `#000000` pitch-black canvas. Designed with the beloved fluid vertical waterfall layout of Apple Music and Spotify Desktop, it features centered active line tracking, smooth depth-of-field blur on inactive lines, and clean glowing text highlights.

Both the **in-page overlay** (`Alt + L`) and the **standalone cinema tab** (`Alt + Shift + L`) provide the exact same seamless, elegant experience.

---

## ✨ Features

### 1. 🌌 Pure Pitch-Black OLED Backdrop
- Absolute `#000000` background for zero eye strain, minimal distraction, and infinite contrast on OLED/AMOLED displays.
- Optional subtle **Aurora Glow** and **Cyber Neon** ambient aura modes.

### 2. 📜 Fluid Waterfall Kinetic Scroll
- **Dynamic Centering**: The active line smoothly glides to the center of your screen as the music plays.
- **Pure Text Highlight**: No clunky boxes or borders around words. The active line scales up (`1.06x`) with a crisp, pure white glow (`text-shadow: 0 0 28px rgba(255, 255, 255, 0.4)`).
- **Depth-of-Field Blur**: Inactive lines are dimmed and subtly blurred (`0.7px`), focusing your attention naturally on the current line while keeping the surrounding lyrics readable.

### 3. 🖱️ Tactile & Interactive
- **Click-to-Seek**: Click on any lyric line to jump audio playback instantly to that timestamp.
- **Manual Browsing**: Scroll freely to explore the lyrics; auto-scroll intelligently resumes after 3.5 seconds of inactivity.
- **Sync Offset Tuning**: Easily adjust lyric timing (`+0.5s`, `-0.5s`, reset) right from the bottom dock if a track is slightly out of sync.

### 4. 🎛️ Dual Modes
- **In-Page Overlay (`Alt + L`)**: Fullscreen cinematic overlay directly on top of Spotify Web, YouTube Music, or YouTube.
- **Standalone Cinema Tab (`Alt + Shift + L`)**: Independent window/tab ideal for dual monitors, laptops plugged into TVs, or dedicated lyrics displays.

---

## 🚀 How to Install / Update in Chrome

1. Open Google Chrome and go to `chrome://extensions/`.
2. Turn ON **"Developer mode"** (top-right corner).
3. If already installed: Click the **Reload (↺)** icon on **Cool Lyrics**.  
   If first time: Click **"Load unpacked"** and select:
   ```
   c:\Users\anubh\Desktop\My Projects\cool-lyrics
   ```
4. Open [Spotify Web](https://open.spotify.com), [YouTube Music](https://music.youtube.com), or [YouTube](https://www.youtube.com), play any song, and press **`Alt + L`** (or **`Alt + Shift + L`**)!

---

## ⌨️ Shortcuts & Controls

| Shortcut / Control | Action |
| --- | --- |
| `Alt + L` | Toggle In-Page Pitch-Black Cinema Overlay |
| `Alt + Shift + L` | Open Standalone Cinema Tab (Multi-monitor / TV) |
| `F` | Toggle Fullscreen Mode |
| `Space` | Play / Pause playback |
| `Esc` | Close In-Page Cinema Overlay |
| `Click on any line` | Jump / Seek playback directly to that line |
| `Scroll Wheel` | Temporarily pause auto-scroll to browse |

---

## 🏗️ Architecture

```
cool-lyrics/
├── manifest.json            # Manifest V3 configuration & CSP
├── icons/                   # High-res neon icons (16, 48, 128px)
├── utils/
│   ├── title-cleaner.js     # Cleans YouTube/Spotify junk metadata ("(Official Video)", etc.)
│   ├── lrc-parser.js        # Millisecond timestamp parser & binary search active line locator
│   └── lyrics-api.js        # LRCLIB API client with caching & fallback search
├── content/
│   ├── content.js           # Multi-player monitor & scrubber controller
│   ├── overlay.js           # In-page cinematic waterfall lyric component
│   └── overlay.css          # Pitch-black OLED backdrop & fluid centering styles
├── cinema/
│   ├── cinema.html          # Standalone theater mode for dual-monitor / TV
│   ├── cinema.js            # Standalone state synchronization & controls
│   └── cinema.css           # Standalone responsive cinema layout
└── popup/
    ├── popup.html           # Toolbar action popup
    ├── popup.js             # Detects active song & quick launchers
    └── popup.css            # Dark sleek toolbar UI
```
