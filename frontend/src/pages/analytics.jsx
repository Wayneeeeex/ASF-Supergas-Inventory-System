import React from "react";
import { BarChart3, TrendingUp, Calendar, Droplets, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Analytics() {
    // Dummy data for charts and metrics
    const weeklyRevenue = [
        { day: "Mon", amount: 32000, height: "45%" },
        { day: "Tue", amount: 28500, height: "40%" },
        { day: "Wed", amount: 41000, height: "65%" },
        { day: "Thu", amount: 39000, height: "60%" },
        { day: "Fri", amount: 52000, height: "85%" },
        { day: "Sat", amount: 61000, height: "100%" },
        { day: "Sun", amount: 48000, height: "75%" },
    ];

    const fuelDistribution = [
        { name: "Diesel", percentage: 45, color: "bg-emerald-500" },
        { name: "Unleaded 91", percentage: 30, color: "bg-blue-500" },
        { name: "Unleaded 95", percentage: 15, color: "bg-yellow-400" },
        { name: "LPG Bulk", percentage: 10, color: "bg-purple-500" },
    ];

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                    <h1 className="font-bold text-2xl tracking-wide text-blue-950">BUSINESS ANALYTICS</h1>
                    <div className="text-xs text-slate-500 font-medium mt-1">Sales trends and inventory insights</div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Calendar size={16} />
                    Last 7 Days
                </button>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-400 tracking-wide mb-1.5">TOTAL WEEKLY REVENUE</div>
                    <div className="text-2xl font-bold text-blue-950">₱ 301,500</div>
                    <div className="text-xs font-semibold mt-2 flex items-center gap-1 text-emerald-600">
                        <ArrowUpRight size={14} /> +8.4% <span className="text-slate-400 font-medium ml-1">vs last week</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-400 tracking-wide mb-1.5">TOTAL VOLUME DISPENSED</div>
                    <div className="text-2xl font-bold text-blue-950">5,840 L</div>
                    <div className="text-xs font-semibold mt-2 flex items-center gap-1 text-emerald-600">
                        <ArrowUpRight size={14} /> +3.2% <span className="text-slate-400 font-medium ml-1">vs last week</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-400 tracking-wide mb-1.5">AVERAGE TICKET SIZE</div>
                    <div className="text-2xl font-bold text-blue-950">₱ 845.50</div>
                    <div className="text-xs font-semibold mt-2 flex items-center gap-1 text-rose-500">
                        <ArrowDownRight size={14} /> -1.1% <span className="text-slate-400 font-medium ml-1">vs last week</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                {/* REVENUE CHART (MOCK) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide flex items-center gap-2">
                            <BarChart3 size={16} className="text-blue-600" />
                            REVENUE TRENDS
                        </h2>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
                        {weeklyRevenue.map((day) => (
                            <div key={day.day} className="flex flex-col items-center flex-1 gap-3 group">
                                {/* Tooltip equivalent */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded absolute -mt-8 pointer-events-none">
                                    ₱{day.amount.toLocaleString()}
                                </div>
                                {/* Bar */}
                                <div className="w-full max-w-[48px] bg-blue-100 rounded-t-lg relative group-hover:bg-blue-200 transition-colors" style={{ height: day.height }}>
                                    <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '100%' }} />
                                </div>
                                {/* Label */}
                                <span className="text-xs font-semibold text-slate-500">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SALES DISTRIBUTION */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide flex items-center gap-2">
                            <Droplets size={16} className="text-blue-600" />
                            VOLUME BY FUEL
                        </h2>
                    </div>

                    <div className="space-y-5">
                        {fuelDistribution.map((fuel) => (
                            <div key={fuel.name}>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-slate-700">{fuel.name}</span>
                                    <span className="text-slate-500">{fuel.percentage}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${fuel.color}`}
                                        style={{ width: `${fuel.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-xs font-bold text-slate-500 mb-1">TOP PERFORMING CATEGORY</div>
                        <div className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                            <TrendingUp size={16} /> Commercial Diesel
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}