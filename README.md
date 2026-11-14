# 🎤 Cool Lyrics (v1.3)
> **Cinematic, Full-Screen Systematic Constellation & Pitch-Black Synchronized Lyrics for Chrome**

**Cool Lyrics** turns your web music experience into a full-screen, OLED typographic constellation. It utilizes the **entire screen** (`100vw x 100vh`) to display words in **systematically randomized spatial coordinates**, while smoothly fading older words into the pitch-black abyss as the song flows.

---

## 🌌 The Constellation Scatter Experience

### 1. 🪐 Full-Screen Systematic Spatial Distribution
- **Utilizes the Complete Screen**: Instead of keeping lyrics locked in a central box, words materialize in organic spatial pockets across the entire screen.
- **Systematic & Aesthetic Randomness**:
  - Divided into 14 balanced spatial anchor zones that prevent awkward overlaps and keep safe distance from headers and controls.
  - Organic human jitter (`±4%` X/Y drift, `±4°` tilt) makes every word feel naturally hand-placed like a living music poster.
  - Non-repeating distribution guarantees a dynamic, breathing visual rhythm.

### 2. ⏳ Lingering & Gradual Fade Trail
- **Newest Active Word (Age 0)**: Bursts in with a blooming animation, brilliant `#ffffff` bold presence, neon glow halo, and a localized ambient radial backdrop aura.
- **Gradual Word Aging**:
  - **Age 1**: Drops to `78%` opacity, retaining crisp readability.
  - **Age 2**: Softens to `52%` opacity.
  - **Age 3**: Dissolves to `30%` opacity with a subtle dream blur.
  - **Age 4**: Dims to a distant `14%` whisper.
  - **Age 5**: Gracefully fades into pure `#000000` pitch black and cleans up.
- Creates an **ethereal luminous trail** of the last 6–8 words across space so you always have musical context without screen clutter.

### 3. 🎯 Click-to-Seek & Linear Reference
- **Click Any Word**: Click any floating word anywhere on the screen to instantly jump the audio playback to that exact second.
- **Context Subbar**: A minimalist pill at the bottom center displays the full current line so you can glance at the complete sentence anytime.

### 4. 🎭 Genre Personalities
Switch vibes or let it auto-detect based on the playing track:
- 📸 **Insta Reel** *(Pop / Anthem / Dance)*: Modern, buoyant *Plus Jakarta Sans* with cyan laser aura.
- 💥 **Street Drill** *(Hip-Hop / Rap / Trap)*: Aggressive *Bebas Neue* & *Syne* with slanted kinetic punch and hot crimson glow.
- 🍷 **Editorial Vinyl** *(Lo-Fi / R&B / Soul / Ballads)*: Elegant high-fashion italic *Playfair Display* with champagne gold aura.
- ⚡ **Cyber Matrix** *(Synthwave / EDM / Electronic)*: Wide *Space Grotesk* tech monospace with matrix emerald pulse.
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
| `V` | **Toggle Display Mode**: Constellation Scatter Canvas vs Waterfall Scroll |
| `F` | Toggle Fullscreen Mode |
| `Space` | Play / Pause playback |
| `Esc` | Close In-Page Cinema Overlay |
| `Click on any floating word` | Jump / Seek playback directly to that word |
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
│   ├── overlay.js           # Full-screen systematic constellation scatter & fading engine
│   └── overlay.css          # Constellation styles, age fades, and glowing aura coordinates
├── cinema/
│   ├── cinema.html          # Standalone theater mode for dual-monitor / TV
│   ├── cinema.js            # Standalone state synchronization & controls
│   └── cinema.css           # Standalone responsive cinema layout
└── popup/
│   ├── popup.html           # Toolbar action popup
│   ├── popup.js             # Detects active song & quick launchers
│   └── popup.css            # Dark sleek toolbar UI
```
