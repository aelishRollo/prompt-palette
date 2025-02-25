chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "promptPalette",
        title: "Prompt Palette",
        contexts: ["all"]
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "promptPalette") {
        openPopup();
    }
  });

  chrome.commands.onCommand.addListener((command) => {
    if (command === "open_prompt_palette") {
        openPopup();
    }
  });

  chrome.action.onClicked.addListener((tab) => {
    openPopup();
  });

  function openPopup() {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: 'popup',
        focused: true,
        width: 400,
        height: 600
    });
  }
