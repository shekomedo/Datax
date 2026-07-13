import React from "react";
import { Workspace } from "../types";

export function DataGrid({ workspace }: { workspace: Workspace }) {
  if (!workspace.data || workspace.data.length === 0) return <div className="p-8 text-center text-gray-500 font-mono tracking-widest uppercase">No data available</div>;

  const columns = Object.keys(workspace.data[0]);

  return (
    <div className="overflow-auto h-full w-full bg-surface2 border-t border-accent/10">
      <table className="min-w-full divide-y divide-white/5 text-sm">
        <thead className="bg-surface sticky top-0 z-10 shadow-md">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-accent uppercase tracking-wider border-b border-accent/20">
              #
            </th>
            {columns.map(col => (
              <th key={col} className="px-4 py-3 text-left font-semibold text-accent uppercase tracking-wider border-b border-accent/20 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-transparent">
          {workspace.data.slice(0, 100).map((row, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-2 text-gray-500 font-mono whitespace-nowrap">
                {idx + 1}
              </td>
              {columns.map(col => (
                <td key={col} className="px-4 py-2 text-gray-300 truncate max-w-xs">
                  {row[col] !== null && row[col] !== undefined && row[col] !== "" ? (
                    String(row[col])
                  ) : (
                    <span className="text-gray-600 italic">null</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {workspace.data.length > 100 && (
        <div className="p-4 text-center text-xs tracking-widest uppercase text-gray-500 bg-surface border-t border-white/5">
          Showing first 100 rows of {workspace.data.length} total
        </div>
      )}
    </div>
  );
}
