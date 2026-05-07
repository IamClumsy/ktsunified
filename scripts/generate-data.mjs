/**
 * Pre-generates all calculator JSON data from Excel source files.
 * Run via: npm run generate
 * Also runs automatically before next build (prebuild hook).
 *
 * Output: public/data/{calc-tables,svs-tables,ceo-tables}.json
 */

import XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "public", "data");

fs.mkdirSync(OUT, { recursive: true });

function write(name, data) {
  const dest = path.join(OUT, `${name}.json`);
  fs.writeFileSync(dest, JSON.stringify(data));
  console.log(`  ✓ ${name}.json`);
}

// ─── CALC TABLES ─────────────────────────────────────────────────────────────

function generateCalcTables() {
  const filePath = path.join(SRC, "apex girl calculator.xlsx");
  const artistXpModsPath = path.join(SRC, "artistxpmods.xlsx");
  if (!fs.existsSync(filePath)) { console.warn(`  ⚠ skip calc-tables: file not found`); return; }

  const RANGES = {
    glass:      { colStart: 0,   colEnd: 3,   maxRows: 603 },
    gems:       { colStart: 3,   colEnd: 6,   maxRows: 53  },
    carParts:   { colStart: 6,   colEnd: 11,  maxRows: 36  },
    villa:      { colStart: 11,  colEnd: 16,  maxRows: 41  },
    carRanks:   { colStart: 16,  colEnd: 18,  maxRows: 7   },
    floors:     { colStart: 59,  colEnd: 70,  maxRows: 63  },
    exhibits:   { colStart: 70,  colEnd: 81,  maxRows: 63  },
    carCore:    { colStart: 81,  colEnd: 92,  maxRows: 63  },
    homemaking: { colStart: 92,  colEnd: 103, maxRows: 63  },
    artists:    { colStart: 103, colEnd: 108, maxRows: 143 },
    assets:     { colStart: 122, colEnd: 132, maxRows: 62  },
    assetTypes: { colStart: 108, colEnd: 111, maxRows: 5   },
    sacrifices: { colStart: 132, colEnd: 135, maxRows: 63  },
  };

  function extractRange(data, { colStart, colEnd, maxRows }) {
    const headerRow = data[1];
    const headers = [];
    for (let c = colStart; c < colEnd; c++) {
      const v = headerRow?.[c];
      headers.push(v != null ? String(v) : null);
    }
    const rows = [];
    for (let r = 2; r < Math.min(data.length, maxRows + 2); r++) {
      const srcRow = data[r];
      if (!srcRow) continue;
      const first = srcRow[colStart];
      if (first == null || first === "") continue;
      const row = [];
      for (let c = colStart; c < colEnd; c++) row.push(srcRow[c] ?? null);
      rows.push(row);
    }
    return { headers, data: rows };
  }

  const fileBuffer = fs.readFileSync(filePath);
  const wb = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
  const ws = wb.Sheets["Tables"];
  if (!ws) { console.warn(`  ⚠ skip calc-tables: "Tables" sheet not found`); return; }
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const result = {};
  for (const [name, rangeDef] of Object.entries(RANGES)) {
    result[name] = extractRange(raw, rangeDef);
  }

  // Override glass from dedicated Glass sheet
  const glassWs = wb.Sheets["Glass"];
  if (glassWs) {
    const glassRaw = XLSX.utils.sheet_to_json(glassWs, { header: 1 });
    const glassData = [];
    let accumulated = 0;
    for (let r = 2; r < glassRaw.length; r++) {
      const row = glassRaw[r];
      if (!Array.isArray(row)) continue;
      const level = row[0];
      if (typeof level !== "number") continue;
      const cost = typeof row[1] === "number" ? row[1] : 0;
      accumulated += cost;
      glassData.push([level - 1, cost || null, accumulated]);
    }
    if (glassData.length > 0) result.glass = { headers: result.glass?.headers ?? [], data: glassData };
  }

  // Extend artist data from Artist sheet
  const artistWs = wb.Sheets["Artist"];
  if (artistWs && result.artists) {
    const artistRaw = XLSX.utils.sheet_to_json(artistWs, { header: 1 });
    const expByLevel = new Map();
    for (const row of artistRaw) {
      if (Array.isArray(row) && typeof row[0] === "number" && typeof row[1] === "number") {
        expByLevel.set(row[0], row[1]);
      }
    }
    const promAccumByLevel = new Map();
    for (const row of artistRaw) {
      if (!Array.isArray(row)) continue;
      const rangeStr = row[3];
      const promAccum = row[7];
      if (typeof rangeStr !== "string" || typeof promAccum !== "number") continue;
      const match = rangeStr.match(/^(\d+)\s+to\s+(\d+)$/);
      if (!match) continue;
      const rangeStart = parseInt(match[1]);
      const rangeEnd = parseInt(match[2]);
      for (let level = rangeStart - 1; level <= rangeEnd - 1; level++) {
        promAccumByLevel.set(level, promAccum);
      }
    }
    if (expByLevel.size > 0) {
      let baseLevel = -1;
      let baseExpAccum = 0;
      for (const row of result.artists.data) {
        const lvl = row[0];
        const accum = row[2];
        if (typeof lvl === "number" && typeof accum === "number" && lvl > baseLevel) {
          baseLevel = lvl;
          baseExpAccum = accum;
        }
      }
      result.artists.data = result.artists.data.filter(
        (row) => typeof row[0] === "number" && typeof row[2] === "number"
      );
      const maxLevel = Math.max(...expByLevel.keys());
      let expAccum = baseExpAccum;
      for (let level = baseLevel + 1; level < maxLevel; level++) {
        const expCard = expByLevel.get(level + 1);
        if (expCard == null) break;
        expAccum += expCard;
        const promAccum = promAccumByLevel.get(level) ?? 0;
        result.artists.data.push([level, expCard, expAccum, null, promAccum]);
      }
    }
  }

  // Extend assets and sacrifices from Assets sheet
  const assetWs = wb.Sheets["Assets"];
  if (assetWs && result.assets && result.sacrifices) {
    const assetRaw = XLSX.utils.sheet_to_json(assetWs, { header: 1 });
    const assetsByLevel = new Map();
    for (const row of assetRaw) {
      if (!Array.isArray(row) || typeof row[0] !== "number" || typeof row[1] !== "number") continue;
      assetsByLevel.set(row[0], [row[1], row[2], row[3], row[6], row[7], row[8], 0, row[11], row[12]]);
    }
    result.assets.data = result.assets.data.filter(
      (row) => typeof row[0] === "number" && typeof row[1] === "number"
    );
    let assetBaseLevel = -1;
    const assetAccum = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const row of result.assets.data) {
      const lvl = row[0];
      if (typeof lvl === "number" && lvl > assetBaseLevel && typeof row[1] === "number") {
        assetBaseLevel = lvl;
        for (let i = 0; i < 9; i++) assetAccum[i] = row[i + 1] ?? 0;
      }
    }
    const promotionCosts = new Map();
    for (const row of assetRaw) {
      if (Array.isArray(row) && typeof row[14] === "number" && typeof row[16] === "number") {
        promotionCosts.set(row[14], row[16]);
      }
    }
    result.sacrifices.data = result.sacrifices.data.filter(
      (row) => typeof row[0] === "number" && typeof row[2] === "number"
    );
    let sacrifBaseLevel = -1;
    let sacrifAccum = 0;
    for (const row of result.sacrifices.data) {
      const lvl = row[0];
      if (typeof lvl === "number" && lvl > sacrifBaseLevel && typeof row[2] === "number") {
        sacrifBaseLevel = lvl;
        sacrifAccum = row[2];
      }
    }
    const maxAssetLevel = Math.max(...assetsByLevel.keys());
    for (let level = assetBaseLevel + 1; level <= maxAssetLevel; level++) {
      const perLevel = assetsByLevel.get(level);
      if (!perLevel) break;
      for (let i = 0; i < 9; i++) assetAccum[i] += perLevel[i];
      result.assets.data.push([level, ...assetAccum]);
      if (level > sacrifBaseLevel) {
        if (promotionCosts.has(level)) sacrifAccum += promotionCosts.get(level);
        result.sacrifices.data.push([level, null, sacrifAccum]);
      }
    }
  }

  // Parse Others sheet (HQ Building Cards + Business Building Gold)
  const othersWs = wb.Sheets["Others"];
  if (othersWs) {
    const othersRaw = XLSX.utils.sheet_to_json(othersWs, { header: 1 });
    const cardsData = [];
    const goldData = [];
    for (let r = 2; r < othersRaw.length; r++) {
      const row = othersRaw[r];
      if (!Array.isArray(row)) continue;
      if (typeof row[0] === "number" && typeof row[2] === "number") cardsData.push([row[0] - 1, row[1] ?? null, row[2]]);
      if (typeof row[4] === "number" && typeof row[6] === "number") goldData.push([row[4] - 1, row[5] ?? null, row[6]]);
    }
    if (cardsData.length > 0) result.buildingCards = { headers: ["Level", "Cards", "Accum"], data: cardsData };
    if (goldData.length > 0) result.buildingGold = { headers: ["Level", "Gold", "Accum"], data: goldData };
  }

  // Parse Blueprints sheet
  const blueprintsWs = wb.Sheets["Blueprints"];
  if (blueprintsWs) {
    const bpRaw = XLSX.utils.sheet_to_json(blueprintsWs, { header: 1 });
    const tierHeaders = bpRaw[1]?.slice(1, 12).map((v) => String(v)) ?? [];
    const tierAccum = new Array(11).fill(0);
    for (let r = 2; r < bpRaw.length; r++) {
      const row = bpRaw[r];
      if (!Array.isArray(row)) continue;
      if (typeof row[0] === "string") break;
      for (let t = 0; t < 11; t++) {
        if (typeof row[t + 1] === "number") tierAccum[t] += row[t + 1];
      }
    }
    result.blueprintsMain = { headers: ["Tier", "Total Cost"], data: tierHeaders.map((h, i) => [h, tierAccum[i]]) };

    let battleDataStart = -1;
    let expansionDataStart = -1;
    for (let r = 0; r < bpRaw.length; r++) {
      const row = bpRaw[r];
      if (!Array.isArray(row)) continue;
      if (typeof row[0] === "string" && row[0].includes("GROUP BATTLE")) battleDataStart = r + 2;
      if (typeof row[0] === "string" && row[0].includes("EXPANSION")) expansionDataStart = r + 2;
    }
    const parseMasterSection = (startRow) => {
      const rows = [];
      let accum = 0;
      for (let r = startRow; r < bpRaw.length; r++) {
        const row = bpRaw[r];
        if (!Array.isArray(row) || typeof row[0] !== "number") break;
        const levelCost = row.slice(1, 12).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0);
        accum += levelCost;
        rows.push([row[0], levelCost, accum]);
      }
      return rows;
    };
    if (battleDataStart >= 0) {
      const data = parseMasterSection(battleDataStart);
      if (data.length) result.blueprintsBattle = { headers: ["Level", "Cost", "Accum"], data };
    }
    if (expansionDataStart >= 0) {
      const data = parseMasterSection(expansionDataStart);
      if (data.length) result.blueprintsExpansion = { headers: ["Level", "Cost", "Accum"], data };
    }
  }

  // Parse CEO Sports from Floors sheet (columns 41–48)
  const floorsWs = wb.Sheets["Floors,Exhibits,Homemaking,CarC"];
  if (floorsWs) {
    const floorsRaw = XLSX.utils.sheet_to_json(floorsWs, { header: 1 });
    const sportsData = [];
    const accum = [0, 0, 0, 0, 0, 0, 0, 0];
    for (const row of floorsRaw) {
      if (!Array.isArray(row) || typeof row[0] !== "number") continue;
      for (let i = 0; i < 8; i++) accum[i] += typeof row[41 + i] === "number" ? row[41 + i] : 0;
      sportsData.push([row[0] - 1, ...accum]);
    }
    if (sportsData.length > 0) {
      result.ceoSports = {
        headers: ["Level", "T1 Drink", "T1 Bar", "T2 Drink", "T2 Bar", "T3 Drink", "T3 Bar", "T4 HQ Drink", "T4 HQ Bar"],
        data: sportsData,
      };
    }
  }

  // Parse CEO Outfit sheet
  const ceoOutfitWs = wb.Sheets["CEO Outfit"];
  if (ceoOutfitWs) {
    const outfitRaw = XLSX.utils.sheet_to_json(ceoOutfitWs, { header: 1 });
    const outfitData = [];
    let lastAppearance = "";
    for (let r = 2; r < outfitRaw.length; r++) {
      const row = outfitRaw[r];
      if (!Array.isArray(row) || row.every((v) => v == null || v === "")) break;
      const appearance = row[0] != null && row[0] !== "" ? String(row[0]) : lastAppearance;
      lastAppearance = appearance;
      const goldCrowns = typeof row[2] === "number" ? row[2] : 0;
      const label = appearance === "Essential" ? "Essential" : `${appearance} GC${goldCrowns}`;
      outfitData.push([label, typeof row[5] === "number" ? row[5] : 0, typeof row[6] === "number" ? row[6] : 0, typeof row[11] === "number" ? row[11] : 0]);
    }
    result.ceoOutfit = { headers: ["Step", "Bank Cards per Item", "Droids", "Crown Cards"], data: outfitData };
  }

  // Override SSS2-SSS5 car parts from dedicated Car Parts sheet
  const carPartsSheetWs = wb.Sheets["Car Parts"];
  if (carPartsSheetWs && result.carParts) {
    const cpRaw = XLSX.utils.sheet_to_json(carPartsSheetWs, { header: 1 });
    const toStars = (v) => typeof v === "string" ? v.length : 0;
    let partsAccum = 0;
    let drawingsAccum = 0;
    for (const row of result.carParts.data) {
      if (String(row[0]) === "SSS1") {
        partsAccum = typeof row[2] === "number" ? row[2] : 0;
        drawingsAccum = typeof row[4] === "number" ? row[4] : 0;
        break;
      }
    }
    const newRows = [];
    for (const row of cpRaw) {
      if (!Array.isArray(row) || String(row[0]) !== "SSS") continue;
      const n = toStars(row[1]);
      if (n === 0 || n >= 5) continue;
      const parts = typeof row[8] === "number" ? row[8] : 0;
      const drawings = typeof row[12] === "number" ? row[12] : 0;
      partsAccum += parts;
      drawingsAccum += drawings;
      newRows.push([`SSS${n + 1}`, parts, partsAccum, drawings, drawingsAccum]);
    }
    if (newRows.length > 0) {
      result.carParts.data = [
        ...result.carParts.data.filter((row) => !/^SSS[2-9]/.test(String(row[0]))),
        ...newRows,
      ];
    }
  }

  // Load artist XP modifiers
  if (fs.existsSync(artistXpModsPath)) {
    const modsBuffer = fs.readFileSync(artistXpModsPath);
    const modsWb = XLSX.read(modsBuffer, { type: "buffer" });
    const modsWs = modsWb.Sheets[modsWb.SheetNames[0]];
    if (modsWs) {
      const modsRaw = XLSX.utils.sheet_to_json(modsWs, { header: 1 });
      const modsData = [];
      for (const row of modsRaw) {
        if (!Array.isArray(row)) continue;
        const name = row[0];
        const mod = row[1];
        if (typeof name === "string" && name !== "" && typeof mod === "number") modsData.push([name, mod]);
      }
      modsData.sort((a, b) => a[0].localeCompare(b[0]));
      result.artistMods = { headers: ["Artist", "Modifier"], data: modsData };
    }
  }

  write("calc-tables", result);
}

// ─── SVS TABLES ──────────────────────────────────────────────────────────────

function generateSvsTables() {
  const filePath = path.join(SRC, "SVS Store Calculator.xlsx");
  if (!fs.existsSync(filePath)) { console.warn(`  ⚠ skip svs-tables: file not found`); return; }

  function parseShop(ws) {
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const title = String(raw[0]?.[0] ?? "");
    const items = [];
    let foundData = false;
    for (const row of raw) {
      if (!Array.isArray(row)) continue;
      const col0 = String(row[0] ?? "").toLowerCase();
      if (col0 === "yes" || col0 === "no") foundData = true;
      if (!foundData) continue;
      const itemName = row[1];
      if (itemName == null || itemName === "") continue;
      items.push({
        inCart: col0 === "yes",
        item: String(itemName),
        quantity: typeof row[2] === "number" ? row[2] : Number(row[2]) || 0,
        price: typeof row[3] === "number" ? row[3] : Number(row[3]) || 0,
      });
    }
    return { title, items };
  }

  const fileBuffer = fs.readFileSync(filePath);
  const wb = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
  const result = {};
  for (const sheetName of ["GOLD", "SILVER", "BRONZE"]) {
    if (wb.Sheets[sheetName]) result[sheetName] = parseShop(wb.Sheets[sheetName]);
  }
  write("svs-tables", result);
}

// ─── CEO TABLES ──────────────────────────────────────────────────────────────

function generateCeoTables() {
  const filePath = path.join(SRC, "EventScoring.xlsx");
  if (!fs.existsSync(filePath)) { console.warn(`  ⚠ skip ceo-tables: file not found`); return; }

  const LEFT     = { category: 0,  task: 1,  points: 2,  used: 3  };
  const RIGHT    = { category: 6,  task: 7,  points: 8,  used: 9  };
  const WARM_UP  = { category: 12, task: 13, points: 14, used: 15 };
  const TRAVELER = { category: 18, task: 19, points: 20, used: 21 };

  const TOTAL_LABELS = new Set(["total", "approximate total for all days"]);

  function parseEvent(raw, cols, eventName) {
    const categories = [];
    let currentCategory = "";
    let currentTasks = [];
    for (let i = 5; i < raw.length; i++) {
      const row = raw[i];
      if (!Array.isArray(row)) continue;
      const taskCell = String(row[cols.task] ?? "").trim();
      if (TOTAL_LABELS.has(taskCell.toLowerCase())) continue;
      if (!taskCell) continue;
      const catCell = String(row[cols.category] ?? "").trim();
      if (catCell && catCell !== currentCategory) {
        if (currentCategory && currentTasks.length > 0) categories.push({ name: currentCategory, tasks: currentTasks });
        currentCategory = catCell;
        currentTasks = [];
      }
      const points = typeof row[cols.points] === "number" ? row[cols.points] : Number(row[cols.points]) || 0;
      const usedRaw = row[cols.used];
      const used = typeof usedRaw === "number" ? usedRaw : (usedRaw != null && usedRaw !== "" ? Number(usedRaw) || 0 : 0);
      currentTasks.push({ task: taskCell, points, used });
    }
    if (currentCategory && currentTasks.length > 0) categories.push({ name: currentCategory, tasks: currentTasks });
    return { name: eventName, categories };
  }

  const fileBuffer = fs.readFileSync(filePath);
  const wb = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
  const ws = wb.Sheets["Sheet1"];
  if (!ws) { console.warn(`  ⚠ skip ceo-tables: "Sheet1" not found`); return; }
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const result = {
    events: [
      parseEvent(raw, LEFT,     "Top CEO Event"),
      parseEvent(raw, RIGHT,    "Ultimate CEO Event"),
      parseEvent(raw, WARM_UP,  "Warm Up Event"),
      parseEvent(raw, TRAVELER, "Ultimate Traveler"),
    ],
  };
  write("ceo-tables", result);
}

// ─── RUN ──────────────────────────────────────────────────────────────────────

console.log("Generating static data files…");
generateCalcTables();
generateSvsTables();
generateCeoTables();
console.log("Done.");
