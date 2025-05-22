chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get([tab.url], (result) => {
      const savedTitle = result[tab.url];
      if (savedTitle) {
        chrome.scripting.executeScript({
          target: { tabId },
          func: (title) => {
            const applyTitle = () => {
              if (document.title !== title) {
                document.title = title;
              }
            };

            applyTitle();

            const observer = new MutationObserver(applyTitle);
            const titleElement = document.querySelector('title');
            if (titleElement) {
              observer.observe(titleElement, { childList: true });
            }

            setInterval(applyTitle, 1000); // fallback in case of missed changes
          },
          args: [savedTitle]
        });
      }
    });
  }
});
