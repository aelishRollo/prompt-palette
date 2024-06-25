document.addEventListener('DOMContentLoaded', () => {
    const addPromptButton = document.getElementById('add-prompt');
    const copyPromptsButton = document.getElementById('copy-prompts');
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
                <input type="checkbox" class="select-prompt" data-index="${index}">
                <span>${prompt}</span>
                <button class="edit" data-index="${index}">Edit</button>
                <button class="delete" data-index="${index}">Delete</button>
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

    function editPrompt(index) {
        const prompts = loadPrompts();
        const currentPrompt = prompts[index];
        const newPrompt = prompt("Edit your prompt:", currentPrompt);
        if (newPrompt !== null && newPrompt.trim() !== "") {
            prompts[index] = newPrompt.trim();
            savePrompts(prompts);
            displayPrompts();
        }
    }

    function copySelectedPrompts() {
        const selectedPrompts = [];
        document.querySelectorAll('.select-prompt:checked').forEach(checkbox => {
            const index = checkbox.getAttribute('data-index');
            selectedPrompts.push(loadPrompts()[index]);
        });
        const textToCopy = selectedPrompts.join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Prompts copied to clipboard');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    addPromptButton.addEventListener('click', addPrompt);
    copyPromptsButton.addEventListener('click', copySelectedPrompts);
    promptList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete')) {
            const index = event.target.getAttribute('data-index');
            deletePrompt(index);
        } else if (event.target.classList.contains('edit')) {
            const index = event.target.getAttribute('data-index');
            editPrompt(index);
        }
    });

    displayPrompts();
});
