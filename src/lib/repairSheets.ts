export interface RepairModel {
  brand: string;
  model: string;
}

export interface RepairPrice {
  brand: string;
  model: string;
  repairType: string;
  price: number;
}

export interface RepairData {
  brands: string[];
  models: RepairModel[];
  prices: RepairPrice[];
}

const EMPTY: RepairData = { brands: [], models: [], prices: [] };

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

async function fetchSheet(sheetId: string, sheetName: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Error al obtener la hoja "${sheetName}"`);
  return res.text();
}

export async function getRepairData(): Promise<RepairData> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) return EMPTY;

  try {
    const [modelsCSV, pricesCSV] = await Promise.all([
      fetchSheet(sheetId, "Modelos"),
      fetchSheet(sheetId, "Precios"),
    ]);

    const modelsRows = parseCSV(modelsCSV);
    const pricesRows = parseCSV(pricesCSV);

    const models: RepairModel[] = modelsRows
      .filter((r) => r["Activo"] === "Sí" && r["Marca"] && r["Modelo"])
      .map((r) => ({ brand: r["Marca"], model: r["Modelo"] }));

    const prices: RepairPrice[] = pricesRows
      .filter((r) => r["Marca"] && r["Modelo"] && r["TipoReparacion"])
      .map((r) => ({
        brand: r["Marca"],
        model: r["Modelo"],
        repairType: r["TipoReparacion"],
        price: parseInt(r["PrecioFinal"].replace(/[^0-9]/g, ""), 10) || 0,
      }));

    const brands = [...new Set(models.map((m) => m.brand))].sort();

    return { brands, models, prices };
  } catch (err) {
    console.error("[repairSheets]", err);
    return EMPTY;
  }
}
