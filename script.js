import { init as initJournal, renderJournal } from './journal.js';

// D&D 5e Character Sheet Application
class CharacterSheet {
    constructor() {
        this.currentCharacter = null;
        this.spellSlots = {};
        this.usedSpellSlots = {};
        this.spells = [];
        this.cantrips = [];
        this.currentSpellTab = 1;
        this.notesEntries = [];
        this.currentJournalFilter = 'all';
        this.autoSaveTimeout = null;
        this.initializeEventListeners();
        this.initializeJournal();
        this.initializeDiceRoller();
        this.initializeSkillResults();
        this.initializeNavigation();
        this.loadLastCharacter();
        this.loadLastScreen();
    }

    initializeJournal() {
        const journalOptions = {
            container: document.querySelector('.journal-notes-container'),
            addButton: document.querySelector('.journal-add-btn'),
            input: document.querySelector('.journal-input'),
            filterContainer: document.querySelector('.journal-filters'),
            onNoteChange: this.handleNoteChange.bind(this),
            getNotes: () => this.notesEntries,
            getFilter: () => this.currentJournalFilter,
            setFilter: (filter) => { this.currentJournalFilter = filter; },
        };
        initJournal(journalOptions);
    }

    handleNoteChange(updatedNotes) {
        this.notesEntries = updatedNotes;
        this.autoSave();
    }

    initializeEventListeners() {
        // Header button events
        document.getElementById('new-character-btn').addEventListener('click', () => this.newCharacter());
        document.getElementById('save-character-btn').addEventListener('click', () => this.saveCharacter());
        document.getElementById('load-character-btn').addEventListener('click', () => this.showLoadModal());
        document.getElementById('export-character-btn').addEventListener('click', () => this.exportCharacter());
        
        // Import file input
        const importFileInput = document.getElementById('import-file');
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => this.handleFileImport(e));
            console.log('Import file input found and event listener attached');
        } else {
            console.error('Import file input not found!');
        }

        document.getElementById('save-info-btn').addEventListener('click', () => this.showSaveInfoModal());

        // Ability score change events
        const abilityScores = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        abilityScores.forEach(ability => {
            document.getElementById(ability).addEventListener('input', () => {
                this.updateModifiers();
                this.updateSpellcastingStats();
            });
        });

        // Level change event
        document.getElementById('character-level').addEventListener('input', () => {
            this.updateLevelDependentStats();
            this.updateSpellcasting();
        });

        // Class change event
        document.getElementById('character-class').addEventListener('change', () => {
            this.updateClassDependentStats();
            this.updateSpellcasting();
        });

        // Skill proficiency events
        const skills = [
            'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
            'history', 'insight', 'intimidation', 'investigation', 'medicine',
            'nature', 'perception', 'performance', 'persuasion', 'religion',
            'sleight-of-hand', 'stealth', 'survival'
        ];
        
        skills.forEach(skill => {
            const checkbox = document.getElementById(`${skill}-prof`);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.updateSkillBonuses());
            }
        });

        // Spellcasting events
        document.getElementById('add-cantrip-btn').addEventListener('click', () => this.showSpellModal(true));
        document.getElementById('add-spell-btn').addEventListener('click', () => this.showSpellModal(false));
        document.getElementById('short-rest-btn').addEventListener('click', () => this.shortRest());
        document.getElementById('long-rest-btn').addEventListener('click', () => this.longRest());

        // Spell modal events
        const spellModal = document.getElementById('spell-modal');
        const spellModalClose = document.getElementById('spell-modal-close');
        const cancelSpell = document.getElementById('cancel-spell');
        const spellForm = document.getElementById('spell-form');

        spellModalClose.addEventListener('click', () => {
            spellModal.style.display = 'none';
        });

        cancelSpell.addEventListener('click', () => {
            spellModal.style.display = 'none';
        });

        spellForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSpell();
        });

        // Save info modal events
        const saveInfoModal = document.getElementById('save-info-modal');
        const saveInfoClose = document.getElementById('save-info-close');
        const closeSaveInfo = document.getElementById('close-save-info');

        saveInfoClose.addEventListener('click', () => {
            saveInfoModal.style.display = 'none';
        });

        closeSaveInfo.addEventListener('click', () => {
            saveInfoModal.style.display = 'none';
        });

        // Modal events
        const modal = document.getElementById('character-modal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
            if (event.target === spellModal) {
                spellModal.style.display = 'none';
            }
            if (event.target === saveInfoModal) {
                saveInfoModal.style.display = 'none';
            }
        });

        // Auto-save on any input change (now debounced)
        document.addEventListener('input', () => {
            if (this.currentCharacter) {
                this.autoSave();
            }
        });
    }

    // Spellcasting data and rules
    getSpellcastingData() {
        return {
            // Spellcasting ability by class
            spellcastingAbility: {
                'bard': 'charisma',
                'cleric': 'wisdom',
                'druid': 'wisdom',
                'paladin': 'charisma',
                'ranger': 'wisdom',
                'sorcerer': 'charisma',
                'warlock': 'charisma',
                'wizard': 'intelligence'
            },

            // Spell preparation method by class
            preparationMethod: {
                'bard': 'known',
                'cleric': 'prepared',
                'druid': 'prepared',
                'paladin': 'prepared',
                'ranger': 'known',
                'sorcerer': 'known',
                'warlock': 'known',
                'wizard': 'prepared'
            },

            // Spell slots by class and level (full casters)
            spellSlots: {
                1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
                2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
                3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
                4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
                5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
                6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
                7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
                8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
                9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
                10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
                11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
                12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
                13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
                14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
                15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
                16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
                17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
                18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
                19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
                20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
            },

            // Half-caster spell slots (Paladin, Ranger)
            halfCasterSlots: {
                1: [0, 0, 0, 0, 0],
                2: [2, 0, 0, 0, 0],
                3: [3, 0, 0, 0, 0],
                4: [3, 0, 0, 0, 0],
                5: [4, 2, 0, 0, 0],
                6: [4, 2, 0, 0, 0],
                7: [4, 3, 0, 0, 0],
                8: [4, 3, 0, 0, 0],
                9: [4, 3, 2, 0, 0],
                10: [4, 3, 2, 0, 0],
                11: [4, 3, 3, 0, 0],
                12: [4, 3, 3, 0, 0],
                13: [4, 3, 3, 1, 0],
                14: [4, 3, 3, 1, 0],
                15: [4, 3, 3, 2, 0],
                16: [4, 3, 3, 2, 0],
                17: [4, 3, 3, 3, 1],
                18: [4, 3, 3, 3, 1],
                19: [4, 3, 3, 3, 2],
                20: [4, 3, 3, 3, 2]
            },

            // Warlock spell slots (Pact Magic)
            warlockSlots: {
                1: [1, 0, 0, 0, 0],
                2: [2, 0, 0, 0, 0],
                3: [0, 2, 0, 0, 0],
                4: [0, 2, 0, 0, 0],
                5: [0, 0, 2, 0, 0],
                6: [0, 0, 2, 0, 0],
                7: [0, 0, 2, 0, 0],
                8: [0, 0, 2, 0, 0],
                9: [0, 0, 2, 0, 0],
                10: [0, 0, 2, 0, 0],
                11: [0, 0, 0, 3, 0],
                12: [0, 0, 0, 3, 0],
                13: [0, 0, 0, 3, 0],
                14: [0, 0, 0, 3, 0],
                15: [0, 0, 0, 3, 0],
                16: [0, 0, 0, 3, 0],
                17: [0, 0, 0, 0, 4],
                18: [0, 0, 0, 0, 4],
                19: [0, 0, 0, 0, 4],
                20: [0, 0, 0, 0, 4]
            },

            // Cantrips known by class and level
            cantripsKnown: {
                'bard': {1: 2, 4: 3, 10: 4},
                'cleric': {1: 3, 4: 4, 10: 5},
                'druid': {1: 2, 4: 3, 10: 4},
                'sorcerer': {1: 4, 4: 5, 10: 6},
                'warlock': {1: 2, 4: 3, 10: 4},
                'wizard': {1: 3, 4: 4, 10: 5}
            },

            // Spells known by class and level (for known casters)
            spellsKnown: {
                'bard': {
                    1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14,
                    11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22
                },
                'ranger': {
                    2: 2, 3: 3, 5: 4, 7: 5, 9: 6, 11: 7, 13: 8, 15: 9, 17: 10, 19: 11
                },
                'sorcerer': {
                    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
                    11: 12, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 15, 20: 15
                },
                'warlock': {
                    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10,
                    11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15
                }
            }
        };
    }

    // Calculate ability modifier
    calculateModifier(score) {
        return Math.floor((score - 10) / 2);
    }

    // Update all ability modifiers
    updateModifiers() {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        abilities.forEach(ability => {
            const score = parseInt(document.getElementById(ability).value) || 10;
            const modifier = this.calculateModifier(score);
            const modifierElement = document.getElementById(`${ability}-mod`);
            
            modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        });

        // Update dependent stats
        this.updateInitiative();
        this.updateSkillBonuses();
    }

    // Update proficiency bonus based on level
    updateProficiencyBonus() {
        const level = parseInt(document.getElementById('character-level').value) || 1;
        const proficiencyBonus = Math.ceil(level / 4) + 1;
        document.getElementById('proficiency-bonus').value = proficiencyBonus;
        return proficiencyBonus;
    }

    // Update initiative (Dex modifier)
    updateInitiative() {
        const dexScore = parseInt(document.getElementById('dexterity').value) || 10;
        const dexModifier = this.calculateModifier(dexScore);
        document.getElementById('initiative').value = dexModifier >= 0 ? `+${dexModifier}` : `${dexModifier}`;
    }

    // Update level-dependent stats
    updateLevelDependentStats() {
        this.updateProficiencyBonus();
        this.updateHitDice();
        this.updateSkillBonuses();
    }

    // Update hit dice based on class and level
    updateHitDice() {
        const characterClass = document.getElementById('character-class').value;
        const level = parseInt(document.getElementById('character-level').value) || 1;
        
        const hitDiceMap = {
            'barbarian': 'd12',
            'fighter': 'd10',
            'paladin': 'd10',
            'ranger': 'd10',
            'bard': 'd8',
            'cleric': 'd8',
            'druid': 'd8',
            'monk': 'd8',
            'rogue': 'd8',
            'warlock': 'd8',
            'sorcerer': 'd6',
            'wizard': 'd6'
        };

        const hitDie = hitDiceMap[characterClass] || 'd8';
        document.getElementById('hit-dice').value = `${level}${hitDie}`;
    }

    // Update class-dependent stats
    updateClassDependentStats() {
        this.updateHitDice();
    }

    // Update spellcasting section visibility and stats
    updateSpellcasting() {
        const characterClass = document.getElementById('character-class').value;
        const spellcastingClasses = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'];
        const spellsTab = document.querySelector('[data-screen="spells"]');
        
        if (spellcastingClasses.includes(characterClass)) {
            // Show spells tab for spellcasting classes
            if (spellsTab) {
                spellsTab.style.display = 'block';
            }
            this.updateSpellcastingStats();
            this.updateSpellSlots();
            this.updateCantripsKnown();
            this.updateSpellsKnown();
            this.renderSpellSlots();
            this.renderSpellTabs();
        } else {
            // Hide spells tab for non-spellcasting classes
            if (spellsTab) {
                spellsTab.style.display = 'none';
            }
        }
    }

    // Update spellcasting stats (DC, attack bonus, etc.)
    updateSpellcastingStats() {
        const characterClass = document.getElementById('character-class').value;
        const data = this.getSpellcastingData();
        const spellcastingAbility = data.spellcastingAbility[characterClass];
        
        if (!spellcastingAbility) return;

        const abilityScore = parseInt(document.getElementById(spellcastingAbility).value) || 10;
        const abilityModifier = this.calculateModifier(abilityScore);
        const proficiencyBonus = parseInt(document.getElementById('proficiency-bonus').value) || 2;
        
        const spellSaveDC = 8 + abilityModifier + proficiencyBonus;
        const spellAttackBonus = abilityModifier + proficiencyBonus;

        document.getElementById('spellcasting-ability').value = spellcastingAbility.charAt(0).toUpperCase() + spellcastingAbility.slice(1);
        document.getElementById('spell-save-dc').value = spellSaveDC;
        document.getElementById('spell-attack-bonus').value = spellAttackBonus >= 0 ? `+${spellAttackBonus}` : `${spellAttackBonus}`;

        // Update spell section title based on preparation method
        const preparationMethod = data.preparationMethod[characterClass];
        const title = preparationMethod === 'prepared' ? 'Prepared Spells' : 'Known Spells';
        document.getElementById('spells-section-title').textContent = title;
    }

    // Update spell slots based on class and level
    updateSpellSlots() {
        const characterClass = document.getElementById('character-class').value;
        const level = parseInt(document.getElementById('character-level').value) || 1;
        const data = this.getSpellcastingData();
        
        let slots = [];
        
        if (characterClass === 'warlock') {
            slots = data.warlockSlots[level] || [0, 0, 0, 0, 0];
        } else if (['paladin', 'ranger'].includes(characterClass)) {
            slots = data.halfCasterSlots[level] || [0, 0, 0, 0, 0];
        } else if (['bard', 'cleric', 'druid', 'sorcerer', 'wizard'].includes(characterClass)) {
            slots = data.spellSlots[level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        // Initialize spell slots object
        this.spellSlots = {};
        this.usedSpellSlots = this.usedSpellSlots || {};
        
        for (let i = 0; i < slots.length; i++) {
            const level = i + 1;
            this.spellSlots[level] = slots[i];
            if (!this.usedSpellSlots[level]) {
                this.usedSpellSlots[level] = 0;
            }
            // Ensure used slots don't exceed available slots
            if (this.usedSpellSlots[level] > this.spellSlots[level]) {
                this.usedSpellSlots[level] = this.spellSlots[level];
            }
        }
    }

    // Update cantrips known
    updateCantripsKnown() {
        const characterClass = document.getElementById('character-class').value;
        const level = parseInt(document.getElementById('character-level').value) || 1;
        const data = this.getSpellcastingData();
        
        const cantripsData = data.cantripsKnown[characterClass];
        if (!cantripsData) {
            document.getElementById('cantrips-max').textContent = '0';
            return;
        }

        let maxCantrips = 0;
        for (const levelThreshold in cantripsData) {
            if (level >= parseInt(levelThreshold)) {
                maxCantrips = cantripsData[levelThreshold];
            }
        }

        document.getElementById('cantrips-max').textContent = maxCantrips;
        document.getElementById('cantrips-count').textContent = this.cantrips.length;
    }

    // Update spells known/prepared
    updateSpellsKnown() {
        const characterClass = document.getElementById('character-class').value;
        const level = parseInt(document.getElementById('character-level').value) || 1;
        const data = this.getSpellcastingData();
        const spellsLimitDisplay = document.getElementById('spells-limit-display');
        
        if (characterClass === 'wizard') {
            spellsLimitDisplay.style.display = 'none';
        } else {
            spellsLimitDisplay.style.display = 'inline';
            let maxSpells = 0;
            
            if (data.preparationMethod[characterClass] === 'prepared') {
                // Prepared casters: Level + ability modifier
                const spellcastingAbility = data.spellcastingAbility[characterClass];
                const abilityScore = parseInt(document.getElementById(spellcastingAbility).value) || 10;
                const abilityModifier = Math.max(1, this.calculateModifier(abilityScore));
                maxSpells = level + abilityModifier;
            } else {
                // Known casters: Fixed by level
                const spellsData = data.spellsKnown[characterClass];
                if (spellsData) {
                    for (const levelThreshold in spellsData) {
                        if (level >= parseInt(levelThreshold)) {
                            maxSpells = spellsData[levelThreshold];
                        }
                    }
                }
            }
            document.getElementById('spells-max').textContent = maxSpells;
        }

        document.getElementById('spells-count').textContent = this.spells.length;
    }

    // Render spell slots UI
    renderSpellSlots() {
        const container = document.getElementById('spell-slots-grid');
        container.innerHTML = '';

        for (let level = 1; level <= 9; level++) {
            const slots = this.spellSlots[level] || 0;
            if (slots === 0) continue;

            const slotDiv = document.createElement('div');
            slotDiv.className = 'spell-slot-level';
            
            const title = document.createElement('h4');
            title.textContent = level === 1 ? '1st' : level === 2 ? '2nd' : level === 3 ? '3rd' : `${level}th`;
            slotDiv.appendChild(title);

            const slotsContainer = document.createElement('div');
            slotsContainer.className = 'spell-slots';

            for (let i = 0; i < slots; i++) {
                const slot = document.createElement('div');
                slot.className = 'spell-slot';
                if (i < (this.usedSpellSlots[level] || 0)) {
                    slot.classList.add('used');
                }
                
                slot.addEventListener('click', () => {
                    this.toggleSpellSlot(level, i);
                });

                slotsContainer.appendChild(slot);
            }

            slotDiv.appendChild(slotsContainer);
            container.appendChild(slotDiv);
        }
    }

    // Toggle spell slot usage
    toggleSpellSlot(level, index) {
        const used = this.usedSpellSlots[level] || 0;
        
        if (index < used) {
            // Clicking on a used slot - remove usage from this slot and all higher slots
            this.usedSpellSlots[level] = index;
        } else {
            // Clicking on an unused slot - mark this slot and all lower slots as used
            this.usedSpellSlots[level] = index + 1;
        }

        this.renderSpellSlots();
        if (this.currentCharacter) {
            this.autoSave();
        }
    }

    // Render spell level tabs
    renderSpellTabs() {
        const container = document.getElementById('spell-level-tabs');
        container.innerHTML = '';

        // Determine max spell level based on character level and class
        const characterClass = document.getElementById('character-class').value;
        const level = parseInt(document.getElementById('character-level').value) || 1;
        
        let maxSpellLevel = 0;
        if (['paladin', 'ranger'].includes(characterClass)) {
            maxSpellLevel = Math.min(5, Math.ceil(level / 4));
        } else if (characterClass === 'warlock') {
            if (level >= 17) maxSpellLevel = 5;
            else if (level >= 11) maxSpellLevel = 4;
            else if (level >= 3) maxSpellLevel = 2;
            else maxSpellLevel = 1;
        } else {
            maxSpellLevel = Math.min(9, Math.ceil(level / 2));
        }

        for (let spellLevel = 1; spellLevel <= maxSpellLevel; spellLevel++) {
            const tab = document.createElement('div');
            tab.className = 'spell-tab';
            if (spellLevel === this.currentSpellTab) {
                tab.classList.add('active');
            }
            
            tab.textContent = spellLevel === 1 ? '1st' : spellLevel === 2 ? '2nd' : spellLevel === 3 ? '3rd' : `${spellLevel}th`;
            
            tab.addEventListener('click', () => {
                this.currentSpellTab = spellLevel;
                this.renderSpellTabs();
                this.renderSpellLists();
            });

            container.appendChild(tab);
        }

        this.renderSpellLists();
    }

    // Render spell lists
    renderSpellLists() {
        const container = document.getElementById('spell-lists-by-level');
        container.innerHTML = '';

        const spellsForLevel = this.spells.filter(spell => spell.level === this.currentSpellTab);
        
        spellsForLevel.forEach(spell => {
            const spellDiv = this.createSpellElement(spell);
            container.appendChild(spellDiv);
        });

        if (spellsForLevel.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.style.textAlign = 'center';
            emptyDiv.style.color = '#a0aec0';
            emptyDiv.style.padding = '20px';
            emptyDiv.textContent = `No ${this.currentSpellTab === 1 ? '1st' : this.currentSpellTab === 2 ? '2nd' : this.currentSpellTab === 3 ? '3rd' : `${this.currentSpellTab}th`} level spells`;
            container.appendChild(emptyDiv);
        }
    }

    // Create spell element
    createSpellElement(spell) {
        const spellDiv = document.createElement('div');
        spellDiv.className = 'spell-item';
        if (spell.prepared) {
            spellDiv.classList.add('prepared');
        }

        const header = document.createElement('div');
        header.className = 'spell-header';

        const name = document.createElement('div');
        name.className = 'spell-name';
        name.textContent = spell.name;

        const levelIndicator = document.createElement('div');
        levelIndicator.className = 'spell-level-indicator';
        levelIndicator.textContent = spell.level === 1 ? '1st' : spell.level === 2 ? '2nd' : spell.level === 3 ? '3rd' : `${spell.level}th`;

        header.appendChild(name);
        header.appendChild(levelIndicator);

        if (spell.school) {
            const school = document.createElement('div');
            school.className = 'spell-school';
            school.textContent = spell.school.charAt(0).toUpperCase() + spell.school.slice(1);
            spellDiv.appendChild(school);
        }

        if (spell.description) {
            const description = document.createElement('div');
            description.className = 'spell-description';
            description.textContent = spell.description;
            spellDiv.appendChild(description);
        }

        const actions = document.createElement('div');
        actions.className = 'spell-actions';

        // Prepared toggle for preparation casters
        const characterClass = document.getElementById('character-class').value;
        const data = this.getSpellcastingData();
        if (data.preparationMethod[characterClass] === 'prepared') {
            const preparedToggle = document.createElement('label');
            preparedToggle.className = 'spell-prepared-toggle';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = spell.prepared || false;
            checkbox.addEventListener('change', () => {
                spell.prepared = checkbox.checked;
                spellDiv.classList.toggle('prepared', spell.prepared);
                if (this.currentCharacter) {
                    this.autoSave();
                }
            });

            preparedToggle.appendChild(checkbox);
            preparedToggle.appendChild(document.createTextNode('Prepared'));
            actions.appendChild(preparedToggle);
        }

        // Cast button
        const castBtn = document.createElement('button');
        castBtn.className = 'spell-cast-btn';
        castBtn.textContent = 'Cast';
        
        // Check if spell can be cast
        const canCast = this.canCastSpell(spell);
        castBtn.disabled = !canCast;
        
        castBtn.addEventListener('click', () => {
            this.castSpell(spell);
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'spell-delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            this.deleteSpell(spell);
        });

        actions.appendChild(castBtn);
        actions.appendChild(deleteBtn);

        spellDiv.appendChild(header);
        spellDiv.appendChild(actions);

        return spellDiv;
    }

    // Check if spell can be cast
    canCastSpell(spell) {
        const characterClass = document.getElementById('character-class').value;
        const data = this.getSpellcastingData();
        
        // Check if spell is prepared (for preparation casters)
        if (data.preparationMethod[characterClass] === 'prepared' && !spell.prepared) {
            return false;
        }

        // Check if there are available spell slots of the spell's level or higher
        for (let level = spell.level; level <= 9; level++) {
            const available = (this.spellSlots[level] || 0) - (this.usedSpellSlots[level] || 0);
            if (available > 0) {
                return true;
            }
        }

        return false;
    }

    // Cast spell
    castSpell(spell) {
        if (!this.canCastSpell(spell)) return;

        // Find the lowest available spell slot that can cast this spell
        for (let level = spell.level; level <= 9; level++) {
            const available = (this.spellSlots[level] || 0) - (this.usedSpellSlots[level] || 0);
            if (available > 0) {
                this.usedSpellSlots[level] = (this.usedSpellSlots[level] || 0) + 1;
                this.renderSpellSlots();
                this.renderSpellLists(); // Update cast buttons
                
                if (this.currentCharacter) {
                    this.autoSave();
                }
                
                alert(`Cast ${spell.name} using a ${level === 1 ? '1st' : level === 2 ? '2nd' : level === 3 ? '3rd' : `${level}th`} level spell slot!`);
                break;
            }
        }
    }

    // Delete spell
    deleteSpell(spell) {
        if (confirm(`Are you sure you want to delete "${spell.name}"?`)) {
            this.spells = this.spells.filter(s => s !== spell);
            this.updateSpellsKnown();
            this.renderSpellLists();
            
            if (this.currentCharacter) {
                this.autoSave();
            }
        }
    }

    // Show spell modal
    showSpellModal(isCantrip = false) {
        const modal = document.getElementById('spell-modal');
        const title = document.getElementById('spell-modal-title');
        const levelSelect = document.getElementById('spell-level');
        const preparedGroup = document.getElementById('prepared-group');
        
        title.textContent = isCantrip ? 'Add Cantrip' : 'Add Spell';
        
        if (isCantrip) {
            levelSelect.value = '0';
            levelSelect.disabled = true;
            preparedGroup.style.display = 'none';
        } else {
            levelSelect.disabled = false;
            levelSelect.value = '1';
            
            // Show prepared option for preparation casters
            const characterClass = document.getElementById('character-class').value;
            const data = this.getSpellcastingData();
            if (data.preparationMethod[characterClass] === 'prepared') {
                preparedGroup.style.display = 'block';
            } else {
                preparedGroup.style.display = 'none';
            }
        }

        // Clear form
        document.getElementById('spell-name').value = '';
        document.getElementById('spell-school').value = '';
        document.getElementById('spell-description').value = '';
        document.getElementById('spell-prepared').checked = false;

        modal.style.display = 'block';
    }

    // Add spell
    addSpell() {
        const name = document.getElementById('spell-name').value.trim();
        const level = parseInt(document.getElementById('spell-level').value);
        const school = document.getElementById('spell-school').value;
        const description = document.getElementById('spell-description').value.trim();
        const prepared = document.getElementById('spell-prepared').checked;

        if (!name) {
            alert('Please enter a spell name.');
            return;
        }

        const spell = {
            name,
            level,
            school,
            description,
            prepared: level === 0 ? true : prepared // Cantrips are always "prepared"
        };

        if (level === 0) {
            // Check cantrip limit
            const maxCantrips = parseInt(document.getElementById('cantrips-max').textContent) || 0;
            if (this.cantrips.length >= maxCantrips) {
                alert(`You can only know ${maxCantrips} cantrips at your current level.`);
                return;
            }
            this.cantrips.push(spell);
            this.renderCantrips();
            this.updateCantripsKnown();
        } else {
            const characterClass = document.getElementById('character-class').value;
            // Check spell limit, but not for Wizards
            if (characterClass !== 'wizard') {
                const maxSpells = parseInt(document.getElementById('spells-max').textContent) || 0;
                if (this.spells.length >= maxSpells) {
                    alert(`You can only know/prepare ${maxSpells} spells at your current level.`);
                    return;
                }
            }
            this.spells.push(spell);
            this.updateSpellsKnown();
            this.renderSpellLists();
        }

        document.getElementById('spell-modal').style.display = 'none';
        
        if (this.currentCharacter) {
            this.autoSave();
        }
    }

    // Render cantrips
    renderCantrips() {
        const container = document.getElementById('cantrips-list');
        container.innerHTML = '';

        this.cantrips.forEach(cantrip => {
            const cantripDiv = this.createSpellElement(cantrip);
            container.appendChild(cantripDiv);
        });

        if (this.cantrips.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.style.textAlign = 'center';
            emptyDiv.style.color = '#a0aec0';
            emptyDiv.style.padding = '20px';
            emptyDiv.textContent = 'No cantrips known';
            container.appendChild(emptyDiv);
        }
    }

    // Short rest
    shortRest() {
        const characterClass = document.getElementById('character-class').value;
        
        if (characterClass === 'warlock') {
            // Warlocks recover spell slots on short rest
            this.usedSpellSlots = {};
            this.renderSpellSlots();
            this.renderSpellLists();
            alert('Short rest completed! Warlock spell slots restored.');
        } else {
            alert('Short rest completed! (No spell slot recovery for this class)');
        }

        if (this.currentCharacter) {
            this.autoSave();
        }
    }

    // Long rest
    longRest() {
        // All classes recover spell slots on long rest
        this.usedSpellSlots = {};
        this.renderSpellSlots();
        this.renderSpellLists();
        alert('Long rest completed! All spell slots restored.');

        if (this.currentCharacter) {
            this.autoSave();
        }
    }

    // Update skill bonuses
    updateSkillBonuses() {
        const proficiencyBonus = parseInt(document.getElementById('proficiency-bonus').value) || 2;
        
        const skillAbilityMap = {
            'athletics': 'strength',
            'acrobatics': 'dexterity',
            'sleight-of-hand': 'dexterity',
            'stealth': 'dexterity',
            'arcana': 'intelligence',
            'history': 'intelligence',
            'investigation': 'intelligence',
            'nature': 'intelligence',
            'religion': 'intelligence',
            'animal-handling': 'wisdom',
            'insight': 'wisdom',
            'medicine': 'wisdom',
            'perception': 'wisdom',
            'survival': 'wisdom',
            'deception': 'charisma',
            'intimidation': 'charisma',
            'performance': 'charisma',
            'persuasion': 'charisma'
        };

        Object.entries(skillAbilityMap).forEach(([skill, ability]) => {
            const abilityScore = parseInt(document.getElementById(ability).value) || 10;
            const abilityModifier = this.calculateModifier(abilityScore);
            const isProficient = document.getElementById(`${skill}-prof`).checked;
            
            const profBonus = isProficient ? proficiencyBonus : 0;
            const skillBonus = abilityModifier + profBonus;
            
            // Update ability modifier display
            const abilityElement = document.getElementById(`${skill}-ability`);
            if (abilityElement) {
                abilityElement.textContent = abilityModifier >= 0 ? `+${abilityModifier}` : `${abilityModifier}`;
            }
            
            // Update proficiency bonus display
            const profElement = document.getElementById(`${skill}-prof-bonus`);
            if (profElement) {
                profElement.textContent = profBonus >= 0 ? `+${profBonus}` : `${profBonus}`;
            }
            
            // Update total bonus display
            const bonusElement = document.getElementById(`${skill}-bonus`);
            if (bonusElement) {
                bonusElement.textContent = skillBonus >= 0 ? `+${skillBonus}` : `${skillBonus}`;
            }
        });

        this.autoSave();
    }

    // Create new character
    newCharacter() {
        this.currentCharacter = `character_${Date.now()}`;
        this.resetForm();
        this.saveCharacter();
        alert('New character created. Fill in the details and your progress will be auto-saved.');
    }

    // Reset form to default values
    resetForm() {
        document.getElementById('character-sheet-form').reset();
        this.spells = [];
        this.cantrips = [];
        this.notesEntries = [];
        this.currentJournalFilter = 'all';
        this.updateModifiers();
        this.updateLevelDependentStats();
        this.updateClassDependentStats();
        this.updateSpellcasting();
        this.renderAllSpells();
        renderJournal(document.querySelector('.journal-notes-container'), this.notesEntries, this.currentJournalFilter);
    }

    // Save character to localStorage
    saveCharacter() {
        if (!this.currentCharacter) {
            // This case should ideally not be hit if newCharacter sets it, but as a fallback:
            this.currentCharacter = `character_${Date.now()}`;
        }
        const data = this.gatherCharacterData();

        try {
            const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '{}');
            savedCharacters[this.currentCharacter] = {
                ...data,
                lastModified: new Date().toISOString()
            };
            localStorage.setItem('dnd-characters', JSON.stringify(savedCharacters));
            localStorage.setItem('dnd-last-character', this.currentCharacter);

            console.log(`Character ${this.currentCharacter} saved successfully.`);
        } catch (error) {
            console.error("Failed to save character to localStorage:", error);
            const saveBtn = document.getElementById('save-character-btn');
            saveBtn.style.backgroundColor = '#e53e3e'; // A shade of red
            saveBtn.textContent = 'Save Failed';
            setTimeout(() => {
                saveBtn.style.backgroundColor = ''; // Revert to original style
                saveBtn.textContent = 'Save Character';
            }, 3000);
            alert('Could not save character. Your browser storage might be full or disabled.');
        }
    }

    autoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveCharacter();
        }, 500);
    }

    // Gather all character data from form
    gatherCharacterData() {
        const getIntValue = (id, fallback = 0) => parseInt(document.getElementById(id).value, 10) || fallback;

        const data = {
            // Basic info
            name: document.getElementById('character-name').value,
            class: document.getElementById('character-class').value,
            race: document.getElementById('character-race').value,
            background: document.getElementById('character-background').value,
            level: getIntValue('character-level', 1),
            alignment: document.getElementById('character-alignment').value,

            // Ability scores
            abilities: {
                strength: getIntValue('strength', 10),
                dexterity: getIntValue('dexterity', 10),
                constitution: getIntValue('constitution', 10),
                intelligence: getIntValue('intelligence', 10),
                wisdom: getIntValue('wisdom', 10),
                charisma: getIntValue('charisma', 10)
            },

            // Combat stats
            armorClass: getIntValue('armor-class', 10),
            speed: getIntValue('speed', 30),

            // Hit points
            maxHp: getIntValue('max-hp', 8),
            currentHp: getIntValue('current-hp', 8),
            tempHp: getIntValue('temp-hp', 0),

            // Skills
            skills: {},

            // Spellcasting
            spells: this.spells,
            cantrips: this.cantrips,
            usedSpellSlots: this.usedSpellSlots,

            // Equipment and notes
            equipment: document.getElementById('equipment').value,
            notesEntries: this.notesEntries,
        };

        // Gather skill proficiencies
        const skills = [
            'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
            'history', 'insight', 'intimidation', 'investigation', 'medicine',
            'nature', 'perception', 'performance', 'persuasion', 'religion',
            'sleight-of-hand', 'stealth', 'survival'
        ];
        
        skills.forEach(skill => {
            const checkbox = document.getElementById(`${skill}-prof`);
            if (checkbox) {
                data.skills[skill] = checkbox.checked;
            }
        });

        return data;
    }

    // Load character data into form
    loadCharacterData(characterData) {
        // A helper function to safely parse integers
        const safeParseInt = (value, fallback) => {
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? fallback : parsed;
        };

        // Load basic info
        document.getElementById('character-name').value = characterData.name || '';
        document.getElementById('character-class').value = characterData.class || '';
        document.getElementById('character-race').value = characterData.race || '';
        document.getElementById('character-background').value = characterData.background || '';
        document.getElementById('character-level').value = safeParseInt(characterData.level, 1);
        document.getElementById('character-alignment').value = characterData.alignment || '';

        // Load ability scores
        if (characterData.abilities) {
            Object.entries(characterData.abilities).forEach(([ability, value]) => {
                document.getElementById(ability).value = safeParseInt(value, 10);
            });
        }

        // Load combat stats
        document.getElementById('armor-class').value = safeParseInt(characterData.armorClass, 10);
        document.getElementById('speed').value = safeParseInt(characterData.speed, 30);

        // Load hit points
        document.getElementById('max-hp').value = safeParseInt(characterData.maxHp, 8);
        document.getElementById('current-hp').value = safeParseInt(characterData.currentHp, 8);
        document.getElementById('temp-hp').value = safeParseInt(characterData.tempHp, 0);

        // Load skill proficiencies
        if (characterData.skills) {
            Object.entries(characterData.skills).forEach(([skill, isProficient]) => {
                const checkbox = document.getElementById(`${skill}-prof`);
                if (checkbox) {
                    checkbox.checked = isProficient;
                }
            });
        }

        // Load spellcasting data
        this.spells = characterData.spells || [];
        this.cantrips = characterData.cantrips || [];
        this.usedSpellSlots = characterData.usedSpellSlots || {};

        // Load equipment and notes
        document.getElementById('equipment').value = characterData.equipment || '';

        // Load notes entries
        this.notesEntries = characterData.notesEntries || [];

        this.updateModifiers();
        this.updateLevelDependentStats();
        this.updateSpellcasting();
        this.renderCantrips();
        this.renderAllSpells();
        renderJournal(document.querySelector('.journal-notes-container'), this.notesEntries, this.currentJournalFilter);
    }

    // Show load character modal
    showLoadModal() {
        const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '{}');
        const characterList = document.getElementById('character-list');
        
        characterList.innerHTML = '';

        if (Object.keys(savedCharacters).length === 0) {
            characterList.innerHTML = '<p>No saved characters found.</p>';
        } else {
            Object.entries(savedCharacters).forEach(([name, data]) => {
                const characterItem = document.createElement('div');
                characterItem.className = 'character-list-item';
                
                characterItem.innerHTML = `
                    <div class="character-info">
                        <h4>${data.name || name}</h4>
                        <p>Level ${data.level || 1} ${data.race || 'Unknown'} ${data.class || 'Unknown'}</p>
                        <p>Last modified: ${new Date(data.lastModified).toLocaleDateString()}</p>
                    </div>
                    <button class="delete-character" data-character-name="${name}">Delete</button>
                `;
                
                characterItem.addEventListener('click', (e) => {
                    if (e.target.classList.contains('delete-character')) {
                        const charNameToDelete = e.target.dataset.characterName;
                        this.deleteCharacter(charNameToDelete);
                    } else {
                        this.loadCharacter(name);
                        document.getElementById('character-modal').style.display = 'none';
                    }
                });
                
                characterList.appendChild(characterItem);
            });
        }

        document.getElementById('character-modal').style.display = 'block';
    }

    // Load specific character
    loadCharacter(characterName) {
        const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '{}');
        
        if (savedCharacters[characterName]) {
            this.loadCharacterData(savedCharacters[characterName]);
            this.currentCharacter = characterName;
            localStorage.setItem('dnd-last-character', characterName);
            alert(`Character "${characterName}" loaded successfully!`);
        } else {
            alert('Character not found!');
        }
    }

    // Delete character
    deleteCharacter(characterName) {
        if (confirm(`Are you sure you want to delete "${characterName}"?`)) {
            const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '{}');
            delete savedCharacters[characterName];
            localStorage.setItem('dnd-characters', JSON.stringify(savedCharacters));
            
            if (this.currentCharacter === characterName) {
                this.currentCharacter = null;
                localStorage.removeItem('dnd-last-character');
            }
            
            this.showLoadModal(); // Refresh the modal
        }
    }

    // Load last character on page load
    loadLastCharacter() {
        const lastCharacter = localStorage.getItem('dnd-last-character');
        
        if (lastCharacter) {
            const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '{}');
            
            if (savedCharacters[lastCharacter]) {
                this.loadCharacterData(savedCharacters[lastCharacter]);
                this.currentCharacter = lastCharacter;
            }
        } else {
            // Initialize with default values
            this.updateModifiers();
            this.updateLevelDependentStats();
            this.updateSpellcasting();
        }
    }

    // Export character data
    exportCharacter() {
        const characterData = this.gatherCharacterData();
        
        if (!characterData.name || characterData.name.trim() === '') {
            alert('Please enter a character name before exporting.');
            return;
        }
        
        // Add export metadata
        const exportData = {
            ...characterData,
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0'
        };
        
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${characterData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_character.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`Character "${characterData.name}" exported successfully!`);
    }

    // Handle file import
    handleFileImport(e) {
        console.log('File import triggered');
        const file = e.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }
        
        console.log('File selected:', file.name, file.type);
        
        if (!file.name.endsWith('.json')) {
            alert('Please select a valid JSON file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                console.log('File content loaded, parsing JSON...');
                const characterData = JSON.parse(event.target.result);
                console.log('Character data parsed:', characterData);
                
                const characterName = characterData.name || `character_${Date.now()}`;
                
                this.currentCharacter = characterName;
                this.loadCharacterData(characterData);
                this.saveCharacter();
                alert(`Character "${characterName}" imported successfully!`);
                
                // Close any open modals
                document.getElementById('character-modal').style.display = 'none';
            } catch (error) {
                console.error('JSON parsing error:', error);
                alert('Failed to import character. Invalid JSON file. Error: ' + error.message);
            }
        };
        
        reader.onerror = (error) => {
            console.error('File reading error:', error);
            alert('Failed to read the file.');
        };
        
        reader.readAsText(file);
        
        // Reset file input
        e.target.value = '';
    }

    // Show save info modal
    showSaveInfoModal() {
        const saveInfoModal = document.getElementById('save-info-modal');
        saveInfoModal.style.display = 'block';
    }

    // Render all spells
    renderAllSpells() {
        this.renderCantrips();
        this.renderSpellSlots();
        this.renderSpellTabs();
        this.renderSpellLists();
    }

    // Dice Rolling System
    initializeDiceRoller() {
        this.rollHistory = JSON.parse(localStorage.getItem('diceRollHistory')) || [];
        this.advantageMode = 'normal'; // normal, advantage, disadvantage
        
        // Dice button event listeners
        document.querySelectorAll('.dice-button').forEach(button => {
            button.addEventListener('click', (e) => this.rollDice(e));
        });
        
        // Control event listeners
        document.getElementById('advantage-btn').addEventListener('click', () => this.setAdvantageMode('advantage'));
        document.getElementById('disadvantage-btn').addEventListener('click', () => this.setAdvantageMode('disadvantage'));
        document.getElementById('normal-btn').addEventListener('click', () => this.setAdvantageMode('normal'));
        
        // Custom roll
        document.getElementById('custom-roll-btn').addEventListener('click', () => this.rollCustom());
        document.getElementById('custom-roll-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.rollCustom();
        });
        
        // Clear history
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearRollHistory());
        
        this.renderRollHistory();
    }
    
    setAdvantageMode(mode) {
        this.advantageMode = mode;
        document.querySelectorAll('.advantage-controls .btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-btn`).classList.add('active');
    }
    
    rollDice(event) {
        const button = event.currentTarget;
        const sides = parseInt(button.dataset.sides);
        const quantity = parseInt(document.getElementById('dice-quantity').value) || 1;
        const modifier = parseInt(document.getElementById('dice-modifier').value) || 0;
        
        // Add rolling animation
        button.classList.add('rolling');
        setTimeout(() => button.classList.remove('rolling'), 600);
        
        let rolls = [];
        let total = 0;
        
        if (sides === 20 && this.advantageMode !== 'normal') {
            // Handle advantage/disadvantage for d20
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            
            if (this.advantageMode === 'advantage') {
                rolls = [Math.max(roll1, roll2)];
                total = rolls[0] + modifier;
            } else {
                rolls = [Math.min(roll1, roll2)];
                total = rolls[0] + modifier;
            }
            
            this.displayRollResult(button, rolls[0], `${this.advantageMode} (${roll1}, ${roll2})`);
        } else {
            // Normal rolling
            for (let i = 0; i < quantity; i++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                rolls.push(roll);
                total += roll;
            }
            total += modifier;
            
            this.displayRollResult(button, rolls.length === 1 ? rolls[0] : total);
        }
        
        // Add to history
        const rollExpression = quantity > 1 ? `${quantity}d${sides}` : `d${sides}`;
        const modifierText = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : '';
        const advantageText = sides === 20 && this.advantageMode !== 'normal' ? ` (${this.advantageMode})` : '';
        
        this.addToRollHistory(`${rollExpression}${modifierText}${advantageText}`, total, rolls);
        
        // Update main result display
        this.updateMainResult(total, rolls, modifier, sides === 20);
    }
    
    displayRollResult(button, result, note = '') {
        const resultElement = button.querySelector('.dice-result');
        resultElement.textContent = result;
        
        // Add special styling for d20 crits/fumbles
        resultElement.classList.remove('critical', 'fumble');
        if (button.dataset.sides === '20') {
            if (result === 20) resultElement.classList.add('critical');
            if (result === 1) resultElement.classList.add('fumble');
        }
    }
    
    updateMainResult(total, rolls, modifier, isD20) {
        const resultElement = document.getElementById('main-result');
        const breakdownElement = document.getElementById('result-breakdown');
        
        resultElement.textContent = total;
        resultElement.classList.remove('critical', 'fumble');
        
        // Special styling for d20 results
        if (isD20 && rolls.length === 1) {
            if (rolls[0] === 20) resultElement.classList.add('critical');
            if (rolls[0] === 1) resultElement.classList.add('fumble');
        }
        
        // Show breakdown for multiple dice or modifiers
        if (rolls.length > 1 || modifier !== 0) {
            let breakdown = `[${rolls.join(', ')}]`;
            if (modifier !== 0) {
                breakdown += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
            }
            breakdownElement.textContent = breakdown;
        } else {
            breakdownElement.textContent = '';
        }
    }
    
    rollCustom() {
        const input = document.getElementById('custom-roll-input');
        const expression = input.value.trim();
        
        if (!expression) return;
        
        try {
            const result = this.parseAndRollExpression(expression);
            this.addToRollHistory(expression, result.total, result.rolls);
            this.updateMainResult(result.total, result.rolls, 0, false);
            input.value = '';
        } catch (error) {
            alert('Invalid dice expression. Use format like: 3d6+2, 2d10-1, d20+5');
        }
    }
    
    parseAndRollExpression(expression) {
        // Simple parser for dice expressions like "3d6+2", "2d10-1", "d20+5"
        const regex = /(\d*)d(\d+)([+-]\d+)?/g;
        let match;
        let total = 0;
        let allRolls = [];
        
        while ((match = regex.exec(expression)) !== null) {
            const quantity = parseInt(match[1]) || 1;
            const sides = parseInt(match[2]);
            const modifier = parseInt(match[3]) || 0;
            
            let rolls = [];
            for (let i = 0; i < quantity; i++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                rolls.push(roll);
                total += roll;
            }
            total += modifier;
            allRolls = allRolls.concat(rolls);
        }
        
        if (allRolls.length === 0) {
            throw new Error('Invalid expression');
        }
        
        return { total, rolls: allRolls };
    }
    
    addToRollHistory(expression, result, rolls) {
        const timestamp = new Date().toLocaleTimeString();
        const historyItem = {
            expression,
            result,
            rolls,
            timestamp,
            id: Date.now()
        };
        
        this.rollHistory.unshift(historyItem);
        
        // Keep only last 20 rolls
        if (this.rollHistory.length > 20) {
            this.rollHistory = this.rollHistory.slice(0, 20);
        }
        
        localStorage.setItem('diceRollHistory', JSON.stringify(this.rollHistory));
        this.renderRollHistory();
    }
    
    renderRollHistory() {
        const historyList = document.getElementById('roll-history-list');
        
        if (this.rollHistory.length === 0) {
            historyList.innerHTML = '<div class="history-item"><span class="history-roll">No rolls yet</span></div>';
            return;
        }
        
        historyList.innerHTML = this.rollHistory.map(item => `
            <div class="history-item">
                <span class="history-roll">${item.expression}</span>
                <span class="history-result">${item.result}</span>
                <span class="history-time">${item.timestamp}</span>
            </div>
        `).join('');
    }
    
    clearRollHistory() {
        this.rollHistory = [];
        localStorage.removeItem('diceRollHistory');
        this.renderRollHistory();
        
        // Clear main result display
        document.getElementById('main-result').textContent = '-';
        document.getElementById('result-breakdown').textContent = '';
        
        // Clear individual dice results
        document.querySelectorAll('.dice-result').forEach(result => {
            result.textContent = '-';
            result.classList.remove('critical', 'fumble');
        });
    }

    // Navigation System
    initializeNavigation() {
        this.currentScreen = 'character';
        
        // Navigation tab event listeners
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchScreen(e.target.dataset.screen));
        });
    }
    
    switchScreen(screenName) {
        // Update current screen
        this.currentScreen = screenName;
        
        // Update navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.screen === screenName) {
                tab.classList.add('active');
            }
        });
        
        // Update screen visibility
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Handle screen name mapping for spells
        const screenId = screenName === 'spells' ? 'spells-screen' : `${screenName}-screen`;
        document.getElementById(screenId).classList.add('active');
        
        // Save current screen preference
        localStorage.setItem('currentScreen', screenName);
    }
    
    loadLastScreen() {
        const savedScreen = localStorage.getItem('currentScreen');
        if (savedScreen && savedScreen !== 'character') {
            this.switchScreen(savedScreen);
        }
    }

    // Initialize skill results system
    initializeSkillResults() {
        this.skillToAbility = {
            'athletics': 'strength',
            'acrobatics': 'dexterity',
            'sleight-of-hand': 'dexterity',
            'stealth': 'dexterity',
            'arcana': 'intelligence',
            'history': 'intelligence',
            'investigation': 'intelligence',
            'nature': 'intelligence',
            'religion': 'intelligence',
            'animal-handling': 'wisdom',
            'insight': 'wisdom',
            'medicine': 'wisdom',
            'perception': 'wisdom',
            'survival': 'wisdom',
            'deception': 'charisma',
            'intimidation': 'charisma',
            'performance': 'charisma',
            'persuasion': 'charisma'
        };
    }

    // Show skill results for a d20 roll
    showSkillResults(d20Roll) {
        console.log('showSkillResults called with d20Roll:', d20Roll);
        const skillResultsDisplay = document.getElementById('skill-results-display');
        if (!skillResultsDisplay) {
            console.log('skill-results-display element not found');
            return;
        }

        // Show the results panel
        skillResultsDisplay.style.display = 'block';
        console.log('Skill results panel shown');

        // Calculate results for each skill
        console.log('Available skills:', Object.keys(this.skillToAbility));
        Object.keys(this.skillToAbility).forEach(skill => {
            this.calculateAndDisplaySkillResult(skill, d20Roll);
        });

        // Also calculate constitution save
        this.calculateAndDisplaySkillResult('constitution-save', d20Roll, 'constitution');
    }

    // Calculate and display individual skill result
    calculateAndDisplaySkillResult(skill, d20Roll, overrideAbility = null) {
        const resultElement = document.getElementById(`${skill}-result`);
        if (!resultElement) {
            console.log(`Result element not found for skill: ${skill}`);
            return;
        }
        
        console.log(`Found result element for ${skill}:`, resultElement);

        let abilityKey = overrideAbility || this.skillToAbility[skill];
        let abilityScore = 10;
        let isProficient = false;
        let proficiencyBonus = 2;

        console.log(`Calculating for skill: ${skill}, ability: ${abilityKey}, d20: ${d20Roll}`);

        // Use character data if available
        if (this.currentCharacter) {
            console.log('Using character data:', this.currentCharacter);
            console.log('Character type:', typeof this.currentCharacter);
            
            // Check if currentCharacter is the data object or we need to load from storage
            let characterData = this.currentCharacter;
            if (typeof this.currentCharacter === 'string') {
                // If it's a string, load from localStorage
                const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '{}');
                characterData = savedCharacters[this.currentCharacter];
                console.log('Loaded character from storage:', characterData);
            }
            
            if (!characterData) {
                console.log('No character data found, using defaults');
                characterData = {};
            }
            
            const abilities = characterData.abilities || {};
            const skills = characterData.skills || {};
            const level = characterData.level || 1;
            
            abilityScore = abilities[abilityKey] || 10;
            isProficient = skills[skill] || false;
            proficiencyBonus = Math.ceil(level / 4) + 1;
            
            console.log(`Ability score: ${abilityScore}, Proficient: ${isProficient}, Prof bonus: ${proficiencyBonus}`);
        } else {
            console.log('No character data available, using defaults');
        }

        const abilityModifier = Math.floor((abilityScore - 10) / 2);
        const totalModifier = abilityModifier + (isProficient ? proficiencyBonus : 0);
        const totalResult = d20Roll + totalModifier;

        console.log(`Final calculation: ${d20Roll} + ${totalModifier} = ${totalResult}`);

        // Display the result
        console.log(`Setting result element text to: ${totalResult}`);
        resultElement.textContent = totalResult;
        console.log(`Result element after setting:`, resultElement.textContent);
        
        // Add critical styling
        resultElement.className = 'skill-result';
        if (d20Roll === 20) {
            resultElement.classList.add('critical-success');
        } else if (d20Roll === 1) {
            resultElement.classList.add('critical-failure');
        }
    }

    // Override the existing rollDice method to show skill results for d20 rolls
    rollDice(event) {
        const button = event.currentTarget;
        const sides = parseInt(button.dataset.sides);
        const quantity = parseInt(document.getElementById('dice-quantity').value) || 1;
        const modifier = parseInt(document.getElementById('dice-modifier').value) || 0;
        
        // Add rolling animation
        button.classList.add('rolling');
        setTimeout(() => button.classList.remove('rolling'), 600);
        
        let rolls = [];
        let total = 0;
        
        if (sides === 20 && this.advantageMode !== 'normal') {
            // Handle advantage/disadvantage for d20
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            
            if (this.advantageMode === 'advantage') {
                rolls = [Math.max(roll1, roll2)];
                total = rolls[0] + modifier;
            } else {
                rolls = [Math.min(roll1, roll2)];
                total = rolls[0] + modifier;
            }
            
            this.displayRollResult(button, rolls[0], `${this.advantageMode} (${roll1}, ${roll2})`);
        } else {
            // Normal rolling
            for (let i = 0; i < quantity; i++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                rolls.push(roll);
                total += roll;
            }
            total += modifier;
            
            this.displayRollResult(button, rolls.length === 1 ? rolls[0] : total);
        }
        
        // Add to history
        const rollExpression = quantity > 1 ? `${quantity}d${sides}` : `d${sides}`;
        const modifierText = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : '';
        const advantageText = sides === 20 && this.advantageMode !== 'normal' ? ` (${this.advantageMode})` : '';
        
        this.addToRollHistory(`${rollExpression}${modifierText}${advantageText}`, total, rolls);
        
        // Update main result display
        this.updateMainResult(total, rolls, modifier, sides === 20);
        
        // Show skill results for d20 rolls (single die only)
        if (sides === 20 && quantity === 1) {
            this.showSkillResults(rolls[0]);
        }
    }
}

// Initialize the application when the page loads
let characterSheet;

document.addEventListener('DOMContentLoaded', () => {
    characterSheet = new CharacterSheet();
});

// Make characterSheet globally accessible for event handlers
window.characterSheet = characterSheet;

// Info button tooltip handling for touch devices
document.addEventListener('DOMContentLoaded', function() {
    const infoButtons = document.querySelectorAll('.info-btn');
    
    infoButtons.forEach(button => {
        // For touch devices, show tooltip on click
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle tooltip visibility for touch devices
            if (window.innerWidth <= 768 || 'ontouchstart' in window) {
                const isVisible = button.classList.contains('tooltip-visible');
                
                // Hide all other tooltips
                infoButtons.forEach(btn => btn.classList.remove('tooltip-visible'));
                
                // Toggle current tooltip
                if (!isVisible) {
                    button.classList.add('tooltip-visible');
                    
                    // Hide after 3 seconds
                    setTimeout(() => {
                        button.classList.remove('tooltip-visible');
                    }, 3000);
                }
            }
        });
    });
    
    // Hide tooltips when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('info-btn')) {
            infoButtons.forEach(btn => btn.classList.remove('tooltip-visible'));
        }
    });
}); 
