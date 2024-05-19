const defaultPrompts = [
    { id: "conveyInfo", text: "Convey the most essential information while reducing the amount of tokens used.", favorite: false },
    { id: "explainSimply", text: "Explain in 3 lines using simple language and no metaphors. Make sure to capture the entire essence in your explanation.", favorite: true },
    { id: "outlineFeedback", text: "Come up with an outline for approaching the solution. Then give yourself constructive feedback on this outline, then come up with another outline which improves using that feedback.", favorite: false },
    { id: "summarize", text: "Summarize the text focusing on the main points.", favorite: true },
    { id: "detailedSteps", text: "Provide detailed step-by-step instructions for achieving the desired outcome.", favorite: false }
  ];
  
  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
  }
  
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "openPromptManager",
      title: "Open GPT Prompt Manager",
      contexts: ["all"]
    });
  
    // Create context menu items for favorite prompts
    defaultPrompts.filter(prompt => prompt.favorite).forEach(prompt => {
      chrome.contextMenus.create({
        id: `prompt_${prompt.id}`,
        parentId: "openPromptManager",
        title: `⭐ ${truncateText(prompt.text, 50)}`, // Truncate text for display
        contexts: ["all"]
      });
    });
  
    // Create context menu separator
    chrome.contextMenus.create({
      id: "separator",
      parentId: "openPromptManager",
      type: "separator",
      contexts: ["all"]
    });
  
    // Create context menu items for non-favorite prompts
    defaultPrompts.filter(prompt => !prompt.favorite).forEach(prompt => {
      chrome.contextMenus.create({
        id: `prompt_${prompt.id}`,
        parentId: "openPromptManager",
        title: truncateText(prompt.text, 50), // Truncate text for display
        contexts: ["all"]
      });
    });
  });
  
  let lastClickTime = 0;
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const prompt = defaultPrompts.find(p => `prompt_${p.id}` === info.menuItemId);
    if (prompt) {
      const currentTime = new Date().getTime();
      const isDoubleClick = currentTime - lastClickTime < 300;
      lastClickTime = currentTime;
  
      // Show notification with the full text
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png', // Ensure this path is correct
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
  });
  