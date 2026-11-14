/**
 * LRC Synchronized Lyrics Parser & Synchronization Utility
 */

const LrcParser = {
  /**
   * Parse an LRC formatted string into an array of timed lyric objects
   * @param {string} lrcString
   * @returns {{ lines: Array<{time: number, text: string}>, metadata: Object, isSynced: boolean }}
   */
  parse(lrcString) {
    if (!lrcString || typeof lrcString !== 'string') {
      return { lines: [], metadata: {}, isSynced: false };
    }

    const lines = [];
    const metadata = {};
    const rawLines = lrcString.split(/\r?\n/);

    const timeRegex = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g;
    const metaRegex = /^\[([a-zA-Z]+):([^\]]+)\]$/;

    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Check metadata tags e.g. [ar:Artist], [ti:Title], [offset:500]
      const metaMatch = trimmed.match(metaRegex);
      if (metaMatch && !trimmed.match(timeRegex)) {
        metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
        continue;
      }

      // Check timestamp tags
      const matches = [...trimmed.matchAll(timeRegex)];
      if (matches.length > 0) {
        // Strip timestamps to get the lyric text
        const text = trimmed.replace(timeRegex, '').trim();

        // A single line may have multiple timestamps e.g. [00:12.00][00:24.00] Chorus
        for (const match of matches) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
          const time = minutes * 60 + seconds + millis / 1000;

          lines.push({
            time,
            text: text || '♪' // Fallback for instrumental or vocal break lines
          });
        }
      }
    }

    // Sort chronologically
    lines.sort((a, b) => a.time - b.time);

    // If metadata includes global offset (in milliseconds)
    const globalOffsetMs = parseInt(metadata.offset || '0', 10);
    if (!isNaN(globalOffsetMs) && globalOffsetMs !== 0) {
      const offsetSec = globalOffsetMs / 1000;
      for (const line of lines) {
        line.time += offsetSec;
      }
    }

    // Check if we found valid synced lines
    if (lines.length > 0) {
      return { lines, metadata, isSynced: true };
    }

    // Fallback: If not formatted with timestamps, treat as plain text lines
    const plainLines = rawLines
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('['))
      .map((text, idx) => ({
        time: idx * 4, // placeholder time interval
        text
      }));

    return {
      lines: plainLines,
      metadata,
      isSynced: false
    };
  },

  /**
   * Finds the currently active lyric line index based on current playback time.
   * @param {Array<{time: number, text: string}>} lines 
   * @param {number} currentTime (seconds)
   * @param {number} offset (seconds, manual adjustment)
   * @returns {number} Index of the active line, or -1 if before the first line
   */
  getActiveIndex(lines, currentTime, offset = 0) {
    if (!lines || lines.length === 0) return -1;
    const adjustedTime = currentTime + offset;

    // Binary search for efficiency
    let low = 0;
    let high = lines.length - 1;
    let result = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lines[mid].time <= adjustedTime) {
        result = mid;
        low = mid + 1; // Try to find a later line that also satisfies the condition
      } else {
        high = mid - 1;
      }
    }

    return result;
  },

  /**
   * Format seconds to mm:ss format
   * @param {number} seconds 
   * @returns {string}
   */
  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LrcParser;
}
