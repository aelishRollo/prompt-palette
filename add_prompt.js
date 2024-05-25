document.addEventListener('DOMContentLoaded', () => {
    const savePromptButton = document.getElementById('savePromptButton');
    const newPromptText = document.getElementById('newPromptText');
  
    savePromptButton.addEventListener('click', () => {
      const text = newPromptText.value.trim();
      if (text) {
        chrome.runtime.sendMessage({ action: 'addNewPrompt', text: text }, () => {
          window.close();
        });
      }
    });
  });
  