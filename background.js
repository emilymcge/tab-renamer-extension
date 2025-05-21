chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get([tab.url], (result) => {
      if (result[tab.url]) {
        chrome.scripting.executeScript({
          target: { tabId },
          func: (title) => { document.title = title; },
          args: [result[tab.url]]
        });
      }
    });
  }
});
