/**
 * LRCLIB Synced Lyrics API Client
 * Docs: https://lrclib.net/docs
 */

const LyricsAPI = {
  BASE_URL: 'https://lrclib.net/api',
  cache: new Map(),

  /**
   * Fetch synced or plain lyrics for a track
   * @param {Object} options
   * @param {string} options.track
   * @param {string} options.artist
   * @param {number} [options.duration] in seconds
   * @param {string} [options.album]
   * @returns {Promise<{syncedLyrics: string|null, plainLyrics: string|null, instrumental: boolean, id: number|null}>}
   */
  async fetchLyrics({ track, artist, duration = 0, album = '' }) {
    if (!track) return null;

    const cacheKey = `${artist || ''} - ${track}`.toLowerCase().trim();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 1. First attempt: exact match endpoint
      let result = await this._getExact({ track, artist, duration, album });
      
      // 2. Second attempt: search endpoint if exact failed
      if (!result || (!result.syncedLyrics && !result.plainLyrics)) {
        result = await this._search({ track, artist, duration });
      }

      if (result) {
        this.cache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn('[CoolLyrics] Error fetching lyrics from LRCLIB:', err);
    }

    return null;
  },

  async _getExact({ track, artist, duration, album }) {
    const params = new URLSearchParams({
      track_name: track
    });
    if (artist) params.append('artist_name', artist);
    if (album) params.append('album_name', album);
    if (duration && duration > 0) params.append('duration', Math.round(duration).toString());

    const url = `${this.BASE_URL}/get?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CoolLyricsChromeExtension/1.0 (https://github.com/cool-lyrics)'
      }
    });

    if (res.ok) {
      return await res.json();
    }
    return null;
  },

  async _search({ track, artist, duration }) {
    const query = `${track} ${artist || ''}`.trim();
    const url = `${this.BASE_URL}/search?q=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CoolLyricsChromeExtension/1.0 (https://github.com/cool-lyrics)'
      }
    });

    if (!res.ok) return null;

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) return null;

    // Pick best match: prefer syncedLyrics and closest duration
    let best = null;
    let minDiff = Infinity;

    for (const item of items) {
      if (!item.syncedLyrics && !item.plainLyrics) continue;

      let score = 0;
      if (item.syncedLyrics) score -= 1000; // heavy preference for synced

      if (duration > 0 && item.duration) {
        const diff = Math.abs(item.duration - duration);
        score += diff;
      }

      if (score < minDiff) {
        minDiff = score;
        best = item;
      }
    }

    return best || items[0];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LyricsAPI;
}
