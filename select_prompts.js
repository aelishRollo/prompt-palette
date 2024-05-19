document.addEventListener('DOMContentLoaded', () => {
    const promptsContainer = document.getElementById('prompts');
    const doneButton = document.getElementById('done');
  
    let prompts = [];
    let selectedPrompts = [];
  
    // Load prompts from local storage
    chrome.storage.local.get('prompts', (data) => {
      if (data.prompts) {
        prompts = data.prompts;
        renderPrompts();
      }
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
    doneButton.addEventListener('click', () => {
      const selectedTexts = selectedPrompts.map(index => prompts[index].text).join("\n\n");
      navigator.clipboard.writeText(selectedTexts).then(() => {
        alert('Copied to clipboard');
        window.close();
      }).catch(err => {
        console.error('Failed to write to clipboard', err);
      });
    });
  });
  