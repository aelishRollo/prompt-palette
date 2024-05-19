const defaultPrompts = [
    { id: "conveyInfo", text: "Convey the most essential information while reducing the amount of tokens used." },
    { id: "explainSimply", text: "Explain in 3 lines using simple language and no metaphors. Make sure to capture the entire essence in your explanation." },
    { id: "outlineFeedback", text: "Come up with an outline for approaching the solution. Then give yourself constructive feedback on this outline, then come up with another outline which improves using that feedback." },
    { id: "summarize", text: "Summarize the text focusing on the main points." },
    { id: "detailedSteps", text: "Provide detailed step-by-step instructions for achieving the desired outcome." }
  ];
  
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "openPromptManager",
      title: "Open GPT Prompt Manager",
      contexts: ["all"]
    });
  
    // Create context menu items for each prompt
    defaultPrompts.forEach(prompt => {
      chrome.contextMenus.create({
        id: `prompt_${prompt.id}`,
        parentId: "openPromptManager",
        title: prompt.text,
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
  
      navigator.clipboard.writeText(prompt.text).then(() => {
        console.log(`Copied: ${prompt.text}`);
        if (isDoubleClick) {
          // Close the context menu (refresh the page to close it)
          chrome.tabs.reload(tab.id);
        }
      }).catch(err => console.error('Failed to write to clipboard', err));
    }
  });
  