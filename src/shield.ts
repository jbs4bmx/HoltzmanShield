/*
 *      Name: Holtzman Shield
 *   Version: 320.0.1
 * Copyright: jbs4bmx
 *    Update: 08.08.2022
*/

import { DependencyContainer } from "tsyringe";
import { IMod } from "@spt-aki/models/external/mod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { DatabaseImporter } from "@spt-aki/utils/DatabaseImporter";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";

let hsdb;

class Holtzman implements IMod
{
    private pkg;
    private path = require('path');
    private modName = this.path.basename(this.path.dirname(__dirname.split('/').pop()));

    public preAkiLoad(container: DependencyContainer)
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        this.pkg = require("../package.json")
        logger.info(`Loading: ${this.pkg.author}-${this.pkg.name} v${this.pkg.version}`);
    }

    public postDBLoad(container: DependencyContainer)
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const databaseImporter = container.resolve<DatabaseImporter>("DatabaseImporter");
        const locales = db.locales.global;
        this.pkg = require("../package.json");
        hsdb = databaseImporter.loadRecursive(`${preAkiModLoader.getModPath(this.modName)}database/`);

        for (const i_item in hsdb.templates.items.templates) {
            db.templates.items[i_item] = hsdb.templates.items.templates[i_item];
            db.templates.items[i_item]._props.Finallowed = false;
            db.templates.items[i_item]._props.FinAllowed = false;
        }

        for (const h_item of hsdb.templates.handbook.Items) {
            if (!db.templates.handbook.Items.find(i=>i.Id == h_item.Id)) {
                db.templates.handbook.Items.push(h_item);
            }

        }

        for (const localeID in locales) {
            for (const locale in hsdb.locales.en.templates) {
                locales[localeID].templates[locale] = hsdb.locales.en.templates[locale];
            }
        }

        for (const tradeName in db.traders) {
            // Ragman
            if ( tradeName === "5ac3b934156ae10c4430e83c" ) {
                for (const ri_item of hsdb.traders.Ragman.items.list) {
                    if (!db.traders[tradeName].assort.items.find(i=>i._id == ri_item._id)) {
                        db.traders[tradeName].assort.items.push(ri_item);
                    }
                }
                for (const rb_item in hsdb.traders.Ragman.barter_scheme) {
                    db.traders[tradeName].assort.barter_scheme[rb_item] = hsdb.traders.Ragman.barter_scheme[rb_item];
                }
                for (const rl_item in hsdb.traders.Ragman.loyal_level_items){
                    db.traders[tradeName].assort.loyal_level_items[rl_item] = hsdb.traders.Ragman.loyal_level_items[rl_item];
                }
            }
        }

        this.setConfigOptions(container)

        logger.info(`${this.pkg.author}-${this.pkg.name} v${this.pkg.version}: Cached Successfully`);
    }

    public setConfigOptions(container: DependencyContainer): void
    {
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const { MainArmor, HeadAreas, Resources, GodMode } = require("./config.json");

        db.templates.items["55d7217a4bdc2d86028b456d"]._props.Slots[14]._props.filters[0].Filter.push(
            "HShieldEvade",
            "HShieldTG",
            "HShieldUSEC",
            "HShieldYellow",
            "HShieldUntar",
            "HShieldRed",
            "HShieldWhite",
            "HShieldRivals",
            "HShieldAlpha",
            "HShieldRFArmy",
            "HShieldTrainHard",
            "HShieldGreen",
            "HShieldBlue",
            "HShieldKiba",
            "HShieldDead",
            "HShieldLabs",
            "HShieldBear"
        );

        let armor = [];
        let segments = [];

        if (typeof MainArmor.Head === "boolean") { if (MainArmor.Head === true) { armor.push("Head") } }
        if (typeof MainArmor.Thorax === "boolean") { if (MainArmor.Thorax === true) { armor.push("Chest") } }
        if (typeof MainArmor.Stomach === "boolean") { if (MainArmor.Stomach === true) { armor.push("Stomach") } }
        if (typeof MainArmor.LeftArm === "boolean") { if (MainArmor.LeftArm === true) { armor.push("LeftArm") } }
        if (typeof MainArmor.RightArm === "boolean") { if (MainArmor.RightArm === true) { armor.push("RightArm") } }
        if (typeof MainArmor.LeftLeg === "boolean") { if (MainArmor.LeftLeg === true) { armor.push("LeftLeg") } }
        if (typeof MainArmor.RightLeg === "boolean") { if (MainArmor.RightLeg === true) { armor.push("RightLeg") } }
        if (typeof HeadAreas.Top === "boolean") { if (HeadAreas.Top === true) { segments.push("Top") } }
        if (typeof HeadAreas.Nape === "boolean") { if (HeadAreas.Nape === true) { segments.push("Nape") } }
        if (typeof HeadAreas.Ears === "boolean") { if (HeadAreas.Ears === true) { segments.push("Ears") } }
        if (typeof HeadAreas.Eyes === "boolean") { if (HeadAreas.Eyes === true) { segments.push("Eyes") } }
        if (typeof HeadAreas.Jaws === "boolean") { if (HeadAreas.Jaws === true) { segments.push("Jaws") } }
        if (typeof Resources.RepairCost === "number") { if ((Resources.RepairCost < 1) || (Resources.RepairCost > 9999999)) { Resources.RepairCost = 1000 } }
        if (typeof Resources.Durability === "number") { if ((Resources.Durability < 1) || (Resources.Durability > 9999999)) { Resources.Durability = 1500 } }
        if (typeof Resources.traderPrice === "number") { if ((Resources.traderPrice < 1) || (Resources.traderPrice > 9999999)) { Resources.traderPrice = 69420 } }
        if (typeof GodMode.Enabled === "boolean") { if (GodMode.Enabled) {var throughput = 0 } else { var throughput = 1 } }

        db.templates.items["HShieldEvade"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldEvade"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldEvade"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldEvade"]._props.armorZone = armor;
        db.templates.items["HShieldEvade"]._props.headSegments = segments;

        db.templates.items["HShieldTG"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldTG"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldTG"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldTG"]._props.armorZone = armor;
        db.templates.items["HShieldTG"]._props.headSegments = segments;

        db.templates.items["HShieldUSEC"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldUSEC"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldUSEC"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldUSEC"]._props.armorZone = armor;
        db.templates.items["HShieldUSEC"]._props.headSegments = segments;

        db.templates.items["HShieldYellow"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldYellow"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldYellow"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldYellow"]._props.armorZone = armor;
        db.templates.items["HShieldYellow"]._props.headSegments = segments;

        db.templates.items["HShieldUntar"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldUntar"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldUntar"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldUntar"]._props.armorZone = armor;
        db.templates.items["HShieldUntar"]._props.headSegments = segments;

        db.templates.items["HShieldRed"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldRed"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldRed"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldRed"]._props.armorZone = armor;
        db.templates.items["HShieldRed"]._props.headSegments = segments;

        db.templates.items["HShieldWhite"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldWhite"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldWhite"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldWhite"]._props.armorZone = armor;
        db.templates.items["HShieldWhite"]._props.headSegments = segments;

        db.templates.items["HShieldRivals"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldRivals"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldRivals"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldRivals"]._props.armorZone = armor;
        db.templates.items["HShieldRivals"]._props.headSegments = segments;

        db.templates.items["HShieldAlpha"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldAlpha"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldAlpha"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldAlpha"]._props.armorZone = armor;
        db.templates.items["HShieldAlpha"]._props.headSegments = segments;

        db.templates.items["HShieldRFArmy"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldRFArmy"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldRFArmy"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldRFArmy"]._props.armorZone = armor;
        db.templates.items["HShieldRFArmy"]._props.headSegments = segments;

        db.templates.items["HShieldTrainHard"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldTrainHard"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldTrainHard"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldTrainHard"]._props.armorZone = armor;
        db.templates.items["HShieldTrainHard"]._props.headSegments = segments;

        db.templates.items["HShieldGreen"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldGreen"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldGreen"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldGreen"]._props.armorZone = armor;
        db.templates.items["HShieldGreen"]._props.headSegments = segments;

        db.templates.items["HShieldBlue"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldBlue"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldBlue"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldBlue"]._props.armorZone = armor;
        db.templates.items["HShieldBlue"]._props.headSegments = segments;

        db.templates.items["HShieldKiba"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldKiba"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldKiba"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldKiba"]._props.armorZone = armor;
        db.templates.items["HShieldKiba"]._props.headSegments = segments;

        db.templates.items["HShieldDead"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldDead"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldDead"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldDead"]._props.armorZone = armor;
        db.templates.items["HShieldDead"]._props.headSegments = segments;

        db.templates.items["HShieldLabs"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldLabs"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldLabs"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldLabs"]._props.armorZone = armor;
        db.templates.items["HShieldLabs"]._props.headSegments = segments;

        db.templates.items["HShieldBear"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["HShieldBear"]._props.Durability = Resources.Durability;
        db.templates.items["HShieldBear"]._props.MaxDurability = Resources.Durability;
        db.templates.items["HShieldBear"]._props.armorZone = armor;
        db.templates.items["HShieldBear"]._props.headSegments = segments;

        // GodMode Settings
        if ( throughput === 0) {
            db.templates.items["HShieldEvade"]._props.BluntThroughput = 0
            db.templates.items["HShieldTG"]._props.BluntThroughput = 0
            db.templates.items["HShieldUSEC"]._props.BluntThroughput = 0
            db.templates.items["HShieldYellow"]._props.BluntThroughput = 0
            db.templates.items["HShieldUntar"]._props.BluntThroughput = 0
            db.templates.items["HShieldRed"]._props.BluntThroughput = 0
            db.templates.items["HShieldWhite"]._props.BluntThroughput = 0
            db.templates.items["HShieldRivals"]._props.BluntThroughput = 0
            db.templates.items["HShieldAlpha"]._props.BluntThroughput = 0
            db.templates.items["HShieldRFArmy"]._props.BluntThroughput = 0
            db.templates.items["HShieldTrainHard"]._props.BluntThroughput = 0
            db.templates.items["HShieldGreen"]._props.BluntThroughput = 0
            db.templates.items["HShieldBlue"]._props.BluntThroughput = 0
            db.templates.items["HShieldKiba"]._props.BluntThroughput = 0
            db.templates.items["HShieldDead"]._props.BluntThroughput = 0
            db.templates.items["HShieldLabs"]._props.BluntThroughput = 0
            db.templates.items["HShieldBear"]._props.BluntThroughput = 0
        }
    }

}
module.exports = { mod: new Holtzman() }