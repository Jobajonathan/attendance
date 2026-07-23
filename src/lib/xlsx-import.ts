import ExcelJS from "exceljs";
import { rowsToObjects } from "@/lib/csv";

// Cells formatted as dates come back as real Date objects from ExcelJS —
// normalize those to "YYYY-MM-DD" so they match the CSV import path's
// expected format instead of a full Date.toString() dump. Formula cells
// resolve to their cached `.result`; anything else is stringified as-is.
function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("result" in value) return cellToString(value.result as ExcelJS.CellValue);
    if ("text" in value) return String(value.text ?? "");
  }
  return String(value);
}

export async function parseXlsxToObjects(buffer: ArrayBuffer): Promise<Record<string, string>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const rows: string[][] = [];
  worksheet.eachRow((row) => {
    // row.values is 1-indexed with an empty slot at index 0.
    const values = (row.values as ExcelJS.CellValue[]).slice(1);
    rows.push(values.map(cellToString));
  });

  return rowsToObjects(rows);
}
