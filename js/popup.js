document.addEventListener('DOMContentLoaded', () => {
    const addPromptButton = document.getElementById('add-prompt');
    const addGroupButton = document.getElementById('add-group');
    const copyPromptsButton = document.getElementById('copy-prompts');
    const toggleTagFilterButton = document.getElementById('toggle-tag-filter');
    const promptInput = document.getElementById('prompt-input');
    const groupInput = document.getElementById('group-input');
    const promptGroupSelect = document.getElementById('prompt-group');
    const groupFilterSelect = document.getElementById('group-filter');
    const promptList = document.getElementById('prompt-list');
    const groupList = document.getElementById('group-list');

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function loadData(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    function displayGroups() {
        const groups = loadData('groups');
        groupList.innerHTML = '';
        promptGroupSelect.innerHTML = '<option value="">No Group</option>';
        groupFilterSelect.innerHTML = '<option value="">All Groups</option>';
        groups.forEach((group, index) => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.innerHTML = `
                <span>${group.name}</span>
                <button class="delete-group" data-index="${index}">Delete</button>
            `;
            groupList.appendChild(groupItem);

            const groupOption = document.createElement('option');
            groupOption.value = group.id;
            groupOption.innerText = group.name;
            promptGroupSelect.appendChild(groupOption);
            groupFilterSelect.appendChild(groupOption.cloneNode(true));
        });
    }

    function displayPrompts() {
        const prompts = loadData('prompts');
        const selectedGroup = groupFilterSelect.value;
        promptList.innerHTML = '';
        prompts.forEach((prompt, index) => {
            if (selectedGroup && prompt.groupId !== selectedGroup) return;
            const promptItem = document.createElement('div');
            promptItem.className = 'prompt-item';
            promptItem.innerHTML = `
                <span>${prompt.text}</span>
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

    function addGroup() {
        const groupName = groupInput.value.trim();
        if (groupName) {
            const groups = loadData('groups');
            const groupId = Date.now().toString();
            groups.push({ id: groupId, name: groupName });
            saveData('groups', groups);
            displayGroups();
            groupInput.value = '';
        }
    }

    function addPrompt() {
        const newPrompt = promptInput.value.trim();
        const groupId = promptGroupSelect.value;
        if (newPrompt) {
            const prompts = loadData('prompts');
            prompts.push({ text: newPrompt, groupId });
            saveData('prompts', prompts);
            displayPrompts();
            displayTags();
            promptInput.value = '';
        }
    }

    function deleteGroup(index) {
        const groups = loadData('groups');
        groups.splice(index, 1);
        saveData('groups', groups);
        displayGroups();
        displayPrompts();
    }

    function deletePrompt(index) {
        const confirmation = confirm("Are you sure you want to delete this prompt?");
        if (confirmation) {
            const prompts = loadData('prompts');
            prompts.splice(index, 1);
            saveData('prompts', prompts);
            displayPrompts();
            displayTags();
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
            displayTags();
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
            displayTags();
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
    }

    function toggleTagFilter() {
        tagFilterSection.classList.toggle('hidden');
    }

    addPromptButton.addEventListener('click', addPrompt);
    addGroupButton.addEventListener('click', addGroup);
    copyPromptsButton.addEventListener('click', copySelectedPrompts);

    groupList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-group')) {
            const index = event.target.getAttribute('data-index');
            deleteGroup(index);
        }
    });

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

    groupFilterSelect.addEventListener('change', displayPrompts);

    displayGroups();
    displayPrompts();
    displayTags();
});
