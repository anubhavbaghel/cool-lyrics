# 🎤 Cool Lyrics (v1.0)
> **Cinematic Pitch-Black Synchronized Lyrics for Chrome**

**Cool Lyrics** turns your web music experience into a stunning, distraction-free OLED visualizer. It automatically detects songs playing on **Spotify Web**, **YouTube Music**, or **YouTube**, fetches synchronized lyrics with millisecond precision, and displays them on a pure pitch-black backdrop with fluid Apple Music-style spring auto-scroll.

---

## ✨ Features

- **🌑 True Pitch-Black OLED Mode**: Pure `#000000` background so lyrics appear to float in space with zero light bleed.
- **✨ Fluid Spring Auto-Scroll**: Active line is highlighted and centered; past and upcoming lines softly blur and dim into the background.
- **⚡ Multiple Visual Themes**:
  - `Pitch Black`: Absolute OLED `#000000` minimalist studio.
  - `Aurora Glow`: Pitch black with subtle chromatic ambient aura.
  - `Cyber Neon`: Electric cyan & neon magenta glowing typography.
- **🖱️ Click-to-Seek**: Click any lyric line to jump the song directly to that timestamp.
- **⏱️ Sync Offset Fine-Tuner**: Tune timing by `+0.5s` or `-0.5s` if lyrics have timing drift.
- **📺 Two Display Modes**:
  1. **In-Page Cinema Overlay**: Floats directly over Spotify or YouTube (`Alt + L`).
  2. **Standalone Cinema Tab**: Dedicated window (`Alt + Shift + L`) for second monitors, split-screen, or TV projection.
- **🕹️ Smart Idle Auto-Hide**: Controls and headers fade out completely when your mouse is stationary for pure immersion.
- **🎵 Multi-Platform Support**: Spotify Web Player, YouTube Music, YouTube, and generic HTML5 media players.

---

## 🚀 How to Install in Chrome

1. Open Google Chrome.
2. Navigate to `chrome://extensions/` in the URL bar.
3. Turn ON **"Developer mode"** (toggle in the top-right corner).
4. Click the **"Load unpacked"** button in the top-left corner.
5. Select this folder:
   ```
   c:\Users\anubh\Desktop\My Projects\cool-lyrics
   ```
6. **Cool Lyrics** is now installed and ready! Pin it to your extension toolbar for quick access.

---

## ⌨️ Shortcuts & Controls

| Shortcut / Control | Action |
| --- | --- |
| `Alt + L` | Toggle In-Page Pitch-Black Cinema Overlay |
| `Alt + Shift + L` | Open Standalone Cinema Tab (Multi-monitor / TV) |
| `F` | Toggle Fullscreen Mode |
| `Space` | Play / Pause playback |
| `Esc` | Close In-Page Cinema Overlay |
| `Click on any lyric line` | Jump / Seek playback directly to that line |
| `Scroll Wheel` | Temporarily pause auto-scroll to browse lyrics (resumes automatically) |

---

## 🏗️ Architecture

```
cool-lyrics/
├── manifest.json            # Manifest V3 configuration
├── icons/                   # Extension icons (16, 48, 128px)
├── utils/
│   ├── title-cleaner.js     # Cleans YouTube/Spotify junk metadata ("(Official Video)", etc.)
│   ├── lrc-parser.js        # Parses millisecond LRC timestamps & calculates active lines
│   └── lyrics-api.js        # LRCLIB API client with caching & fallback search
├── content/
│   ├── content.js           # Multi-player monitor & scrubber controller
│   ├── overlay.js           # In-page pitch-black cinema overlay component
│   └── overlay.css          # OLED styling, animations, and typography
├── cinema/
│   ├── cinema.html          # Standalone theater mode for dual-monitor / TV
│   ├── cinema.js            # Standalone state synchronization & controls
│   └── cinema.css           # Standalone high-res responsive cinema layout
└── popup/
│   ├── popup.html           # Toolbar action popup
│   ├── popup.js             # Detects active song & quick launchers
│   └── popup.css            # Dark sleek toolbar UI
```

---

Enjoy your music in pure cinema mode! 🎶
