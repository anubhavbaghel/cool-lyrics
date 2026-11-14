# 🎤 Cool Lyrics (v1.2)
> **Cinematic, Instagram-Style Kinetic Pitch-Black Synchronized Lyrics for Chrome**

**Cool Lyrics** turns your web music experience into a distraction-free OLED visualizer. It displays full lyric phrases with **Instagram-style dynamic word-by-word karaoke spotlights**, bold expressive typography, and musical genre personalities on a pure `#000000` pitch-black canvas.

---

## 🎨 The Instagram-Style Experience

### 1. 📸 Full-Phrase Composition (No Annoying Dictation)
- Instead of showing an isolated single word in the center (which feels like a dictation test), **the full sentence / stanza is prominently displayed on screen**.
- As the music plays, each word highlights dynamically in sync with the singer's voice:
  - **Active Word**: Emphasized with an Instagram-style pop & neon glow pill highlight (`scale(1.10)`).
  - **Surrounding Words**: Fully visible and bold (75% opacity), giving you natural context to sing along.
  - **Previous & Upcoming Lines**: Subtly visible above and below for complete song flow.
- **Click Any Word to Seek**: Click any word directly in the sentence to jump playback to that instant!

### 2. 🎭 Song Genre Personalities
Automatically matches the personality of what's playing, or switch anytime via the top bar pills:
- 📸 **Insta Reel** *(Modern Pop / Anthem / Dance)*: Clean, punchy typography (*Plus Jakarta Sans*), cyan karaoke pill highlight, buoyant energy.
- 💥 **Street Drill** *(Hip-Hop / Rap / Trap / Drill)*: Slanted 6° aggressive poster layout (*Bebas Neue* / *Syne*), hot crimson neon pulse.
- 🍷 **Editorial Vinyl** *(Lo-Fi / R&B / Soul / Ballads)*: Elegant high-fashion editorial serif (*Playfair Display*), warm champagne gold glow, poetic italics.
- ⚡ **Cyber Matrix** *(Synthwave / EDM / Electronic)*: Wide futuristic monospace (*Space Grotesk*), glowing emerald matrix tags.
- 📜 **Pure Studio** *(Minimalist)*: Classic Apple Music-style vertical waterfall scroll.

### 3. 🌑 True Pitch-Black OLED Mode
- Absolute `#000000` backdrop with zero light bleed.
- Dynamic radial aura blooms and pulses subtly behind words on the beat.

---

## 🚀 How to Install / Update in Chrome

1. Open Google Chrome and go to `chrome://extensions/`.
2. Turn ON **"Developer mode"** (top-right corner).
3. If already installed: Click the **Reload (↺)** icon on **Cool Lyrics**.  
   If first time: Click **"Load unpacked"** and select:
   ```
   c:\Users\anubh\Desktop\My Projects\cool-lyrics
   ```
4. Open [Spotify Web](https://open.spotify.com) or [YouTube Music](https://music.youtube.com), play any song, and press **`Alt + L`**!

---

## ⌨️ Shortcuts & Controls

| Shortcut / Control | Action |
| --- | --- |
| `Alt + L` | Toggle In-Page Pitch-Black Cinema Overlay |
| `Alt + Shift + L` | Open Standalone Cinema Tab (Multi-monitor / TV) |
| `V` | **Toggle Display Mode**: Instagram Full-Phrase vs Waterfall Scroll |
| `F` | Toggle Fullscreen Mode |
| `Space` | Play / Pause playback |
| `Esc` | Close In-Page Cinema Overlay |
| `Click on any word` | Jump / Seek playback directly to that word |
| `Scroll Wheel` | Temporarily pause auto-scroll to browse |

---

## 🏗️ Architecture

```
cool-lyrics/
├── manifest.json            # Manifest V3 configuration & CSP
├── icons/                   # High-res neon icons (16, 48, 128px)
├── utils/
│   ├── genre-detector.js    # Smart genre/vibe estimator (Reel, Drill, Vinyl, Cyber)
│   ├── title-cleaner.js     # Cleans YouTube/Spotify junk metadata ("(Official Video)", etc.)
│   ├── lrc-parser.js        # Multi-line context & word timing engine
│   └── lyrics-api.js        # LRCLIB API client with caching & fallback search
├── content/
│   ├── content.js           # Multi-player monitor & scrubber controller
│   ├── overlay.js           # In-page Instagram-style cinema overlay component
│   └── overlay.css          # Full-phrase typography, bouncy word highlights & vibes
├── cinema/
│   ├── cinema.html          # Standalone theater mode for dual-monitor / TV
│   ├── cinema.js            # Standalone state synchronization & controls
│   └── cinema.css           # Standalone responsive cinema layout
└── popup/
│   ├── popup.html           # Toolbar action popup
│   ├── popup.js             # Detects active song & quick launchers
│   └── popup.css            # Dark sleek toolbar UI
```
