﻿using BepInEx;
using EFT.InventoryLogic;
using Aki.Reflection;
using Aki.Reflection.Patching;
using System.Reflection;

namespace Shield
{
    [BepInPlugin("com.jbs4bmx.HoltzmanShield", "HoltzmanShield", "320.0.1")]
    public class Shield : BaseUnityPlugin
    {
        private void Main()
        {
            // Plugin startup logic
            Logger.LogInfo("HoltzmanShield v320.0.1 is loading...");
            AddArmBandArmorSlot();
            Logger.LogInfo("HoltzmanShield v320.0.1 has loaded!");
        }

        // Patch
        public void AddArmBandArmorSlot()
        {
            var bindingFlags = BindingFlags.Instance | BindingFlags.Static | BindingFlags.NonPublic | BindingFlags.Public;
            var field = typeof(InventoryClass).GetField("ArmorSlots", bindingFlags);

            field.SetValue(null, new EquipmentSlot[]
            {
                EquipmentSlot.TacticalVest,
                EquipmentSlot.ArmorVest,
                EquipmentSlot.Headwear,
                EquipmentSlot.FaceCover,
                EquipmentSlot.Eyewear,
                EquipmentSlot.ArmBand
            });
        }
    }
}
