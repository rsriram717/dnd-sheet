# Notes & Journal Feature: Requirements and Implementation Plan (v2)

This document outlines a revised, robust plan for implementing the categorized notes and journal system. This version incorporates key improvements focusing on modularity, security, and performance.

## 1. Feature Requirements

The goal is to create a user-friendly, lightweight notes system that is fully client-side and backward-compatible with the existing JSON import/export functionality.

### Core Functionality
- **Categorized Notes**: Users can create, view, edit, and delete notes.
- **Note Categories**: Notes can be categorized as `General`, `Inventory`, `NPCs`, or `Lore/World`.
- **Filtering**: Users can filter the notes by category, or view all notes at once.
- **Timestamping**: Each note should be automatically timestamped upon creation.
- **Pinning**: Users can "pin" important notes to the top of the list for quick access.

### User Interface
- A new "Notes & Journal" section will be added to the character sheet.
- The section will contain filter "chips" (buttons) for each category.
- A simple textarea will be provided for note entry, with an "Add Note" button.
- A keyboard shortcut (Ctrl+Enter or Cmd+Enter) will also save the note.
- The list of notes will be displayed chronologically (newest first), with pinned notes always appearing at the top.
- Each note will display its content, category, and creation date.
- Each note will have "pin" and "delete" action buttons.

### Technical Requirements
- **100% Frontend**: The feature must run entirely in the browser, with no backend or database required.
- **Data Storage**: Notes will be stored in the browser's `localStorage` as part of the character object.
- **Backward Compatibility**:
    - Exported JSON files from this new version must remain compatible with older versions of the app.
    - The app must be able to successfully import older JSON files that do not have the new notes structure.
- **Data Model**: A new array, `notesEntries`, will be added to the character data object. Each object in the array will represent a note and contain its `id`, `timestamp`, `type`, `text`, and `pinned` status.

### Bonus Features (Stretch Goals)
- **Auto-Highlighting**: Automatically style strings that look like dice rolls (`2d6+3`) or currency (`50gp`) for better readability.
- **Auto-logging**: Automatically create an "Inventory" note when items are added or removed from the main equipment list.

---

## 2. Revised Implementation Plan

This plan is broken into phases that prioritize stability and maintainability.

**Phase 1: Setup and UI Scaffolding**

*   **STATUS**: Partially Complete.

1.  **File Structure**:
    *   `[DONE]` Create a new file: `journal.js`.
    *   **Note**: The plan specified `public/journal.js`, but no `public` directory exists. The file was created in the root directory. This can be moved later if desired.
2.  **Modify `index.html`**:
    *   `[BLOCKED]` Add the "Notes & Journal" section **directly into the HTML**.
    *   `[BLOCKED]` Link the new `journal.js` file in `index.html`.
    *   **Note**: This step has been problematic. Multiple attempts to add the HTML have failed, with the model making incorrect edits. This needs to be revisited.
3.  **Modify `styles.css`**:
    *   `[DONE]` Add all necessary CSS rules for the journal section.

**Phase 2: Core Logic (in `journal.js`)**

*   **STATUS**: Not Started.

4.  **Create the Journal Module (`journal.js`)**:
    *   This file will **not** be a class. It will be a module of pure functions that operate on data passed to them. It should not hold its own state.
    *   Export an `init(options)` function. It will take an object with DOM element references (`container`, `addButton`, etc.) and a `onNoteChange` callback function.
    *   Inside `init()`:
        *   Set up a **single event listener** on the main notes container to handle clicks on delete/pin buttons via **event delegation**.
        *   Set up listeners on the filter chips and the add button.
    *   Export a `renderJournal(container, notes, filter)` function that handles all DOM manipulation (add/remove/update notes).
5.  **Secure & Incremental Rendering**:
    *   The `renderJournal` function will use **incremental DOM updates**. When adding a note, it will only `prepend` the new note element. When deleting, it will only `remove` that specific element. A full re-render should only happen when changing filters.
    *   When creating note elements, use `document.createElement` and `element.textContent = userText` to prevent XSS attacks. **Avoid `innerHTML`** for user-generated content.
6.  **Unique IDs**:
    *   When creating a new note object, use `crypto.randomUUID()` to generate a unique, collision-proof ID.

**Phase 3: Integration with `script.js`**

7.  **Integrate the Journal Module**:
    *   In the `CharacterSheet` constructor in `script.js`, initialize the new properties: `this.notesEntries = [];` and `this.currentJournalFilter = 'all';`.
    *   In the constructor (or a new `initializeJournal` method), call the `journal.init()` function, passing it the required DOM elements and a callback function (e.g., `this.handleNoteChange.bind(this)`).
    *   `handleNoteChange(updatedNotes)` will be the method in `CharacterSheet` that updates `this.notesEntries` and triggers the debounced auto-save.
8.  **Debounced Auto-Save**:
    *   Modify the existing `autoSave` logic in `script.js`. Instead of firing on every `input`, it should be "debounced" (wrapped in a timeout) to only run ~500ms after the last change.
    *   Ensure the debounced save is triggered by the callback from the journal module and other character sheet inputs.
9.  **Backward-Compatible Save/Load**:
    *   **`gatherCharacterData()`**: Add `notesEntries` to the export object. For compatibility, also populate the legacy `notes` string with a summary.
    *   **`loadCharacterData()`**:
        *   **Import Precedence Rule**: When loading, if `characterData.notesEntries` exists, use it as the source of truth.
        *   If the legacy `characterData.notes` field also contains data, create a *new* "general" note entry from it and append it to the `notesEntries` array to ensure no data is lost.
        *   If `notesEntries` does not exist, convert the legacy `notes` string into the new array structure.
        *   After loading, call the `journal.renderJournal()` function to display the notes.

**Phase 4: Polish and Error Handling**

10. **UI/UX Polish**:
    *   Animate the appearance of new notes.
    *   When adding a note, scroll it into view if it's off-screen.
    *   Provide clear visual feedback for all actions (pinning, deleting).
11. **Robust Error Handling**:
    *   Wrap all `localStorage.setItem` calls in a `try...catch` block to handle potential errors (e.g., storage quota exceeded, browser security restrictions).
    *   If a save fails, provide a small, non-intrusive visual indicator to the user.
12. **Final Testing**:
    *   Test the full CRUD and filter lifecycle.
    *   Rigorously test the import/export cycle with pre- and post-feature JSON files.
    *   Test on different browsers to check for compatibility issues with `crypto.randomUUID()`.

This revised plan produces a more professional, secure, and maintainable feature. 