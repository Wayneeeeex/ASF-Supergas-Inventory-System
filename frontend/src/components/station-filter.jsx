import React from "react";

export default function StationFilter({ stations, selectedId, onSelect }) {
    if (!stations.length) return null;

    return (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1">Station:</span>

            <button
                onClick={() => onSelect(null)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-colors ${
                    selectedId === null
                        ? "bg-blue-950 border-blue-950 text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-700"
                }`}
            >
                All Stations
            </button>

            {stations.map((s) => (
                <button
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-colors ${
                        selectedId === s.id
                            ? "bg-blue-950 border-blue-950 text-white"
                            : "bg-white border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-700"
                    }`}
                >
                    {s.name}
                </button>
            ))}
        </div>
    );
}