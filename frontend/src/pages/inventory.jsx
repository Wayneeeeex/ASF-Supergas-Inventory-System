import React from "react";
import { Search, Bell, Package, TrendingUp, AlertTriangle, Truck, Plus, X } from "lucide-react";

// Helper functions & constants
const CATEGORY_FILTERS = [
    { key: "all", label: "All" },
    { key: "Lubricants", label: "Lubricants" },
    { key: "Filters", label: "Filters & Parts" },
    { key: "Cylinders", label: "LPG Cylinders" },
    { key: "Safety", label: "Safety Gear" },
    { key: "Convenience", label: "Convenience" },
];
const STATUS_FILTERS = ["In Stock", "Low", "Critical"];

const tankRing = (pct, status) => {
    const color = status === "critical" ? "#dc2626" : status === "low" ? "#facc15" : "#2563eb";
    return { background: `conic-gradient(${color} 0% ${pct}%, rgba(255,255,255,0.12) ${pct}% 100%)` };
};

const barTone = { healthy: "bg-blue-600", low: "bg-yellow-400", critical: "bg-red-600" };

const poStatusStyle = {
    "In Transit": "bg-blue-50 text-blue-700",
    Pending: "bg-yellow-50 text-yellow-700",
    Delayed: "bg-red-50 text-red-600",
    Delivered: "bg-emerald-50 text-emerald-600",
};

const rowStatusStyle = {
    "In Stock": "text-emerald-600",
    Low: "text-yellow-600",
    Critical: "text-red-600",
    "Out of Stock": "text-slate-400",
};

const qtyStyle = {
    "In Stock": "text-slate-800",
    Low: "text-yellow-600",
    Critical: "text-red-600",
    "Out of Stock": "text-red-600",
};

export default function Inventory({
                                      tanks, products, categoryBars, purchaseOrders, alertOpen, setAlertOpen,
                                      criticalCount, criticalNames, query, setQuery, activeCat, setActiveCat,
                                      activeStatus, setActiveStatus
                                  }) {
    return (
        <div className="animate-in fade-in duration-300">
            {/* TOPBAR */}
            <div className="flex items-center justify-between gap-5 mb-6 flex-wrap">
                <div>
                    <h1 className="font-bold text-2xl tracking-wide text-blue-950">STATION INVENTORY</h1>
                    <div className="text-xs text-slate-500 font-medium mt-1">Bunawan Depot · Davao Region</div>
                </div>
                <div className="relative flex-1 max-w-sm min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search SKU or name..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white shadow-sm text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    />
                </div>
                <button className="w-10 h-10 rounded-lg border border-slate-200 bg-white shadow-sm flex items-center justify-center relative shrink-0 hover:bg-slate-50">
                    <Bell size={18} className="text-slate-600" />
                    {criticalCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
                    )}
                </button>
            </div>

            {/* ALERT BANNER */}
            {alertOpen && criticalCount > 0 && (
                <div className="flex items-center gap-3 bg-red-600 text-white rounded-xl px-4 py-3.5 mb-6 text-sm font-medium shadow-sm">
                    <AlertTriangle size={18} className="shrink-0" />
                    <div>
                        <b className="font-bold">{criticalCount} critical alert{criticalCount !== 1 ? "s" : ""}:</b>{" "}
                        {criticalNames.join(", ")} need immediate reorder
                    </div>
                    <button onClick={() => setAlertOpen(false)} className="ml-auto opacity-75 hover:opacity-100 shrink-0">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="TOTAL SKUS" value={String(products.length)} delta="live from database" tone="up" icon={Package} iconTone="blue" />
                <StatCard label="INVENTORY VALUE" value={`₱${products.reduce((sum, p) => sum + p.qty * Number(p.unit_cost), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} delta="across depot & forecourt" tone="up" icon={TrendingUp} iconTone="yellow" />
                <StatCard label="LOW / CRITICAL" value={String(products.filter((p) => p.status === "Low" || p.status === "Critical").length)} delta="items below minimum" tone="down" icon={AlertTriangle} iconTone="red" />
                <StatCard label="OPEN ORDERS" value={String(purchaseOrders.filter((po) => po.status !== "Delivered").length)} delta={`${purchaseOrders.length} total this cycle`} tone="neutral" icon={Truck} iconTone="green" />
            </div>

            {/* TANK GAUGES */}
            <div className="relative overflow-hidden rounded-2xl bg-blue-950 px-7 py-6 mb-6 shadow-md">
                <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 90% -10%, rgba(250,204,21,0.18), transparent 45%)" }} />
                <div className="relative flex items-center justify-between mb-5">
                    <h2 className="text-white font-semibold text-sm tracking-wider">UNDERGROUND TANK LEVELS</h2>
                    <span className="text-[11px] text-white/50 font-medium">Live from database</span>
                </div>
                <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tanks.map((t) => (
                        <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 flex flex-col items-center text-center">
                            <div className="w-28 h-28 rounded-full flex items-center justify-center mb-2.5" style={tankRing(t.pct, t.status)}>
                                <div className="w-[88px] h-[88px] rounded-full bg-blue-950 ring-1 ring-white/10 flex flex-col items-center justify-center shadow-inner">
                                    <div className="text-white font-bold text-xl leading-none">{t.pct}%</div>
                                    <div className="text-white/40 text-[8px] tracking-widest font-semibold mt-1">FULL</div>
                                </div>
                            </div>
                            <div className="text-white font-semibold text-sm">{t.name}</div>
                            <div className="text-white/55 text-[11px] mt-0.5 font-mono">{t.vol} / {t.cap}</div>
                            <span className={`mt-2 text-[9px] font-bold tracking-wide px-2.5 py-1 rounded-full ${t.status === "critical" ? "bg-red-500/25 text-red-300" : t.status === "low" ? "bg-yellow-400/20 text-yellow-300" : "bg-blue-500/30 text-blue-200"}`}>
                {t.status === "critical" ? "CRITICAL — ORDER NOW" : t.status === "low" ? "LOW — REORDER SOON" : "HEALTHY"}
              </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CHART + PURCHASE ORDERS */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5 mb-6">
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-sm tracking-wide text-blue-950">STOCK LEVELS BY CATEGORY</h2>
                        <span className="text-[11px] text-slate-400 font-medium">Units on hand</span>
                    </div>
                    <div className="flex items-end gap-6 h-44 border-b border-slate-200 pb-2">
                        {categoryBars.map((b) => (
                            <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full max-w-[46px] h-40 flex items-end">
                                    <div className={`w-full rounded-t-md ${barTone[b.tone]}`} style={{ height: `${b.pct}%` }} />
                                </div>
                                <div className="text-[11px] text-slate-500 font-semibold text-center">{b.label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-3 text-[11px] text-slate-500 font-medium">
                        <LegendDot color="bg-blue-600" label="Healthy" />
                        <LegendDot color="bg-yellow-400" label="Low" />
                        <LegendDot color="bg-red-600" label="Critical" />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-sm tracking-wide text-blue-950">PURCHASE ORDERS</h2>
                        <button className="flex items-center gap-1 text-xs font-bold text-yellow-600 hover:text-yellow-700">
                            <Plus size={13} /> New PO
                        </button>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {purchaseOrders.map((po) => (
                            <div key={po.id} className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-3 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-mono font-semibold text-xs text-slate-800">{po.id}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">{po.vendor}</div>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${poStatusStyle[po.status]}`}>{po.status}</span>
                                <div className="text-right shrink-0">
                                    <div className="font-bold text-xs text-slate-800">{po.amount}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">ETA {po.eta}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PRODUCT TABLE */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-5">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <h2 className="font-semibold text-sm tracking-wide text-blue-950">
                        PRODUCT INVENTORY <span className="text-slate-400 font-medium text-xs">({products.length} items)</span>
                    </h2>
                    <div className="flex gap-1.5 flex-wrap">
                        {CATEGORY_FILTERS.map((f) => (
                            <Chip key={f.key} active={activeCat === f.key} onClick={() => setActiveCat(f.key)}>{f.label}</Chip>
                        ))}
                        {STATUS_FILTERS.map((s) => (
                            <Chip key={s} active={activeStatus === s} onClick={() => setActiveStatus(activeStatus === s ? null : s)}>
                                {s === "In Stock" ? "In Stock" : `${s} Stock`}
                            </Chip>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[720px]">
                        <thead>
                        <tr>
                            {["NAME / SKU", "CATEGORY", "QTY", "MIN", "UNIT COST", "LOCATION", "STATUS", "UPDATED"].map((h) => (
                                <th key={h} className="text-left text-[10px] text-slate-400 font-bold tracking-wider py-3 px-2.5 border-b border-slate-200 bg-slate-50">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((p) => (
                            <tr key={p.sku} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-2.5 border-b border-slate-100">
                                    <div className="font-semibold text-slate-800 text-sm">{p.name}</div>
                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.sku}</div>
                                </td>
                                <td className="py-3 px-2.5 border-b border-slate-100">
                                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">{p.category_label}</span>
                                </td>
                                <td className="py-3 px-2.5 border-b border-slate-100">
                                    <span className={`font-mono font-bold text-sm ${qtyStyle[p.status]}`}>{p.qty}</span> <span className="text-slate-400 text-[11px]">{p.unit}</span>
                                </td>
                                <td className="py-3 px-2.5 border-b border-slate-100 text-slate-500 text-sm">{p.min_qty}</td>
                                <td className="py-3 px-2.5 border-b border-slate-100 font-mono text-sm">₱{Number(p.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="py-3 px-2.5 border-b border-slate-100 text-slate-500 text-sm">{p.location}</td>
                                <td className="py-3 px-2.5 border-b border-slate-100">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${rowStatusStyle[p.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === "In Stock" ? "bg-emerald-500" : p.status === "Low" ? "bg-yellow-500" : p.status === "Critical" ? "bg-red-600" : "bg-slate-400"}`} />
                        {p.status}
                    </span>
                                </td>
                                <td className="py-3 px-2.5 border-b border-slate-100 text-slate-400 text-xs">
                                    {new Date(p.updated_at).toISOString().slice(0, 10)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Micro-components specific to Inventory
function StatCard({ label, value, delta, tone, icon: Icon, iconTone }) {
    const iconBg = { blue: "bg-blue-50 text-blue-600", yellow: "bg-yellow-50 text-yellow-600", red: "bg-red-50 text-red-600", green: "bg-emerald-50 text-emerald-600" }[iconTone];
    const deltaColor = tone === "up" ? "text-emerald-600" : tone === "down" ? "text-red-600" : "text-slate-500";
    return (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-bold text-slate-500 tracking-wide">{label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}><Icon size={16} /></span>
            </div>
            <div className="font-bold text-2xl text-slate-800">{value}</div>
            <div className={`text-xs mt-1 font-semibold ${deltaColor}`}>{delta}</div>
        </div>
    );
}

function LegendDot({ color, label }) {
    return <span className="inline-flex items-center gap-1.5"><span className={`w-2 h-2 rounded-sm ${color}`} /> {label}</span>;
}

function Chip({ active, onClick, children }) {
    return (
        <button onClick={onClick} className={`text-[11px] font-semibold px-3.5 py-1.5 rounded-lg border transition-colors ${active ? "bg-yellow-400 border-yellow-400 text-blue-950" : "bg-white border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-700"}`}>
            {children}
        </button>
    );
}