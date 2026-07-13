import Papa from "papaparse";
import { Profile, Column } from "../types";

export function parseCsv(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Record<string, any>[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function profileData(data: Record<string, any>[]): Profile {
  if (!data || data.length === 0) {
    return { rowCount: 0, colCount: 0, missingPercent: 0, duplicateRowsPercent: 0, columns: [] };
  }

  const rowCount = data.length;
  const colNames = Object.keys(data[0]);
  const colCount = colNames.length;

  let totalMissing = 0;
  const columns: Column[] = colNames.map(name => {
    let missingCount = 0;
    const valueCounts: Record<string, number> = {};
    let isNumeric = true;
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < rowCount; i++) {
      const val = data[i][name];
      if (val === null || val === undefined || val === "") {
        missingCount++;
        totalMissing++;
      } else {
        const strVal = String(val);
        valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
        
        if (isNumeric) {
          const num = Number(val);
          if (isNaN(num)) {
            isNumeric = false;
          } else {
            if (num < min) min = num;
            if (num > max) max = num;
          }
        }
      }
    }

    const uniqueCount = Object.keys(valueCounts).length;
    
    // Quality flag heuristic
    let qualityFlag: "good" | "warning" | "critical" = "good";
    if (missingCount / rowCount > 0.2) qualityFlag = "critical";
    else if (missingCount > 0) qualityFlag = "warning";
    
    // Top values
    const topValues = Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));

    return {
      id: name,
      name,
      type: isNumeric && uniqueCount > 0 ? "numeric" : "categorical",
      missingCount,
      uniqueCount,
      qualityFlag,
      min: isNumeric && min !== Infinity ? min : undefined,
      max: isNumeric && max !== -Infinity ? max : undefined,
      topValues
    };
  });

  const missingPercent = totalMissing / (rowCount * colCount);
  
  // Basic duplicate detection (simplistic stringify for now)
  const rowStrings = new Set();
  let duplicates = 0;
  for (const row of data) {
    const s = JSON.stringify(row);
    if (rowStrings.has(s)) duplicates++;
    else rowStrings.add(s);
  }
  const duplicateRowsPercent = duplicates / rowCount;

  return {
    rowCount,
    colCount,
    missingPercent,
    duplicateRowsPercent,
    columns
  };
}
