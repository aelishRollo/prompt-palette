chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyToClipboard') {
    navigator.permissions.query({ name: 'clipboard-write' }).then(permissionStatus => {
      if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
        navigator.clipboard.writeText(request.text).then(() => {
          console.log(`Copied to clipboard: ${request.text}`);
          sendResponse({ success: true });
        }).catch(err => {
          console.error('Failed to write to clipboard', err);
          sendResponse({ success: false, error: err });
        });
      } else {
        console.error('Clipboard write permission denied');
        sendResponse({ success: false, error: 'Clipboard write permission denied' });
      }
    });
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});
