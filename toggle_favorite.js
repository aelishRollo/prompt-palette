document.addEventListener('DOMContentLoaded', () => {
    const promptsContainer = document.getElementById('prompts');
    const doneButton = document.createElement('button');
    doneButton.textContent = 'Done';
    doneButton.className = 'button';
    document.body.appendChild(doneButton);
  
    let prompts = [];
    let selectedPrompts = [];
  
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
        promptElement.addEventListener('click', () => toggleSelectPrompt(index));
        promptsContainer.appendChild(promptElement);
      });
    }
  
    // Toggle selection of a prompt
    function toggleSelectPrompt(index) {
      const promptElement = promptsContainer.children[index];
      if (selectedPrompts.includes(index)) {
        selectedPrompts = selectedPrompts.filter(i => i !== index);
        promptElement.classList.remove('selected');
      } else {
        selectedPrompts.push(index);
        promptElement.classList.add('selected');
      }
    }
  
    // Toggle favorite status of selected prompts
    doneButton.addEventListener('click', () => {
      selectedPrompts.forEach(index => {
        const prompt = prompts[index];
        prompt.favorite = !prompt.favorite;
      });
      chrome.storage.local.set({ prompts: prompts }, () => {
        chrome.runtime.sendMessage({ action: 'toggleFavoriteMultiple', ids: selectedPrompts.map(index => prompts[index].id) });
        window.close();
      });
    });
  });
  