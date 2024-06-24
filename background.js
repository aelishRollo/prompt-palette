let defaultPrompts = [
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
  console.log('Saving prompts to storage:', prompts);
  chrome.storage.local.set({ prompts: prompts }, () => {
    console.log('Prompts saved to LocalStorage');
  });
}

// Function to load prompts from LocalStorage
function loadPromptsFromLocalStorage(callback) {
  chrome.storage.local.get('prompts', (data) => {
    console.log('Loaded prompts from storage:', data.prompts);
    if (data.prompts) {
      callback(data.prompts);
    } else {
      callback(defaultPrompts);
    }
  });
}

// Function to update the context menu
function updateContextMenu() {
  console.log('Updating context menu');
  chrome.contextMenus.removeAll(() => {
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

    // Add context menu item for copying selected prompts
    chrome.contextMenus.create({
      id: "copySelectedPrompts",
      title: "Add Multiple Prompts to Clipboard",
      contexts: ["all"],
      parentId: "openPromptManager"
    });

    // Add context menu item for toggling favorites
    chrome.contextMenus.create({
      id: "toggleFavorite",
      title: "Add or Remove Favorite",
      contexts: ["all"],
      parentId: "openPromptManager"
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  loadPromptsFromLocalStorage((prompts) => {
    defaultPrompts = prompts;
    updateContextMenu();
  });
});

function openPopup(url, widthPercentage, heightPercentage) {
  chrome.system.display.getInfo((displays) => {
    console.log('Displays Info:', displays); // Log display information for debugging
    if (displays && displays.length > 0) {
      const display = displays[0];
      const screenWidth = display.workArea.width;
      const screenHeight = display.workArea.height;

      const width = Math.min(400, screenWidth * widthPercentage);
      const height = Math.min(600, screenHeight * heightPercentage);

      console.log(`Creating popup with width: ${width} and height: ${height}`); // Log popup dimensions for debugging
      chrome.windows.create({
        url: url,
        type: "popup",
        width: width,
        height: height
      });
    } else {
      console.error('No displays found');
    }
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addNewPrompt") {
    openPopup("add_prompt.html", 0.4, 0.3);
  } else if (info.menuItemId === "copySelectedPrompts") {
    openPopup("select_prompts.html", 0.4, 0.6);
  } else if (info.menuItemId === "toggleFavorite") {
    openPopup("toggle_favorite.html", 0.4, 0.6);
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

    // Save the updated prompts to LocalStorage
    savePromptsToLocalStorage(defaultPrompts);
  } else if (request.action === "toggleFavoriteMultiple") {
    console.log('Received toggleFavoriteMultiple message:', request.ids);
    request.ids.forEach(id => {
      const prompt = defaultPrompts.find(p => p.id === id);
      if (prompt) {
        prompt.favorite = !prompt.favorite;
        console.log('Toggled favorite status for prompt:', prompt);
      }
    });
    savePromptsToLocalStorage(defaultPrompts);
  }
});
