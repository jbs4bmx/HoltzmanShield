/**
 * Copyright: jbs4bmx
*/

import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { DependencyContainer } from "tsyringe";
import { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import { IItemConfig } from "@spt/models/spt/config/IItemConfig";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ImporterUtil } from "@spt/utils/ImporterUtil";
import { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { VFS } from "@spt/utils/VFS";
import { jsonc } from "jsonc";
import path from "path";

let hsdb;
let itemConfig: IItemConfig;
let botConfig: IBotConfig;
let pmcConfig: IPmcConfig;
let configServer: ConfigServer;

class Holtzman implements IPreSptLoadMod, IPostDBLoadMod
{
    private pkg;
    private privatePath = require('path');
    private modName = this.privatePath.basename(this.privatePath.dirname(__dirname.split('/').pop()));

    public postDBLoad(container: DependencyContainer)
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const preSptModLoader = container.resolve<PreSptModLoader>("PreSptModLoader");
        const databaseImporter = container.resolve<ImporterUtil>("ImporterUtil");
        const locales = db.locales.global;
        const handbook = db.templates.handbook.Items;
        this.pkg = require("../package.json");
        hsdb = databaseImporter.loadRecursive(`${preSptModLoader.getModPath(this.modName)}database/`);

        for (const iItem in hsdb.dbItems.templates) {
            db.templates.items[iItem] = hsdb.dbItems.templates[iItem];
        }

        for (const hItem of hsdb.dbItems.handbook.Items) {
            if (!handbook.find(i=>i.Id == hItem.Id)) {
                handbook.push(hItem);
            }
        }

        for (const localeID in locales) {
            for (const locale in hsdb.dbItems.locales.en) {
                locales[localeID][locale] = hsdb.dbItems.locales.en[locale];
            }
        }

        for (const pItem in hsdb.dbItems.prices) {
            db.templates.prices[pItem] = hsdb.dbItems.prices[pItem];
        }

        for (const tradeName in db.traders) {
            // Ragman
            if ( tradeName === "5ac3b934156ae10c4430e83c" ) {
                for (const riItem of hsdb.ragmanAssort.items) {
                    if (!db.traders[tradeName].assort.items.find(i=>i._id == riItem._id)) {
                        db.traders[tradeName].assort.items.push(riItem);
                    }
                }
                for (const rbItem in hsdb.ragmanAssort.barter_scheme) {
                    db.traders[tradeName].assort.barter_scheme[rbItem] = hsdb.ragmanAssort.barter_scheme[rbItem];
                }
                for (const rlItem in hsdb.ragmanAssort.loyal_level_items) {
                    db.traders[tradeName].assort.loyal_level_items[rlItem] = hsdb.ragmanAssort.loyal_level_items[rlItem];
                }
            }
        }

        this.setConfigOptions(container)

        logger.info(`${this.pkg.author}-${this.pkg.name} v${this.pkg.version}: Cached Successfully`);
    }

    public setConfigOptions(container: DependencyContainer): void
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const handBook = db.templates.handbook.Items;
        const priceList = db.templates.prices;
        const barterScheme = db.traders["5ac3b934156ae10c4430e83c"].assort.barter_scheme;
        const loyaltyItems = db.traders["5ac3b934156ae10c4430e83c"].assort.loyal_level_items;
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        //const botConfig = configServer.getConfig<IBotConfig>(ConfigTypes.BOT);
        const pmcConfig = configServer.getConfig<IPmcConfig>(ConfigTypes.PMC);
        const itemConfig = configServer.getConfig<IItemConfig>(ConfigTypes.ITEM);
        const vfs = container.resolve<VFS>("VFS");
        const { ArmorCoverage, ArmorAmount, Resources, PreFab, GodMode, Blacklist } = jsonc.parse(vfs.readFile(path.resolve(__dirname, "../config.jsonc")));

        //Add item to filter so it can be worn
        db.templates.items["55d7217a4bdc2d86028b456d"]._props.Slots[14]._props.filters[0].Filter.push("66087622e26587d9430a1cfb");

        let colliders: string[] = [];
        //var penPower = 1;


        //Cost and durability range verification
        if (typeof Resources.RepairCost === "number") {
            if ((Resources.RepairCost < 1) || (Resources.RepairCost > 2000)) {
                Resources.RepairCost = 1000;
            }
        }
        if (typeof ArmorAmount.Durability === "number") {
            if ((ArmorAmount.Durability < 1) || (ArmorAmount.Durability > 9999999)) {
                ArmorAmount.Durability = 1500;
            }
        }
        if (typeof Resources.traderPrice === "number") {
            if ((Resources.traderPrice < 1) || (Resources.traderPrice > 9999999)) {
                Resources.traderPrice = 69420;
            }
        }


        //Armor Colliders config
        if (typeof ArmorCoverage.Head === "boolean") {
            if (ArmorCoverage.Head === true) {
                colliders.push("ParietalHead", "BackHead", "HeadCommon");
            }
        }
        if (typeof ArmorCoverage.Neck === "boolean") {
            if (ArmorCoverage.Neck === true) {
                colliders.push("NeckFront", "NeckBack");
            }
        }
        if (typeof ArmorCoverage.Eyes === "boolean") {
            if (ArmorCoverage.Eyes === true) {
                colliders.push("Eyes");
            }
        }
        if (typeof ArmorCoverage.Ears === "boolean") {
            if (ArmorCoverage.Ears === true) {
                colliders.push("Ears");
            }
        }
        if (typeof ArmorCoverage.Jaw === "boolean") {
            if (ArmorCoverage.Jaw === true) {
                colliders.push("Jaw");
            }
        }
        if (typeof ArmorCoverage.Arms === "boolean") {
            if (ArmorCoverage.Arms === true) {
                colliders.push("LeftUpperArm", "LeftForearm","RightUpperArm", "RightForearm");
            }
        }
        if (typeof ArmorCoverage.Front === "boolean") {
            if (ArmorCoverage.Front === true) {
                colliders.push("RibcageUp","RibcageLow");
            }
        }
        if (typeof ArmorCoverage.Back === "boolean") {
            if (ArmorCoverage.Back === true) {
                colliders.push("SpineTop", "SpineDown");
            }
        }
        if (typeof ArmorCoverage.Sides === "boolean") {
            if (ArmorCoverage.Sides === true) {
                colliders.push("RightSideChestUp", "RightSideChestDown", "LeftSideChestUp", "LeftSideChestDown");
            }
        }
        if (typeof ArmorCoverage.Pelvis === "boolean") {
            if (ArmorCoverage.Pelvis === true) {
                colliders.push("Pelvis");
            }
        }
        if (typeof ArmorCoverage.Buttocks === "boolean") {
            if (ArmorCoverage.Buttocks === true) {
                colliders.push("PelvisBack");
            }
        }
        if (typeof ArmorCoverage.Legs === "boolean") {
            if (ArmorCoverage.Legs === true) {
                colliders.push("LeftThigh", "LeftCalf","RightThigh", "RightCalf");
            }
        }


        //Armor Plate Colliders = N/A


        //Trader Settings (from Resources)
        for ( let i=0; i<handBook.length; i++ ) {
            if ( handBook[i].Id == "66087622e26587d9430a1cfb" ) {
                handBook[i].Price = Resources.traderPrice;
            }
        }
        for ( let i=0; i<priceList.length; i++ ) {
            if ( priceList[i] == "66087622e26587d9430a1cfb" ) {
                priceList[i] = Resources.traderPrice;
            }
        }
        for (const barterItem in barterScheme) {
            if (barterItem == "66087622e26587d9430a1cfb" ) {
                barterScheme[barterItem][0][0].count = Resources.traderPrice;
            }
        }
        for (const loyalItem in loyaltyItems) {
            if (loyalItem == "66087622e26587d9430a1cfb" ) {
                loyaltyItems[loyalItem] = Resources.traderLoyaltyLevel;
            }
        }


        //PreFab
        let prefabCount = 0;
        let trueKey: string | null = null;
        for (const key in PreFab) {
            if (PreFab[key] === true) {
                prefabCount++;
                trueKey = key;
            }
        }
        if (prefabCount === 0) {
            logger.error("[HS] No property for PreFab is set to 'true'. Defaulting to Evasion.");
            db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/facecover_buffalo/item_equipment_facecover_buffalo.bundle";
        } else if (prefabCount > 1) {
            logger.error("[HS] More than one property value for PreFab is set to 'true'. Defaulting to Evasion.");
            db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/facecover_buffalo/item_equipment_facecover_buffalo.bundle";
        } else {
            switch (trueKey) {
                case "Evasion": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_evasion.bundle";
                    break;
                }
                case "Alpha": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_alpha.bundle";
                    break;
                }
                case "DeadSkul": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_dead.bundle";
                    break;
                }
                case "TrainHard": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_helmet.bundle";
                    break;
                }
                case "TwitchRivals": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_revals.bundle";
                    break;
                }
                case "Bear": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_bear.bundle";
                    break;
                }
                case "Kiba": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_kibaarms.bundle";
                    break;
                }
                case "Labs": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_labs.bundle";
                    break;
                }
                case "RFArmy": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_russia.bundle";
                    break;
                }
                case "TerraGroup": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_terragroup.bundle";
                    break;
                }
                case "Untar": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_un.bundle";
                    break;
                }
                case "USEC": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_usec.bundle";
                    break;
                }
                case "Blue": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_blue.bundle";
                    break;
                }
                case "Green": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_green.bundle";
                    break;
                }
                case "Red": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_red.bundle";
                    break;
                }
                case "White": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_white.bundle";
                    break;
                }
                case "Yellow": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_yellow.bundle";
                    break;
                }
                case "Unheard": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_unheard.bundle";
                    break;
                }
                case "Arena": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_arena.bundle";
                    break;
                }
                case "BlackDivision": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    //db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_newItem.bundle";
                    break;
                }
                case "Cultist": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    //db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_newItem.bundle";
                    break;
                }
                case "EoDOwners": {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    //db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_newItem.bundle";
                    break;
                }
                default: {
                    logger.info(`[HS] Setting HS prefab to selected value: ${trueKey}`)
                    db.templates.items["66087622e26587d9430a1cfb"]._props.Prefab.path = "assets/content/items/equipment/armband/item_equipment_armband_evasion.bundle";
                    break;
                }
            }
        }


        //Resources
        db.templates.items["66087622e26587d9430a1cfb"]._props.ArmorMaterial = Resources.ArmorMaterial;
        db.templates.items["66087622e26587d9430a1cfb"]._props.ArmorType = Resources.ArmorType;
        db.templates.items["66087622e26587d9430a1cfb"]._props.BlindnessProtection = Resources.BlindnessProtection;
        db.templates.items["66087622e26587d9430a1cfb"]._props.Durability = ArmorAmount.Durability;
        db.templates.items["66087622e26587d9430a1cfb"]._props.MaxDurability = ArmorAmount.Durability;
        db.templates.items["66087622e26587d9430a1cfb"]._props.ArmorClass = Resources.ArmorClass;
        db.templates.items["66087622e26587d9430a1cfb"]._props.Weight = Resources.ItemWeight;
        db.templates.items["66087622e26587d9430a1cfb"]._props.RepairCost = Resources.RepairCost;
        db.templates.items["66087622e26587d9430a1cfb"]._props.armorColliders = colliders;
        //db.templates.items["66087622e26587d9430a1cfb"]._props.armorPlateColliders = colPlates;


        //GodMode
        if (typeof GodMode.BluntForce === "boolean") {
            if (GodMode.BluntForce === true) {
                db.templates.items["66087622e26587d9430a1cfb"]._props.BluntThroughput = 0;
                db.templates.items["66087622e26587d9430a1cfb"]._props.Indestructibility = 1;
            }
        }
        //if (typeof GodMode.Penetration === "boolean") { if (GodMode.Penetration === true) { penPower = 0; } }


        //Blacklists
        if (typeof Blacklist.pmc === "boolean") {
            if (Blacklist.pmc === true) {
                pmcConfig.vestLoot.blacklist.push("660877b848b061d3eca2579f");
                pmcConfig.pocketLoot.blacklist.push("660877b848b061d3eca2579f");
                pmcConfig.backpackLoot.blacklist.push("660877b848b061d3eca2579f");
            }
        }
        if (typeof Blacklist.globalLoot === "boolean") {
            if (Blacklist.globalLoot === true) {
                itemConfig.blacklist.push("660877b848b061d3eca2579f");
            }
        }
    }

}

module.exports = { mod: new Holtzman() }
