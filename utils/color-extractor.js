/**
 * Cool Lyrics - Smart Vibrant Color Extractor & Mood Palette Generator
 * Analyzes track metadata and album artwork to generate harmonious lighting colors.
 */

const ColorExtractor = {
  // Preset mood palettes for genres and vibes
  PRESETS: {
    neonCyan: { r: 0, g: 240, b: 255 },
    neonMagenta: { r: 255, g: 0, b: 128 },
    auroraGreen: { r: 16, g: 235, b: 150 },
    sunsetAmber: { r: 255, g: 140, b: 40 },
    deepViolet: { r: 140, g: 60, b: 255 },
    warmStudio: { temp: 2700, dimming: 100 }
  },

  /**
   * Deterministically generates a vibrant RGB color from a string (e.g., track title + artist)
   */
  getColorFromString(str) {
    if (!str) return this.PRESETS.neonCyan;

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert hash to a rich, saturated hue (0-360)
    const hue = Math.abs(hash) % 360;
    // Saturation 85%, Lightness 50% for vibrant, punchy smart light colors
    return this.hslToRgb(hue / 360, 0.88, 0.52);
  },

  /**
   * Attempts to extract the most vibrant dominant color from an image element
   * Falls back gracefully to string-derived mood palette if CORS blocks pixel access
   */
  extractFromImage(imgElement, fallbackString) {
    return new Promise((resolve) => {
      if (!imgElement || !imgElement.complete || !imgElement.naturalWidth) {
        return resolve(this.getColorFromString(fallbackString));
      }

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(this.getColorFromString(fallbackString));

        ctx.drawImage(imgElement, 0, 0, 32, 32);
        const imgData = ctx.getImageData(0, 0, 32, 32).data;

        let bestColor = null;
        let maxVibrancy = -1;

        // Sample pixels every 4th pixel for speed
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // Skip transparent

          // Skip near-black and near-white
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 35 || brightness > 230) continue;

          // Vibrancy score = distance between min and max RGB channels
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;

          // Saturation indicator
          if (delta > maxVibrancy) {
            maxVibrancy = delta;
            bestColor = { r, g, b };
          }
        }

        if (bestColor && maxVibrancy > 30) {
          return resolve(bestColor);
        }
      } catch (e) {
        // Tainted canvas due to cross-origin image - fallback to string hash
      }

      resolve(this.getColorFromString(fallbackString));
    });
  },

  /**
   * Helper: HSL to RGB conversion
   */
  hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = this.hueToRgb(p, q, h + 1 / 3);
      g = this.hueToRgb(p, q, h);
      b = this.hueToRgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  },

  hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColorExtractor;
}
