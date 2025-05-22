chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get([tab.url], (result) => {
      const savedTitle = result[tab.url];
      if (savedTitle) {
        chrome.scripting.executeScript({
          target: { tabId },
          func: (title) => {
            const setCustomTitle = () => {
              if (document.title !== title) {
                document.title = title;
              }
            };

            // Run once initially
            setCustomTitle();

            // Observe the <title> element directly
            const titleEl = document.querySelector('title');
            if (titleEl) {
              const observer = new MutationObserver(setCustomTitle);
              observer.observe(titleEl, { childList: true });
            }

            // Also fallback to polling every second
            setInterval(setCustomTitle, 1000);
          },
          args: [savedTitle]
        });
      }
    });
  }
});
