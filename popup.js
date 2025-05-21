document.getElementById('renameBtn').addEventListener('click', async () => {
  const newTitle = document.getElementById('newTitle').value.trim();
  if (!newTitle) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (title) => { document.title = title; },
    args: [newTitle]
  });
});
