document.getElementById('renameBtn').addEventListener('click', async () => {
  const newTitle = document.getElementById('newTitle').value.trim();
  if (!newTitle) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
  alert("Cannot rename tabs on internal Chrome pages (chrome://)");
  return;
}


  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (title) => { document.title = title; },
    args: [newTitle]
  });
  chrome.storage.local.set({ [tab.url]: newTitle }, () => {
  console.log('Saved title for:', tab.url);
});
});

document.getElementById('searchBtn').addEventListener('click', async () => {
  const searchTerm = document.getElementById('searchTitle').value.trim().toLowerCase();
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = ''; // Clear old results

  if (!searchTerm) return;

  chrome.storage.local.get(null, async (savedTitles) => {
    const tabs = await chrome.tabs.query({});
    let matches = [];

    for (const tab of tabs) {
      const customTitle = savedTitles[tab.url];
      if (customTitle && customTitle.toLowerCase().includes(searchTerm)) {
        matches.push({ tab, customTitle });
      }
    }

    if (matches.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No matching tabs found.';
      resultsList.appendChild(li);
      return;
    }

    // Populate result list
    matches.forEach(({ tab, customTitle }) => {
      const li = document.createElement('li');
      li.textContent = customTitle;
      li.style.cursor = 'pointer';
      li.style.padding = '4px 0';
      li.addEventListener('click', () => {
        chrome.tabs.update(tab.id, { active: true });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const flash = () => {
              const original = document.body.style.outline;
              let counter = 0;
              const interval = setInterval(() => {
                document.body.style.outline = counter % 2 === 0
                  ? '5px solid red'
                  : 'none';
                counter++;
                if (counter > 5) {
                  clearInterval(interval);
                  document.body.style.outline = original;
                }
              }, 300);
            };
            flash();
          }
        });
      });

      resultsList.appendChild(li);
    });
  });
});
