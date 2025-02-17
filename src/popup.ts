document.addEventListener('DOMContentLoaded', () => {
    const addPromptButton = document.getElementById('add-prompt');
    const copyPromptsButton = document.getElementById('copy-prompts');
    const toggleTagFilterButton = document.getElementById('toggle-tag-filter');
    const promptInput = document.getElementById('prompt-input');
    const tagFilterSelect = document.getElementById('tag-filter-select');
    const promptList = document.getElementById('prompt-list');
    const tagFilterSection = document.getElementById('tag-filter-section');
    const kebabMenuButton = document.getElementById('kebab-menu-button');
    const kebabMenuDropdown = document.getElementById('kebab-menu-dropdown');
    const helpMenuButton = document.getElementById('help-menu-button');
    const helpMenuDropdown = document.getElementById('help-menu-dropdown');
    const importJsonButton = document.getElementById('import-json-button');
    const importJsonInput = document.getElementById('import-json');
    const exportJsonButton = document.getElementById('export-json-button');

    const deleteDialog = document.getElementById('delete-dialog');
    const deleteConfirmButton = document.getElementById('delete-yes');
    const deleteCancelButton = document.getElementById('delete-no');

    const editDialog = document.getElementById('edit-dialog');
    const editInput = document.getElementById('edit-input');
    const editConfirmButton = document.getElementById('edit-yes');
    const editCancelButton = document.getElementById('edit-no');

    const addTagDialog = document.getElementById('add-tag-dialog');
    const addTagInput = document.getElementById('add-tag-input');
    const addTagConfirmButton = document.getElementById('add-tag-yes');
    const addTagCancelButton = document.getElementById('add-tag-no');

    let currentFocusIndex = -1;
    let currentEditIndex = -1;
    let currentDeleteIndex = -1;
    let currentAddTagIndex = -1;
    let kebabMenuClicked = false;
    let helpMenuClicked = false;

    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`Data saved under key "${key}":`, data);
        } catch (error) {
            console.error(`Failed to save data under key "${key}":`, error);
        }
    }

    function loadData(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key)) || [];
            console.log(`Data loaded under key "${key}":`, data);
            return data;
        } catch (error) {
            console.error(`Failed to load data under key "${key}":`, error);
            return [];
        }
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
            promptItem.setAttribute('tabindex', '0');
            promptItem.setAttribute('role', 'button');
            promptItem.setAttribute('aria-pressed', 'false');
            promptItem.innerHTML = `
                <span>${prompt.text}</span>
                <div class="button-container">
                    <button class="add-tag" data-index="${index}">Add Tag</button>
                    <button class="edit" data-index="${index}">Edit</button>
                    <button class="delete" data-index="${index}">Delete</button>
                </div>
            `;
            promptItem.addEventListener('click', handlePromptClick);
            promptList.appendChild(promptItem);
        });
    }

    function displayTags() {
        const prompts = loadData('prompts');
        const tags = new Set();
        prompts.forEach(prompt => {
            prompt.tags.forEach(tag => {
                tags.add(tag);
            });
        });
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
            displayTags();
            promptInput.value = '';
        }
    }

    function deletePrompt() {
        const prompts = loadData('prompts');
        prompts.splice(currentDeleteIndex, 1);
        saveData('prompts', prompts);
        displayPrompts();
        displayTags();
        toggleDialog(deleteDialog, false);
    }

    function editPrompt() {
        const prompts = loadData('prompts');
        const newPrompt = editInput.value.trim();
        if (newPrompt !== "") {
            prompts[currentEditIndex].text = newPrompt;
            saveData('prompts', prompts);
            displayPrompts();
            displayTags();
            toggleDialog(editDialog, false);
        }
    }

    function addTagToPrompt() {
        const tag = addTagInput.value.trim();
        if (tag !== "") {
            const prompts = loadData('prompts');
            if (!prompts[currentAddTagIndex].tags.includes(tag)) {
                prompts[currentAddTagIndex].tags.push(tag);
                saveData('prompts', prompts);
                displayTags();
            }
            toggleDialog(addTagDialog, false);
        }
    }

    function copySelectedPrompts() {
        const selectedPrompts = [];
        document.querySelectorAll('.prompt-item.selected').forEach(item => {
            const index = item.querySelector('.edit').getAttribute('data-index');
            selectedPrompts.push(loadData('prompts')[index].text);
        });
        const textToCopy = '\n\n' + selectedPrompts.join('\n\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            showFullScreenNotification('Prompts copied!');
            setTimeout(() => {
                window.close();
            }, 400);
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
        if (tagFilterSection.classList.contains('hidden')) {
            const selectedTags = Array.from(tagFilterSelect.selectedOptions).map(option => option.value);
            if (selectedTags.length === 1 && selectedTags[0] !== "") {
                toggleTagFilterButton.innerText = `Filter Prompts - Filtered by ${selectedTags[0]}`;
            } else if (selectedTags.length > 1) {
                toggleTagFilterButton.innerText = 'Filter Prompts - Filtered by multiple tags';
            } else {
                toggleTagFilterButton.innerText = 'Filter Prompts';
            }
        } else {
            toggleTagFilterButton.innerText = 'Close';
        }
    }

    function handleKeyDown(event) {
        const prompts = document.querySelectorAll('.prompt-item');
        if (event.key === 'ArrowDown') {
            currentFocusIndex = (currentFocusIndex + 1) % prompts.length;
            prompts[currentFocusIndex].focus();
        } else if (event.key === 'ArrowUp') {
            currentFocusIndex = (currentFocusIndex - 1 + prompts.length) % prompts.length;
            prompts[currentFocusIndex].focus();
        } else if (event.key === '\'') {
            if (document.activeElement.classList.contains('prompt-item')) {
                document.activeElement.classList.toggle('selected');
                const isSelected = document.activeElement.classList.contains('selected');
                document.activeElement.setAttribute('aria-pressed', isSelected.toString());
            }
        } else if (event.key === 'Enter') {
            if (event.shiftKey) {
                copySelectedPrompts();
            } else if (document.activeElement.classList.contains('prompt-item')) {
                document.activeElement.classList.toggle('selected');
                const isSelected = document.activeElement.classList.contains('selected');
                document.activeElement.setAttribute('aria-pressed', isSelected.toString());
            }
        }
    }

    function handlePromptClick(event) {
        const promptItem = event.currentTarget;
        if (!event.target.classList.contains('edit') && !event.target.classList.contains('delete') && !event.target.classList.contains('add-tag')) {
            promptItem.classList.toggle('selected');
            const isSelected = promptItem.classList.contains('selected');
            promptItem.setAttribute('aria-pressed', isSelected.toString());
        }
    }

    function toggleKebabMenu() {
        kebabMenuClicked = !kebabMenuClicked;
        console.log('Kebab menu button clicked'); // Debug log
        kebabMenuDropdown.classList.toggle('hidden');
        console.log('Kebab menu dropdown state:', kebabMenuDropdown.classList.contains('hidden') ? 'hidden' : 'visible'); // Debug log

        // Force visibility for debugging
        if (!kebabMenuDropdown.classList.contains('hidden')) {
            kebabMenuDropdown.style.display = 'block';
        } else {
            kebabMenuDropdown.style.display = 'none';
        }
    }

    function toggleHelpMenu() {
        helpMenuClicked = !helpMenuClicked;
        console.log('Help menu button clicked'); // Debug log
        console.log(`helpMenuDropdown is ${helpMenuDropdown}`)
        helpMenuDropdown.classList.toggle('hidden');


    }

    function mergePrompt(p1, p2) {
        const combinedTags = new Set([...p1.tags, ...p2.tags]);
        const tags = Array.from(combinedTags);

        return {
            text: p1.text,
            tags,
        };
    }

    function arePromptsTheSame(p1, p2) {
        return p1.text === p2.text;
    }

    function handleJsonImport(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const contents = e.target.result;
                const newPrompts = JSON.parse(contents);

                const existing = loadData('prompts');

                const nextData = [];

                for (const newPrompt of newPrompts) {
                    const found = existing.find(existingPrompt => arePromptsTheSame(existingPrompt, newPrompt));
                    if (found) {
                        const prompt = mergePrompt(newPrompt, found);
                        nextData.push(prompt);
                    } else {
                        nextData.push(newPrompt);
                    }
                }

                for (const entry of existing) {
                    const found = nextData.find(nextEntry => arePromptsTheSame(nextEntry, entry));
                    if (!found) {
                        nextData.push(entry);
                    }
                }

                saveData('prompts', nextData);
                displayPrompts();
                displayTags();
            };
            reader.readAsText(file);
        }
    }

    function handleJsonExport() {
        const prompts = loadData('prompts');
        const jsonContent = JSON.stringify(prompts, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prompts.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function toggleDialog(dialog, show) {
        dialog.classList.toggle('hidden', !show);
    }

    // Resize window to 35% width and 100% height
    chrome.system.display.getInfo((displays) => {
        if (displays.length > 0) {
            const display = displays[0]; // Use the first display
            const width = Math.round(display.workArea.width * 0.35);
            const height = display.workArea.height;
            chrome.windows.getCurrent((window) => {
                chrome.windows.update(window.id, { width: width, height: height });
            });
        }
    });

    // Check if elements exist before attaching event listeners
    if (addPromptButton) addPromptButton.addEventListener('click', addPrompt);
    else console.error('addPromptButton not found');

    if (copyPromptsButton) copyPromptsButton.addEventListener('click', copySelectedPrompts);
    else console.error('copyPromptsButton not found');

    if (toggleTagFilterButton) toggleTagFilterButton.addEventListener('click', toggleTagFilter);
    else console.error('toggleTagFilterButton not found');

    if (kebabMenuButton) kebabMenuButton.addEventListener('click', toggleKebabMenu);
    else console.error('kebabMenuButton not found');

    if (helpMenuButton) helpMenuButton.addEventListener('click', toggleHelpMenu);
    else console.error('helpMenuButton not found');

    if (importJsonButton) importJsonButton.addEventListener('click', () => importJsonInput.click());
    else console.error('importJsonButton not found');

    if (importJsonInput) importJsonInput.addEventListener('change', handleJsonImport);
    else console.error('importJsonInput not found');

    if (exportJsonButton) exportJsonButton.addEventListener('click', handleJsonExport);
    else console.error('exportJsonButton not found');

    promptInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addPrompt();
        }
    });

    window.addEventListener('blur', () => {
        if (!kebabMenuClicked) window.close();
    });

    document.addEventListener('keydown', handleKeyDown);

    promptList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete')) {
            currentDeleteIndex = event.target.getAttribute('data-index');
            toggleDialog(deleteDialog, true);
        } else if (event.target.classList.contains('edit')) {
            currentEditIndex = event.target.getAttribute('data-index');
            editInput.value = loadData('prompts')[currentEditIndex].text;
            toggleDialog(editDialog, true);
        } else if (event.target.classList.contains('add-tag')) {
            currentAddTagIndex = event.target.getAttribute('data-index');
            addTagInput.value = ''; // Clear previous value
            toggleDialog(addTagDialog, true);
        }
    });

    if (deleteConfirmButton) deleteConfirmButton.addEventListener('click', deletePrompt);
    if (deleteCancelButton) deleteCancelButton.addEventListener('click', () => {
        toggleDialog(deleteDialog, false);
    });

    if (editConfirmButton) editConfirmButton.addEventListener('click', editPrompt);
    if (editCancelButton) editCancelButton.addEventListener('click', () => {
        toggleDialog(editDialog, false);
    });

    if (addTagConfirmButton) addTagConfirmButton.addEventListener('click', addTagToPrompt);
    if (addTagCancelButton) addTagCancelButton.addEventListener('click', () => {
        toggleDialog(addTagDialog, false);
    });

    tagFilterSelect.addEventListener('change', displayPrompts);

    console.log("Initial load of prompts");
    displayPrompts();
    displayTags();
});
