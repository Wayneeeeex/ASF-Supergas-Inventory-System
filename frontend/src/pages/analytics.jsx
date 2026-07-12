import React, { useMemo } from "react";
import { BarChart3, TrendingUp, Calendar, Droplets, ArrowUpRight, ArrowDownRight } from "lucide-react";

const CHART_HEIGHT_PX = 200; // fixed pixel height of the bar chart area
const MIN_BAR_PX      = 6;   // minimum bar height so zero-revenue days still show a sliver

// ── Date helpers ──────────────────────────────────────────────────────────────
// "2026-07-12" → local Date (avoids UTC-rollback that shifts the day by 1 in UTC+8)
function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}

// Returns "Mon" … "Sun" for a local Date
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function localDayName(dateStr) {
    return DAY_NAMES[parseLocalDate(dateStr).getDay()];
}

// Last-7-days window in local time (inclusive of today)
function last7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // format as YYYY-MM-DD in local time
        const yyyy = d.getFullYear();
        const mm   = String(d.getMonth() + 1).padStart(2, "0");
        const dd   = String(d.getDate()).padStart(2, "0");
        days.push({
            dateStr: `${yyyy}-${mm}-${dd}`,
            label:   DAY_NAMES[d.getDay()],
        });
    }
    return days;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Analytics({ transactions, tanks, selectedStationId }) {
    const window7 = useMemo(() => last7Days(), []);

    const stationTransactions = useMemo(() => {
        if (selectedStationId === null) return transactions;
        return transactions.filter((t) => Number(t.station_id) === Number(selectedStationId));
    }, [transactions, selectedStationId]);

    const salesTxns = useMemo(
        () => stationTransactions.filter((t) => t.category === "sales"),
        [stationTransactions]
    );

    // ── KPI metrics ───────────────────────────────────────────────────────────
    const totalWeeklyRevenue    = salesTxns.reduce((s, t) => s + Number(t.amount), 0);
    const totalVolumeDispensed  = salesTxns.reduce((s, t) => s + Number(t.liters),  0);
    const averageTicketSize     = salesTxns.length > 0 ? totalWeeklyRevenue / salesTxns.length : 0;

    // ── Weekly Revenue Trend (last 7 calendar days, local timezone) ───────────
    const weeklyRevenue = useMemo(() => {
        // Build a map: dateStr → total revenue
        const sumByDate = {};
        window7.forEach(({ dateStr }) => { sumByDate[dateStr] = 0; });

        salesTxns.forEach((t) => {
            if (sumByDate[t.date] !== undefined) {
                sumByDate[t.date] += Number(t.amount);
            }
        });

        const amounts = window7.map(({ dateStr }) => sumByDate[dateStr]);
        const maxAmt  = Math.max(...amounts, 1); // avoid divide-by-zero

        return window7.map(({ dateStr, label }, i) => {
            const amount  = amounts[i];
            const barPx   = amount > 0
                ? Math.max(MIN_BAR_PX, Math.round((amount / maxAmt) * CHART_HEIGHT_PX))
                : MIN_BAR_PX;
            return { label, dateStr, amount, barPx };
        });
    }, [salesTxns, window7]);

    // ── Volume by fuel type ───────────────────────────────────────────────────
    const FUEL_COLORS = {
        "Diesel":      "bg-emerald-500",
        "Unleaded 91": "bg-blue-500",
        "Unleaded 95": "bg-yellow-400",
        "LPG Bulk":    "bg-purple-500",
    };
    const fuelTypes = Object.keys(FUEL_COLORS);

    const fuelDistribution = useMemo(() => {
        const totalLiters = totalVolumeDispensed || 1;
        return fuelTypes.map((name) => {
            const liters = salesTxns
                .filter((t) => t.type === name)
                .reduce((s, t) => s + Number(t.liters), 0);
            return {
                name,
                liters,
                percentage: Math.round((liters / totalLiters) * 100),
                color: FUEL_COLORS[name],
            };
        });
    }, [salesTxns, totalVolumeDispensed]);

    const topFuel = useMemo(
        () => fuelDistribution.reduce(
            (max, f) => (f.liters > max.liters ? f : max),
            { name: "No Fuel Logged", liters: 0 }
        ),
        [fuelDistribution]
    );

    // ── Revenue by day — also used for the "today" highlight ─────────────────
    const todayStr = window7[window7.length - 1]?.dateStr;

    return (
        <div className="animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                    <h1 className="font-bold text-2xl tracking-wide text-blue-950">BUSINESS ANALYTICS</h1>
                    <div className="text-xs text-slate-500 font-medium mt-1">Sales trends and inventory insights — last 7 days</div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-semibold text-slate-600">
                    <Calendar size={16} />
                    Last 7 Days
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-400 tracking-wide mb-1.5">TOTAL WEEKLY REVENUE</div>
                    <div className="text-2xl font-bold text-blue-950">
                        ₱{totalWeeklyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs font-semibold mt-2 flex items-center gap-1 text-emerald-600">
                        <ArrowUpRight size={14} /> Live <span className="text-slate-400 font-medium ml-1">from transaction log</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-400 tracking-wide mb-1.5">TOTAL VOLUME DISPENSED</div>
                    <div className="text-2xl font-bold text-blue-950">
                        {totalVolumeDispensed.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L
                    </div>
                    <div className="text-xs font-semibold mt-2 flex items-center gap-1 text-emerald-600">
                        <ArrowUpRight size={14} /> Live <span className="text-slate-400 font-medium ml-1">from transaction log</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-400 tracking-wide mb-1.5">AVERAGE TICKET SIZE</div>
                    <div className="text-2xl font-bold text-blue-950">
                        ₱{averageTicketSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs font-semibold mt-2 flex items-center gap-1 text-slate-400">
                        <span>per transaction</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

                {/* REVENUE TRENDS CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide flex items-center gap-2">
                            <BarChart3 size={16} className="text-blue-600" />
                            REVENUE TRENDS
                        </h2>
                        <span className="text-[11px] text-slate-400 font-medium">Daily breakdown</span>
                    </div>

                    {/* Chart area — fixed pixel height so bars render correctly */}
                    <div className="relative" style={{ height: `${CHART_HEIGHT_PX + 32}px` }}>
                        {/* Horizontal guide lines */}
                        {[0, 25, 50, 75, 100].map((pct) => (
                            <div
                                key={pct}
                                className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                                style={{ bottom: `${32 + (pct / 100) * CHART_HEIGHT_PX}px` }}
                            />
                        ))}

                        {/* Bars row */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 px-0">
                            {weeklyRevenue.map((day) => {
                                const isToday = day.dateStr === todayStr;
                                return (
                                    <div key={day.dateStr} className="flex flex-col items-center flex-1 gap-0 group">
                                        {/* Hover tooltip */}
                                        <div className="relative w-full flex justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded z-10 whitespace-nowrap pointer-events-none">
                                                ₱{day.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </div>
                                        </div>

                                        {/* Bar */}
                                        <div
                                            className={`w-full max-w-[44px] rounded-t-lg transition-all duration-500 ${
                                                isToday
                                                    ? "bg-blue-600 shadow-md shadow-blue-200"
                                                    : day.amount > 0
                                                        ? "bg-blue-400 group-hover:bg-blue-500"
                                                        : "bg-slate-100"
                                            }`}
                                            style={{ height: `${day.barPx}px` }}
                                        />

                                        {/* Day label */}
                                        <span className={`text-[11px] mt-2 font-bold ${isToday ? "text-blue-600" : "text-slate-400"}`}>
                                            {day.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chart legend */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" /> Today
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Previous days
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <span className="w-3 h-3 rounded-sm bg-slate-100 inline-block" /> No sales
                        </span>
                    </div>
                </div>

                {/* VOLUME BY FUEL */}
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
                                    <span className="text-slate-500">
                                        {fuel.percentage}%
                                        <span className="text-slate-400 font-medium ml-1">
                                            ({Math.round(fuel.liters).toLocaleString()} L)
                                        </span>
                                    </span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${fuel.color}`}
                                        style={{ width: `${fuel.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-xs font-bold text-slate-500 mb-1">TOP PERFORMING FUEL</div>
                        <div className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                            <TrendingUp size={16} />
                            {topFuel.name}
                            {topFuel.liters > 0 && (
                                <span className="text-slate-500 font-medium text-xs">
                                    — {Math.round(topFuel.liters).toLocaleString()} L
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}