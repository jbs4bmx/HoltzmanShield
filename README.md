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
Edit .\src\config.json as desired.

config.json contents
```json
{
    "MainArmor": {
        "Head": false,          // [Boolean] Set "true" to enable protection for this part of the body.
        "Chest": false,         // [Boolean] Set "true" to enable protection for this part of the body.
        "Stomach": false,       // [Boolean] Set "true" to enable protection for this part of the body.
        "LeftArm": false,       // [Boolean] Set "true" to enable protection for this part of the body.
        "RightArm": false,      // [Boolean] Set "true" to enable protection for this part of the body.
        "LeftLeg": false,       // [Boolean] Set "true" to enable protection for this part of the body.
        "RightLeg": false       // [Boolean] Set "true" to enable protection for this part of the body.
    },
    "HeadAreas": {
        "Top": false,           // [Boolean] Set "true" to enable protection for this part of the body.
        "Nape": false,          // [Boolean] Set "true" to enable protection for this part of the body. Will enable/disable both "Nape" and "LowerNape".
        "Ears": false,          // [Boolean] Set "true" to enable protection for this part of the body.
        "Eyes": false,          // [Boolean] Set "true" to enable protection for this part of the body.
        "Jaws": false           // [Boolean] Set "true" to enable protection for this part of the body.
    },
    "Resources": {
        "RepairCost": 1000,     // [Number] (Any number >= 0) Sets the cost of repairing the item.
        "Durability": 1500,     // [Number] (Any number >= 0) Increases or decreases the amount of armor this item provides.
        "MaxDurability": 1500,  // [Number] (Any number >= 0) Increases or decreases the max amount of armor this item provides.
        "traderPrice": 69420    // [Number] (Any number >= 0) Sets the price charged by Ragman.
    },
    "GodMode": {
        "Enabled": false        // [Boolean] Set "true" to disable all throughput on armor. Essentially makes the armor impervious to penetration.
    }
}
```

### End
