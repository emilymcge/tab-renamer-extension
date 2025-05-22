// Listen for updates to any browser tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('triggered');
  // Only proceed when the tab has fully loaded, and has a valid URL
  if (changeInfo.status === 'complete' && tab.url) {
    // Retrieve the saved custom title for this URL from local storage
    chrome.storage.local.get([tab.url], (result) => {
      const savedTitle = result[tab.url];

      // If a saved title exists for this tab's URL, inject script into tab
      if (savedTitle) {
        chrome.scripting.executeScript({
          target: { tabId }, // Specify which tab to run the script in

          // Function to be injected into the tab's web page
          func: (title) => {
            // Helper function that applies the custom title
            const setCustomTitle = () => {
              if (document.title !== title) {
                document.title = title;
              }
            };

            setCustomTitle(); // Run once immediately

            // Watch the <title> element for changes (e.g., by site JavaScript)
            const titleEl = document.querySelector('title');
            if (titleEl) {
              const observer = new MutationObserver(setCustomTitle);
              observer.observe(titleEl, { childList: true }); // Reacts to text changes
            }

            // As a fallback, check and reset the title every second
            setInterval(setCustomTitle, 1000);
          },

          // Pass the saved title as an argument into the injected function
          args: [savedTitle],
        });
      }
    });
  }
});

/*
🔗 References:
- [chrome.tabs.onUpdated](https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated)
- [chrome.scripting.executeScript](https://developer.chrome.com/docs/extensions/reference/scripting/#method-executeScript)
- [chrome.storage.local](https://developer.chrome.com/docs/extensions/reference/storage/#property-local)
- [MutationObserver - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [setInterval - MDN](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
- [document.title - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/title)
*/

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'contextMenuOption',
    title: 'Rename this tab!',
    contexts: ['all'],
  });
});

// chrome.contextMenus.onClicked.addListener(function (info, tab) {
//   if (info.menuItemId === 'contextMenuOption' && tab.id) {

//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       func: () => {
//         const newTitle = prompt('Enter new tab name:');
//         renameTab(newTitle);
//       },
//     });
//     console.log('Menu item clicked!', info, tab);
//   }
// });


//all this below is pasted code from chat gpt trying to save the names like it does w the gui
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'contextMenuOption' && tab.id && tab.url) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const newTitle = prompt('Enter new tab name:');
        if (newTitle !== null) {
          chrome.runtime.sendMessage({
            type: 'saveTitle',
            url: window.location.href,
            title: newTitle,
          });
          document.title = newTitle;
        }
      },
    });
  }
});

// Listen for messages from the content script to store title
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'saveTitle' && msg.url && msg.title) {
    chrome.storage.local.set({ [msg.url]: msg.title });
  }
});
