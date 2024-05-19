chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "openPromptManager",
      title: "Open GPT Prompt Manager",
      contexts: ["all"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openPromptManager") {
      // Placeholder for future functionality
      console.log("GPT Prompt Manager clicked");
    }
  });
  