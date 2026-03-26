import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

type RangeDef = { colStart: number; colEnd: number; maxRows: number };

const RANGES: Record<string, RangeDef> = {
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

function extractRange(
  data: unknown[][],
  { colStart, colEnd, maxRows }: RangeDef
): { headers: (string | null)[]; data: unknown[][] } {
  const headerRow = data[1];
  const headers: (string | null)[] = [];
  for (let c = colStart; c < colEnd; c++) {
    const v = headerRow?.[c];
    headers.push(v != null ? String(v) : null);
  }

  const rows: unknown[][] = [];
  for (let r = 2; r < Math.min(data.length, maxRows + 2); r++) {
    const srcRow = data[r];
    if (!srcRow) continue;
    const first = srcRow[colStart];
    if (first == null || first === "") continue;
    const row: unknown[] = [];
    for (let c = colStart; c < colEnd; c++) {
      row.push(srcRow[c] ?? null);
    }
    rows.push(row);
  }
  return { headers, data: rows };
}

export async function GET() {
  try {
    const dataFilePath = path.join(process.cwd(), "src", "data", "apex girl calculator.xlsx");
    const legacyFilePath = path.join(process.cwd(), "src", "apex girl calculator.xlsx");
    const filePath = fs.existsSync(dataFilePath) ? dataFilePath : legacyFilePath;
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Workbook not found" }, { status: 500 });
    }
    const fileBuffer = await fs.promises.readFile(filePath);
    const wb = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
    const ws = wb.Sheets["Tables"];
    if (!ws) {
      return NextResponse.json({ error: "Tables sheet not found" }, { status: 500 });
    }
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];

    const result: Record<string, { headers: (string | null)[]; data: unknown[][] }> = {};
    for (const [name, rangeDef] of Object.entries(RANGES)) {
      result[name] = extractRange(raw, rangeDef);
    }

    // Override glass data from dedicated Glass sheet if available
    const glassWs = wb.Sheets["Glass"];
    if (glassWs) {
      const glassRaw = XLSX.utils.sheet_to_json(glassWs, { header: 1 }) as unknown[][];
      const glassData: unknown[][] = [];
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
      if (glassData.length > 0) {
        result.glass = { headers: result.glass?.headers ?? [], data: glassData };
      }
    }

    // Extend artist data from Artist sheet
    const artistWs = wb.Sheets["Artist"];
    if (artistWs && result.artists) {
      const artistRaw = XLSX.utils.sheet_to_json(artistWs, { header: 1 }) as unknown[][];
      const expByLevel = new Map<number, number>();
      for (const row of artistRaw) {
        if (Array.isArray(row) && typeof row[0] === "number" && typeof row[1] === "number") {
          expByLevel.set(row[0], row[1]);
        }
      }
      const promAccumByLevel = new Map<number, number>();
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
      const assetRaw = XLSX.utils.sheet_to_json(assetWs, { header: 1 }) as unknown[][];
      const assetsByLevel = new Map<number, number[]>();
      for (const row of assetRaw) {
        if (!Array.isArray(row) || typeof row[0] !== "number" || typeof row[1] !== "number") continue;
        assetsByLevel.set(row[0], [
          row[1] as number,
          row[2] as number,
          row[3] as number,
          row[6] as number,
          row[7] as number,
          row[8] as number,
          0,
          row[11] as number,
          row[12] as number,
        ]);
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
          for (let i = 0; i < 9; i++) assetAccum[i] = (row[i + 1] as number) ?? 0;
        }
      }
      const promotionCosts = new Map<number, number>();
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
          sacrifAccum = row[2] as number;
        }
      }
      const maxAssetLevel = Math.max(...assetsByLevel.keys());
      for (let level = assetBaseLevel + 1; level <= maxAssetLevel; level++) {
        const perLevel = assetsByLevel.get(level);
        if (!perLevel) break;
        for (let i = 0; i < 9; i++) assetAccum[i] += perLevel[i];
        result.assets.data.push([level, ...assetAccum]);
        if (level > sacrifBaseLevel) {
          if (promotionCosts.has(level)) sacrifAccum += promotionCosts.get(level)!;
          result.sacrifices.data.push([level, null, sacrifAccum]);
        }
      }
    }

    // Parse Others sheet (HQ Building Cards + Business Building Gold)
    const othersWs = wb.Sheets["Others"];
    if (othersWs) {
      const othersRaw = XLSX.utils.sheet_to_json(othersWs, { header: 1 }) as unknown[][];
      const cardsData: unknown[][] = [];
      const goldData: unknown[][] = [];
      for (let r = 2; r < othersRaw.length; r++) {
        const row = othersRaw[r];
        if (!Array.isArray(row)) continue;
        if (typeof row[0] === "number" && typeof row[2] === "number") {
          cardsData.push([row[0] - 1, row[1] ?? null, row[2]]);
        }
        if (typeof row[4] === "number" && typeof row[6] === "number") {
          goldData.push([row[4] - 1, row[5] ?? null, row[6]]);
        }
      }
      if (cardsData.length > 0) result.buildingCards = { headers: ["Level", "Cards", "Accum"], data: cardsData };
      if (goldData.length > 0) result.buildingGold = { headers: ["Level", "Gold", "Accum"], data: goldData };
    }

    // Parse CEO Sports from dedicated Floors sheet (columns 41–48)
    const floorsWs = wb.Sheets["Floors,Exhibits,Homemaking,CarC"];
    if (floorsWs) {
      const floorsRaw = XLSX.utils.sheet_to_json(floorsWs, { header: 1 }) as unknown[][];
      const sportsData: unknown[][] = [];
      const accum = [0, 0, 0, 0, 0, 0, 0, 0]; // T1 drink/bar, T2 drink/bar, T3 drink/bar, T4 hq drink/bar
      for (const row of floorsRaw) {
        if (!Array.isArray(row) || typeof row[0] !== "number") continue;
        for (let i = 0; i < 8; i++) {
          accum[i] += typeof row[41 + i] === "number" ? (row[41 + i] as number) : 0;
        }
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
      const outfitRaw = XLSX.utils.sheet_to_json(ceoOutfitWs, { header: 1 }) as unknown[][];
      const outfitData: unknown[][] = [];
      let lastAppearance = "";
      for (let r = 2; r < outfitRaw.length; r++) {
        const row = outfitRaw[r];
        if (!Array.isArray(row) || row.every((v) => v == null || v === "")) break;
        const appearance = row[0] != null && row[0] !== "" ? String(row[0]) : lastAppearance;
        lastAppearance = appearance;
        const goldCrowns = typeof row[2] === "number" ? row[2] : 0;
        const label = appearance === "Essential" ? "Essential" : `${appearance} GC${goldCrowns}`;
        const bankCardsPerItem = typeof row[5] === "number" ? row[5] : 0;
        const droids = typeof row[6] === "number" ? row[6] : 0;
        const crownCards = typeof row[11] === "number" ? row[11] : 0;
        outfitData.push([label, bankCardsPerItem, droids, crownCards]);
      }
      result.ceoOutfit = { headers: ["Step", "Bank Cards per Item", "Droids", "Crown Cards"], data: outfitData };
    }

    // Load artist XP modifiers from artistxpmods.xlsx
    const artistXpModsPath = path.join(process.cwd(), "src", "artistxpmods.xlsx");
    if (fs.existsSync(artistXpModsPath)) {
      const modsBuffer = await fs.promises.readFile(artistXpModsPath);
      const modsWb = XLSX.read(modsBuffer, { type: "buffer" });
      const modsWs = modsWb.Sheets[modsWb.SheetNames[0]];
      if (modsWs) {
        const modsRaw = XLSX.utils.sheet_to_json(modsWs, { header: 1 }) as unknown[][];
        const modsData: unknown[][] = [];
        for (const row of modsRaw) {
          if (!Array.isArray(row)) continue;
          const name = row[0];
          const mod = row[1];
          if (name != null && name !== "" && mod != null) {
            modsData.push([String(name), typeof mod === "number" ? mod : Number(mod)]);
          }
        }
        result.artistMods = { headers: ["Artist", "Modifier"], data: modsData };
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("calc-tables route failed", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
