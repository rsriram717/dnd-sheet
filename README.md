# D&D 5e Character Sheet Tracker

A modern, web-based character sheet tracker for Dungeons & Dragons 5th Edition. This application allows you to create, manage, and track your D&D characters throughout your campaigns, including comprehensive spellcasting support.

## Features

### Core Character Management
- **Complete D&D 5e Character Sheet**: All standard character information including basic details, ability scores, combat stats, hit points, skills, and equipment
- **Auto-calculations**: Automatic calculation of ability modifiers, skill bonuses, proficiency bonuses, and other derived stats
- **Multiple Character Support**: Save and load multiple characters with persistent local storage
- **Character Export/Import**: Export character data to JSON files for backup and sharing, import characters from exported files

### Spellcasting System
- **Full D&D 5e Spell Support**: Complete implementation of official spellcasting rules
- **Class-Specific Mechanics**: 
  - Full casters (Bard, Cleric, Druid, Sorcerer, Wizard): 1st-9th level spells
  - Half casters (Paladin, Ranger): 1st-5th level spells starting at level 2  
  - Warlock: Pact Magic with short rest recovery
- **Spell Management**: Add, remove, and organize spells by level with known vs prepared spell tracking
- **Visual Spell Slot Tracking**: Interactive spell slot grid with click-to-use functionality
- **Cantrip Support**: Unlimited cantrip usage with level-based progression limits
- **Rest Recovery**: Proper short rest (Warlock) and long rest (all classes) spell slot recovery

### User Experience
- **Modern UI**: Clean, responsive design with fantasy-themed styling
- **Auto-save**: Automatic saving of character data as you make changes
- **Mobile Friendly**: Responsive design that works on all devices
- **Data Privacy**: All data stored locally in your browser - no cloud storage or data collection

### Notes & Journal
- **Categorized Notes**: Create, view, edit, and delete notes in `General`, `Inventory`, `NPCs`, or `Lore/World` categories.
- **Filtering**: Filter notes by category or view all at once.
- **Timestamping**: Each note is automatically timestamped upon creation.
- **Pinning**: Pin important notes to the top of the list for quick access.
- **Secure & Animated**: Notes are rendered securely to prevent XSS and have smooth animations for adding and deleting.

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. Fill in your character's basic information (name, class, race, etc.)
3. Set ability scores using point buy, standard array, or rolled stats
4. Configure skills, equipment, and other character details
5. For spellcasters, add spells and manage spell slots

### Character Management
- **New Character**: Click "New Character" to start fresh
- **Save Character**: Click "Save Character" to store locally in browser
- **Load Character**: Click "Load Character" to switch between saved characters
- **Export Character**: Click "Export Character" to download a JSON file backup
- **Import Character**: Click "Import Character" to load a character from a JSON file

### Export/Import Features
- **Exporting**: Creates a downloadable JSON file with all character data including spells, equipment, and stats
- **Importing**: Load any exported character file to restore complete character data
- **Cross-Session**: Export at end of game session, import at start of next session
- **Backup**: Export files serve as permanent backups independent of browser storage
- **Sharing**: Share character files with other players or DMs
- **File Format**: Clean JSON format with metadata (export date, app version)

### Spellcasting (For Spellcasters)
1. **Set Spellcasting Class**: Choose your spellcasting class to enable spell features
2. **Add Cantrips**: Click "Add Cantrip" to add unlimited-use spells
3. **Add Spells**: Use "Add Spell" to add leveled spells to your spellbook
4. **Prepare Spells**: For preparation-based casters, toggle spell preparation status
5. **Cast Spells**: Click "Cast" on any spell to automatically use spell slots
6. **Manage Slots**: Click spell slot circles to manually track usage
7. **Rest Recovery**: Use "Short Rest" (Warlocks) or "Long Rest" (all) to recover slots

### Creating a New Character
1. Click the "New Character" button in the header
2. Fill in the basic character information:
   - Character name
   - Class, race, background
   - Level and alignment
3. Set your ability scores (the modifiers will calculate automatically)
4. Adjust combat stats like Armor Class and Speed
5. Set your hit points
6. Select skill proficiencies (bonuses calculate automatically)
7. Add equipment and notes

### Spellcasting Setup
1. **Select a Spellcasting Class**: Choose Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, or Wizard
2. **Spellcasting Section Appears**: The spellcasting section will automatically appear with:
   - Spellcasting ability, spell save DC, and spell attack bonus
   - Available spell slots based on your class and level
   - Cantrip and spell management areas

### Managing Spells
1. **Adding Cantrips**:
   - Click "Add Cantrip" in the Cantrips section
   - Enter spell name, school, and description
   - Cantrips are automatically "prepared" and can be cast at will

2. **Adding Spells**:
   - Click "Add Spell" in the spells section
   - Choose spell level (limited by your character level and class)
   - For preparation casters (Cleric, Druid, Paladin, Wizard): Check "Prepared" to prepare the spell
   - For known casters (Bard, Ranger, Sorcerer, Warlock): Spells are automatically available

3. **Spell Organization**:
   - Spells are organized by level in tabs (1st, 2nd, 3rd, etc.)
   - Click tabs to view spells of different levels
   - Prepared spells are highlighted with a golden border

### Using Spells in Play
1. **Casting Spells**:
   - Click the "Cast" button on any prepared/known spell
   - The system automatically uses the lowest available spell slot
   - Spell slots are visually marked as used
   - Cast button is disabled if no spell slots are available

2. **Managing Spell Slots**:
   - Click individual spell slot circles to mark them as used/unused
   - Visual indicators show used (filled) vs available (empty) slots
   - Spell slot counts update automatically when you level up

3. **Rest Recovery**:
   - **Short Rest**: Click "Short Rest" button (Warlocks recover all spell slots)
   - **Long Rest**: Click "Long Rest" button (All classes recover all spell slots)

### Spell Limits and Rules
- **Cantrip Limits**: Based on class and level (e.g., Wizards get 3 at 1st level, 4 at 4th level)
- **Spell Limits**: 
  - **Known Casters**: Fixed number based on class table
  - **Prepared Casters**: Character level + spellcasting ability modifier
- **Spell Slot Progression**: Follows official D&D 5e tables for each class
- **Multiclass Support**: Currently designed for single-class characters

### Saving Your Character
1. Make sure you've entered a character name
2. Click the "Save Character" button
3. Your character will be saved to local storage
4. The application will auto-save any future changes

### Loading a Character
1. Click the "Load Character" button
2. Select from your list of saved characters
3. The character data will populate the form
4. You can now continue editing and the changes will auto-save

### Updating During Campaign
- **Hit Points**: Update current HP as you take damage or heal
- **Temporary HP**: Add temporary hit points when gained
- **Spell Usage**: Mark spell slots as used when casting spells
- **Level Up**: Change the level and watch all stats update automatically
- **Equipment**: Update your equipment list as you gain or lose items
- **Spell Management**: Add new spells learned, prepare different spells daily
- **Notes**: Track important campaign events, spells learned, etc.

## Technical Details

### File Structure
- `index.html` - Main application interface with spellcasting UI
- `styles.css` - Modern, responsive styling with fantasy theme and spell-specific styles
- `script.js` - All application logic including comprehensive spellcasting functionality
- `journal.js` - Contains all logic for the Notes & Journal feature.
- `README.md` - This documentation file

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript to be enabled
- Uses localStorage for data persistence

### Data Storage
- All data is stored locally in your browser's localStorage
- No external servers or accounts required
- Data persists between browser sessions
- Clearing browser data will remove saved characters

## D&D 5e Rules Implementation

### Ability Scores
- Standard range of 1-30 (though 3-18 is typical for starting characters)
- Automatic modifier calculation: (Score - 10) ÷ 2, rounded down

### Proficiency Bonus
- Automatically calculated based on character level:
  - Levels 1-4: +2
  - Levels 5-8: +3
  - Levels 9-12: +4
  - Levels 13-16: +5
  - Levels 17-20: +6

### Skills
- All 18 standard D&D 5e skills included
- Proper ability score associations
- Proficiency bonus added when skill is marked as proficient

### Hit Dice
- Automatically set based on character class:
  - Barbarian: d12
  - Fighter, Paladin, Ranger: d10
  - Bard, Cleric, Druid, Monk, Rogue, Warlock: d8
  - Sorcerer, Wizard: d6

### Spellcasting Rules
- **Spell Save DC**: 8 + proficiency bonus + spellcasting ability modifier
- **Spell Attack Bonus**: proficiency bonus + spellcasting ability modifier
- **Spellcasting Abilities**:
  - Intelligence: Wizard
  - Wisdom: Cleric, Druid, Ranger
  - Charisma: Bard, Paladin, Sorcerer, Warlock

### Spell Slot Progression
- **Full Casters**: Standard progression from 1st to 9th level spells
- **Half Casters**: Slower progression, maximum 5th level spells
- **Warlock**: Unique Pact Magic system with fewer but higher-level slots

### Spell Knowledge Systems
- **Spells Known**: Bard, Ranger, Sorcerer, Warlock learn a fixed number of spells
- **Spells Prepared**: Cleric, Druid, Paladin, Wizard prepare spells daily from their full spell list
- **Wizard Special**: Can cast ritual spells from spellbook without preparation

## Customization

The application is built with modern web technologies and can be easily customized:

- **Styling**: Modify `styles.css` to change colors, fonts, or layout
- **Functionality**: Extend `script.js` to add new features
- **Content**: Update `index.html` to add new fields or sections
- **Spell Data**: Extend the spell system to include spell descriptions from official sources

## Tips for Use

1. **Regular Saves**: While the app auto-saves, manually save important milestones
2. **Backup**: Consider exporting your character data periodically
3. **Multiple Campaigns**: Use different character names for different campaigns
4. **Spell Management**: Use the notes section for tracking spell components and special rules
5. **Equipment**: Keep detailed equipment lists for easy reference during play
6. **Spell Preparation**: For preparation casters, plan your daily spell selection based on expected encounters
7. **Spell Slot Conservation**: Track spell usage carefully during adventuring days

## Troubleshooting

### Character Not Saving
- Ensure you've entered a character name
- Check that JavaScript is enabled in your browser
- Try refreshing the page and re-entering data

### Spellcasting Section Not Appearing
- Make sure you've selected a spellcasting class
- Verify the class is one of: Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard
- Try changing the class and changing it back

### Spell Slots Not Updating
- Check that your character level is set correctly
- Verify you've selected the right class
- Try refreshing the page if calculations seem incorrect

### Data Lost
- Check if you're using the same browser and haven't cleared browser data
- Look for the character in the Load Character modal
- Data is tied to the specific browser and computer used

### Calculations Wrong
- Verify ability scores are entered correctly
- Check that the correct level is set
- Ensure skill proficiencies are marked properly
- For spellcasting, verify the correct class is selected

## Future Enhancements

Potential features for future versions:
- Spell database integration with official spell descriptions
- Ritual spell tracking and casting
- Spell component tracking
- Concentration spell management
- Character portrait upload
- Export/import functionality
- Dice rolling integration
- Character sheet printing
- Multi-classing support
- Custom races and classes
- Spell slot recovery tracking
- Spell preparation planning tools

---

Enjoy tracking your D&D adventures and spellcasting! 🎲⚔️🧙‍♂️✨ 