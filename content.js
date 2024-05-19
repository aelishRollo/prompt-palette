chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'copyToClipboard') {
      navigator.clipboard.writeText(request.text).then(() => {
        console.log(`Copied to clipboard: ${request.text}`);
        sendResponse({ success: true });
      }).catch(err => {
        console.error('Failed to write to clipboard', err);
        sendResponse({ success: false, error: err });
      });
  
      // Return true to indicate that the response will be sent asynchronously
      return true;
    }
  });
  
  console.log("Content script loaded");
  