chrome.storage.local.set({ [tab.url]: newTitle }, () => {
  console.log('Title saved for', tab.url);
});
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.local.get([tab.url], (result) => {
    if (result[tab.url]) {
      document.getElementById('newTitle').value = result[tab.url];
    }
  });
});
