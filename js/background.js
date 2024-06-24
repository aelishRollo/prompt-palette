chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "promptPalette",
    title: "Prompt Palette",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "promptPalette") {
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 400,
      height: 600
    });
  }
});
