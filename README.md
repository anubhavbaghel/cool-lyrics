# 🎤 Cool Lyrics (v1.6)
> **Distraction-Free, Pitch-Black Synchronized Lyrics for Chrome**  
> *With Instagram Bouncy Reel Mode, Waterfall Scroll Mode, and Philips WiZ Smart Bulb Ambient Room Sync!*

**Cool Lyrics** turns your web music experience into a distraction-free, cinematic visualizer on a pure `#000000` pitch-black canvas. It gives you the freedom to toggle between **two distinct display modes** anytime:
1. 📸 **Instagram Story Bouncy Mode**: Full phrases with organic spring-bouncing words on the beat, smooth upward slide transitions, and pure glowing text highlights (zero box outlines).
2. 📜 **Classic Waterfall Scroll Mode**: Apple Music-style smooth vertical flowing waterfall with centered active line and photographic depth-of-field blur.

Both the **in-page overlay** (`Alt + L`) and the **standalone cinema tab** (`Alt + Shift + L`) provide the exact same seamless experience.

---

## 🎛️ Two Switchable Display Modes (Toggle with `V`)

### 1. 📸 Instagram Story Bouncy Reel Mode
- **Organic Spring Word Pop**: Each word bounces forward (`scale(1.18)`) in sync with the singer's voice.
- **Full Context**: Surrounding words in the phrase remain visible so you can always read ahead.
- **Pure Text Highlight**: No clunky boxes or borders around words. Highlights use a radiant text-shadow glow (`0 0 16px, 0 0 32px, 0 0 60px`).
- **Rhythmic Phrase Transitions**: When a phrase finishes, it glides upward and the next phrase slides in from below.
- **Pulsing Radial Glow**: Ambient backdrop aura breathes with the beat.

### 2. 📜 Classic Waterfall Scroll Mode
- **Centered Kinetic Flow**: Active line stays anchored at the vertical center of the screen as lyrics scroll automatically.
- **Bold Plus Jakarta Sans**: Active line in commanding `2.85rem` (`font-weight: 900`).
- **Depth-of-Field Blur**: Inactive lines are dimmed and softly blurred (`0.65px`) for cinematic focus.

---

## 🎭 5 Genre Personalities
Switch vibes manually via the top bar or let it automatically match the song:
- 📸 **Insta Reel** *(Pop / Anthems)*: Clean, bouncy *Plus Jakarta Sans* with cyan laser glow.
- 💥 **Street Drill** *(Rap / Drill)*: Slanted -6° aggressive punch (*Bebas Neue* & *Syne*) with hot crimson neon highlights.
- 🍷 **Editorial Vinyl** *(Lo-Fi / R&B / Soul / Ballads)*: Elegant *Playfair Display* serif with italic word pop and champagne gold aura.
- ⚡ **Cyber Matrix** *(Synthwave / EDM / Electronic)*: Wide futuristic *Space Grotesk* monospace with emerald matrix pulse.
- 📜 **Pure Studio** *(Minimalist)*: Clean Apple Music-style monochrome focus.

---

## 💡 Experimental: Philips WiZ Smart Bulb Ambient Sync
- **Local Zero-Latency Sync**: Connects directly to Philips WiZ multicolor smart bulbs over local Wi-Fi (UDP port 38899).
- **Dynamic Album Art Glow**: Real-time color extraction from playing track artwork paints your room in matching vibes.
- **Vocal & Beat Pulse**: Subtle, rhythmic brightness breathing and color accents as new lyric lines are sung.
- **Lighting Modes**:
  - 🎨 **Album Art Vibrant**: Dynamically tracks cover art palette.
  - ⚡ **Cyber Neon**: Electric cyan and hot magenta.
  - 🌌 **Aurora Emerald**: Deep mystical emerald waves.
  - 🕯️ **Warm Studio**: Cozy 2700K backlight.
- **Controls**: One-click popup in the top navigation bar with live status, brightness slider, and instant test flash.

---

## 💡 How to Use the WiZ Smart Bulb Sync

Because web browsers run in a secure sandbox that cannot send raw local UDP network packets directly to smart bulbs, Cool Lyrics includes a tiny, zero-dependency local bridge:

1. **Start the Bridge**:
   - Double-click `bridge/start-bridge.bat`  
     *OR* in terminal:
     ```bash
     npm run bridge
     ```
2. **Auto-Discovery**: The bridge automatically scans your local Wi-Fi and connects to your Philips WiZ bulb (e.g. `192.168.1.11`).
3. **Turn on Sync in Cool Lyrics**:
   - In either the Cinema Tab or Overlay, click the **`💡 WiZ Light`** button in the top bar.
   - Switch **"Enable Sync"** ON!
   - Your smart bulb will now illuminate in real-time with the music and lyrics!

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
| `V` | **Toggle Display Mode**: Instagram Bouncy Reel &harr; Waterfall Scroll |
| `F` | Toggle Fullscreen Mode |
| `Space` | Play / Pause playback |
| `Esc` | Close In-Page Cinema Overlay |
| `Click on any word/line` | Jump / Seek playback directly to that timestamp |
| `Scroll Wheel` | Temporarily pause auto-scroll to browse |

---

## 🏗️ Architecture

```
cool-lyrics/
├── manifest.json            # Manifest V3 configuration & CSP
├── icons/                   # High-res neon icons (16, 48, 128px)
├── bridge/
│   ├── wiz-bridge.js        # Zero-dependency local Node daemon (UDP 38899 <-> HTTP 3737)
│   └── start-bridge.bat     # One-click launcher for Windows
├── utils/
│   ├── title-cleaner.js     # Cleans YouTube/Spotify junk metadata ("(Official Video)", etc.)
│   ├── genre-detector.js    # Smart genre/vibe estimator (Reel, Drill, Vinyl, Matrix)
│   ├── lrc-parser.js        # Multi-line context & word timing engine
│   ├── lyrics-api.js        # LRCLIB API client with caching & fallback search
│   ├── color-extractor.js   # Vibrant palette extraction & harmonic mood generation
│   └── wiz-client.js        # Browser client for WiZ bulb bridge communication
├── content/
│   ├── content.js           # Multi-player monitor & scrubber controller
│   ├── overlay.js           # In-page dual-mode lyric component (Bouncy + Waterfall)
│   └── overlay.css          # Bouncy spring keyframes, slide-up lines & OLED backdrop
├── cinema/
│   ├── cinema.html          # Standalone theater mode for dual-monitor / TV
│   ├── cinema.js            # Standalone state synchronization & controls
│   └── cinema.css           # Standalone responsive cinema layout
└── popup/
    ├── popup.html           # Toolbar action popup
    ├── popup.js             # Detects active song & quick launchers
    └── popup.css            # Dark sleek toolbar UI
```
