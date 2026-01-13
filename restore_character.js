// Temporary script to restore Roderick's character data
const characterData = {
  "name": "Roderick (Ro) Darkwoode",
  "class": "wizard",
  "race": "human",
  "background": "Noble",
  "level": 4,
  "alignment": "neutral-good",
  "abilities": {
    "strength": 9,
    "dexterity": 14,
    "constitution": 13,
    "intelligence": 18,
    "wisdom": 11,
    "charisma": 15
  },
  "armorClass": 12,
  "speed": 30,
  "maxHp": 20,
  "currentHp": 20,
  "tempHp": 0,
  "skills": {
    "acrobatics": false,
    "animal-handling": false,
    "arcana": true,
    "athletics": false,
    "deception": false,
    "history": true,
    "insight": false,
    "intimidation": false,
    "investigation": false,
    "medicine": false,
    "nature": false,
    "perception": false,
    "performance": false,
    "persuasion": true,
    "religion": true,
    "sleight-of-hand": false,
    "stealth": false,
    "survival": false
  },
  "spells": [
    {
      "name": "Detect Magic",
      "level": 1,
      "school": "divination",
      "description": "For up to 10 minutes (concentration), you sense the presence of magic within 30 feet. If you sense magic, you can see a faint aura around any visible creature or object and learn its school of magic, if any. The spell can penetrate most barriers but is blocked by 1 foot of stone, 1 inch of metal, or 3 feet of wood or dirt.",
      "prepared": false
    },
    {
      "name": "Magic Missile",
      "level": 1,
      "school": "evocation",
      "description": "Create three glowing darts of magical force. Each dart automatically hits a creature of your choice within 120 feet and deals 1d4 + 1 force damage. The darts can target the same or different creatures. When cast using a spell slot of 2nd level or higher, you create one additional dart for each slot level above 1st.",
      "prepared": true
    },
    {
      "name": "Cloud of Daggers",
      "level": 2,
      "school": "conjuration",
      "description": "Fill a 5-foot cube within 60 feet with spinning daggers for up to 1 minute (concentration). A creature that enters the area for the first time on a turn or starts its turn there takes 4d4 slashing damage.",
      "prepared": true
    },
    {
      "name": "Darkvision",
      "level": 2,
      "school": "transmutation",
      "description": "You touch a willing creature to grant it the ability to see in darkness. For 8 hours, the target has darkvision out to a range of 60 feet.",
      "prepared": true
    },
    {
      "name": "Mage Armor",
      "level": 1,
      "school": "abjuration",
      "description": "You touch a willing creature not wearing armor. Its base AC becomes 13 + its Dexterity modifier for 8 hours. The spell ends if the target dons armor or if you dismiss the spell.",
      "prepared": false
    },
    {
      "name": "Shield",
      "level": 1,
      "school": "abjuration",
      "description": "As a reaction when hit by an attack or targeted by Magic Missile, you gain a +5 bonus to AC until the start of your next turn, including against the triggering attack. Also negates Magic Missile.",
      "prepared": true
    },
    {
      "name": "Identify",
      "level": 1,
      "school": "divination",
      "description": "You learn the properties and how to use a magical item you touch. You learn if it requires attunement and how many charges it has. If it is affected by a spell, you learn which one. Casting takes 1 minute or 10 minutes if done as a ritual. Requires a pearl worth 100 gp and an owl feather.",
      "prepared": false
    },
    {
      "name": "Feather Fall",
      "level": 1,
      "school": "transmutation",
      "description": "As a reaction when up to 5 creatures fall within 60 feet, you slow their descent to 60 feet per round for 1 minute. They take no falling damage and land on their feet if not incapacitated.",
      "prepared": true
    },
    {
      "name": "Silent Image",
      "level": 1,
      "school": "illusion",
      "description": "You create the visual illusion of an object, creature, or phenomenon no larger than a 15-foot cube, visible within 60 feet. It lasts for up to 10 minutes (concentration). The image cannot produce sound, light, smell, or other sensory effects. A creature that physically interacts with it can make an Investigation check (DC = your spell save DC) to discern the illusion. You can use your action to move the image within range, altering its appearance accordingly.",
      "prepared": false
    },
    {
      "name": "Find Familiar",
      "level": 1,
      "school": "conjuration",
      "description": "You gain the service of a familiar, a spirit that takes an animal form you choose: bat, cat, crab, frog (toad), hawk, lizard, octopus, owl, poisonous snake, fish (quipper), rat, raven, sea horse, spider, or weasel. \n\nAppearing in an unoccupied space within range, the familiar has the statistics of the chosen form, though it is a celestial, fey, or fiend (your choice) instead of a beast. Your familiar acts independently of you, but it always obeys your commands. In combat, it rolls its own initiative and acts on its own turn. \n\nA familiar can't attack, but it can take other actions as normal.\nWhen the familiar drops to 0 hit points, it disappears, leaving behind no physical form. It reappears after you cast this spell again. While your familiar is within 100 feet of you, you can communicate with it telepathically. Additionally, as an action, you can see through your familiar's eyes and hear what it hears until the start of your next turn, gaining the benefits of any special senses that the familiar has. During this time, you are deaf and blind with regard to your own senses.\n\nAs an action, you can temporarily dismiss your familiar. It disappears into a pocket dimension where it awaits your summons. Alternatively, you can dismiss it forever. As an action while it is temporarily dismissed, you can cause it to reappear in any unoccupied space within 30 feet of you.\n\nYou can't have more than one familiar at a time. If you cast this spell while you already have a familiar, you instead cause it to adopt a new form. Choose one of the forms from the above list. Your familiar transforms into the chosen creature.\n\nFinally, when you cast a spell with a range of touch, your familiar can deliver the spell as if it had cast the spell. Your familiar must be within 100 feet of you, and it must use its reaction to deliver the spell when you cast it. If the spell requires an attack roll, you use your attack modifier for the roll.",
      "prepared": true
    },
    {
      "name": "Scorching Ray",
      "level": 2,
      "school": "evocation",
      "description": "Casting Time: 1 action\nRange: 120 feet\nComponents: V, S\nDuration: Instantaneous\n\nYou create three rays of fire and hurl them at targets within range. You can hurl them at one target or several. Make a ranged spell attack for each ray. On a hit, the target takes 2d6 fire damage.\n\nAt Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd.",
      "prepared": true
    },
    {
      "name": "Web",
      "level": 2,
      "school": "",
      "description": "Casting Time: 1 action\nRange: 60 feet\nComponents: V, S, M (a bit of spiderweb)\nDuration: Concentration, up to 1 hour\n\nYou conjure a mass of thick, sticky webbing at a point of your choice within range. The webs fill a 20-foot cube from that point for the duration. The webs are difficult terrain and lightly obscure their area.\n\nIf the webs aren't anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or ceiling, the conjured web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat surface have a depth of 5 feet.\n\nEach creature that starts its turn in the webs or that enters them during its turn must make a Dexterity saving throw. On a failed save, the creature is restrained as long as it remains in the webs or until it breaks free.\n\nA creature restrained by the webs can use its action to make a Strength check against your spell save DC. If it succeeds, it is no longer restrained.\n\nThe webs are flammable. Any 5-foot cube of webs exposed to fire burns away in 1 round, dealing 2d4 fire damage to any creature that starts its turn in the fire.",
      "prepared": true
    }
  ],
  "cantrips": [
    {
      "name": "Prestidigitation",
      "level": 0,
      "school": "transmutation",
      "description": "You create a minor magical effect: clean/soil an object, chill/warm/flavor food, light/snuff a candle, make a sensory effect, or create a small trinket. You can have up to 3 active effects.",
      "prepared": true
    },
    {
      "name": "Minor Illusion",
      "level": 0,
      "school": "illusion",
      "description": "Create a sound or image within 30 feet. The image fits in a 5-foot cube and lasts 1 minute. A creature that uses its action to inspect the illusion can determine it is fake with a successful Investigation check against your spell save DC.",
      "prepared": true
    },
    {
      "name": "Fire Bolt",
      "level": 0,
      "school": "evocation",
      "description": "You hurl a mote of fire at a creature or object within 120 feet. Make a ranged spell attack: on a hit, it deals 1d10 fire damage. A flammable object hit may ignite if not being worn or carried.",
      "prepared": true
    },
    {
      "name": "Mold Earth",
      "level": 0,
      "school": "transmutation",
      "description": "Casting Time: 1 action\nRange: 30 feet\nComponents: S\nDuration: Instantaneous or 1 hour\n\nYou choose a portion of dirt or stone that you can see within range and that fits within a 5-foot cube. You manipulate it in one of the following ways:\n\nIf you target an area of loose earth, you can instantaneously excavate it, move it along the ground, and deposit it up to 5 feet away. This movement doesn't have enough force to cause damage.\nYou cause shapes, colors, or both to appear on the dirt or stone, spelling out words, creating images, or shaping patterns. The changes last for 1 hour.\n\nIf the dirt or stone you target is on the ground, you cause it to become difficult terrain. Alternatively, you can cause the ground to become normal terrain if it is already difficult terrain. This change lasts for 1 hour.\n\nIf you cast this spell multiple times, you can have no more than two of its non-instantaneous effects active at a time, and you can dismiss such an effect as an action.",
      "prepared": true
    }
  ],
  "usedSpellSlots": {},
  "equipment": "+1 point of inspiration",
  "notes": "Journal Summary (see new Notes & Journal section):\n[general] 9/20\n- we find out the authori...\\n[general] 9/9 \n- imolde agrees to send c...\\n[general] Morei: Arndor under seige. Sen...\\n[lore] Dark energy from artefacts cen...\\n[npc] Natha and Torden - masters at ...",
  "notesEntries": [
    {
      "id": "b064d116-5893-4926-a7c8-69b9e6f445c2",
      "timestamp": 1758382136325,
      "type": "general",
      "text": "9/20\n- we find out the authorities are maybe doing some experimentation on the people of the camp. we tell them we want to talk to the hospital as go betweens between authorities and refugees\n- walk into camp. people are distrustful\n- folger (soup guy) in the camp: a few weeks ago some refugees came into the camp, they kept to themselves. recruited some angry kids and riled them all up. this radical faction attacked the mages high academy.",
      "pinned": false
    }
  ],
  "exportDate": "2025-10-17T03:37:53.088Z",
  "appVersion": "1.0.0"
};

// Function to restore character data
function restoreCharacter() {
  console.log('Restoring Roderick character data...');
  
  // Save to localStorage
  localStorage.setItem('currentCharacter', JSON.stringify(characterData));
  
  // Also save as a named character
  const savedCharacters = JSON.parse(localStorage.getItem('savedCharacters')) || {};
  savedCharacters['Roderick (Ro) Darkwoode'] = characterData;
  localStorage.setItem('savedCharacters', JSON.stringify(savedCharacters));
  
  console.log('Character data restored! Reload the page to see your character.');
}

// Auto-run the restoration
restoreCharacter();
