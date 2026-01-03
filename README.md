<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">
  <a href="https://github.com/jbs4bmx/HoltzmanShield">
    <img src="./images/HSBanner.png" alt="logo" width="640" height="320">
  </a>

  <h3 align="center">Holtzman Shield</h3>

  <p align="center">
    A configurable armband-based shield system inspired by Frank Herbert’s <em>Dune</em>.<br />
    Customize armor coverage, durability, prefab skins, and more.
  </p>

  [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/X8X611JH15)
</div>

---

## About the Project
**Type:** Server Mod
**Requires:** [ArmbandCore](https://github.com/jbs4bmx/ArmbandCore/releases)
**Disclaimer:** Provided *as-is* with no guarantee of support.

Holtzman Shield adds a new armband variant that provides configurable armor protection across multiple body regions. Inspired by the personal shields of *Dune*, this mod allows you to fine‑tune which body parts are protected, how durable the shield is, and which visual prefab it uses.

All behavior is controlled through a simple, `config.jsonc` file designed to be easy for anyone to edit.

---

## Features
- **Configurable armor coverage** for head, torso, limbs, and more
- **Multiple prefab skins** selectable via config
- **Adjustable durability, repair cost, and trader pricing**
- **Optional blunt‑force mitigation** (requires client-side support)
- **Optional blacklist integration** for PMC bots and global loot
- **Lightweight, optimized, and SPT 4.0.0+ compatible**
- **Requires ArmbandCore** for slot integration

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Armor Coverage Mapping
The following table shows how each config option maps to in‑game armor colliders:

| Mod Option | Config Value | Assigned Colliders |
|-----------|--------------|--------------------|
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

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Getting Started

### Prerequisites
- SPT 4.0.0+
- EFT 40087 installed
- **ArmbandCore** (required/packaged with this mod)

### Installation
1. Download the latest release from the [Releases](https://github.com/jbs4bmx/HoltzmanShield/releases) page.
2. Extract the contents into your **SPT root folder** (same location as `EscapeFromTarkov.exe`).
3. Edit `config.jsonc` to customize coverage, prefab, and item properties.
4. Start `SPT.Server.exe` and wait for it to fully load.
5. Launch the game through `SPT.Launcher.exe`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Configuration
All settings are controlled through `config.jsonc`. You can adjust:
  - Which body parts are protected
  - Durability and repair cost
  - Blindness protection
  - Trader price and loyalty level
  - Prefab skin (only one may be true)
  - Optional blunt‑force mitigation
  - Optional blacklist behavior

The values that you see in the example below are the default values of the mod.<br>
```jsonc
{
  // Holtzman Shield Configuration File

  // __Armor Coverage Settings_________________________________________________________________________________________
  // The following values must be set to either true or false. You may set more than one of these to true.
  // Default Value (Enabled): true (for all coverage areas)
  // ------------------------------------------------------------------------------------------------------------------
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
  "Legs": true,


  // __Item Properties_________________________________________________________________________________________________
  // Durability must be a whole number ranging from 1-9999999. (Default Value: 100000)
  // BlindnessProtection must be any number value between 0.0 and 1.0 (0.0 = 0%, 1.0 = 100%)
  // RepairCost must be a whole number ranging from 1-2000. Keep this value below 200 to avoid high costs.
  // ------------------------------------------------------------------------------------------------------------------
  "Durability": 100000,
  "BlindnessProtection": 1.0,
  "RepairCost": 35,
  "TraderPrice": 69420,
  "FleaPrice": 76767,
  "TraderLoyaltyLevel": 1,


  // __PreFab Skins____________________________________________________________________________________________________
  // Set only ONE of the following values to 'true' to apply the desired armband skin to Holtzman Shield.
  // BlackDivision, EODOwners, Discord, and Prayer are not yet part of the game. (WIP - Ignore for now.)
  // Default Value (Evasion): true
  // ------------------------------------------------------------------------------------------------------------------
  "PreFab": {
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
    "XMas": false,
    "Prestige1": false,
    "Prestige2": false,
    "Prestige3": false,
    "Prestige4": false,
    "Prestige5": false,
    // Please ignore the following WIP skins for now.
    "BlackDivision_wip": false,
    "EODOwners_wip": false,
    "Discord_wip": false,
    "Prayer_wip": false
  },


  // __Advanced Options________________________________________________________________________________________________
  // BluntForce will help to limit all blunt force damage from projectiles when set to true.
  // This option still requires a client-side mod for no over damage to be taken by the player.
  // Penetration damage still applies as normal unless you use a client-side mod. It cannot be done via a server-side
  // mod alone due to how the game is coded.
  // Default Value (Enabled): true
  // ------------------------------------------------------------------------------------------------------------------
  "BluntForce": true,


  // __Item Blacklist Settings_________________________________________________________________________________________
  // Set to 'true' to disable item spawning on PMC bots, or to remove from global loot pools.
  // Default Value (Enabled): false
  // ------------------------------------------------------------------------------------------------------------------
  "PMC": false,
  "GlobalLoot": false
}
```
<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Troubleshooting

**Prefab not changing**
- Ensure only **one** prefab option is set to `true`
- Clear the game cache before launching

**Item not appearing at trader**
- Check your `TraderLoyaltyLevel` and `TraderPrice` settings
- Ensure ArmbandCore is installed correctly

**Shield not blocking damage**
- BluntForce requires a **client-side mod** to fully prevent over‑damage

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Roadmap
- [✅] Add changelog
- [✅] Fix bugs from SPT 3.9.5
- [✅] Optimize internal code
- [❓] Additional improvements based on community feedback

Suggest changes or report issues here: [ISSUES](https://github.com/jbs4bmx/HoltzmanShield/issues)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contributing
Contributions are welcome!
If you have ideas or improvements:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

Or simply open an issue tagged **enhancement**.

If you'd like to support development:
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/X8X611JH15)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## License
Distributed under the MIT License.
See `LICENSE` for details.

---

## Acknowledgments
Special thanks to:

1. **[sugonyak](https://forge.sp-tarkov.com/user/21495/sugonyak)**
   - Testing and bug fixes
2. **[ShadowXtrex](https://forge.sp-tarkov.com/user/13380/shadowxtrex)**
   - Testing, bug fixes, and code optimizations

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- Repository Metrics -->
[contributors-shield]: https://img.shields.io/github/contributors/jbs4bmx/HoltzmanShield.svg?style=for-the-badge
[contributors-url]: https://github.com/jbs4bmx/HoltzmanShield/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jbs4bmx/HoltzmanShield.svg?style=for-the-badge
[forks-url]: https://github.com/jbs4bmx/HoltzmanShield/network/members
[stars-shield]: https://img.shields.io/github/stars/jbs4bmx/HoltzmanShield.svg?style=for-the-badge
[stars-url]: https://github.com/jbs4bmx/HoltzmanShield/stargazers
[issues-shield]: https://img.shields.io/github/issues/jbs4bmx/HoltzmanShield.svg?style=for-the-badge
[issues-url]: https://github.com/jbs4bmx/HoltzmanShield/issues
[license-shield]: https://img.shields.io/github/license/jbs4bmx/HoltzmanShield.svg?style=for-the-badge
[license-url]: https://github.com/jbs4bmx/HoltzmanShield/blob/master/LICENSE.txt