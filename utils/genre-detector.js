/**
 * Smart Genre & Instagram-Style Vibe Detector
 * Maps track metadata to expressive visual personalities with full-phrase typography.
 */

const GenreDetector = {
  vibes: {
    REEL: {
      id: 'reel',
      name: '📸 Insta Reel',
      description: 'Bouncy karaoke pop, bright emphasis, clean modern poster',
      font: "'Plus Jakarta Sans', -apple-system, sans-serif",
      accent: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.55)'
    },
    SLANTED: {
      id: 'slanted',
      name: '💥 Street Drill',
      description: 'Slanted aggressive typography, heavy rhythm punch, rap poster',
      font: "'Bebas Neue', 'Syne', 'Impact', sans-serif",
      accent: '#ff0055',
      glow: 'rgba(255, 0, 85, 0.6)'
    },
    EDITORIAL: {
      id: 'editorial',
      name: '🍷 Editorial Vinyl',
      description: 'High-fashion editorial serif with italics, golden aura, poetic soul',
      font: "'Playfair Display', 'Georgia', serif",
      accent: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.45)'
    },
    CYBER: {
      id: 'cyber',
      name: '⚡ Cyber Matrix',
      description: 'Futuristic wide letter-spacing, electronic cyan laser glow',
      font: "'Space Grotesk', 'Courier New', monospace",
      accent: '#10b981',
      glow: 'rgba(16, 185, 129, 0.55)'
    },
    CLASSIC: {
      id: 'classic',
      name: '📜 Pure Studio',
      description: 'Refined Swiss typography, seamless waterfall scroll',
      font: "'Plus Jakarta Sans', system-ui, sans-serif",
      accent: '#ffffff',
      glow: 'rgba(255, 255, 255, 0.3)'
    }
  },

  /**
   * Guess the best visual personality based on artist and track keywords
   * @param {string} artist 
   * @param {string} title 
   * @returns {string} vibe id
   */
  detectVibe(artist = '', title = '') {
    const text = `${artist} ${title}`.toLowerCase();

    // 1. Hip-Hop / Rap / Trap / Drill -> Slanted Street Drill
    if (/\b(drake|travis scott|kanye|eminem|kendrick|future|carti|lil |21 savage|metro boomin|rap|hiphop|drill|trap|j\.? cole|post malone|dababy|central cee|gunna|baby keem|nf|50 cent)\b/i.test(text)) {
      return 'slanted';
    }

    // 2. Electronic / Synthwave / EDM / Cyber -> Cyber Matrix
    if (/\b(daft punk|skrillex|deadmau5|the weeknd|kavinsky|synth|electro|techno|house|dubstep|edm|calvin harris|david guetta|tiesto|avicii|cyber|bass|alesso|zedd)\b/i.test(text)) {
      return 'cyber';
    }

    // 3. Lo-Fi / R&B / Soul / Ballads / Indie -> Editorial Vinyl
    if (/\b(sza|frank ocean|billie eilish|joji|lana del rey|clairo|phoebe bridgers|mac miller|chill|lofi|ambient|steve lacy|rex orange county|tyler|adele|queen|daniel caesar|laufey|hontz|chopin|classical|jazz|sam smith|taylor swift)\b/i.test(text)) {
      return 'editorial';
    }

    // Default to Insta Reel for pop, anthem, rock, dance, or generic
    return 'reel';
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GenreDetector;
}
