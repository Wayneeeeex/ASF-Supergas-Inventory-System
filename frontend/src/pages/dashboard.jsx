import React from "react";
import { TrendingUp, Fuel, Users, Clock, Activity, ArrowRight, Truck } from "lucide-react";

export default function Dashboard({ tanks, transactions, setActiveTab }) {
    // Filter today's sales
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = transactions.filter(
        (t) => t.category === "sales" && t.date === todayStr
    );

    const todayRevenue = todaySales.reduce((sum, t) => sum + Number(t.amount), 0);
    const todayLiters = todaySales.reduce((sum, t) => sum + Number(t.liters), 0);
    const todayCustomers = todaySales.length;

    const dailyStats = [
        {
            label: "TODAY'S REVENUE",
            value: `₱ ${todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            trend: todayRevenue > 0 ? "+100%" : "0.0%",
            isUp: todayRevenue > 0,
            icon: TrendingUp,
        },
        {
            label: "LITERS DISPENSED",
            value: `${todayLiters.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`,
            trend: todayLiters > 0 ? "+100%" : "0.0%",
            isUp: todayLiters > 0,
            icon: Fuel,
        },
        {
            label: "ACTIVE CUSTOMERS",
            value: String(todayCustomers),
            trend: todayCustomers > 0 ? "+100%" : "0.0%",
            isUp: todayCustomers > 0,
            icon: Users,
        },
    ];

    const recentTxns = transactions.slice(0, 4);

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6">
                <h1 className="font-bold text-2xl tracking-wide text-blue-950">STATION DASHBOARD</h1>
                <div className="text-xs text-slate-500 font-medium mt-1">Real-time overview of station performance</div>
            </div>

            {/* TOP METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {dailyStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="text-[11px] font-bold text-slate-400 tracking-wide mb-1.5">{stat.label}</div>
                                <div className="text-2xl font-bold text-blue-950">{stat.value}</div>
                                <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${stat.isUp ? "text-emerald-600" : "text-slate-400"}`}>
                                    {stat.trend} <span className="text-slate-400 font-medium ml-1">vs yesterday</span>
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.isUp ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                                <Icon size={24} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QUICK TANK STATUS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide flex items-center gap-2">
                            <Activity size={16} className="text-blue-600" />
                            LIVE TANK LEVELS
                        </h2>
                        <button
                            onClick={() => setActiveTab("Inventory")}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            View Inventory <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {tanks.map((tank) => (
                            <div key={tank.id} className="flex items-center gap-4">
                                <div className="w-24 text-xs font-bold text-slate-600 truncate">{tank.name}</div>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                    <div
                                        className={`absolute top-0 left-0 h-full rounded-full ${tank.pct < 20 ? "bg-rose-500" : tank.pct < 40 ? "bg-yellow-400" : "bg-blue-600"}`}
                                        style={{ width: `${tank.pct}%` }}
                                    />
                                </div>
                                <div className="w-12 text-right text-xs font-bold text-slate-800">{tank.pct}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RECENT TRANSACTIONS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide flex items-center gap-2">
                            <Clock size={16} className="text-blue-600" />
                            LATEST TRANSACTIONS
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {recentTxns.map((txn) => (
                            <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                                        {txn.category === "sales" ? (
                                            <Fuel size={18} className="text-slate-400" />
                                        ) : (
                                            <Truck size={18} className="text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">
                                            {txn.category === "sales" ? txn.type : `Refill: ${txn.type}`}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">{txn.id} • {txn.time}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-bold ${txn.category === "sales" ? "text-emerald-600" : "text-rose-600"}`}>
                                        {txn.category === "sales" ? "+" : "-"}₱{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">{txn.liters.toLocaleString()} L</div>
                                </div>
                            </div>
                        ))}
                        {recentTxns.length === 0 && (
                            <div className="text-center text-slate-400 py-10 text-sm">
                                No transactions logged yet today.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}