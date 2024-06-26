document.addEventListener('DOMContentLoaded', () => {
    const addPromptButton = document.getElementById('add-prompt');
    const copyPromptsButton = document.getElementById('copy-prompts');
    const toggleTagFilterButton = document.getElementById('toggle-tag-filter');
    const promptInput = document.getElementById('prompt-input');
    const tagFilterSelect = document.getElementById('tag-filter-select');
    const promptList = document.getElementById('prompt-list');
    const tagFilterSection = document.getElementById('tag-filter-section');

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function loadData(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    function displayPrompts() {
        const prompts = loadData('prompts');
        const selectedTags = Array.from(tagFilterSelect.selectedOptions).map(option => option.value);
        promptList.innerHTML = '';
        prompts.forEach((prompt, index) => {
            if (selectedTags.length > 0 && selectedTags[0] !== "" && !selectedTags.some(tag => prompt.tags.includes(tag))) {
                return;
            }
            const promptItem = document.createElement('div');
            promptItem.className = 'prompt-item';
            promptItem.innerHTML = `
                <span>${prompt.text}</span>
                <button class="add-tag" data-index="${index}">Add Tag</button>
                <button class="edit" data-index="${index}">Edit</button>
                <button class="delete" data-index="${index}">Delete</button>
            `;
            promptItem.addEventListener('click', (event) => {
                if (!event.target.classList.contains('edit') && !event.target.classList.contains('delete') && !event.target.classList.contains('add-tag')) {
                    promptItem.classList.toggle('selected');
                }
            });
            promptList.appendChild(promptItem);
        });
    }

    function displayTags() {
        const tags = loadData('tags');
        tagFilterSelect.innerHTML = '<option value="">All Prompts</option>';
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilterSelect.appendChild(option);
        });
    }

    function addPrompt() {
        const newPrompt = promptInput.value.trim();
        if (newPrompt) {
            const prompts = loadData('prompts');
            prompts.push({ text: newPrompt, tags: [] });
            saveData('prompts', prompts);
            displayPrompts();
            promptInput.value = '';
        }
    }

    function deletePrompt(index) {
        const confirmation = confirm("Are you sure you want to delete this prompt?");
        if (confirmation) {
            const prompts = loadData('prompts');
            prompts.splice(index, 1);
            saveData('prompts', prompts);
            displayPrompts();
        }
    }

    function editPrompt(index) {
        const prompts = loadData('prompts');
        const currentPrompt = prompts[index];
        const newPrompt = prompt("Edit your prompt:", currentPrompt.text);
        if (newPrompt !== null && newPrompt.trim() !== "") {
            prompts[index].text = newPrompt.trim();
            saveData('prompts', prompts);
            displayPrompts();
        }
    }

    function addTagToPrompt(index) {
        const tag = prompt("Enter a tag:");
        if (tag && tag.trim() !== "") {
            const prompts = loadData('prompts');
            if (!prompts[index].tags.includes(tag.trim())) {
                prompts[index].tags.push(tag.trim());
                saveData('prompts', prompts);
            }
            const tags = loadData('tags');
            if (!tags.includes(tag.trim())) {
                tags.push(tag.trim());
                saveData('tags', tags);
                displayTags();
            }
        }
    }

    function copySelectedPrompts() {
        const selectedPrompts = [];
        document.querySelectorAll('.prompt-item.selected').forEach(item => {
            const index = item.querySelector('.edit').getAttribute('data-index');
            selectedPrompts.push(loadData('prompts')[index].text);
        });
        const textToCopy = selectedPrompts.join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            showFullScreenNotification('Prompts copied to clipboard');
            setTimeout(() => {
                window.close();
            }, 1500);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    function showFullScreenNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'full-screen-notification';
        notification.innerText = message;
        document.body.innerHTML = ''; // Clear the current content
        document.body.appendChild(notification);
        notification.style.width = '100%'; // Ensure it takes the full width
        notification.style.height = '100%'; // Ensure it takes the full height
    }
    

    function toggleTagFilter() {
        tagFilterSection.classList.toggle('hidden');
    }

    addPromptButton.addEventListener('click', addPrompt);
    copyPromptsButton.addEventListener('click', copySelectedPrompts);
    toggleTagFilterButton.addEventListener('click', toggleTagFilter);

    promptList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete')) {
            const index = event.target.getAttribute('data-index');
            deletePrompt(index);
        } else if (event.target.classList.contains('edit')) {
            const index = event.target.getAttribute('data-index');
            editPrompt(index);
        } else if (event.target.classList.contains('add-tag')) {
            const index = event.target.getAttribute('data-index');
            addTagToPrompt(index);
        }
    });

    tagFilterSelect.addEventListener('change', displayPrompts);

    displayTags();
    displayPrompts();
});
