document.addEventListener('DOMContentLoaded', () => {
    const promptsContainer = document.getElementById('prompts');
  
    let prompts = [];
  
    // Load prompts from local storage
    chrome.storage.local.get('prompts', (data) => {
      console.log('Loaded prompts from storage in toggle_favorite.js:', data.prompts);
      if (data.prompts) {
        prompts = data.prompts;
        renderPrompts();
      } else {
        prompts = [];
      }
    });
  
    // Render prompts in the popup
    function renderPrompts() {
      console.log('Rendering prompts in toggle_favorite.js:', prompts);
      promptsContainer.innerHTML = '';
      prompts.forEach((prompt, index) => {
        const promptElement = document.createElement('div');
        promptElement.className = `prompt ${prompt.favorite ? 'favorite' : ''}`;
        promptElement.textContent = prompt.text;
        promptElement.dataset.index = index;
        promptElement.addEventListener('click', () => toggleFavorite(index));
        promptsContainer.appendChild(promptElement);
      });
    }
  
    // Toggle favorite status of a prompt
    function toggleFavorite(index) {
      const prompt = prompts[index];
      prompt.favorite = !prompt.favorite;
      chrome.storage.local.set({ prompts: prompts }, () => {
        chrome.runtime.sendMessage({ action: 'toggleFavorite', id: prompt.id });
        window.close();
      });
    }
  });
  