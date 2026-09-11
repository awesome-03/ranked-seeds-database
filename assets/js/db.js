import { getActiveSet, getDisabledSeeds } from "./collection.js";

let db = null;

export async function initDatabase() {
  try {
    if (typeof initSqlJs !== "function") {
      console.error("SQL.js library is not loaded.");
      return false;
    }
    const SQL = await initSqlJs({
      locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`,
    });

    const response = await fetch("assets/db/seeds.db");
    const arrayBuffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(arrayBuffer));
    console.log("Database successfully initialized.");
    return true;
  } catch (err) {
    console.error("Failed to load SQLite database:", err);
    return false;
  }
}

export function executeQuery(config) {
  if (!db) return [];

  let sql = "SELECT overworld_seed, nether_seed FROM seeds WHERE 1=1";
  const params = [];

  const applyTagGroupFilter = (activeTags, totalPossibleTags) => {
    if (activeTags.length === 0) {
      sql += " AND 1=0";
    } else if (activeTags.length < totalPossibleTags) {
      const clauses = activeTags.map(() => "tags LIKE ?").join(" OR ");
      sql += ` AND (${clauses})`;
      activeTags.forEach((tag) => params.push(`%"${tag}"%`));
    }
  };

  const apply3WayLootFilter = (state, tag) => {
    if (state === "check") {
      sql += " AND tags LIKE ?";
      params.push(`%"${tag}"%`);
    } else if (state === "cross") {
      sql += " AND tags NOT LIKE ?";
      params.push(`%"${tag}"%`);
    }
  };

  // Overworld Type Filter
  if (config.overworld && config.overworld !== "ALL") {
    sql += " AND overworld_type = ?";
    params.push(config.overworld);

    // --- Overworld Sub-Menu Tag Filters ---
    if (config.overworld === "DESERT_TEMPLE" && config.overworldExtras?.desertTemple) {
      const { diamond, egap } = config.overworldExtras.desertTemple.chestLoot || {};
      apply3WayLootFilter(diamond, "DIAMOND");
      apply3WayLootFilter(egap, "EGAP");
    } else if (config.overworld === "BURIED_TREASURE" && config.overworldExtras?.buriedTreasure) {
      const { coldOceans, warmOceans } = config.overworldExtras.buriedTreasure.biome || {};
      const activeTags = [];
      if (coldOceans) activeTags.push("COLD_BIOME");
      if (warmOceans) activeTags.push("WARM_BIOME");
      applyTagGroupFilter(activeTags, 2);
    } else if (config.overworld === "VILLAGE" && config.overworldExtras?.village) {
      const { villageType, chestLoot } = config.overworldExtras.village;
      if (villageType) {
        const activeTags = [];
        if (villageType.plains) activeTags.push("PLAINS_BIOME");
        if (villageType.desert) activeTags.push("DESERT_BIOME");
        if (villageType.savanna) activeTags.push("SAVANNA_BIOME");
        if (villageType.snowy) activeTags.push("SNOWY_TUNDRA_BIOME");
        if (villageType.taiga) activeTags.push("TAIGA_BIOME");
        applyTagGroupFilter(activeTags, 5);
      }
      if (chestLoot) {
        apply3WayLootFilter(chestLoot.diamond, "DIAMOND");
        apply3WayLootFilter(chestLoot.obsidian, "OBSIDIAN");
      }
    } else if (config.overworld === "SHIPWRECK" && config.overworldExtras?.shipwreck) {
      const { shipwreckType, chestLoot, biome } = config.overworldExtras.shipwreck;
      if (shipwreckType) {
        const activeTags = [];
        if (shipwreckType.normal) activeTags.push("NORMAL");
        if (shipwreckType.withMast) activeTags.push("NORMAL_WITH_MAST");
        if (shipwreckType.upsideDown) activeTags.push("UPSIDE_DOWN");
        if (shipwreckType.sideways) activeTags.push("SIDEWAYS");
        applyTagGroupFilter(activeTags, 4);
      }
      if (chestLoot) {
        apply3WayLootFilter(chestLoot.diamond, "DIAMOND");
        apply3WayLootFilter(chestLoot.carrot, "CARROT");
      }
      if (biome) {
        const activeTags = [];
        if (biome.coldOceans) activeTags.push("COLD_BIOME");
        if (biome.warmOceans) activeTags.push("WARM_BIOME");
        applyTagGroupFilter(activeTags, 2);
      }
    } else if (config.overworld === "RUINED_PORTAL" && config.overworldExtras?.ruinedPortal) {
      const { completionType, chestLoot, biome } = config.overworldExtras.ruinedPortal;
      if (completionType) {
        const activeTags = [];
        if (completionType.obsidian) activeTags.push("OBI_COMPLETION");
        if (completionType.bucket) activeTags.push("BUCKET_COMPLETION");
        applyTagGroupFilter(activeTags, 2);
      }
      if (chestLoot) {
        apply3WayLootFilter(chestLoot.looting, "LOOTING");
        apply3WayLootFilter(chestLoot.goldenCarrot, "GARROT");
        apply3WayLootFilter(chestLoot.egap, "EGAP");
      }
      if (biome) {
        const activeTags = [];
        if (biome.beach) activeTags.push("BEACH_BIOME");
        if (biome.birchForest) activeTags.push("BIRCH_FOREST_BIOME");
        if (biome.forest) activeTags.push("FOREST_BIOME");
        if (biome.frozenRiver) activeTags.push("FROZEN_RIVER_BIOME");
        if (biome.plains) activeTags.push("PLAINS_BIOME");
        if (biome.river) activeTags.push("RIVER_BIOME");
        if (biome.savanna) activeTags.push("SAVANNA_BIOME");
        if (biome.snowyBeach) activeTags.push("SNOWY_BEACH_BIOME");
        if (biome.snowyTundra) activeTags.push("SNOWY_TUNDRA_BIOME");
        if (biome.sunflowerPlains) activeTags.push("SUNFLOWER_PLAINS_BIOME");
        applyTagGroupFilter(activeTags, 10);
      }
    }
  }

  // Bastion Type Filter
  if (config.bastion && config.bastion !== "ALL") {
    sql += " AND bastion_type = ?";
    params.push(config.bastion);

    // --- Bastion Sub-Menu Tag Filters ---
    if (config.bastion === "BRIDGE" && config.bastionExtras?.bridge) {
      const { doubleSingle, singleTriple, doubleTriple } = config.bastionExtras.bridge.rampartType || {};
      const activeTags = [];
      if (doubleSingle) activeTags.push("DOUBLE_SINGLE");
      if (singleTriple) activeTags.push("SINGLE_TRIPLE");
      if (doubleTriple) activeTags.push("DOUBLE_TRIPLE");

      if (activeTags.length === 0) {
        sql += " AND 1=0";
      } else if (activeTags.length < 3) {
        const clauses = activeTags.map(() => "tags LIKE ?").join(" OR ");
        sql += ` AND (${clauses})`;
        activeTags.forEach((tag) => params.push(`%"${tag}"%`));
      }
    } else if (config.bastion === "HOUSING" && config.bastionExtras?.housing) {
      const { ruin, single, triple } = config.bastionExtras.housing.rampartType || {};
      const activeTags = [];
      if (ruin) activeTags.push("RUIN");
      if (single) activeTags.push("SINGLE");
      if (triple) activeTags.push("TRIPLE");

      if (activeTags.length === 0) {
        sql += " AND 1=0";
      } else if (activeTags.length < 3) {
        const clauses = activeTags.map(() => "tags LIKE ?").join(" OR ");
        sql += ` AND (${clauses})`;
        activeTags.forEach((tag) => params.push(`%"${tag}"%`));
      }
    } else if (config.bastion === "STABLES" && config.bastionExtras?.stables) {
      const { rampartTypeEnabled, rampartType, gapType } = config.bastionExtras.stables;

      if (gapType) {
        const activeGapTags = [];
        if (gapType.singleGoodGap) activeGapTags.push("SINGLE_GOOD_GAP");
        if (gapType.doubleGoodGap) activeGapTags.push("DOUBLE_GOOD_GAP");

        if (activeGapTags.length === 0) {
          sql += " AND 1=0";
        } else if (activeGapTags.length < 2) {
          const clauses = activeGapTags.map(() => "tags LIKE ?").join(" OR ");
          sql += ` AND (${clauses})`;
          activeGapTags.forEach((tag) => params.push(`%"${tag}"%`));
        }
      }

      // Rampart Type (SINGLE_X, DOUBLE_X, TRIPLE_X)
      if (rampartTypeEnabled && rampartType) {
        if (rampartType.single > 0) {
          sql += " AND tags LIKE ?";
          params.push(`%"SINGLE_${rampartType.single}"%`);
        }
        if (rampartType.double > 0) {
          sql += " AND tags LIKE ?";
          params.push(`%"DOUBLE_${rampartType.double}"%`);
        }
        if (rampartType.triple > 0) {
          sql += " AND tags LIKE ?";
          params.push(`%"TRIPLE_${rampartType.triple}"%`);
        }
      }
    }
  }

  // Bastion Biome Filter
  if (config.bastionBiome && config.bastionBiome !== "ALL") {
    sql += " AND tags LIKE ?";
    params.push(`%"${config.bastionBiome}_BASTION"%`);
  }

  // Fortress Biome Filter
  if (config.fortressBiome && config.fortressBiome !== "ALL") {
    sql += " AND tags LIKE ?";
    params.push(`%"${config.fortressBiome}_FORT"%`);
  }

  // End Spawn Filter
  if (config.endSpawn && config.endSpawn !== "ALL") {
    if (config.endSpawn === "BURIED_PLATFORM" && config.endSpawnRange) {
      const { min, max } = config.endSpawnRange;
      const buriedTags = [];
      for (let y = min; y <= max; y++) {
        buriedTags.push(`BURIED_${y}_PLATFORM`);
      }
      if (buriedTags.length > 0) {
        const clauses = buriedTags.map(() => "tags LIKE ?").join(" OR ");
        sql += ` AND (${clauses})`;
        buriedTags.forEach((tag) => params.push(`%"${tag}"%`));
      }
    } else if (config.endSpawn !== "BURIED_PLATFORM") {
      sql += " AND tags LIKE ?";
      params.push(`%"${config.endSpawn}"%`);
    }
  }

//   sql += " LIMIT 100;";

  console.log("Executing SQL Query:", sql, "Parameters:", params);

  try {
    return db.exec(sql, params);
  } catch (err) {
    console.error("Database query execution failed:", err);
    return [];
  }
}

let cachedSearchResults = null;
let currentDisplayLimit = 50;

// Show the database query results
export function renderSeedResults(results, isShowMore = false) {
  if (results !== undefined) {
    cachedSearchResults = results;
  }
  const targetResults = results !== undefined ? results : cachedSearchResults;

  if (!isShowMore) {
    currentDisplayLimit = 50;
  }

  const dataList = document.querySelector(".data-list");
  if (!dataList) return;

  dataList.innerHTML = "";

  if (!targetResults || targetResults.length === 0 || !targetResults[0].values || targetResults[0].values.length === 0) {
    dataList.innerHTML = `
      <div class="data-row-empty" style="text-align: center; padding: 2rem; color: var(--text-muted);">
        No seeds found with these filter settings.
      </div>
    `;
    return;
  }

  const rows = targetResults[0].values;
  const activeSet = getActiveSet();
  const savedSeeds = activeSet && activeSet.seeds ? activeSet.seeds : [];
  const disabledSeeds = getDisabledSeeds();

  let count = 0;
  let renderedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const [owSeed, netherSeed] = rows[i];
    const cleanOw = String(owSeed).replace(/^'|'$/g, "");
    const cleanNether = String(netherSeed).replace(/^'|'$/g, "");

    if (disabledSeeds.some((s) => s.owSeed === cleanOw && s.netherSeed === cleanNether)) continue;

    count++;
    if (renderedCount >= currentDisplayLimit) continue;

    renderedCount++;
    const savedSeedObj = savedSeeds.find((s) => s.owSeed === cleanOw && s.netherSeed === cleanNether);
    const notesVal = savedSeedObj && savedSeedObj.notes ? savedSeedObj.notes : "";
    const rowDiv = document.createElement("div");
    rowDiv.className = "data-row";
    rowDiv.innerHTML = `
      <input type="checkbox">
      <p class="ow-seed">${escapeHtml(cleanOw)}</p>
      <p class="nether-seed">${escapeHtml(cleanNether)}</p>
      <input type="text" name="notes" class="notes-box" value="${escapeHtml(notesVal)}"></input>
    `;
    dataList.appendChild(rowDiv);
  }

  if (count === 0) {
    dataList.innerHTML = `
      <div class="data-row-empty" style="text-align: center; padding: 2rem; color: var(--text-muted);">
        No seeds found with these filter settings.
      </div>
    `;
  } else if (count > renderedCount) {
    const showMoreBtn = document.createElement("button");
    showMoreBtn.id = "show-more-seeds-btn";
    showMoreBtn.textContent = `Show more (${renderedCount} of ${count.toLocaleString()})`;

    showMoreBtn.addEventListener("click", () => {
      currentDisplayLimit += 50;
      renderSeedResults(undefined, true);
    });

    dataList.appendChild(showMoreBtn);
  }
  if (typeof window.updateTrashButtonState === "function") {
    window.updateTrashButtonState();
  }
}

export function renderSavedSearchResults() {
  renderSeedResults(cachedSearchResults);
}
window.renderSavedSearchResults = renderSavedSearchResults;

// Render seeds inside a set
export function renderSetSeeds(set) {
  const dataList = document.querySelector(".data-list");
  if (!dataList) return;

  dataList.innerHTML = "";

  if (!set || !set.seeds || set.seeds.length === 0) {
    dataList.innerHTML = `
      <div class="data-row-empty" style="text-align: center; padding: 2rem; color: var(--text-muted);">
        No seeds saved in "${escapeHtml(set ? set.name : "this set")}" yet. Check seeds in search results to save them here!
      </div>
    `;
    if (typeof window.updateTrashButtonState === "function") {
      window.updateTrashButtonState();
    }
    return;
  }

  set.seeds.forEach((seed) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "data-row";
    rowDiv.innerHTML = `
      <input type="checkbox">
      <p class="ow-seed">${escapeHtml(seed.owSeed)}</p>
      <p class="nether-seed">${escapeHtml(seed.netherSeed)}</p>
      <input type="text" name="notes" class="notes-box" value="${escapeHtml(seed.notes || "")}"></input>
    `;
    dataList.appendChild(rowDiv);
  });

  if (typeof window.updateTrashButtonState === "function") {
    window.updateTrashButtonState();
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
