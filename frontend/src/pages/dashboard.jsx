import React from "react";
import { TrendingUp, Fuel, Users, Clock, Activity, ArrowRight } from "lucide-react";

export default function Dashboard({ tanks }) {
    // Dummy data for the dashboard
    const dailyStats = [
        { label: "TODAY'S REVENUE", value: "₱ 45,230", trend: "+12.5%", isUp: true, icon: TrendingUp },
        { label: "LITERS DISPENSED", value: "1,284 L", trend: "+5.2%", isUp: true, icon: Fuel },
        { label: "ACTIVE CUSTOMERS", value: "142", trend: "-2.1%", isUp: false, icon: Users },
    ];

    const recentTransactions = [
        { id: "TXN-8921", time: "10:24 AM", type: "Unleaded 95", amount: "₱ 1,500.00", liters: "23.01 L" },
        { id: "TXN-8920", time: "10:18 AM", type: "Diesel", amount: "₱ 2,100.00", liters: "36.20 L" },
        { id: "TXN-8919", time: "10:05 AM", type: "Unleaded 91", amount: "₱ 500.00", liters: "8.26 L" },
        { id: "TXN-8918", time: "09:42 AM", type: "LPG Bulk", amount: "₱ 950.00", liters: "21.11 L" },
    ];

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6">
                <h1 className="font-bold text-2xl tracking-wide text-blue-950">STATION DASHBOARD</h1>
                <div className="text-xs text-slate-500 font-medium mt-1">Real-time overview of station performance</div>
            </div>

            {/* TOP METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {dailyStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="text-[11px] font-bold text-slate-400 tracking-wide mb-1.5">{stat.label}</div>
                                <div className="text-2xl font-bold text-blue-950">{stat.value}</div>
                                <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${stat.isUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {stat.trend} <span className="text-slate-400 font-medium ml-1">vs yesterday</span>
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
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
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            View Inventory <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {tanks.map(tank => (
                            <div key={tank.id} className="flex items-center gap-4">
                                <div className="w-24 text-xs font-bold text-slate-600 truncate">{tank.name}</div>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                    <div
                                        className={`absolute top-0 left-0 h-full rounded-full ${tank.pct < 20 ? 'bg-rose-500' : tank.pct < 40 ? 'bg-yellow-400' : 'bg-blue-600'}`}
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
                        {recentTransactions.map(txn => (
                            <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                                        <Fuel size={18} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{txn.type}</div>
                                        <div className="text-xs text-slate-500 font-medium">{txn.id} • {txn.time}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-emerald-600">{txn.amount}</div>
                                    <div className="text-xs text-slate-500 font-medium">{txn.liters}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}