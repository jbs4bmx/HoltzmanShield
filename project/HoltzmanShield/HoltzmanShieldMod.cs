using SPTarkov.Common.Logger;
using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Helpers.Server;
using SPTarkov.Server.Core.Models.Common;
using SPTarkov.Server.Core.Models.Eft.Common.Tables;
using SPTarkov.Server.Core.Models.Enums;
using SPTarkov.Server.Core.Models.Spt.Config;
using SPTarkov.Server.Core.Models.Spt.Mod;
using SPTarkov.Server.Core.Models.Spt.Tables;
using SPTarkov.Server.Core.Services.Modding.Custom;
using System.Reflection;
using System.Text.Json;

namespace HoltzmanShield;

public record ModMetadata : IModMetadata
{
    public string ModGuid { get; init; } = "com.jbs4bmx.holtzmanshield";
    public string Name { get; init; } = "HoltzmanShield";
    public string Author { get; init; } = "jbs4bmx";
    public List<string>? Contributors { get; init; } = null;
    public SemanticVersioning.Version Version { get; init; } = new("4.1.3");
    public SemanticVersioning.Range SptVersion { get; init; } = new("~4.1.3");
    public List<string>? Incompatibilities { get; init; } = null;
    public Dictionary<string, SemanticVersioning.Range>? ModDependencies { get; init; } = null;
    public string? Url { get; init; } = null;
    public string License { get; init; } = "MIT";
    public bool HasPrepatcher { get; init; } = false;
}

[Injectable(TypePriority = OnLoadOrder.Preload + 999)]
public class ShieldItemService(SptLogger<ShieldItemService> logger, TemplateTable templatesTable, TradersTable tradersTable, CustomItemService customItemService, AirdropConfig airdropConfig, PmcConfig pmcConfig, BotConfig botConfig, LootConfig lootConfig, ItemConfig itemConfig, ModHelper modHelper) : IOnLoad
{
    private static class HSConstants
    {
        public static readonly MongoId ShieldId = new("66087622e26587d9430a1cfb");
        public static readonly MongoId TraderRagman = new("5ac3b934156ae10c4430e83c");
        public const string DefaultPrefab = "assets/content/items/equipment/armband/item_equipment_armband_evasion.bundle";

        public static readonly IReadOnlyDictionary<string, IEnumerable<string>> ColliderMap =
            new Dictionary<string, IEnumerable<string>>(StringComparer.Ordinal)
            {
                ["Head"] = ["ParietalHead", "BackHead", "HeadCommon" ],
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

        public static readonly IReadOnlyDictionary<string, string> PrefabMap =
            new Dictionary<string, string>(StringComparer.Ordinal)
            {
                ["Evasion"] = DefaultPrefab,
                ["Alpha"] = "assets/content/items/equipment/armband/item_equipment_armband_alpha.bundle",
                ["Arena"] = "assets/content/items/equipment/armband/item_equipment_armband_arena.bundle",
                ["BEAR"] = "assets/content/items/equipment/armband/item_equipment_armband_bear.bundle",
                ["Beta"] = DefaultPrefab,
                ["Blue"] = "assets/content/items/equipment/armband/item_equipment_armband_blue.bundle",
                ["Darkness"] = DefaultPrefab,
                ["DeadSkul"] = "assets/content/items/equipment/armband/item_equipment_armband_dead.bundle",
                ["Discord"] = "assets/content/items/equipment/armband/item_equipment_armband_discord.bundle",
                ["Forged"] = DefaultPrefab,
                ["Green"] = "assets/content/items/equipment/armband/item_equipment_armband_green.bundle",
                ["HeadEyes"] = DefaultPrefab,
                ["Humanity"] = DefaultPrefab,
                ["Khorovod"] = "assets/content/items/equipment/armband/item_equipment_armband_xmass.bundle",
                ["Kiba"] = "assets/content/items/equipment/armband/item_equipment_armband_kibaarms.bundle",
                ["Labs"] = "assets/content/items/equipment/armband/item_equipment_armband_labs.bundle",
                ["Lighthouse"] = DefaultPrefab,
                ["Loot"] = DefaultPrefab,
                ["Red"] = "assets/content/items/equipment/armband/item_equipment_armband_red.bundle",
                ["Release"] = DefaultPrefab,
                ["RFArmy"] = "assets/content/items/equipment/armband/item_equipment_armband_russia.bundle",
                ["Rivals2020"] = "assets/content/items/equipment/armband/item_equipment_armband_revals.bundle",
                ["SBEU"] = DefaultPrefab,
                ["Survivor"] = DefaultPrefab,
                ["TerraGroup"] = "assets/content/items/equipment/armband/item_equipment_armband_terragroup.bundle",
                ["TrainHard"] = "assets/content/items/equipment/armband/item_equipment_armband_helmet.bundle",
                ["Unheard"] = "assets/content/items/equipment/armband/item_equipment_armband_unheard.bundle",
                ["Untar"] = "assets/content/items/equipment/armband/item_equipment_armband_un.bundle",
                ["USEC"] = "assets/content/items/equipment/armband/item_equipment_armband_usec.bundle",
                ["White"] = "assets/content/items/equipment/armband/item_equipment_armband_white.bundle",
                ["Yellow"] = "assets/content/items/equipment/armband/item_equipment_armband_yellow.bundle",
                ["Prestige1"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_1.bundle",
                ["Prestige2"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_2.bundle",
                ["Prestige3"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_3.bundle",
                ["Prestige4"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_4.bundle",
                ["Prestige5"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_5.bundle",
                ["Prestige6"] = "assets/content/items/equipment/armband/item_equipment_armband_prestige_6.bundle"
            };
    }

    public Task OnLoadAsync(CancellationToken cancellationToken)
    {
        // Load mod config (supports .jsonc comments)
        var pathToMod = System.IO.Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)!;
        var configPath = System.IO.Path.Combine(pathToMod, "config.jsonc");

        ModConfig? shieldConfig = null;
        if (File.Exists(configPath))
        {
            try
            {
                // Parse with comment handling and deserialize
                var raw = File.ReadAllText(configPath);
                raw = System.Text.RegularExpressions.Regex.Replace(raw, @"/\*.*?\*/", string.Empty, System.Text.RegularExpressions.RegexOptions.Singleline);
                raw = System.Text.RegularExpressions.Regex.Replace(raw, @"//.*?$", string.Empty, System.Text.RegularExpressions.RegexOptions.Multiline);
                var opts = new JsonSerializerOptions {AllowTrailingCommas = true};
                shieldConfig = JsonSerializer.Deserialize<ModConfig>(raw, opts);
            }
            catch (Exception ex)
            {
                logger.Warning($"[HS] Failed to parse config.jsonc: {ex.Message}");
            }
        }

        if (shieldConfig == null)
        {
            logger.Warning("[HS] No config found or failed to parse 'config.jsonc'. Aborting HoltzmanShield OnLoad.");
            return Task.CompletedTask;
        }

        var inventoryTemplates = templatesTable.Items;
        if (!inventoryTemplates.TryGetValue(ItemTpl.INVENTORY_DEFAULT, out var inventoryTemplate) || inventoryTemplate?.Properties?.Slots == null)
        {
            logger.Warning("[HS] Inventory template or slots not found. Aborting OnLoad.");
            return Task.CompletedTask;
        }

        // Prefer to find armband slot robustly, fallback to index 14 with safety.
        var slots = inventoryTemplate.Properties.Slots.ToList();
        var placeableSlot = slots.ElementAtOrDefault(14) ?? slots.FirstOrDefault();
        if (placeableSlot == null)
        {
            logger.Warning("[HS] Armband slot not found. Aborting OnLoad.");
            return Task.CompletedTask;
        }

        // Container config reference.
        var containerTemplate = templatesTable.Items.GetValueOrDefault(BaseClasses.LOOT_CONTAINER);

        var colliders = new HashSet<string>(StringComparer.Ordinal);

        // defaults
        double bluntValue = 0.5;
        double indestructibleValue = 0.1;
        string prefabValue = HSConstants.DefaultPrefab;

        // Validate configuration values and set defaults if out of range.
        shieldConfig.RepairCost = Clamp(shieldConfig.RepairCost, 1, 2000, 500);
        shieldConfig.Durability = Clamp(shieldConfig.Durability, 1, 9999999, 2000);
        shieldConfig.TraderPrice = Clamp(shieldConfig.TraderPrice, 1, 9999999, 69420);
        shieldConfig.FleaPrice = Clamp(shieldConfig.FleaPrice, 1, 9999999, 76767);
        shieldConfig.BlindnessProtection = Clamp(shieldConfig.BlindnessProtection, 0.0, 1.0, 1.0);

        // Build collider list based on config using safe reflection
        foreach (var kvp in HSConstants.ColliderMap)
        {
            if (TryGetBoolPropertyValue(shieldConfig, kvp.Key, out var enabled) && enabled)
            {
                foreach (var c in kvp.Value)
                    colliders.Add(c);
            }
        }

        // Resolve PreFab: find a single true boolean property on ModPreFab
        if (shieldConfig.PreFab != null)
        {
            var trueProps = typeof(ModPreFab)
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.PropertyType == typeof(bool) && (bool)(p.GetValue(shieldConfig.PreFab) ?? false))
                .Select(p => p.Name)
                .ToList();

            if (trueProps.Count == 1)
            {
                var key = trueProps[0];
                if (!HSConstants.PrefabMap.TryGetValue(key, out prefabValue!))
                    prefabValue = HSConstants.DefaultPrefab;
            }
            else if (trueProps.Count == 0)
            {
                logger.Debug("[HS] No prefab flag set; using default.");
            }
            else
            {
                logger.Warning("[HS] Multiple prefab flags set; using default.");
            }
        }

        // Advanced Options
        if (shieldConfig.BluntForce)
        {
            bluntValue = 0;
            indestructibleValue = 1;
        }

        // Initialize item properties from configuration file and create item
        var HSItem = CreateHoltzmanShieldItem(shieldConfig, prefabValue, [.. colliders], bluntValue, indestructibleValue);
        customItemService.CreateItemFromClone(HSItem);

        // Add to Armband slot - guard nulls and duplicates
        var filter = placeableSlot.Properties?.Filters?.FirstOrDefault()?.Filter;
        if (filter != null)
        {
            var idStr = HSConstants.ShieldId.ToString();
            if (!filter.Contains(idStr))
                filter.Add(idStr);
        }

        // Configure blacklists safely
        ApplyBlacklists(shieldConfig, HSConstants.ShieldId, pmcConfig, botConfig, lootConfig, itemConfig, airdropConfig, containerTemplate!);

        // Add to trader
        AddToTraderAssort(HSConstants.TraderRagman, HSConstants.ShieldId, shieldConfig.TraderPrice, shieldConfig.TraderLoyaltyLevel);

        return Task.CompletedTask;
    }

    private static bool TryGetBoolPropertyValue(object obj, string propertyName, out bool value)
    {
        value = false;
        var prop = obj.GetType().GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance);
        if (prop == null || prop.PropertyType != typeof(bool))
            return false;

        var v = prop.GetValue(obj);
        if (v is bool b)
        {
            value = b;
            return true;
        }

        return false;
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
            ItemTplToClone = ItemTpl.FACECOVER_BALACLAVA,
            ParentId = BaseClasses.ARMORED_EQUIPMENT,
            NewId = HSConstants.ShieldId,
            NewItemName = "Holtzman Shield",
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
                BlocksArmorVest = false,
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
                RicochetChance = 0,
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

    private static void ApplyBlacklists(ModConfig cfg, MongoId itemId, PmcConfig pmcConfig, BotConfig botConfig, LootConfig lootConfig, ItemConfig itemConfig, AirdropConfig airdropConfig, TemplateItem containerTemplate)
    {
        var idStr = itemId.ToString();
        
        // Scav blacklist
        if (cfg.BotLoot)
        {
            foreach (var limitDict in botConfig.ItemSpawnLimits.Values)
            {
                if (!limitDict.ContainsKey(idStr))
                    limitDict[idStr] = 0;
            }
        }

        // PMC blacklist
        if (cfg.PMCLoot)
        {
            if (!pmcConfig.VestLoot.Blacklist.Contains(idStr)) pmcConfig.VestLoot.Blacklist.Add(idStr);
            if (!pmcConfig.PocketLoot.Blacklist.Contains(idStr)) pmcConfig.PocketLoot.Blacklist.Add(idStr);
            if (!pmcConfig.BackpackLoot.Blacklist.Contains(idStr)) pmcConfig.BackpackLoot.Blacklist.Add(idStr);
            if (!pmcConfig.GlobalLootBlacklist.Contains(idStr)) pmcConfig.GlobalLootBlacklist.Add(idStr);
        }

        // Global loot blacklist
        if (cfg.ContainerLoot)
        {
            // Remove from containers
            if (containerTemplate?.Properties?.Grids != null)
            {
                foreach (var grid in containerTemplate.Properties.Grids)
                {
                    var filters = grid.Properties?.Filters?.ToList();
                    if (filters?.Count > 0)
                    {
                        var excluded = filters[0].ExcludedFilter;
                        if (excluded != null && !excluded.Contains(idStr))
                            excluded.Add(idStr);

                        grid.Properties!.Filters = filters;
                    }
                }
            }
        }

        // Loose loot blacklist
        if (cfg.LooseLoot)
        {
            // Remove from loose loot
            if (!itemConfig.LootableItemBlacklist.Contains(idStr)) itemConfig.LootableItemBlacklist.Add(idStr);
            foreach (var limitLoose in lootConfig.StaticItemWeightAdjustment.Values)
            {
                if (!limitLoose.ContainsKey(idStr))
                    limitLoose[idStr] = 0;
            }
        }

        // AirDrop loot blacklist
        if (cfg.AirDropLoot)
        {
            // Remove from Airdrop containers
            foreach (var limitAir in airdropConfig.Loot.Values)
            {
                if (!limitAir.ItemBlacklist.Contains(idStr)) limitAir.ItemBlacklist.Add(idStr);
            }
        }
    }

    private void AddToTraderAssort(MongoId traderId, MongoId itemId, double price, int level)
    {
        var assort = tradersTable.GetTrader(traderId)?.Assort;
        if (assort == null)
        {
            logger.Warning($"[HS] Trader {traderId} not found. Cannot add item to assort.");
            return;
        }

        // Generate a new assortId and avoid key collisions
        MongoId assortId;
        do
        {
            assortId = new MongoId();
        } while (assort.Items.Any(i => i.Id == assortId));

        // Add item entry
        assort.Items.Add(new Item
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

        // Generate a barter scheme for the item
        assort.BarterScheme[assortId] =
        [
            [
                new BarterScheme
                {
                    Count = (int)price,
                    Template = ItemTpl.MONEY_ROUBLES
                }
            ]
        ];

        // Set the loyalty level
        assort.LoyalLevelItems[assortId] = level;
    }

    private static int Clamp(int value, int min, int max, int fallback) =>
        value < min || value > max ? fallback : value;

    private static double Clamp(double value, double min, double max, double fallback) =>
        value < min || value > max ? fallback : value;
}

public class ModConfig
{
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
    public int Durability { get; set; }
    public double BlindnessProtection { get; set; }
    public int RepairCost { get; set; }
    public int TraderPrice { get; set; }
    public int FleaPrice { get; set; }
    public int TraderLoyaltyLevel { get; set; }
    public ModPreFab? PreFab { get; set; }
    public bool BluntForce { get; set; }
    public bool PMCLoot { get; set; }
    public bool BotLoot { get; set; }
    public bool ContainerLoot { get; set; }
    public bool LooseLoot { get; set; }
    public bool AirDropLoot { get; set; }
}

public class ModPreFab
{
    public bool Evasion { get; set; }
    public bool Alpha { get; set; }
    public bool Arena { get; set; }
    public bool BEAR { get; set; }
    public bool Beta { get; set; }
    public bool Blue { get; set; }
    public bool Darkness { get; set; }
    public bool DeadSkul { get; set; }
    public bool Discord { get; set; }
    public bool Forged { get; set; }
    public bool Green { get; set; }
    public bool HeadEyes { get; set; }
    public bool Humanity { get; set; }
    public bool Khorovod { get; set; }
    public bool Kiba { get; set; }
    public bool Labs { get; set; }
    public bool Lighthouse { get; set; }
    public bool Loot { get; set; }
    public bool Red { get; set; }
    public bool Release { get; set; }
    public bool RFArmy { get; set; }
    public bool Rivals2020 { get; set; }
    public bool SBEU { get; set; }
    public bool Survivor { get; set; }
    public bool TerraGroup { get; set; }
    public bool TrainHard { get; set; }
    public bool Unheard { get; set; }
    public bool Untar { get; set; }
    public bool USEC { get; set; }
    public bool White { get; set; }
    public bool Yellow { get; set; }
    public bool Prestige1 { get; set; }
    public bool Prestige2 { get; set; }
    public bool Prestige3 { get; set; }
    public bool Prestige4 { get; set; }
    public bool Prestige5 { get; set; }
    public bool Prestige6 { get; set; }
}