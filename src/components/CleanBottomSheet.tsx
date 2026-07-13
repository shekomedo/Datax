import React, { useState } from "react";
import { Workspace } from "../types";
import { X, Type, Search, ArrowRightLeft, Sparkles, Hash, Calendar, Layers } from "lucide-react";
import { profileData } from "../lib/dataUtils";

interface Props {
  workspace: Workspace;
  onUpdateWorkspace: (ws: Workspace) => void;
  onClose: () => void;
}

export function CleanBottomSheet({ workspace, onUpdateWorkspace, onClose }: Props) {
  const [operation, setOperation] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string>("");

  const handleApply = () => {
    if (!operation || !targetColumn) return;

    const newData = workspace.data.map((row) => {
      const newRow = { ...row };
      const val = newRow[targetColumn];
      
      if (val !== undefined && val !== null) {
        if (operation === "trim") {
          newRow[targetColumn] = String(val).trim();
        } else if (operation === "uppercase") {
          newRow[targetColumn] = String(val).toUpperCase();
        } else if (operation === "lowercase") {
          newRow[targetColumn] = String(val).toLowerCase();
        }
      }
      
      // fill missing
      if (operation === "fill_missing") {
        if (val === undefined || val === null || val === "") {
          newRow[targetColumn] = "N/A";
        }
      }

      return newRow;
    });

    const newProfile = profileData(newData);
    onUpdateWorkspace({
      ...workspace,
      data: newData,
      profile: newProfile
    });
    onClose();
  };

  return (
    <div className="w-full bg-surface border-t border-accent/30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-3xl z-50 transform transition-transform duration-300 flex flex-col max-h-[85vh] backdrop-blur-xl">
      <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1"></div>
      
      <div className="p-5 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-lg border border-accent/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white tracking-wide uppercase">AI Data Cleaning</h3>
            <p className="text-xs text-accent font-mono tracking-widest">Select Operation & Target</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="space-y-5">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            1. Select Operation
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <OpButton active={operation === "trim"} onClick={() => setOperation("trim")} icon={<ArrowRightLeft className="w-4 h-4" />} label="Trim Whitespace" />
            <OpButton active={operation === "uppercase"} onClick={() => setOperation("uppercase")} icon={<Type className="w-4 h-4" />} label="To Uppercase" />
            <OpButton active={operation === "lowercase"} onClick={() => setOperation("lowercase")} icon={<Type className="w-4 h-4" />} label="To Lowercase" />
            <OpButton active={operation === "fill_missing"} onClick={() => setOperation("fill_missing")} icon={<Search className="w-4 h-4" />} label="Fill Missing Values" highlight />
          </div>
        </div>

        <div className="space-y-5">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
            2. Select Target Column
          </h4>
          <div className="bg-black/30 border border-white/5 rounded-xl p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {workspace.profile?.columns.map(col => (
              <label 
                key={col.id} 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${targetColumn === col.id ? 'bg-success/10 border-success/30' : 'border-transparent hover:bg-white/5'}`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${targetColumn === col.id ? 'border-success' : 'border-gray-500'}`}>
                  {targetColumn === col.id && <div className="w-2 h-2 bg-success rounded-full"></div>}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${targetColumn === col.id ? 'text-white' : 'text-gray-300'}`}>{col.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono uppercase">{col.type} • {col.missingCount} Missing</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-white/5 bg-black/40 flex justify-end gap-4 rounded-b-3xl">
        <button onClick={onClose} className="px-6 py-2.5 text-gray-400 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-colors uppercase tracking-wider text-xs border border-transparent">
          Cancel
        </button>
        <button 
          onClick={handleApply}
          disabled={!operation || !targetColumn}
          className="px-8 py-2.5 bg-gradient-to-r from-success/80 to-success text-white font-medium rounded-xl hover:shadow-[0_0_20px_rgba(50,205,50,0.4)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed transition-all uppercase tracking-wider text-xs flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Apply Operation
        </button>
      </div>
    </div>
  );
}

function OpButton({ active, onClick, icon, label, highlight = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, highlight?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-left ${
        active 
          ? highlight ? "border-success bg-success/10 text-success shadow-[0_0_15px_rgba(50,205,50,0.15)]" : "border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(0,229,255,0.15)]" 
          : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-300"
      }`}
    >
      <div className={`${active ? (highlight ? 'text-success' : 'text-accent') : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className="font-medium text-sm tracking-wide">{label}</span>
      {highlight && <div className="ml-auto flex items-center gap-1 text-[9px] uppercase tracking-widest text-success font-mono bg-success/20 px-2 py-0.5 rounded-full"><Sparkles className="w-3 h-3"/> AI</div>}
    </button>
  );
}
