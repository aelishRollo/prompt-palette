document.addEventListener('DOMContentLoaded', () => {
  const promptsContainer = document.getElementById('prompts');
  const doneButton = document.getElementById('doneButton');
  let prompts = [];
  let selectedPrompts = [];

  // Load prompts from local storage
  chrome.storage.local.get('prompts', (data) => {
    prompts = data.prompts || [];
    renderPrompts();
  });

  // Render prompts in the popup
  function renderPrompts() {
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
      const promptElement = promptsContainer.children[index];
      promptElement.classList.toggle('favorite', prompt.favorite);
    });
    chrome.storage.local.set({ prompts: prompts }, () => {
      const toggledFavoriteIds = selectedPrompts.map(index => prompts[index].id);
      chrome.runtime.sendMessage({ action: 'toggleFavoriteMultiple', ids: toggledFavoriteIds });
      window.close();
    });
  });
});
