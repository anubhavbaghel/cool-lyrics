/**
 * Cool Lyrics - Background Service Worker
 * Manages player tab sessions, lyrics caching, and message routing.
 */

let activePlayerTabId = null;
let currentSession = {
  track: null,
  lyrics: null,
  state: null
};

// Listen for messages from content scripts and UI pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action } = message;

  if (action === 'TRACK_CHANGED') {
    if (sender.tab) {
      activePlayerTabId = sender.tab.id;
    }
    currentSession.track = message.track;
    currentSession.lyrics = message.lyrics;

    // Broadcast to any open cinema or popup pages
    broadcastMessage({
      action: 'TRACK_CHANGED',
      track: message.track,
      lyrics: message.lyrics
    });
    sendResponse({ received: true });
    return true;
  }

  if (action === 'PLAYBACK_TICK') {
    if (sender.tab) {
      activePlayerTabId = sender.tab.id;
    }
    currentSession.state = message.state;

    // Relay to open cinema tabs
    broadcastMessage({
      action: 'PLAYBACK_TICK',
      state: message.state
    });
    sendResponse({ received: true });
    return true;
  }

  if (action === 'GET_ACTIVE_SESSION') {
    sendResponse(currentSession);
    return true;
  }

  if (action === 'OPEN_CINEMA_TAB') {
    openCinemaTab();
    sendResponse({ opened: true });
    return true;
  }

  if (action === 'MEDIA_COMMAND') {
    // Relay media action to active music player tab
    if (activePlayerTabId) {
      chrome.tabs.sendMessage(activePlayerTabId, {
        action: message.command,
        ...message.data
      }).catch(() => {
        // Tab may have closed or navigated, attempt finding any music tab
        findActivePlayerTab().then(tab => {
          if (tab) {
            activePlayerTabId = tab.id;
            chrome.tabs.sendMessage(tab.id, {
              action: message.command,
              ...message.data
            }).catch(() => {});
          }
        });
      });
    }
    sendResponse({ relayed: true });
    return true;
  }

  return true;
});

// Broadcast a message to all extension pages (cinema tabs, popups)
function broadcastMessage(msg) {
  // Send to tabs running extension pages
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.url && tab.url.includes(chrome.runtime.id)) {
        chrome.tabs.sendMessage(tab.id, msg).catch(() => {});
      }
    }
  });
}

function openCinemaTab() {
  const cinemaUrl = chrome.runtime.getURL('cinema/cinema.html');
  chrome.tabs.query({ url: cinemaUrl }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
      if (tabs[0].windowId) {
        chrome.windows.update(tabs[0].windowId, { focused: true });
      }
    } else {
      chrome.tabs.create({ url: cinemaUrl });
    }
  });
}

async function findActivePlayerTab() {
  const tabs = await chrome.tabs.query({
    url: [
      '*://open.spotify.com/*',
      '*://music.youtube.com/*',
      '*://www.youtube.com/*'
    ]
  });
  // Prefer audible tabs first
  const audible = tabs.find(t => t.audible);
  return audible || tabs[0] || null;
}

// Global shortcut handler
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-cinema-overlay') {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'TOGGLE_OVERLAY' }).catch(() => {
        // If not on supported player tab, open cinema tab
        openCinemaTab();
      });
    }
  } else if (command === 'open-cinema-tab') {
    openCinemaTab();
  }
});
