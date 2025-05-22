// Add click listener to the "Rename Tab" button
document.getElementById('renameBtn').addEventListener('click', async () => {
  // Get the value from the input field and trim whitespace
  const newTitle = document.getElementById('newTitle').value.trim();
  if (!newTitle) return; // Exit if the field is empty

  //Query for the currently active tab in the current window
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  // Guard clause: Don't run on chrome:// internal pages
  if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
    alert('Cannot rename tabs on internal Chrome pages (chrome://)');
    return;
  }

  // Inject a script into the current tab to change the document's title
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (title) => {
      document.title = title;
    }, // code run inside tab
    args: [newTitle], // argument passed into the function above
  });

  // Store the new title in chrome.storage.local using the tab's URL as the key
  chrome.storage.local.set({ [tab.url]: newTitle }, () => {
    console.log('Saved title for:', tab.url);
  });
  window.close;
});

/*
  🔗 MDN References:
  - [chrome.tabs.query()](https://developer.chrome.com/docs/extensions/reference/tabs/#method-query)
  - [chrome.scripting.executeScript()](https://developer.chrome.com/docs/extensions/reference/scripting/#method-executeScript)
  - [chrome.storage.local](https://developer.chrome.com/docs/extensions/reference/storage/#property-local)
  - [Element.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
*/

//allows user to press enter to change tab name
document.getElementById('newTitle').addEventListener('keydown', async (e) => {
  const newTitle = document.getElementById('newTitle').value.trim();
  if (!newTitle) return;
  // Get the value from the input field and trim whitespace
  if (e.key === 'Enter') {
    renameTab(newTitle);
  }
  window.close;
});

// Add click listener to the "Find Tab" button
document.getElementById('searchBtn').addEventListener('click', async () => {
  // Get search term from input and convert to lowercase
  const searchTerm = document
    .getElementById('searchTitle')
    .value.trim()
    .toLowerCase();

  // Get the results <ul> and clear it from previous searches
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = '';

  if (!searchTerm) return;

  // Fetch all saved titles from chrome.storage.local
  chrome.storage.local.get(null, async (savedTitles) => {
    const tabs = await chrome.tabs.query({});
    let matches = [];

    // Loop through open tabs and match saved titles against search term
    for (const tab of tabs) {
      const customTitle = savedTitles[tab.url];
      if (customTitle && customTitle.toLowerCase().includes(searchTerm)) {
        matches.push({ tab, customTitle });
      }
    }

    // If no matches found, show a message in the list
    if (matches.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No matching tabs found.';
      resultsList.appendChild(li);
      return;
    }

    // For each matching tab, create a clickable list item
    matches.forEach(({ tab, customTitle }) => {
      const li = document.createElement('li');
      li.textContent = customTitle;
      li.style.cursor = 'pointer';
      li.style.padding = '4px 0';

      // When a result is clicked, focus the tab and flash its content
      li.addEventListener('click', () => {
        chrome.tabs.update(tab.id, { active: true });

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Create a flashing red outline around the page
            const flash = () => {
              const original = document.body.style.outline;
              let counter = 0;
              const interval = setInterval(() => {
                document.body.style.outline =
                  counter % 2 === 0 ? '5px solid red' : 'none';
                counter++;
                if (counter > 5) {
                  clearInterval(interval);
                  document.body.style.outline = original;
                }
              }, 300);
            };
            flash();
          },
        });
      });

      resultsList.appendChild(li); // Add result to the list
    });
  });
});

/*
  MDN References:
  - [chrome.tabs.update()](https://developer.chrome.com/docs/extensions/reference/tabs/#method-update)
  - [document.createElement()](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
  - [Element.appendChild()](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild)
  - [HTMLElement.style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)
  - [MutationObserver (used in background.js)](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
*/

document.getElementById('icon-boxes').addEventListener('change', async (e) => {
  const iconUrl = chrome.runtime.getURL(e.target.value);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [iconUrl],
    func: (url) => {
      console.log('Changing favicon to:', url);

      // Remove all existing favicon links
      document
        .querySelectorAll("link[rel*='icon']")
        .forEach((el) => el.remove());

      // Create a new one
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = url + '?v=' + Date.now(); // cache-busting
      document.head.appendChild(link);
    },
  });
});
//abstracted rename tab
async function renameTab(title) {
  const newTitle = document.getElementById('newTitle').value.trim();
  if (!newTitle) return; // Exit if the field is empty

  //Query for the currently active tab in the current window
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  // Guard clause: Don't run on chrome:// internal pages
  if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
    alert('Cannot rename tabs on internal Chrome pages (chrome://)');
    return;
  }

  // Inject a script into the current tab to change the document's title
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (title) => {
      document.title = title;
    }, // code run inside tab
    args: [newTitle], // argument passed into the function above
  });

  // Store the new title in chrome.storage.local using the tab's URL as the key
  chrome.storage.local.set({ [tab.url]: newTitle }, () => {
    console.log('Saved title for:', tab.url);
  });
  window.close;
}
