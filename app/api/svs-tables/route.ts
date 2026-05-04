import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

let _cache: { mtime: number; data: Record<string, ShopData> } | null = null;

export type ShopItem = {
  inCart: boolean;
  item: string;
  quantity: number;
  price: number;
};

export type ShopData = {
  title: string;
  items: ShopItem[];
};

function parseShop(ws: XLSX.WorkSheet): ShopData {
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
  const title = String(raw[0]?.[0] ?? "");
  const items: ShopItem[] = [];
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

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src", "SVS Store Calculator.xlsx");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Workbook not found" }, { status: 500 });
    }
    const mtime = fs.statSync(filePath).mtimeMs;
    if (_cache && _cache.mtime === mtime) return NextResponse.json(_cache.data);

    const fileBuffer = await fs.promises.readFile(filePath);
    const wb = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });

    const result: Record<string, ShopData> = {};
    for (const sheetName of ["GOLD", "SILVER", "BRONZE"]) {
      if (wb.Sheets[sheetName]) {
        result[sheetName] = parseShop(wb.Sheets[sheetName]);
      }
    }

    _cache = { mtime, data: result };
    return NextResponse.json(result);
  } catch (error) {
    console.error("svs-tables route failed", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
