export interface Column {
  id: string;
  name: string;
  type: string;
  missingCount: number;
  uniqueCount: number;
  qualityFlag: "good" | "warning" | "critical";
  min?: number;
  max?: number;
  topValues?: { value: string; count: number }[];
}

export interface Profile {
  rowCount: number;
  colCount: number;
  missingPercent: number;
  duplicateRowsPercent: number;
  columns: Column[];
}

export interface Workspace {
  id: string;
  fileName: string;
  data: Record<string, any>[];
  profile: Profile | null;
}

