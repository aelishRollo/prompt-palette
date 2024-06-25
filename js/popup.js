document.addEventListener('DOMContentLoaded', () => {
    const addPromptButton = document.getElementById('add-prompt');
    const promptInput = document.getElementById('prompt-input');
    const promptList = document.getElementById('prompt-list');

    function savePrompts(prompts) {
        localStorage.setItem('prompts', JSON.stringify(prompts));
    }

    function loadPrompts() {
        return JSON.parse(localStorage.getItem('prompts')) || [];
    }

    function displayPrompts() {
        const prompts = loadPrompts();
        promptList.innerHTML = '';
        prompts.forEach((prompt, index) => {
            const promptItem = document.createElement('div');
            promptItem.className = 'prompt-item';
            promptItem.innerHTML = `
                <span>${prompt}</span>
                <button data-index="${index}">Delete</button>
            `;
            promptList.appendChild(promptItem);
        });
    }

    function addPrompt() {
        const newPrompt = promptInput.value.trim();
        if (newPrompt) {
            const prompts = loadPrompts();
            prompts.push(newPrompt);
            savePrompts(prompts);
            displayPrompts();
            promptInput.value = '';
        }
    }

    function deletePrompt(index) {
        const confirmation = confirm("Are you sure you want to delete this prompt?");
        if (confirmation) {
            const prompts = loadPrompts();
            prompts.splice(index, 1);
            savePrompts(prompts);
            displayPrompts();
        }
    }

    addPromptButton.addEventListener('click', addPrompt);
    promptList.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const index = event.target.getAttribute('data-index');
            deletePrompt(index);
        }
    });

    displayPrompts();
});
