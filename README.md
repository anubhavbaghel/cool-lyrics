# 🎤 Cool Lyrics (v1.4)
> **Cinematic, Instagram Story Bouncy Synchronized Lyrics for Chrome**

**Cool Lyrics** turns your web music experience into a distraction-free, pitch-black visualizer inspired by **Instagram Story & Reel bouncy lyrics**. It displays full lyric phrases with **signature bouncy spring physics**, slide-up line transitions, and genre personalities on a pure `#000000` pitch-black canvas.

---

## 📸 The Instagram Story Bouncy Experience

### 1. 🦘 Signature Bouncy Word Spring (`insta-word-pop`)
- The active phrase is front-and-center in bold, modern Instagram typography.
- As the singer speaks each word, that specific word **bounces/springs forward** with organic spring elasticity (`scale(1.15)` overshoot -> settles at `1.08`), illuminated in white with a glowing highlight badge.
- **Surrounding words remain fully legible** in the sentence, giving you complete musical context.

### 2. 🚀 Rhythmic Slide-Up & Fade Line Transitions
- When a phrase finishes, it **smoothly glides upward and fades out** into the dark void.
- The new incoming phrase **rises up from below** (`line-rise` animation) with words springing in to the beat.
- The upcoming phrase waits subtly below in dimmed text.

### 3. 🖱️ Tactile Controls
- **Click Any Word to Jump**: Click any word in the active phrase to seek audio playback directly to that second.
- **Mode Toggle (`V`)**: Press `V` anytime to switch between **Instagram Bouncy Reel** and **Classic Waterfall Scroll**.

### 4. 🎭 Genre Personalities
Switch vibes manually or let it auto-match the playing song:
- 📸 **Insta Reel** *(Pop / Modern Anthems)*: Clean, bouncy *Plus Jakarta Sans* with cyan laser glow.
- 💥 **Street Drill** *(Hip-Hop / Rap / Drill)*: Slanted 6° aggressive punch (*Bebas Neue* & *Syne*) with hot crimson neon highlights.
- 🍷 **Editorial Vinyl** *(Lo-Fi / R&B / Soul / Ballads)*: Elegant *Playfair Display* serif with italic word pop and champagne gold aura.
- ⚡ **Cyber Matrix** *(Synthwave / EDM / Electronic)*: Wide futuristic *Space Grotesk* monospace with emerald matrix pulse.
- 📜 **Pure Studio** *(Minimalist)*: Classic Apple Music-style vertical waterfall scroll.

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
| `V` | **Toggle Display Mode**: Instagram Bouncy Reel vs Waterfall Scroll |
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
│   ├── overlay.js           # In-page Instagram Story bouncy lyric component
│   └── overlay.css          # Bouncy spring keyframes, slide-up lines & OLED backdrop
├── cinema/
│   ├── cinema.html          # Standalone theater mode for dual-monitor / TV
│   ├── cinema.js            # Standalone state synchronization & controls
│   └── cinema.css           # Standalone responsive cinema layout
└── popup/
│   ├── popup.html           # Toolbar action popup
│   ├── popup.js             # Detects active song & quick launchers
│   └── popup.css            # Dark sleek toolbar UI
```
