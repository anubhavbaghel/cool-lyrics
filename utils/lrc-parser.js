/**
 * LRC Synchronized Lyrics Parser & Synchronization Utility
 * Enhanced with word-level interpolation for Kinetic Hero displays.
 */

const LrcParser = {
  /**
   * Parse an LRC formatted string into an array of timed lyric objects
   * @param {string} lrcString
   * @returns {{ lines: Array<{time: number, text: string, words: Array<{word: string, time: number, endTime: number}>, duration: number}>, metadata: Object, isSynced: boolean }}
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

      // Metadata tags e.g. [ar:Artist], [ti:Title]
      const metaMatch = trimmed.match(metaRegex);
      if (metaMatch && !trimmed.match(timeRegex)) {
        metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
        continue;
      }

      // Timestamp tags
      const matches = [...trimmed.matchAll(timeRegex)];
      if (matches.length > 0) {
        const text = trimmed.replace(timeRegex, '').trim();

        for (const match of matches) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
          const time = minutes * 60 + seconds + millis / 1000;

          lines.push({
            time,
            text: text || '♪',
            words: [],
            duration: 3
          });
        }
      }
    }

    // Sort chronologically
    lines.sort((a, b) => a.time - b.time);

    // Apply global offset if specified in metadata
    const globalOffsetMs = parseInt(metadata.offset || '0', 10);
    if (!isNaN(globalOffsetMs) && globalOffsetMs !== 0) {
      const offsetSec = globalOffsetMs / 1000;
      for (const line of lines) {
        line.time += offsetSec;
      }
    }

    // Calculate duration & word-level timing for each line
    for (let i = 0; i < lines.length; i++) {
      const current = lines[i];
      const next = lines[i + 1];
      const lineDuration = next ? Math.max(1.5, Math.min(8, next.time - current.time)) : 4.0;
      current.duration = lineDuration;

      // Split line into words
      const rawWords = current.text.split(/\s+/).filter(w => w.length > 0);
      if (rawWords.length > 0) {
        const wordInterval = lineDuration / rawWords.length;
        current.words = rawWords.map((word, wIdx) => ({
          word,
          time: current.time + (wIdx * wordInterval),
          endTime: current.time + ((wIdx + 1) * wordInterval)
        }));
      } else {
        current.words = [{ word: current.text, time: current.time, endTime: current.time + lineDuration }];
      }
    }

    if (lines.length > 0) {
      return { lines, metadata, isSynced: true };
    }

    // Fallback for plain text
    const plainLines = rawLines
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('['))
      .map((text, idx) => {
        const time = idx * 4;
        const rawWords = text.split(/\s+/);
        const interval = 4 / Math.max(1, rawWords.length);
        return {
          time,
          text,
          duration: 4,
          words: rawWords.map((w, wIdx) => ({
            word: w,
            time: time + wIdx * interval,
            endTime: time + (wIdx + 1) * interval
          }))
        };
      });

    return {
      lines: plainLines,
      metadata,
      isSynced: false
    };
  },

  /**
   * Finds the currently active lyric line index based on playback time.
   * @param {Array} lines 
   * @param {number} currentTime 
   * @param {number} offset 
   * @returns {number}
   */
  getActiveIndex(lines, currentTime, offset = 0) {
    if (!lines || lines.length === 0) return -1;
    const adjustedTime = currentTime + offset;

    let low = 0;
    let high = lines.length - 1;
    let result = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lines[mid].time <= adjustedTime) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return result;
  },

  /**
   * Finds the currently active individual word
   * @param {Array} lines 
   * @param {number} currentTime 
   * @param {number} offset 
   * @returns {{ currentWord: string, lineIndex: number, wordIndex: number, lineText: string, nextLineText: string, progress: number }}
   */
  getActiveWord(lines, currentTime, offset = 0) {
    const lineIndex = this.getActiveIndex(lines, currentTime, offset);
    if (lineIndex < 0 || !lines[lineIndex]) {
      return null;
    }

    const line = lines[lineIndex];
    const nextLine = lines[lineIndex + 1];
    const adjustedTime = currentTime + offset;

    let activeWordIndex = 0;
    for (let i = 0; i < line.words.length; i++) {
      if (adjustedTime >= line.words[i].time) {
        activeWordIndex = i;
      }
    }

    const currentWordObj = line.words[activeWordIndex] || { word: line.text, time: line.time, endTime: line.time + line.duration };
    const wordDuration = Math.max(0.1, currentWordObj.endTime - currentWordObj.time);
    const progress = Math.min(1, Math.max(0, (adjustedTime - currentWordObj.time) / wordDuration));

    return {
      currentWord: currentWordObj.word,
      lineIndex,
      wordIndex: activeWordIndex,
      lineText: line.text,
      nextLineText: nextLine ? nextLine.text : '',
      progress
    };
  },

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
