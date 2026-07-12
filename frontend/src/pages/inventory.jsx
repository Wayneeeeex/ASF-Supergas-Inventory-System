import React, { useState, useMemo, useEffect } from "react";
import { Search, Fuel, AlertTriangle, Truck, Plus, X, ChevronLeft, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LOG_PAGE_SIZE = 6;

const tankRing = (pct, status) => {
    const color = status === "critical" ? "#dc2626" : status === "low" ? "#facc15" : "#2563eb";
    return { background: `conic-gradient(${color} 0% ${pct}%, rgba(255,255,255,0.12) ${pct}% 100%)` };
};

const poStatusStyle = {
    "In Transit": "bg-blue-50 text-blue-700 border-blue-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Delayed: "bg-red-50 text-red-600 border-red-200",
    Delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Paid: "bg-teal-50 text-teal-700 border-teal-200",
};

const FUEL_Pill_COLORS = {
    "Unleaded 91": "bg-blue-100 text-blue-700",
    "Unleaded 95": "bg-violet-100 text-violet-700",
    "Diesel": "bg-amber-100 text-amber-700",
    "LPG Bulk": "bg-emerald-100 text-emerald-700",
};
function fuelPillColor(name) { return FUEL_Pill_COLORS[name] || "bg-slate-100 text-slate-600"; }

export default function Inventory({
    stations = [],
    tanks = [],
    transactions = [],
    purchaseOrders = [],
    refreshData,
    selectedStationId,
}) {
    const { token } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Log Tab selection ("sales" vs "delivery")
    const [logTab, setLogTab] = useState("sales");
    const [salesSearch, setSalesSearch] = useState("");
    const [salesPage, setSalesPage] = useState(1);
    const [deliverySearch, setDeliverySearch] = useState("");
    const [deliveryPage, setDeliveryPage] = useState(1);

    // Reset pagination when filter changes
    useEffect(() => {
        setSalesPage(1);
        setDeliveryPage(1);
    }, [selectedStationId, salesSearch, deliverySearch]);

    // Station Name Info
    const stationName = selectedStationId
        ? (stations.find((s) => s.id === selectedStationId)?.name || `Station #${selectedStationId}`)
        : null;

    const displayTitle = stationName ? `${stationName.toUpperCase()} STATION INVENTORY` : "ALL STATION INVENTORY";

    // ── Calculations ──
    const totalFuelOnHand = useMemo(() => tanks.reduce((sum, t) => sum + (t.volume_liters || 0), 0), [tanks]);
    const totalFuelCapacity = useMemo(() => tanks.reduce((sum, t) => sum + (t.capacity_liters || 0), 0), [tanks]);
    const criticalTanksCount = useMemo(() => tanks.filter((t) => t.status === "critical").length, [tanks]);
    const openPOsCount = useMemo(() => purchaseOrders.filter((po) => po.status !== "Delivered" && po.status !== "Paid").length, [purchaseOrders]);

    // ── Filtering Transactions by Station ──
    const stationFilteredTransactions = useMemo(() => {
        if (selectedStationId === null) return transactions;
        return transactions.filter((t) => Number(t.station_id) === Number(selectedStationId));
    }, [transactions, selectedStationId]);

    // Sales Logs
    const fuelSalesLog = useMemo(() => {
        const sales = stationFilteredTransactions.filter((t) => t.category === "sales");
        const query = salesSearch.toLowerCase().trim();
        return query
            ? sales.filter((t) => t.type.toLowerCase().includes(query) || t.id.toLowerCase().includes(query) || t.date.includes(query))
            : sales;
    }, [stationFilteredTransactions, salesSearch]);

    const totalSalesPages = Math.max(1, Math.ceil(fuelSalesLog.length / LOG_PAGE_SIZE));
    const safeSalesPage = Math.min(salesPage, totalSalesPages);
    const pagedSales = fuelSalesLog.slice((safeSalesPage - 1) * LOG_PAGE_SIZE, safeSalesPage * LOG_PAGE_SIZE);

    // Delivery Logs
    const depotDeliveryLog = useMemo(() => {
        const deliveries = stationFilteredTransactions.filter((t) => t.category === "delivery");
        const query = deliverySearch.toLowerCase().trim();
        return query
            ? deliveries.filter((t) => t.type.toLowerCase().includes(query) || t.id.toLowerCase().includes(query) || t.date.includes(query))
            : deliveries;
    }, [stationFilteredTransactions, deliverySearch]);

    const totalDeliveryPages = Math.max(1, Math.ceil(depotDeliveryLog.length / LOG_PAGE_SIZE));
    const safeDeliveryPage = Math.min(deliveryPage, totalDeliveryPages);
    const pagedDeliveries = depotDeliveryLog.slice((safeDeliveryPage - 1) * LOG_PAGE_SIZE, safeDeliveryPage * LOG_PAGE_SIZE);

    return (
        <div className="animate-in fade-in duration-300">
            {/* TOP BAR */}
            <div className="mb-6">
                <h1 className="font-bold text-xl sm:text-2xl tracking-wide text-blue-950 uppercase">{displayTitle}</h1>
                <div className="text-xs text-slate-500 font-medium mt-1">
                    Real-time monitoring of underground storage tanks and logs
                </div>
            </div>

            {/* KPI STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard 
                    label="TOTAL FUEL ON HAND" 
                    value={`${totalFuelOnHand.toLocaleString()} L`} 
                    delta={`Capacity: ${totalFuelCapacity.toLocaleString()} L`} 
                    tone="neutral" 
                    icon={Fuel} 
                    iconTone="blue" 
                />
                <StatCard 
                    label="FUEL UTILIZATION" 
                    value={`${totalFuelCapacity > 0 ? Math.round((totalFuelOnHand / totalFuelCapacity) * 100) : 0}%`} 
                    delta="Average filled percentage" 
                    tone="up" 
                    icon={TrendingUpIcon} 
                    iconTone="yellow" 
                />
                <StatCard 
                    label="CRITICAL TANKS" 
                    value={String(criticalTanksCount)} 
                    delta="Requires immediate reorder" 
                    tone={criticalTanksCount > 0 ? "down" : "neutral"} 
                    icon={AlertTriangle} 
                    iconTone="red" 
                />
                <StatCard 
                    label="OPEN ORDERS" 
                    value={String(openPOsCount)} 
                    delta={`${purchaseOrders.length} total orders recorded`} 
                    tone="neutral" 
                    icon={Truck} 
                    iconTone="green" 
                />
            </div>

            {/* TANKS SECTION */}
            <div className="relative overflow-hidden rounded-2xl bg-blue-950 px-4 sm:px-7 py-6 mb-6 shadow-md">
                <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 90% -10%, rgba(250,204,21,0.18), transparent 45%)" }} />
                <div className="relative flex items-center justify-between mb-5">
                    <h2 className="text-white font-semibold text-sm tracking-wider">UNDERGROUND TANK LEVELS</h2>
                    <span className="text-[11px] text-white/50 font-medium">Live sensor status</span>
                </div>
                <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {tanks.map((t) => {
                        const tankStationName = stations.find((s) => s.id === t.station_id)?.name || `Station #${t.station_id}`;
                        return (
                            <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-4 flex flex-col items-center text-center">
                                {selectedStationId === null && (
                                    <div className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-2 max-w-full truncate" title={tankStationName}>
                                        📍 {tankStationName}
                                    </div>
                                )}
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mb-2.5" style={tankRing(t.pct, t.status)}>
                                    <div className="w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-full bg-blue-950 ring-1 ring-white/10 flex flex-col items-center justify-center shadow-inner">
                                        <div className="text-white font-bold text-lg sm:text-xl leading-none">{t.pct}%</div>
                                        <div className="text-white/40 text-[8px] tracking-widest font-semibold mt-1">FULL</div>
                                    </div>
                                </div>
                                <div className="text-white font-semibold text-sm">{t.name}</div>
                                <div className="text-white/55 text-[10px] sm:text-[11px] mt-0.5 font-mono">{t.vol} / {t.cap}</div>
                                <span className={`mt-2.5 text-[8px] sm:text-[9px] font-bold tracking-wide px-2 sm:px-2.5 py-1 rounded-full text-center ${
                                    t.status === "critical" 
                                        ? "bg-red-500/25 text-red-300" 
                                        : t.status === "low" 
                                            ? "bg-yellow-400/20 text-yellow-300" 
                                            : "bg-blue-500/30 text-blue-200"
                                }`}>
                                    {t.status === "critical" ? "CRITICAL — ORDER NOW" : t.status === "low" ? "LOW — REORDER SOON" : "HEALTHY"}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* TWO COLUMN GRID: LOGS & POs */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
                
                {/* TRANSACTION LOGS TABBED CARD */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-fit">
                    
                    {/* Header + Tabs */}
                    <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Fuel size={16} className="text-blue-950" />
                            <h2 className="font-bold text-sm text-blue-950 tracking-wide">FUEL TRANSACTION LOGS</h2>
                        </div>
                        
                        <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                            <button 
                                onClick={() => setLogTab("sales")}
                                className={`px-3 py-1.5 rounded-md transition-all ${logTab === "sales" ? "bg-white text-blue-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                Sales Outflow
                            </button>
                            <button 
                                onClick={() => setLogTab("delivery")}
                                className={`px-3 py-1.5 rounded-md transition-all ${logTab === "delivery" ? "bg-white text-blue-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                Depot Deliveries
                            </button>
                        </div>
                    </div>

                    {/* Sales Log Panel */}
                    {logTab === "sales" && (
                        <div className="flex-1 flex flex-col">
                            {/* Search */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="relative w-full sm:max-w-xs">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text"
                                        value={salesSearch}
                                        onChange={(e) => setSalesSearch(e.target.value)}
                                        placeholder="Search sales (fuel, date, ID)..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-blue-600 focus:bg-white"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{fuelSalesLog.length} Txns</span>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider">
                                            <th className="py-2.5 px-4">TXN ID</th>
                                            {selectedStationId === null && <th className="py-2.5 px-4">STATION</th>}
                                            <th className="py-2.5 px-4">FUEL</th>
                                            <th className="py-2.5 px-4">DATE & TIME</th>
                                            <th className="py-2.5 px-4 text-right">VOLUME</th>
                                            <th className="py-2.5 px-4 text-right">TOTAL AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                        {pagedSales.map((txn) => {
                                            const stName = stations.find(s => s.id === txn.station_id)?.name || `Station #${txn.station_id}`;
                                            return (
                                                <tr key={txn.id} className="hover:bg-slate-50/50">
                                                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{txn.id}</td>
                                                    {selectedStationId === null && (
                                                        <td className="py-3 px-4 font-bold text-[10px] text-slate-500 max-w-[120px] truncate" title={stName}>
                                                            {stName}
                                                        </td>
                                                    )}
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${fuelPillColor(txn.type)}`}>
                                                            {txn.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-500">
                                                        <span>{txn.date}</span> <span className="text-slate-400 text-[10px] ml-1">{txn.time}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-semibold font-mono text-slate-800">
                                                        {Number(txn.liters).toLocaleString(undefined, { maximumFractionDigits: 1 })} L
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                                                        ₱{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {fuelSalesLog.length === 0 && (
                                            <tr>
                                                <td colSpan={selectedStationId === null ? 6 : 5} className="py-10 text-center text-slate-400">
                                                    No sales outflows found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination 
                                page={safeSalesPage} 
                                total={totalSalesPages} 
                                onPrev={() => setSalesPage(p => p - 1)} 
                                onNext={() => setSalesPage(p => p + 1)} 
                            />
                        </div>
                    )}

                    {/* Delivery Log Panel */}
                    {logTab === "delivery" && (
                        <div className="flex-1 flex flex-col">
                            {/* Search */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="relative w-full sm:max-w-xs">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text"
                                        value={deliverySearch}
                                        onChange={(e) => setDeliverySearch(e.target.value)}
                                        placeholder="Search deliveries (fuel, date, ID)..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-blue-600 focus:bg-white"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{depotDeliveryLog.length} Txns</span>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider">
                                            <th className="py-2.5 px-4">DELIVERY ID</th>
                                            {selectedStationId === null && <th className="py-2.5 px-4">STATION</th>}
                                            <th className="py-2.5 px-4">FUEL</th>
                                            <th className="py-2.5 px-4">DATE & TIME</th>
                                            <th className="py-2.5 px-4 text-right">VOLUME</th>
                                            <th className="py-2.5 px-4 text-right">TOTAL COST</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                        {pagedDeliveries.map((txn) => {
                                            const stName = stations.find(s => s.id === txn.station_id)?.name || `Station #${txn.station_id}`;
                                            return (
                                                <tr key={txn.id} className="hover:bg-slate-50/50">
                                                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{txn.id}</td>
                                                    {selectedStationId === null && (
                                                        <td className="py-3 px-4 font-bold text-[10px] text-slate-500 max-w-[120px] truncate" title={stName}>
                                                            {stName}
                                                        </td>
                                                    )}
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${fuelPillColor(txn.type)}`}>
                                                            {txn.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-500">
                                                        <span>{txn.date}</span> <span className="text-slate-400 text-[10px] ml-1">{txn.time}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-semibold font-mono text-slate-800">
                                                        {Number(txn.liters).toLocaleString(undefined, { maximumFractionDigits: 1 })} L
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                                                        ₱{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {depotDeliveryLog.length === 0 && (
                                            <tr>
                                                <td colSpan={selectedStationId === null ? 6 : 5} className="py-10 text-center text-slate-400">
                                                    No deliveries found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination 
                                page={safeDeliveryPage} 
                                total={totalDeliveryPages} 
                                onPrev={() => setDeliveryPage(p => p - 1)} 
                                onNext={() => setDeliveryPage(p => p + 1)} 
                            />
                        </div>
                    )}
                </div>

                {/* PURCHASE ORDERS PANEL */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-5 h-fit flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Truck size={16} className="text-blue-950" />
                            <h2 className="font-bold text-sm text-blue-950 tracking-wide">PURCHASE ORDERS</h2>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className="flex items-center gap-1 text-xs font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100/80 px-2.5 py-1.5 rounded-lg border border-yellow-200 transition-colors"
                        >
                            <Plus size={13} /> New PO
                        </button>
                    </div>

                    <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                        {purchaseOrders.map((po) => {
                            const poStationName = stations.find((s) => s.id === po.station_id)?.name || `Station #${po.station_id}`;
                            return (
                                <div key={po.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-mono font-bold text-xs text-slate-800">{po.id}</div>
                                            <div className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">{po.vendor}</div>
                                            {selectedStationId === null && (
                                                <div className="text-[9px] text-blue-800 font-bold bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md mt-1 w-fit">
                                                    {poStationName}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${poStatusStyle[po.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                            {po.status}
                                        </span>
                                    </div>
                                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-500">
                                        <div>
                                            <span className="font-semibold text-slate-800">{po.amount}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                            <Clock size={11} /> ETA {po.eta}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {purchaseOrders.length === 0 && (
                            <div className="py-10 text-center text-slate-400 text-xs">
                                No purchase orders found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <CreatePoModal
                    token={token}
                    selectedStationId={selectedStationId}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => {
                        setIsModalOpen(false);
                        refreshData();
                    }}
                />
            )}
        </div>
    );
}

// ── REUSABLE HELPER COMPONENTS ──

function StatCard({ label, value, delta, tone, icon: Icon, iconTone }) {
    const iconBg = { 
        blue: "bg-blue-50 text-blue-600", 
        yellow: "bg-yellow-50 text-yellow-600", 
        red: "bg-red-50 text-red-600", 
        green: "bg-emerald-50 text-emerald-600" 
    }[iconTone];

    const deltaColor = tone === "up" ? "text-emerald-600" : tone === "down" ? "text-red-600" : "text-slate-400 font-semibold";
    
    return (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-4 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{label}</span>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}><Icon size={14} /></span>
                </div>
                <div className="font-extrabold text-xl sm:text-2xl text-slate-800 tracking-wide leading-tight">{value}</div>
            </div>
            <div className={`text-[10px] mt-2.5 font-bold uppercase tracking-wider ${deltaColor}`}>{delta}</div>
        </div>
    );
}

const TrendingUpIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 12.184-5.04M18 8.25V18a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V8.25" />
    </svg>
);

function Pagination({ page, total, onPrev, onNext }) {
    if (total <= 1) return null;
    return (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Page {page} of {total}</span>
            <div className="flex gap-1.5">
                <button disabled={page <= 1} onClick={onPrev}
                    className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={14} />
                </button>
                <button disabled={page >= total} onClick={onNext}
                    className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

// ── CREATE PURCHASE ORDER MODAL ──
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function CreatePoModal({ token, selectedStationId, onClose, onSaved }) {
    const [vendor, setVendor] = useState("");
    const [type, setType] = useState("Bulk Fuel");
    const [items, setItems] = useState("");
    const [amount, setAmount] = useState("");
    const [etaDate, setEtaDate] = useState("");
    
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSaving(true);

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError("Please enter a valid amount");
            setSaving(false);
            return;
        }

        const po_number = `PO-${Math.floor(1000 + Math.random() * 9000)}`;

        try {
            const res = await fetch(`${API_URL}/purchase-orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    po_number,
                    vendor,
                    status: "Pending",
                    amount: amountNum,
                    eta_date: etaDate,
                    type,
                    items,
                    station_id: selectedStationId || 1
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create Purchase Order");

            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 text-left">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-base text-slate-800">Create New Purchase Order</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4 flex items-center gap-1.5">
                        <span className="text-red-500">⚠</span> {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vendor Name</label>
                        <input
                            value={vendor}
                            onChange={(e) => setVendor(e.target.value)}
                            required
                            placeholder="e.g. Petron Corporation"
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Order Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600 focus:bg-white"
                            >
                                <option value="Bulk Fuel">Bulk Fuel</option>
                                <option value="Lubricants">Lubricants</option>
                                <option value="Cylinders">Cylinders</option>
                                <option value="Safety">Safety</option>
                                <option value="Convenience">Convenience</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Amount (₱)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                placeholder="0.00"
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Items Summary</label>
                        <input
                            value={items}
                            onChange={(e) => setItems(e.target.value)}
                            required
                            placeholder="e.g. 5,000L Unleaded 95, 24x Brake Fluid"
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Estimated Delivery Date (ETA)</label>
                        <input
                            type="date"
                            value={etaDate}
                            onChange={(e) => setEtaDate(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600 focus:bg-white"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full mt-6 bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm py-2.5 rounded-lg disabled:opacity-60 transition-colors"
                >
                    {saving ? "Creating PO..." : "Generate Purchase Order"}
                </button>
            </form>
        </div>
    );
}