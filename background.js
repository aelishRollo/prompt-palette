const defaultPrompts = [
  { id: "conveyInfo", text: "Convey the most essential information while reducing the amount of tokens used.", favorite: false },
  { id: "explainSimply", text: "Explain in 3 lines using simple language and no metaphors. Make sure to capture the entire essence in your explanation.", favorite: true },
  { id: "outlineFeedback", text: "Come up with an outline for approaching the solution. Then give yourself constructive feedback on this outline, then come up with another outline which improves using that feedback.", favorite: false },
  { id: "summarize", text: "Summarize the text focusing on the main points.", favorite: true },
  { id: "detailedSteps", text: "Provide detailed step-by-step instructions for achieving the desired outcome.", favorite: false }
];

// Function to truncate text for display
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
}

// Function to save prompts to LocalStorage
function savePromptsToLocalStorage(prompts) {
  chrome.storage.local.set({ prompts: prompts }, () => {
    console.log('Prompts saved to LocalStorage');
  });
}

// Function to load prompts from LocalStorage
function loadPromptsFromLocalStorage(callback) {
  chrome.storage.local.get('prompts', (data) => {
    if (data.prompts) {
      callback(data.prompts);
    } else {
      callback(defaultPrompts);
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  // Load prompts from LocalStorage and create context menu items
  loadPromptsFromLocalStorage((prompts) => {
    chrome.contextMenus.create({
      id: "openPromptManager",
      title: "Open GPT Prompt Manager",
      contexts: ["all"]
    });

    // Create context menu item for adding new prompts
    chrome.contextMenus.create({
      id: "addNewPrompt",
      title: "Add New Prompt",
      contexts: ["all"],
      parentId: "openPromptManager"
    });

    // Create separator after "Add New Prompt"
    chrome.contextMenus.create({
      id: "separatorTop",
      parentId: "openPromptManager",
      type: "separator",
      contexts: ["all"]
    });

    // Create context menu items for favorite prompts
    prompts.filter(prompt => prompt.favorite).forEach(prompt => {
      chrome.contextMenus.create({
        id: `prompt_${prompt.id}`,
        parentId: "openPromptManager",
        title: `⭐ ${truncateText(prompt.text, 50)}`, // Truncate text for display
        contexts: ["all"]
      });
    });

    // Create context menu separator for favorites
    chrome.contextMenus.create({
      id: "separatorFavorites",
      parentId: "openPromptManager",
      type: "separator",
      contexts: ["all"]
    });

    // Create context menu items for non-favorite prompts
    prompts.filter(prompt => !prompt.favorite).forEach(prompt => {
      chrome.contextMenus.create({
        id: `prompt_${prompt.id}`,
        parentId: "openPromptManager",
        title: truncateText(prompt.text, 50), // Truncate text for display
        contexts: ["all"]
      });
    });

    // Update the defaultPrompts array with the loaded prompts
    defaultPrompts.splice(0, defaultPrompts.length, ...prompts);
  });
});

let lastClickTime = 0;

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addNewPrompt") {
    // Prompt the user to enter a new prompt
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const newPrompt = prompt("Enter your new GPT prompt:");
        if (newPrompt) {
          chrome.runtime.sendMessage({ action: "addNewPrompt", text: newPrompt });
        }
      }
    });
  } else {
    // Check if the clicked item is a known prompt
    let prompt = defaultPrompts.find(p => `prompt_${p.id}` === info.menuItemId);

    // If not found, check if it's a dynamically added prompt
    if (!prompt) {
      prompt = defaultPrompts.find(p => p.id === info.menuItemId);
    }

    if (prompt) {
      const currentTime = new Date().getTime();
      const isDoubleClick = currentTime - lastClickTime < 300;
      lastClickTime = currentTime;

      // Show notification with the full text
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png', // Path to an icon image for the notification
        title: 'Full Prompt Text',
        message: prompt.text
      });

      // Check if the tab URL is valid
      if (!tab.url.startsWith('chrome://')) {
        // Inject content script and then send message to copy to clipboard
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }, () => {
          chrome.tabs.sendMessage(tab.id, { action: 'copyToClipboard', text: prompt.text }, () => {
            console.log(`Copied: ${prompt.text}`);
            if (isDoubleClick) {
              // Close the context menu (refresh the page to close it)
              chrome.tabs.reload(tab.id);
            }
          });
        });
      } else {
        console.error('Cannot access a chrome:// URL');
      }
    }
  }
});

// Listen for the message from the content script to add a new prompt
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "addNewPrompt") {
    const newPrompt = {
      id: `prompt_${Date.now()}`,
      text: request.text,
      favorite: false
    };
    defaultPrompts.push(newPrompt);

    // Add the new prompt to the context menu
    chrome.contextMenus.create({
      id: `prompt_${newPrompt.id}`,
      parentId: "openPromptManager",
      title: truncateText(newPrompt.text, 50),
      contexts: ["all"]
    });

    // Save the updated prompts to LocalStorage
    savePromptsToLocalStorage(defaultPrompts);
  }
});
