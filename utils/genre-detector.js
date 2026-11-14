/**
 * Smart Genre & Vibe Detector
 * Analyzes track and artist metadata to suggest matching visual aesthetics.
 */

const GenreDetector = {
  genres: {
    KINETIC_PUNCH: {
      id: 'kinetic',
      name: 'Kinetic Punch',
      description: 'Massive punchy words, high energy, bold impact',
      font: "'Syne', 'Impact', 'Arial Black', sans-serif",
      accent: '#ff0055',
      glow: 'rgba(255, 0, 85, 0.45)'
    },
    CYBERPUNK: {
      id: 'cyber',
      name: 'Cyber Neon',
      description: 'Futuristic wide font, neon glow, electronic pulse',
      font: "'Unbounded', 'Courier New', monospace",
      accent: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.5)'
    },
    DREAMWAVE: {
      id: 'dreamwave',
      name: 'Dreamwave',
      description: 'Soft ethereal typography, ambient cloud, floating aura',
      font: "'Outfit', 'Inter', -apple-system, sans-serif",
      accent: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.4)'
    },
    MIDNIGHT_VELVET: {
      id: 'velvet',
      name: 'Midnight Velvet',
      description: 'Dramatic luxury editorial serif, dark romance',
      font: "'Cinzel Decorative', 'Playfair Display', 'Georgia', serif",
      accent: '#e2b170',
      glow: 'rgba(226, 177, 112, 0.35)'
    },
    WATERFALL: {
      id: 'waterfall',
      name: 'Fluid Waterfall',
      description: 'Classic Apple Music-style springy scroll',
      font: "'Inter', system-ui, sans-serif",
      accent: '#ffffff',
      glow: 'rgba(255, 255, 255, 0.25)'
    }
  },

  /**
   * Guess the best visual vibe based on artist and track keywords
   * @param {string} artist 
   * @param {string} title 
   * @returns {string} genre style id
   */
  detectVibe(artist = '', title = '') {
    const text = `${artist} ${title}`.toLowerCase();

    // Hip-hop / Rap / Trap / High-energy drill
    if (/\b(drake|travis scott|kanye|eminem|kendrick|future|carti|lil |21 savage|metro boomin|rap|hiphop|drill|trap|j\.? cole|post malone|dababy|central cee)\b/i.test(text)) {
      return 'kinetic';
    }

    // Electronic / Synthwave / EDM / Cyber
    if (/\b(daft punk|skrillex|deadmau5|the weeknd|kavinsky|synth|electro|techno|house|dubstep|edm|calvin harris|david guetta|tiesto|avicii|cyber|bass)\b/i.test(text)) {
      return 'cyber';
    }

    // Lo-fi / R&B / Dream Pop / Indie / Ambient
    if (/\b(sza|frank ocean|billie eilish|joji|lana del rey|clairo|phoebe bridgers|mac miller|chill|lofi|dream|ambient|steve lacy|rex orange county|tyler)\b/i.test(text)) {
      return 'dreamwave';
    }

    // Rock / Metal / Classical / Jazz / Soulful
    if (/\b(queen|nirvana|metallica|pink floyd|arctic monkeys|beatles|ac\/dc|rock|metal|jazz|orchestra|adele|hontz|chopin|beethoven|led zeppelin)\b/i.test(text)) {
      return 'velvet';
    }

    // Default to Kinetic Hero if high tempo, or Dreamwave
    return 'kinetic';
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GenreDetector;
}
