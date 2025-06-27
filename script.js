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
        this.loadLastCharacter();
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
        document.getElementById('import-character-btn').addEventListener('click', () => this.importCharacter());
        document.getElementById('import-file-input').addEventListener('change', (e) => this.handleImportFile(e));
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
        const spellcastingSection = document.getElementById('spellcasting-section');
        
        if (spellcastingClasses.includes(characterClass)) {
            spellcastingSection.style.display = 'block';
            this.updateSpellcastingStats();
            this.updateSpellSlots();
            this.updateCantripsKnown();
            this.updateSpellsKnown();
            this.renderSpellSlots();
            this.renderSpellTabs();
        } else {
            spellcastingSection.style.display = 'none';
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
            notes: document.getElementById('notes').value,
            notesEntries: this.notesEntries,
        };

        // For backward compatibility, create a summary in the legacy notes field
        if (this.notesEntries.length > 0) {
            const summary = this.notesEntries
                .slice(0, 5) // Take first 5 notes
                .map(n => `[${n.type}] ${n.text.substring(0, 30)}...`)
                .join('\\n');
            data.notes = `Journal Summary (see new Notes & Journal section):\n${summary}`;
        }

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
        document.getElementById('notes').value = characterData.notes || '';

        // Load notes with backward compatibility
        this.notesEntries = [];
        if (characterData.notesEntries && characterData.notesEntries.length > 0) {
            this.notesEntries = characterData.notesEntries;
            // If legacy notes also exist, import them as a new note to prevent data loss
            if (characterData.notes) {
                const legacyNote = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    type: 'general',
                    text: `Imported from legacy notes field:\n\n${characterData.notes}`,
                    pinned: false,
                };
                this.notesEntries.unshift(legacyNote);
            }
        } else if (characterData.notes) {
            // If only legacy notes exist, convert them to the new format
            const legacyNote = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                type: 'general',
                text: characterData.notes,
                pinned: false,
            };
            this.notesEntries.push(legacyNote);
        }

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

    // Import character data
    importCharacter() {
        const fileInput = document.getElementById('import-file-input');
        fileInput.click();
    }

    // Handle imported file
    handleImportFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.json')) {
            alert('Please select a valid JSON file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const characterData = JSON.parse(event.target.result);
                // Use the character's name from the file as the primary key
                const characterName = characterData.name || `character_${Date.now()}`;
                
                this.currentCharacter = characterName;
                this.loadCharacterData(characterData);
                this.saveCharacter(); 
                alert(`Character "${characterName}" imported successfully!`);
            } catch (error) {
                console.error('Error parsing imported file:', error);
                alert('Failed to import character. The file may be corrupted or in the wrong format.');
            }
        };
        reader.readAsText(file);
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