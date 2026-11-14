/**
 * Title & Artist Cleaner for music stream metadata
 * Normalizes YouTube, YouTube Music, and Spotify titles for accurate lyrics matching.
 */

const TitleCleaner = {
  /**
   * Cleans a track title and attempts to extract artist if not provided or merged.
   * @param {string} rawTitle 
   * @param {string} rawArtist 
   * @returns {{ cleanTitle: string, cleanArtist: string }}
   */
  clean(rawTitle = '', rawArtist = '') {
    let title = (rawTitle || '').trim();
    let artist = (rawArtist || '').trim();

    // Decode HTML entities if any
    title = this.decodeHtml(title);
    artist = this.decodeHtml(artist);

    // If title has "Artist - Track" format (very common on YouTube)
    if ((!artist || artist.toLowerCase().includes('vevo') || artist.toLowerCase().includes('topic')) && title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }
    }

    // Common junk patterns to strip from titles
    const junkPatterns = [
      /\s*[\(\[\{]?(?:official\s*(?:music\s*)?(?:video|audio|lyric\s*video|visualizer|clip|stream)?)[\)\]\}]?/gi,
      /\s*[\(\[\{]?(?:4k|1080p|hd|uhd|remastered|remaster|live|acoustic|deluxe|bonus\s*track|explicit|clean\s*version)[\)\]\}]?/gi,
      /\s*[\(\[\{]?(?:lyrics?|lyric\s*video|with\s*lyrics|full\s*song)[\)\]\}]?/gi,
      /\s*[\(\[\{]?(?:prod\.?|produced\s*by|directed\s*by)[^\)\]\}]+[\)\]\}]?/gi,
      /\s*[\(\[\{]?(?:feat\.?|ft\.?|featuring)[^\)\]\}]+[\)\]\}]?/gi,
      /\s*[\(\[\{]?(?:album\s*version|single\s*version|extended\s*version)[\)\]\}]?/gi,
      /^\d+\.\s*/, // Track numbers at start like "01. "
      /["'']/g    // Stray surrounding quotes
    ];

    for (const pattern of junkPatterns) {
      title = title.replace(pattern, ' ');
    }

    // Also clean artist if it has "- Topic" or "VEVO"
    artist = artist.replace(/\s*-\s*Topic$/i, '');
    artist = artist.replace(/VEVO$/i, '');
    artist = artist.replace(/\s*[\(\[\{]?(?:feat\.?|ft\.?|featuring)[^\)\]\}]+[\)\]\}]?/gi, '');

    // Normalize multiple spaces
    title = title.replace(/\s+/g, ' ').trim();
    artist = artist.replace(/\s+/g, ' ').trim();

    return {
      cleanTitle: title,
      cleanArtist: artist
    };
  },

  decodeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TitleCleaner;
}
