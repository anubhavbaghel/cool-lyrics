/**
 * Cool Lyrics - Popup Action Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const trackArt = document.getElementById('track-art');
  const trackName = document.getElementById('track-name');
  const trackArtist = document.getElementById('track-artist');
  const trackPlatform = document.getElementById('track-platform');
  const statusPill = document.getElementById('status-pill');

  const btnInPage = document.getElementById('btn-in-page');
  const btnStandalone = document.getElementById('btn-standalone');

  // Query background for current session
  chrome.runtime.sendMessage({ action: 'GET_ACTIVE_SESSION' }, (session) => {
    if (session && session.track && session.track.title) {
      updateUI(session.track);
    } else {
      // Check if current tab is a music player tab
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab && tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: 'GET_PLAYBACK_STATE' }, (res) => {
            if (res && res.track && res.track.title) {
              updateUI(res.track);
            }
          });
        }
      });
    }
  });

  function updateUI(track) {
    trackName.textContent = track.title || 'Unknown Title';
    trackArtist.textContent = track.artist || 'Unknown Artist';
    trackPlatform.textContent = track.platform ? `Playing on ${track.platform}` : 'Web Player';
    statusPill.textContent = 'Active';
    statusPill.style.color = '#10b981';
    statusPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    statusPill.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';

    if (track.artwork) {
      trackArt.src = track.artwork;
    }
  }

  // Button: Toggle in-page overlay on the active tab or player tab
  btnInPage.addEventListener('click', async () => {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if current tab is a music player
    const isPlayerTab = currentTab && currentTab.url && (
      currentTab.url.includes('open.spotify.com') ||
      currentTab.url.includes('music.youtube.com') ||
      currentTab.url.includes('youtube.com')
    );

    if (isPlayerTab) {
      chrome.tabs.sendMessage(currentTab.id, { action: 'TOGGLE_OVERLAY' });
      window.close();
    } else {
      // Find the active player tab and switch to it or open standalone cinema
      const tabs = await chrome.tabs.query({
        url: [
          '*://open.spotify.com/*',
          '*://music.youtube.com/*',
          '*://www.youtube.com/*'
        ]
      });

      if (tabs.length > 0) {
        const playerTab = tabs.find(t => t.audible) || tabs[0];
        await chrome.tabs.update(playerTab.id, { active: true });
        if (playerTab.windowId) {
          await chrome.windows.update(playerTab.windowId, { focused: true });
        }
        chrome.tabs.sendMessage(playerTab.id, { action: 'TOGGLE_OVERLAY' });
        window.close();
      } else {
        // Fallback to standalone cinema tab
        chrome.runtime.sendMessage({ action: 'OPEN_CINEMA_TAB' });
        window.close();
      }
    }
  });

  // Button: Open Standalone Cinema Tab
  btnStandalone.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'OPEN_CINEMA_TAB' });
    window.close();
  });
});
