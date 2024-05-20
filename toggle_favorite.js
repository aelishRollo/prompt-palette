console.log('toggle_favorite.js script loaded'); // Log to verify script load

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const promptsContainer = document.getElementById('prompts');
  console.log('promptsContainer:', promptsContainer); // Log container existence

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
      console.log('No prompts found in storage.');
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
      console.log('Added prompt element:', promptElement); // Log element addition
    });
    console.log('Finished rendering prompts.');
  }

  // Toggle selection of a prompt
  function toggleSelectPrompt(index) {
    const promptElement = promptsContainer.children[index];
    console.log('Clicked prompt:', prompts[index]); // Debugging message
    if (selectedPrompts.includes(index)) {
      selectedPrompts = selectedPrompts.filter(i => i !== index);
      promptElement.classList.remove('selected');
    } else {
      selectedPrompts.push(index);
      promptElement.classList.add('selected');
    }
    console.log('Current selected prompts:', selectedPrompts); // Log selected prompts
  }

  // Toggle favorite status of selected prompts
  doneButton.addEventListener('click', () => {
    console.log('Done button clicked. Current selected prompts:', selectedPrompts); // Log before processing
    selectedPrompts.forEach(index => {
      const prompt = prompts[index];
      prompt.favorite = !prompt.favorite;
      const promptElement = promptsContainer.children[index];
      promptElement.classList.toggle('favorite', prompt.favorite); // Ensure UI updates
      console.log('Toggling favorite status for prompt:', prompt); // Debugging message
    });
    chrome.storage.local.set({ prompts: prompts }, () => {
      console.log('Saved updated prompts to storage:', prompts); // Debugging message
      const toggledFavoriteIds = selectedPrompts.map(index => prompts[index].id);
      chrome.runtime.sendMessage({ action: 'toggleFavoriteMultiple', ids: toggledFavoriteIds });
      console.log('Sent toggleFavoriteMultiple message with ids:', toggledFavoriteIds); // Log message
      window.close();
    });
  });
});
