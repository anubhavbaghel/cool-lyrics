# 🎤 Cool Lyrics (v1.1)
> **Cinematic, Artistic & Kinetic Pitch-Black Synchronized Lyrics for Chrome**

**Cool Lyrics** turns your web music experience into a stunning, distraction-free OLED visualizer. It automatically detects songs playing on **Spotify Web**, **YouTube Music**, or **YouTube**, matches the genre aesthetic, and displays synced lyrics with bold artistic typography and kinetic rhythm animations on a pure `#000000` pitch-black canvas.

---

## 🎨 What Makes It Next-Level & Artistic

### 1. 🎯 Massive Kinetic Word Hero Mode
Instead of just static stacked lines, lyrics can take over the entire screen:
- **Giant screen-filling words** (up to 12vw font size) that punch into view on the beat (`word-slam` animation).
- **Radial backdrop aura** pulsing dynamically behind each word.
- **Contextual phrase tracker** below the hero word showing the full active sentence and upcoming lyric preview.
- Press **`V`** anytime to seamlessly toggle between **Kinetic Word Hero** and **Fluid Waterfall Scroll**.

### 2. 🎭 Genre & Vibe Adaptation
Auto-detects the musical genre or lets you switch vibes with one click:
- 💥 **Kinetic Punch** *(Hip-hop, Rap, High-Energy Beats)*: Ultra-heavy bold display font (*Syne*), vibrant crimson neon highlights, aggressive kinetic punch.
- ⚡ **Cyber Neon** *(EDM, Synthwave, Electronic)*: Wide futuristic monospace (*Unbounded*), electric cyan laser glow.
- 🌌 **Dreamwave** *(Lo-Fi, R&B, Indie Pop)*: Ethereal floating typography (*Outfit*), breathing violet aura clouds.
- 🖤 **Midnight Velvet** *(Rock, Metal, Soul, Ballads)*: High-drama artistic luxury serif (*Cinzel Decorative* / *Playfair*), champagne gold backlight.
- 📜 **Fluid Waterfall** *(Minimalist Studio)*: Refined Apple Music-style springy auto-scroll.

### 3. 🌑 True Pitch-Black OLED Mode
- Zero light bleed (`#000000`) for true contrast on OLED/Mini-LED monitors.
- Dynamic radial aura illuminates only when words hit the rhythm.

### 4. 🖱️ Tactile Controls
- **Click-to-Seek**: Click any lyric line to jump the song directly to that timestamp.
- **Sync Offset Tuner**: Fine-tune timing by `+0.5s` or `-0.5s` for tracks with timing drift.
- **Dual Display Modes**: In-Page Cinema Overlay (`Alt + L`) or Standalone Cinema Window (`Alt + Shift + L`).

---

## 🚀 How to Install in Chrome

1. Open Google Chrome.
2. Navigate to `chrome://extensions/`.
3. Turn ON **"Developer mode"** (top-right corner).
4. Click **"Load unpacked"** (or click "Update" if already loaded).
5. Select this folder:
   ```
   c:\Users\anubh\Desktop\My Projects\cool-lyrics
   ```
6. Open [Spotify Web](https://open.spotify.com) or [YouTube Music](https://music.youtube.com), play any song, and press **`Alt + L`**!

---

## ⌨️ Shortcuts & Controls

| Shortcut / Control | Action |
| --- | --- |
| `Alt + L` | Toggle In-Page Pitch-Black Cinema Overlay |
| `Alt + Shift + L` | Open Standalone Cinema Tab (Multi-monitor / TV) |
| `V` | **Toggle Artistic Mode**: Kinetic Word Hero vs Fluid Waterfall |
| `F` | Toggle Fullscreen Mode |
| `Space` | Play / Pause playback |
| `Esc` | Close In-Page Cinema Overlay |
| `Click on any lyric line` | Jump / Seek playback directly to that line |
| `Scroll Wheel` | Temporarily pause auto-scroll to browse (resumes automatically) |

---

## 🏗️ Architecture

```
cool-lyrics/
├── manifest.json            # Manifest V3 configuration & CSP
├── icons/                   # High-res neon icons (16, 48, 128px)
├── utils/
│   ├── genre-detector.js    # Smart genre/vibe estimator based on artist & track
│   ├── title-cleaner.js     # Cleans YouTube/Spotify junk metadata ("(Official Video)", etc.)
│   ├── lrc-parser.js        # Word-level interpolation & line timestamp parser
│   └── lyrics-api.js        # LRCLIB API client with caching & fallback search
├── content/
│   ├── content.js           # Multi-player monitor & scrubber controller
│   ├── overlay.js           # In-page pitch-black cinema overlay component
│   └── overlay.css          # Artistic typography, kinetic animations, and genre themes
├── cinema/
│   ├── cinema.html          # Standalone theater mode for dual-monitor / TV
│   ├── cinema.js            # Standalone state synchronization & controls
│   └── cinema.css           # Standalone responsive cinema layout
└── popup/
│   ├── popup.html           # Toolbar action popup
│   ├── popup.js             # Detects active song & quick launchers
│   └── popup.css            # Dark sleek toolbar UI
```
