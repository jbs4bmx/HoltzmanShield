using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Helpers;
using SPTarkov.Server.Core.Models.Common;
using SPTarkov.Server.Core.Models.Eft.Common;
using SPTarkov.Server.Core.Models.Eft.Common.Tables;
using SPTarkov.Server.Core.Models.Enums;
using SPTarkov.Server.Core.Models.Spt.Config;
using SPTarkov.Server.Core.Models.Spt.Mod;
using SPTarkov.Server.Core.Models.Utils;
using SPTarkov.Server.Core.Servers;
using SPTarkov.Server.Core.Services;
using SPTarkov.Server.Core.Services.Mod;
using System.Reflection;

namespace HoltzmanShield;

public record ModMetadata : AbstractModMetadata
{
    public override string ModGuid { get; init; } = "com.jbs4bmx.holtzmanshield";
    public override string Name { get; init; } = "HoltzmanShield";
    public override string Author { get; init; } = "jbs4bmx";
    public override List<string>? Contributors { get; init; }
    public override SemanticVersioning.Version Version { get; init; } = new("4.0.0");
    public override SemanticVersioning.Range SptVersion { get; init; } = new("~4.0.0");
    public override List<string>? Incompatibilities { get; init; }
    public override Dictionary<string, SemanticVersioning.Range>? ModDependencies { get; init; }
    public override string? Url { get; init; }
    public override bool? IsBundleMod { get; init; }
    public override string? License { get; init; } = "MIT";
}

[Injectable(TypePriority = OnLoadOrder.PostDBModLoader + 2)]
public class ShieldItemService(
    ISptLogger<ShieldItemService> logger,
    CustomItemService customItemService,
    DatabaseService databaseService,
    ConfigServer configServer,
    ModHelper modHelper) : IOnLoad
{
    private static class HSConstants
    {
        public static readonly MongoId ShieldId = new("66087622e26587d9430a1cfb");
        public static readonly MongoId TraderRagman = new("5ac3b934156ae10c4430e83c");
        public const string DefaultPrefab =
            "assets/content/items/equipment/armband/item_equipment_armband_evasion.bundle";
    }

    public Task OnLoad()
    {
        var pathToMod = modHelper.GetAbsolutePathToModFolder(Assembly.GetExecutingAssembly());
        var shieldConfig = modHelper.GetJsonDataFromFile<ModConfig>(pathToMod, "config.jsonc");
        var placeableSlot = databaseService.GetTables().Templates.Items[ItemTpl.INVENTORY_DEFAULT].Properties!.Slots!.ToList()[14];
        var itemConfig = configServer!.GetConfig<ItemConfig>();
        var botConfig = configServer!.GetConfig<BotConfig>();
        var pmcConfig = configServer!.GetConfig<PmcConfig>();
        var containerTemplate = databaseService.GetTables().Templates.Items[BaseClasses.LOOT_CONTAINER];

        List<string> colliders = [];

        double bluntValue = 0.5;
        double indestructibleValue = 0.1;
        string prefabValue;
        string? trueKey = null;
        int prefabCount = 0;

        // Validate configuration values and set defaults if out of range.
        shieldConfig.RepairCost = Clamp(shieldConfig.RepairCost, 1, 2000, 500);
        shieldConfig.Durability = Clamp(shieldConfig.Durability, 1, 9999999, 2000);
        shieldConfig.TraderPrice = Clamp(shieldConfig.TraderPrice, 1, 9999999, 69420);
        shieldConfig.FleaPrice = Clamp(shieldConfig.FleaPrice, 1, 9999999, 76767);
        shieldConfig.BlindnessProtection = Clamp(shieldConfig.BlindnessProtection, 0.0, 1.0, 1.0);

        // Build collider list based on config
        var colliderMap = new Dictionary<string, IEnumerable<string>>
        {
            ["Head"] = ["ParietalHead", "BackHead", "HeadCommon"],
            ["Eyes"] = ["Eyes"],
            ["Ears"] = ["Ears"],
            ["Jaw"] = ["Jaw"],
            ["Neck"] = ["NeckFront", "NeckBack"],
            ["Arms"] = ["LeftUpperArm", "LeftForearm", "RightUpperArm", "RightForearm"],
            ["Front"] = ["RibcageUp", "RibcageLow"],
            ["Back"] = ["SpineTop", "SpineDown"],
            ["Sides"] = ["LeftSideChestUp", "LeftSideChestDown", "RightSideChestUp", "RightSideChestDown"],
            ["Pelvis"] = ["Pelvis"],
            ["Buttocks"] = ["PelvisBack"],
            ["Legs"] = ["LeftThigh", "LeftCalf", "RightThigh", "RightCalf"],
        };

        foreach (var kvp in colliderMap)
        {
            var enabled = (bool)typeof(ModConfig)
                .GetProperty(kvp.Key)!
                .GetValue(shieldConfig)!;

            if (enabled)
                colliders.AddRange(kvp.Value);
        }

        // Get PreFab value from config.
        if (shieldConfig.PreFab != null)
        {
            foreach (var prop in typeof(ModPreFab).GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (prop.PropertyType == typeof(bool) && (bool)(prop.GetValue(shieldConfig.PreFab) ?? false))
                {
                    prefabCount++;
                    trueKey = prop.Name;
                }
            }
        }

        var prefabMap = new Dictionary<string, string>
        {
            ["Evasion"] = "assets/content/items/equipment/armband/item_equipment_armband_evasion.bundle",
            ["Alpha"] = "assets/content/items/equipment/armband/item_equipment_armband_alpha.bundle",
            ["DeadSkul"] = "assets/content/items/equipment/armband/item_equipment_armband_dead.bundle",
            ["TrainHard"] = "assets/content/items/equipment/armband/item_equipment_armband_helmet.bundle",
            ["TwitchRivals"] = "assets/content/items/equipment/armband/item_equipment_armband_revals.bundle",
            ["Bear"] = "assets/content/items/equipment/armband/item_equipment_armband_bear.bundle",
            ["Kiba"] = "assets/content/items/equipment/armband/item_equipment_armband_kibaarms.bundle",
            ["Labs"] = "assets/content/items/equipment/armband/item_equipment_armband_labs.bundle",
            ["RFArmy"] = "assets/content/items/equipment/armband/item_equipment_armband_russia.bundle",
            ["TerraGroup"] = "assets/content/items/equipment/armband/item_equipment_armband_terragroup.bundle",
            ["Untar"] = "assets/content/items/equipment/armband/item_equipment_armband_un.bundle",
            ["USEC"] = "assets/content/items/equipment/armband/item_equipment_armband_usec.bundle",
            ["Blue"] = "assets/content/items/equipment/armband/item_equipment_armband_blue.bundle",
            ["Green"] = "assets/content/items/equipment/armband/item_equipment_armband_green.bundle",
            ["Red"] = "assets/content/items/equipment/armband/item_equipment_armband_red.bundle",
            ["White"] = "assets/content/items/equipment/armband/item_equipment_armband_white.bundle",
            ["Yellow"] = "assets/content/items/equipment/armband/item_equipment_armband_yellow.bundle",
            ["Unheard"] = "assets/content/items/equipment/armband/item_equipment_armband_unheard.bundle",
            ["Arena"] = "assets/content/items/equipment/armband/item_equipment_armband_arena.bundle",
            ["XMas"] = "assets/content/items/equipment/armband/item_equipment_armband_xmass.bundle",
            ["Prestige1"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_1.bundle",
            ["Prestige2"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_2.bundle",
            ["Prestige3"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_3.bundle",
            ["Prestige4"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_4.bundle",
            ["Prestige5"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_5.bundle",

            // WIP → default to Evasion
            ["BlackDivision_wip"] = "assets/content/items/equipment/armband/item_equipment_armband_evasion.bundle",
            ["EODOwners_wip"] = "assets/content/items/equipment/armband/item_equipment_armband_evasion.bundle",
            ["Discord_wip"] = "assets/content/items/equipment/armband/item_equipment_armband_evasion.bundle",
            ["Prayer_wip"] = "assets/content/items/equipment/armband/item_equipment_armband_evasion.bundle",
        };

        // Default prefab
        const string defaultPrefab = HSConstants.DefaultPrefab;

        // Resolve prefab
        if (prefabCount == 0)
        {
            logger.Warning("[HS] No property for PreFab is set to 'true'. Defaulting to Evasion Armband.");
            prefabValue = defaultPrefab;
        }
        else if (prefabCount > 1)
        {
            logger.Warning("[HS] More than one property value for PreFab is set to 'true'. Defaulting to Evasion Armband.");
            prefabValue = defaultPrefab;
        }
        else
        {
            prefabValue = prefabMap.TryGetValue(trueKey!, out var path)
                ? path
                : defaultPrefab;
        }

        // Advanced Options
        if (shieldConfig.BluntForce is bool blunt && blunt)
        {
            bluntValue = 0;
            indestructibleValue = 1;
        }

        // Initialize item properties from configuration file.
        var HSItem = CreateHoltzmanShieldItem(
            shieldConfig,
            prefabValue,
            colliders,
            bluntValue,
            indestructibleValue
        );

        // Create the new item
        customItemService.CreateItemFromClone(HSItem);

        // Add to Armband slot
        placeableSlot.Properties!.Filters!.First().Filter!.Add(HSConstants.ShieldId.ToString());

        // Configure blacklists
        ApplyBlacklists(
            shieldConfig,
            HSConstants.ShieldId,
            pmcConfig,
            botConfig,
            containerTemplate
        );

        // Call function to add the item to the specified trader.
        AddToTraderAssort(
            HSConstants.TraderRagman,
            HSConstants.ShieldId,
            shieldConfig.TraderPrice,
            shieldConfig.TraderLoyaltyLevel
        );

        // End.
        return Task.CompletedTask;
    }

    private static NewItemFromCloneDetails CreateHoltzmanShieldItem(
        ModConfig cfg,
        string prefabPath,
        List<string> colliders,
        double bluntValue,
        double indestructibleValue)
    {
        return new NewItemFromCloneDetails
        {
            ItemTplToClone = ItemTpl.FACECOVER_ATOMIC_DEFENSE_CQCM_BALLISTIC_MASK_SKULL,
            ParentId = BaseClasses.ARMORED_EQUIPMENT,
            NewId = HSConstants.ShieldId,
            FleaPriceRoubles = cfg.FleaPrice,
            HandbookPriceRoubles = cfg.TraderPrice,
            HandbookParentId = "5b5f701386f774093f2ecf0f",

            Locales = new Dictionary<string, LocaleDetails>
            {
                ["en"] = new LocaleDetails
                {
                    Name = "Holtzman Shield",
                    ShortName = "Shield",
                    Description = "Shield technology engineered by House Atreides that aims to prevent kinetic projectiles."
                }
            },

            OverrideProperties = new TemplateItemProperties
            {
                ArmorMaterial = ArmorMaterial.ArmoredSteel,
                ArmorType = "Heavy",
                BackgroundColor = "red",
                BlindnessProtection = cfg.BlindnessProtection,
                BlocksEarpiece = false,
                BlocksEyewear = false,
                BlocksFaceCover = false,
                BlocksHeadwear = false,
                BluntThroughput = bluntValue,
                Description = "Shield technology engineered by House Atreides that aims to prevent kinetic projectiles.",
                Durability = cfg.Durability,
                Height = 1,
                Indestructibility = indestructibleValue,
                MaterialType = "BodyArmor",
                MaxDurability = cfg.Durability,
                MetascoreGroup = "Defence",
                Prefab = new Prefab { Path = prefabPath },
                RarityPvE = "Not_exist",
                RepairCost = cfg.RepairCost,
                RepairSpeed = 2,
                RicochetParams = new XYZ { X = 0, Y = 0, Z = 80 },
                UnlootableFromSlot = "FirstPrimaryWeapon",
                Weight = 0.01,
                Width = 1,
                ArmorClass = 10,
                ArmorColliders = colliders,
                MousePenalty = 0,
                SpeedPenaltyPercent = 0,
                WeaponErgonomicPenalty = 0
            }
        };
    }

    private static void ApplyBlacklists(
        ModConfig cfg,
        MongoId itemId,
        PmcConfig pmcConfig,
        BotConfig botConfig,
        TemplateItem containerTemplate)
    {
        // PMC blacklist
        if (cfg.PMC)
        {
            pmcConfig.VestLoot.Blacklist.Add(itemId.ToString());
            pmcConfig.PocketLoot.Blacklist.Add(itemId.ToString());
            pmcConfig.BackpackLoot.Blacklist.Add(itemId.ToString());
            pmcConfig.GlobalLootBlacklist.Add(itemId.ToString());
        }

        // Global loot blacklist
        if (cfg.GlobalLoot)
        {
            // Remove from bot loot tables
            foreach (var limitDict in botConfig.ItemSpawnLimits.Values)
            {
                if (!limitDict.ContainsKey(itemId.ToString()))
                    limitDict[itemId.ToString()] = 0;
            }

            // Remove from containers
            if (containerTemplate?.Properties?.Grids != null)
            {
                foreach (var grid in containerTemplate.Properties.Grids)
                {
                    var filters = grid.Properties?.Filters?.ToList();
                    if (filters != null && filters.Count > 0)
                    {
                        filters[0].ExcludedFilter?.Add(itemId);
                        grid.Properties!.Filters = filters;
                    }
                }
            }
        }
    }


    private void AddToTraderAssort(MongoId traderId, MongoId itemId, double price, int level)
    {
        // This function adds the specified item to the trader's assortment with the property values passed to it.
        var assort = databaseService.GetTrader(traderId)?.Assort;

        if (assort == null)
        {
            logger.Warning($"[HS] Trader {traderId} not found. Cannot add item to assort.");
            return;
        }

        // Generate a new assortId.
        var assortId = new MongoId();

        // Add item entry
        assort!.Items.Add(new Item
        {
            Id = assortId,
            Template = itemId,
            ParentId = "hideout",
            SlotId = "hideout",
            Upd = new Upd
            {
                UnlimitedCount = false,
                StackObjectsCount = 1,
                BuyRestrictionMax = 50,
                BuyRestrictionCurrent = 0
            }
        });

        // Generate a barter scheme for the item.
        assort!.BarterScheme[assortId] = [[new BarterScheme
        {
            Count = price,
            Template = ItemTpl.MONEY_ROUBLES
        }]];

        // Add the new item to the trader's assortment and set the loyaltylevel.
        assort!.LoyalLevelItems[assortId] = level;
    }

    private static int Clamp(int value, int min, int max, int fallback)
    {
        return value < min || value > max ? fallback : value;
    }

    private static double Clamp(double value, double min, double max, double fallback)
    {
        return value < min || value > max ? fallback : value;
    }

}

public class ModConfig
{
    //Coverage Options
    public bool Head { get; set; }
    public bool Neck { get; set; }
    public bool Eyes { get; set; }
    public bool Ears { get; set; }
    public bool Jaw { get; set; }
    public bool Arms { get; set; }
    public bool Front { get; set; }
    public bool Back { get; set; }
    public bool Sides { get; set; }
    public bool Pelvis { get; set; }
    public bool Buttocks { get; set; }
    public bool Legs { get; set; }

    // Item Properties
    public int Durability { get; set; }
    public double BlindnessProtection { get; set; }
    public int RepairCost { get; set; }
    public int TraderPrice { get; set; }
    public int FleaPrice { get; set; }
    public int TraderLoyaltyLevel { get; set; }

    // Prefab
    public ModPreFab? PreFab { get; set; }

    // Advanced
    public bool BluntForce { get; set; }

    // Blacklist
    public bool PMC { get; set; }
    public bool GlobalLoot { get; set; }
}

public class ModPreFab
{
    public bool Evasion { get; set; }
    public bool Alpha { get; set; }
    public bool DeadSkul { get; set; }
    public bool TrainHard { get; set; }
    public bool TwitchRivals { get; set; }
    public bool Bear { get; set; }
    public bool Kiba { get; set; }
    public bool Labs { get; set; }
    public bool RFArmy { get; set; }
    public bool TerraGroup { get; set; }
    public bool Untar { get; set; }
    public bool USEC { get; set; }
    public bool Blue { get; set; }
    public bool Green { get; set; }
    public bool Red { get; set; }
    public bool White { get; set; }
    public bool Yellow { get; set; }
    public bool Unheard { get; set; }
    public bool Arena { get; set; }
    public bool XMas { get; set; }
    public bool Prestige1 { get; set; }
    public bool Prestige2 { get; set; }
    public bool Prestige3 { get; set; }
    public bool Prestige4 { get; set; }
    public bool Prestige5 { get; set; }

    // WIP Prefabs
    public bool BlackDivision_wip { get; set; }
    public bool EODOwners_wip { get; set; }
    public bool Discord_wip { get; set; }
    public bool Prayer_wip { get; set; }
}
