document.addEventListener('DOMContentLoaded', () => {
  const promptsContainer = document.getElementById('prompts');
  const copyPromptsButton = document.getElementById('copyPromptsButton');
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
      promptElement.className = 'prompt';
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

  // Copy selected prompts to clipboard
  copyPromptsButton.addEventListener('click', () => {
    const selectedText = selectedPrompts.map(index => prompts[index].text).join('\n\n');
    navigator.clipboard.writeText(selectedText).then(() => {
      window.close();
    });
  });
});
