/**
 *      Name: Holtzman Shield
 *   Version: 350.0.2
 * Copyright: jbs4bmx
 *    Update: [DMY] 05.03.2023
*/

import { DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/externals/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IBotConfig } from "@spt-aki/models/spt/config/IBotConfig";

let hsdb;

class Holtzman implements IPreAkiLoadMod, IPostDBLoadMod
{
    private pkg;
    private path = require('path');
    private modName = this.path.basename(this.path.dirname(__dirname.split('/').pop()));

    public postDBLoad(container: DependencyContainer)
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const databaseImporter = container.resolve<ImporterUtil>("ImporterUtil");
        const locales = db.locales.global;
        this.pkg = require("../package.json");
        hsdb = databaseImporter.loadRecursive(`${preAkiModLoader.getModPath(this.modName)}database/`);

        for (const i_item in hsdb.templates.items.templates) {
            db.templates.items[i_item] = hsdb.templates.items.templates[i_item];
        }

        for (const h_item of hsdb.templates.handbook.Items) {
            if (!db.templates.handbook.Items.find(i=>i.Id == h_item.Id)) {
                db.templates.handbook.Items.push(h_item);
            }

        }

        for (const localeID in locales) {
            for (const locale in hsdb.locales.en) {
                locales[localeID][locale] = hsdb.locales.en[locale];
            }
        }

        for (const p_item in hsdb.templates.prices) {
            db.templates.prices[p_item] = hsdb.templates.prices[p_item];
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
                for (const rl_item in hsdb.traders.Ragman.loyal_level_items) {
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
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const botConfig = configServer.getConfig<IBotConfig>(ConfigTypes.BOT);
        const handBook = db.templates.handbook.Items;
        const priceList = db.templates.prices;
        const barterScheme = db.traders["5ac3b934156ae10c4430e83c"].assort.barter_scheme;
        const { MainArmor, HeadAreas, Resources, GodMode, Blacklist } = require("./config.json");

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

        if (typeof MainArmor.Head === "boolean") { if (MainArmor.Head === true) { armor.push("Head"); } }
        if (typeof MainArmor.Thorax === "boolean") { if (MainArmor.Thorax === true) { armor.push("Chest"); } }
        if (typeof MainArmor.Stomach === "boolean") { if (MainArmor.Stomach === true) { armor.push("Stomach"); } }
        if (typeof MainArmor.LeftArm === "boolean") { if (MainArmor.LeftArm === true) { armor.push("LeftArm"); } }
        if (typeof MainArmor.RightArm === "boolean") { if (MainArmor.RightArm === true) { armor.push("RightArm"); } }
        if (typeof MainArmor.LeftLeg === "boolean") { if (MainArmor.LeftLeg === true) { armor.push("LeftLeg"); } }
        if (typeof MainArmor.RightLeg === "boolean") { if (MainArmor.RightLeg === true) { armor.push("RightLeg"); } }
        if (typeof HeadAreas.Top === "boolean") { if (HeadAreas.Top === true) { segments.push("Top"); } }
        if (typeof HeadAreas.Nape === "boolean") { if (HeadAreas.Nape === true) { segments.push("Nape"); } }
        if (typeof HeadAreas.LowerNape === "boolean") { if (HeadAreas.LowerNape === true) { segments.push("LowerNape"); } }
        if (typeof HeadAreas.Ears === "boolean") { if (HeadAreas.Ears === true) { segments.push("Ears"); } }
        if (typeof HeadAreas.Eyes === "boolean") { if (HeadAreas.Eyes === true) { segments.push("Eyes"); } }
        if (typeof HeadAreas.Jaws === "boolean") { if (HeadAreas.Jaws === true) { segments.push("Jaws"); } }
        if (typeof Resources.RepairCost === "number") { if ((Resources.RepairCost < 1) || (Resources.RepairCost > 9999999)) { Resources.RepairCost = 1000; } }
        if (typeof Resources.Durability === "number") { if ((Resources.Durability < 1) || (Resources.Durability > 9999999)) { Resources.Durability = 1500; } }
        if (typeof Resources.traderPrice === "number") { if ((Resources.traderPrice < 1) || (Resources.traderPrice > 9999999)) { Resources.traderPrice = 69420; } }
        if (typeof GodMode.Enabled === "boolean") { if (GodMode.Enabled) {var throughput = 0; } else { var throughput = 1; } }
        if (typeof Blacklist.Value === "boolean") { if (Blacklist.Value) { botConfig.pmc.dynamicLoot.blacklist.push("HShieldEvade","HShieldTG","HShieldUSEC","HShieldYellow","HShieldUntar","HShieldRed","HShieldWhite","HShieldRivals","HShieldAlpha","HShieldRFArmy","HShieldTrainHard","HShieldGreen","HShieldBlue","HShieldKiba","HShieldDead","HShieldLabs","HShieldBear"); }}

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

        for ( var i=0; i<handBook.length; i++ ) {
            if ( handBook[i].Id == "HShieldEvade" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldTG" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldUSEC" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldYellow" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldUntar" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldRed" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldWhite" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldRivals" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldAlpha" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldRFArmy" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldTrainHard" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldGreen" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldBlue" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldKiba" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldDead" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldLabs" ) { handBook[i].Price = Resources.traderPrice; }
            if ( handBook[i].Id == "HShieldBear" ) { handBook[i].Price = Resources.traderPrice; }
        }

        for ( var i=0; i<priceList.length; i++ ) {
            if ( priceList[i] == "HShieldEvade" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldTG" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldUSEC" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldYellow" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldUntar" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldRed" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldWhite" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldRivals" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldAlpha" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldRFArmy" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldTrainHard" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldGreen" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldBlue" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldKiba" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldDead" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldLabs" ) { priceList[i] = Resources.traderPrice; }
            if ( priceList[i] == "HShieldBear" ) { priceList[i] = Resources.traderPrice; }
        }

        for (const barterItem in barterScheme) {
            if (barterItem == "HShieldEvade" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldTG" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldUSEC" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldYellow" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldUntar" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldRed" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldWhite" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldRivals" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldAlpha" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldRFArmy" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldTrainHard" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldGreen" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldBlue" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldKiba" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldDead" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldLabs" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
            if (barterItem == "HShieldBear" ) { barterScheme[barterItem][0][0].count = Resources.traderPrice; }
        }

        if ( throughput === 0) {
            db.templates.items["HShieldEvade"]._props.BluntThroughput = 0;
            db.templates.items["HShieldTG"]._props.BluntThroughput = 0;
            db.templates.items["HShieldUSEC"]._props.BluntThroughput = 0;
            db.templates.items["HShieldYellow"]._props.BluntThroughput = 0;
            db.templates.items["HShieldUntar"]._props.BluntThroughput = 0;
            db.templates.items["HShieldRed"]._props.BluntThroughput = 0;
            db.templates.items["HShieldWhite"]._props.BluntThroughput = 0;
            db.templates.items["HShieldRivals"]._props.BluntThroughput = 0;
            db.templates.items["HShieldAlpha"]._props.BluntThroughput = 0;
            db.templates.items["HShieldRFArmy"]._props.BluntThroughput = 0;
            db.templates.items["HShieldTrainHard"]._props.BluntThroughput = 0;
            db.templates.items["HShieldGreen"]._props.BluntThroughput = 0;
            db.templates.items["HShieldBlue"]._props.BluntThroughput = 0;
            db.templates.items["HShieldKiba"]._props.BluntThroughput = 0;
            db.templates.items["HShieldDead"]._props.BluntThroughput = 0;
            db.templates.items["HShieldLabs"]._props.BluntThroughput = 0;
            db.templates.items["HShieldBear"]._props.BluntThroughput = 0;
        }
    }

}

module.exports = { mod: new Holtzman() }
