# Holtzman Shield


## Description
This mod adds a new variant of armband based loosely on the shield technology from the Novel/Movies "Dune". It adds armor protection for body parts as defined in the configuration file. You may alter the level of protection by editing the values found in the 'config.json' file.


## Credits
Author: jbs4bmx <br>
Contributors: n/a


## Armor
Values of **armorCollider** array assigned by Armor mod options.

| Mod Option | Configurable Value | Assigned Value |
|:----- | :----- | :----- |
| Head | true/false | ParietalHead, BackHead, HeadCommon |
| Neck | true/false | NeckFront, NeckBack |
| Eyes | true/false | Eyes |
| Ears | true/false | Ears |
| Jaw | true/false | Jaw |
| Back | true/false | SpineTop, SpineDown |
| Arms | true/false | LeftUpperArm, LeftForearm, RightUpperArm, RightForearm |
| Sides | true/false | RightSideChestUp, RightSideChestDown, LeftSideChestUp, LeftSideChestDown |
| Front | true/false | RibcageUp, RibcageLow |
| Pelvis | true/false | Pelvis |
| Buttocks | true/false | PelvisBack |
| Legs | true/false | RightThigh, RightCalf, LeftThigh, LeftCalf |


## Installation
### How to Install this Mod.
"[SPT]" = Your SPT folder path
   1. Extract the contents of the zip file into the root of your [SPT] folder.
      - That's the same location as "SPT.Server.exe" and "SPT.Launcher.exe".
   2. Edit the Config to adjust the values to your likeing.
   3. Start SPT.Server.exe and wait until it fully loads.
   4. Start SPT.Launcher.exe but do not launch the game.
   5. Run the cache cleaner found in the launcher's settings menu.
   6. Now you can launch the game and profit.

### Common Questions
   1. Where do I report bugs found with the current version of the mod?
      - You can report bugs for the current version of this mod here: [HS Mod Page](https://hub.sp-tarkov.com/files/file/488-holtzman-shield/).
   2. Why can't I see the different prefab for the armband?
      - Make sure you only have one of the options set to true. The remaining prefab options should be false.
      - Before you launch the game, be sure to clear (delete) the cache files.


## Configuration Guide
Edit '.\config.jsonc' file as desired. <br>
config.jsonc contents
```jsonc
{
    "ArmorCoverage": {
        // Customize Holtzman Shield armor protection areas.
        // This value must be true or false.
        "Head": true,
        "Neck": true,
        "Eyes": true,
        "Ears": true,
        "Jaw": true,
        "Arms": true,
        "Front": true,
        "Back": true,
        "Sides": true,
        "Pelvis": true,
        "Buttocks": true,
        "Legs": true
    },
    "ArmorAmount": {
        // Customize Holtzman Shield armor durability level.
        // This must be a whole number ranging from 1-9999999.
        "Durability": 100000
    },
    "Resources": {
        // Customize Holtzman Shield item properties.
        "ArmorClass": "10",
        "ArmorMaterial": "Ceramic",
        "ArmorType": "Heavy",
        "ItemWeight": 0.01,

        // This is the amount of protection from bright lights.
        // This must be any number value between 0 and 1 (e.g., 0, 0.25, 0.5, 0.8, 1, etc.)
        "BlindnessProtection": 1,

        // I recommend keeping this at or below 100
        // This must be a whole number ranging from 1-2000.
        "RepairCost": 100,

        // Customize trader (Ragman) properties
        "traderPrice": 1000,
        "traderLoyaltyLevel": 1
    },
    "PreFab": {
        // If more than one is set to 'true', then PreFab will revert to default (Evasion).
        "Evasion": true,
        "Alpha": false,
        "DeadSkul": false,
        "TrainHard": false,
        "TwitchRivals": false,
        "Bear": false,
        "Kiba": false,
        "Labs": false,
        "RFArmy": false,
        "TerraGroup": false,
        "Untar": false,
        "USEC": false,
        "Blue": false,
        "Green": false,
        "Red": false,
        "White": false,
        "Yellow": false,
        "Unheard": false,
        "Arena": false,
        // The following item(s) is(are) not yet part of the game. (WIP - Ignore for now.)
        "BlackDivision": false
    },
    "GodMode": {
        // Disable damage dealt by blunt force trauma.
        "BluntForce": true,

        // (WIP) Disable damage from projectile penetration of armor.
        // This value is a work in progress and is not currently implemented in this mod. - Please ignore for now.
        "Penetration": false
    },
    "Blacklist": {
        // Set to 'true' to disable item spawning on PMC or Scav bots, or to remove from global loot pools.
        "pmc": false,
        "scav": false,
        "globalLoot": false
    }
}
```

## Disclaimer
**This mod is provided _as-is_ with _no guarantee_ of support.** <br>
**This mod requires the ArmBandCore mod to function properly.**
