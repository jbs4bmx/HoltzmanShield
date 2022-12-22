# Holtzman Shield

This mod adds 17 new variants of armbands based loosely on the shield technology from the Novel/Movies "Dune". It adds armor protection for body parts as defined in the configuration file. You may alter the level of protection by editing the values found in the 'config.json' file within each of the variants.

>Author  : jbs4bmx



### ==================================================
Variant List:
| Name | Style |
|:----- | :----- |
|Holtzman Shield Alpha | Alpha armband |
|Holtzman Shield BEAR | Bear armband |
|Holtzman Shield Blue | Blue armband |
|Holtzman Shield DeadSkul | DeadSkul armband |
|Holtzman Shield Evasion | Evasion armband |
|Holtzman Shield Green | Green armband |
|Holtzman Shield Kiba Arms | KibaArms armband |
|Holtzman Shield Labs | Labs armband |
|Holtzman Shield Red | Red armband |
|Holtzman Shield RF Army | RFArmy armband |
|Holtzman Shield Twitch Rivals | Rivals armband |
|Holtzman Shield TerraGroup | TerraGroup armband |
|Holtzman Shield Train Hard | TrainHard armband |
|Holtzman Shield Untar | Untar armband |
|Holtzman Shield USEC | USEC armband |
|Holtzman Shield White | White armband |
|Holtzman Shield Yellow | Yellow armband |


### ==================================================


:bangbang: **This mod is provided _as-is_ with _no guarantee_ of support.** :bangbang:

:bangbang: **This mod requires the ArmBandCore mod to function.** :bangbang:


### ==================================================


### How to Install this Mod.
"[SPT]" = Your SPT-AKI folder path

1. Extract the contents of the zip file into the root of your [SPT] folder.
2. Edit the Config if you want to.
3. Profit.


### ==================================================


### Configuration Guide
Edit '.\src\config.json' file as desired.

config.json contents
```json
{
    "MainArmor": {
        "_COMMENT": "What areas of the body do you want to protect?",
        "Head": false,
        "Chest": false,
        "Stomach": false,
        "LeftArm": false,
        "RightArm": false,
        "LeftLeg": false,
        "RightLeg": false
    },
    "HeadAreas": {
        "_COMMENT": "What head areas do you want to protect?",
        "Top": false,
        "Nape": false,
        "Ears": false,
        "Eyes": false,
        "Jaws": false
    },
    "Resources": {
        "_COMMENT": "Repair Cost, Item Durability, and Cost of Item from Ragman",
        "RepairCost": 1415,
        "Durability": 1500,
        "traderPrice": 141592
    },
    "GodMode": {
        "_COMMENT": "Enable this to disable penetration of armor. (i.e., 0 throughput)",
        "Enabled": false
    },
    "Blacklist": {
        "_COMMENT": "Set to true to remove chance of pmc bots spawning with this item in their inventory.",
        "Value": false
    }
}
```

### End
