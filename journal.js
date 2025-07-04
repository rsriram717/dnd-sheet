// This file will contain all the logic for the notes and journal feature. 

/**
 * Creates the DOM element for a single note.
 * @param {object} note - The note object.
 * @returns {HTMLElement} The created note element.
 */
function createNoteElement(note) {
    const noteEl = document.createElement('div');
    noteEl.classList.add('journal-note');
    if (note.pinned) {
        noteEl.classList.add('pinned');
    }
    noteEl.dataset.id = note.id;
    noteEl.dataset.category = note.type;

    const header = document.createElement('div');
    header.classList.add('journal-note-header');

    const meta = document.createElement('div');
    meta.classList.add('journal-note-meta');
    
    const category = document.createElement('span');
    category.classList.add('journal-note-category');
    category.textContent = note.type;

    const timestamp = document.createElement('span');
    timestamp.classList.add('journal-note-timestamp');
    timestamp.textContent = new Date(note.timestamp).toLocaleString();

    meta.appendChild(category);
    meta.appendChild(timestamp);

    const actions = document.createElement('div');
    actions.classList.add('journal-note-actions');

    const pinBtn = document.createElement('button');
    pinBtn.classList.add('pin-note-btn');
    if (note.pinned) {
        pinBtn.classList.add('pinned');
    }
    pinBtn.title = note.pinned ? 'Unpin Note' : 'Pin Note';
    pinBtn.textContent = '📌';
    
    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-note-btn');
    editBtn.title = 'Edit Note';
    editBtn.textContent = '✏️';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-note-btn');
    deleteBtn.title = 'Delete Note';
    deleteBtn.textContent = '🗑️';

    actions.appendChild(pinBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    header.appendChild(meta);
    header.appendChild(actions);

    const content = document.createElement('div');
    content.classList.add('journal-note-content');
    content.textContent = note.text;

    noteEl.appendChild(header);
    noteEl.appendChild(content);

    // Add the editing area (initially hidden)
    const editArea = document.createElement('div');
    editArea.classList.add('journal-note-edit-area');
    
    const editTextarea = document.createElement('textarea');
    editTextarea.value = note.text;
    
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '8px';

    const saveEditBtn = document.createElement('button');
    saveEditBtn.classList.add('btn', 'btn-small', 'save-note-btn');
    saveEditBtn.textContent = 'Save';

    const cancelEditBtn = document.createElement('button');
    cancelEditBtn.classList.add('btn', 'btn-small', 'btn-secondary', 'cancel-edit-btn');
    cancelEditBtn.textContent = 'Cancel';

    buttonGroup.appendChild(saveEditBtn);
    buttonGroup.appendChild(cancelEditBtn);
    
    editArea.appendChild(editTextarea);
    editArea.appendChild(buttonGroup);
    noteEl.appendChild(editArea);

    return noteEl;
}

/**
 * Renders the journal notes in the container.
 * @param {HTMLElement} container - The DOM element to render notes into.
 * @param {Array<object>} notes - The array of note objects.
 * @param {string} filter - The current category filter.
 */
export function renderJournal(container, notes, filter) {
    if (!container) return;
    
    container.innerHTML = ''; // Clear existing notes for a full re-render

    const filteredNotes = notes
        .filter(note => filter === 'all' || note.type === filter)
        .sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return b.timestamp - a.timestamp;
        });

    if (filteredNotes.length === 0) {
        container.innerHTML = '<p class="empty-journal-message">No notes found. Start by adding one!</p>';
    } else {
        filteredNotes.forEach(note => {
            const noteEl = createNoteElement(note);
            container.appendChild(noteEl);
        });
    }
}

/**
 * Initializes the journal feature.
 * @param {object} options - Options for initialization.
 * @param {HTMLElement} options.container - The main notes container.
 * @param {HTMLElement} options.addButton - The 'Add Note' button.
 * @param {HTMLElement} options.input - The textarea for note entry.
 * @param {HTMLElement} options.filterContainer - The container for filter buttons.
 * @param {function} options.onNoteChange - Callback for when notes are changed.
 * @param {function} options.getNotes - Function to get the current notes array.
 * @param {function} options.getFilter - Function to get the current filter.
 * @param {function} options.setFilter - Function to set the current filter.
 */
export function init(options) {
    const { container, addButton, input, filterContainer, onNoteChange, getNotes, getFilter, setFilter } = options;

    // Event Listener for adding a new note
    const addNote = () => {
        const text = input.value.trim();
        const activeFilter = document.querySelector('.journal-filter-btn.active').dataset.filter;
        const type = (activeFilter === 'all' || !activeFilter) ? 'general' : activeFilter;

        if (text) {
            const newNote = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                type: type,
                text: text,
                pinned: false,
            };
            
            const updatedNotes = [newNote, ...getNotes()];
            onNoteChange(updatedNotes);
            input.value = '';
            
            // Incremental DOM update with animation
            const noteEl = createNoteElement(newNote);
            if (container.querySelector('.empty-journal-message')) {
                container.innerHTML = '';
            }
            container.prepend(noteEl);
            noteEl.classList.add('new');
            noteEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            noteEl.addEventListener('animationend', () => {
                noteEl.classList.remove('new');
            }, { once: true });
        }
    };

    addButton.addEventListener('click', addNote);
    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            addNote();
        }
    });

    // Event Delegation for Pin/Delete actions
    container.addEventListener('click', (e) => {
        const notes = getNotes();
        const noteEl = e.target.closest('.journal-note');
        if (!noteEl) return;
        const noteId = noteEl.dataset.id;

        let updatedNotes;
        let changed = false;

        // Pin note
        if (e.target.closest('.pin-note-btn')) {
            updatedNotes = notes.map(note => {
                if (note.id === noteId) {
                    return { ...note, pinned: !note.pinned };
                }
                return note;
            });
            onNoteChange(updatedNotes);
            renderJournal(container, updatedNotes, getFilter()); // Full re-render is acceptable for re-sorting
            return; // Exit early
        }

        // Delete note
        if (e.target.closest('.delete-note-btn')) {
            if (confirm('Are you sure you want to delete this note?')) {
                updatedNotes = notes.filter(note => note.id !== noteId);
                onNoteChange(updatedNotes);
                
                // Animate out and remove element
                noteEl.classList.add('deleting');
                noteEl.addEventListener('animationend', () => {
                    noteEl.remove();
                    // Show empty message if no notes are left
                    if (container.childElementCount === 0) {
                        renderJournal(container, [], getFilter());
                    }
                }, { once: true });
            }
            return; // Exit early
        }

        // Edit note - listen for clicks on the new edit button
        if (e.target.closest('.edit-note-btn')) {
            noteEl.classList.add('editing');
            noteEl.querySelector('textarea').focus();
            return;
        }

        // Save edited note
        if (e.target.closest('.save-note-btn')) {
            const newText = noteEl.querySelector('textarea').value.trim();
            if (newText) {
                updatedNotes = notes.map(note => {
                    if (note.id === noteId) {
                        return { ...note, text: newText };
                    }
                    return note;
                });
                onNoteChange(updatedNotes);
                // Just update the text content and switch back view
                noteEl.querySelector('.journal-note-content').textContent = newText;
                noteEl.classList.remove('editing');
            }
            return;
        }

        // Cancel editing
        if (e.target.closest('.cancel-edit-btn')) {
            // Revert the textarea value to the original, in case of changes
            noteEl.querySelector('textarea').value = noteEl.querySelector('.journal-note-content').textContent;
            noteEl.classList.remove('editing');
            return;
        }
    });

    // Event Listener for filter buttons
    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('journal-filter-btn')) {
            const filter = e.target.dataset.filter;
            setFilter(filter);
            
            filterContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');

            renderJournal(container, getNotes(), filter);
        }
    });
} 