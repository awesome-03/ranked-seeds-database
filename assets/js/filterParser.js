export function getFilterConfiguration() {
  const endSpawnValue = document.getElementById("end-spawns")?.value || "ALL";
  let endSpawnRange = null;

  if (endSpawnValue === "BURIED_PLATFORM") {
    const r1 = document.getElementById("buried-range-1");
    const r2 = document.getElementById("buried-range-2");
    const v1 = r1 ? parseInt(r1.value, 10) : 52;
    const v2 = r2 ? parseInt(r2.value, 10) : 61;
    endSpawnRange = {
      min: Math.min(v1, v2),
      max: Math.max(v1, v2),
    };
  }

  const config = {
    // Primary Dropdowns
    overworld: document.getElementById("overworlds")?.value || "ALL",
    bastion: document.getElementById("bastions")?.value || "ALL",
    bastionBiome: document.getElementById("bastion-biomes")?.value || "ALL",
    fortressBiome: document.getElementById("fortress-biomes")?.value || "ALL",
    endSpawn: endSpawnValue,
    endSpawnRange: endSpawnRange,

    overworldExtras: {},
    bastionExtras: {},
  };

  const get2WayState = (containerSelector, labelText) => {
    const container = document.querySelector(containerSelector);
    if (!container) return false;
    const items = Array.from(container.querySelectorAll(".expandable-content-wrapper > div"));
    for (const div of items) {
      const label = div.querySelector("label");
      if (label && label.textContent.trim().toLowerCase() === labelText.toLowerCase()) {
        const checkbox = div.querySelector("input[type='checkbox']");
        return checkbox ? checkbox.checked : false;
      }
    }
    return false;
  };

  const get3WayState = (containerSelector, inputName) => {
    const sw = document.querySelector(`${containerSelector} input[name='${inputName}']`)?.parentElement;
    return sw ? sw.getAttribute("data-state") || "neutral" : "neutral";
  };

  // Parse Overworld Extras
  if (config.overworld === "SHIPWRECK") {
    config.overworldExtras.shipwreck = {
      shipwreckType: {
        normal: get2WayState("#shipwreck-type-content", "Normal"),
        withMast: get2WayState("#shipwreck-type-content", "With Mast"),
        upsideDown: get2WayState("#shipwreck-type-content", "Upside Down"),
        sideways: get2WayState("#shipwreck-type-content", "Sideways"),
      },
      chestLoot: {
        diamond: get3WayState("#chest-loot-type-content", "diamond"),
        carrot: get3WayState("#chest-loot-type-content", "carrot"),
      },
      biome: {
        coldOceans: get2WayState("#biome-type-content", "Cold Oceans"),
        warmOceans: get2WayState("#biome-type-content", "Warm Oceans"),
      },
    };
  } else if (config.overworld === "DESERT_TEMPLE") {
    config.overworldExtras.desertTemple = {
      chestLoot: {
        diamond: get3WayState("#dt-chest-loot-content", "dt_diamond"),
        egap: get3WayState("#dt-chest-loot-content", "dt_egap"),
      },
    };
  } else if (config.overworld === "BURIED_TREASURE") {
    config.overworldExtras.buriedTreasure = {
      biome: {
        coldOceans: get2WayState("#bt-biome-content", "Cold Oceans"),
        warmOceans: get2WayState("#bt-biome-content", "Warm Oceans"),
      },
    };
  } else if (config.overworld === "VILLAGE") {
    config.overworldExtras.village = {
      villageType: {
        plains: get2WayState("#village-type-content", "Plains Village"),
        desert: get2WayState("#village-type-content", "Desert Village"),
        savanna: get2WayState("#village-type-content", "Savanna Village"),
        snowy: get2WayState("#village-type-content", "Snowy Village"),
        taiga: get2WayState("#village-type-content", "Taiga Village"),
      },
      chestLoot: {
        diamond: get3WayState("#village-chest-loot-content", "v_diamond"),
        obsidian: get3WayState("#village-chest-loot-content", "v_obsidian"),
      },
    };
  } else if (config.overworld === "RUINED_PORTAL") {
    config.overworldExtras.ruinedPortal = {
      completionType: {
        obsidian: get2WayState("#rp-completion-content", "Obsidian"),
        bucket: get2WayState("#rp-completion-content", "Bucket"),
      },
      chestLoot: {
        looting: get3WayState("#rp-chest-loot-content", "rp_looting"),
        goldenCarrot: get3WayState("#rp-chest-loot-content", "rp_golden_carrot"),
        egap: get3WayState("#rp-chest-loot-content", "rp_egap"),
      },
      biome: {
        beach: get2WayState("#rp-biome-content", "Beach"),
        birchForest: get2WayState("#rp-biome-content", "Birch Forest"),
        forest: get2WayState("#rp-biome-content", "Forest"),
        frozenRiver: get2WayState("#rp-biome-content", "Frozen River"),
        plains: get2WayState("#rp-biome-content", "Plains"),
        river: get2WayState("#rp-biome-content", "River"),
        savanna: get2WayState("#rp-biome-content", "Savanna"),
        snowyBeach: get2WayState("#rp-biome-content", "Snowy Beach"),
        snowyTundra: get2WayState("#rp-biome-content", "Snowy Tundra"),
        sunflowerPlains: get2WayState("#rp-biome-content", "Sunflower Plains"),
      },
    };
  }

  // Parse Bastion Extras
  if (config.bastion === "BRIDGE") {
    config.bastionExtras.bridge = {
      rampartType: {
        doubleSingle: get2WayState("#bridge-rampart-type-content", "Double Single"),
        singleTriple: get2WayState("#bridge-rampart-type-content", "Single Triple"),
        doubleTriple: get2WayState("#bridge-rampart-type-content", "Double Triple"),
      },
    };
  } else if (config.bastion === "STABLES") {
    const stablesRampartCheckbox = document.querySelector("#stables-rampart-toggle input[type='checkbox']");
    const rampartTypeEnabled = stablesRampartCheckbox ? stablesRampartCheckbox.checked : false;

    const get4WayNumState = (inputName) => {
      const sw = document.querySelector(`#stables-rampart-type-content input[name='${inputName}']`)?.parentElement;
      return sw ? parseInt(sw.getAttribute("data-state") || "1", 10) : 1;
    };

    config.bastionExtras.stables = {
      rampartTypeEnabled,
      rampartType: rampartTypeEnabled
        ? {
            single: get4WayNumState("stables_rampart_single"),
            double: get4WayNumState("stables_rampart_double"),
            triple: get4WayNumState("stables_rampart_triple"),
          }
        : null,
      gapType: {
        singleGoodGap: get2WayState("#stables-gap-type-content", "Single Good Gap"),
        doubleGoodGap: get2WayState("#stables-gap-type-content", "Double Good Gap"),
      },
    };
  } else if (config.bastion === "HOUSING") {
    config.bastionExtras.housing = {
      rampartType: {
        ruin: get2WayState("#rampart-type-content", "Ruin"),
        single: get2WayState("#rampart-type-content", "Single"),
        triple: get2WayState("#rampart-type-content", "Triple"),
      },
    };
  }

  return config;
}
