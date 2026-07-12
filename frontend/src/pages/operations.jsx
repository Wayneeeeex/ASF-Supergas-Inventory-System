import React, { useState, useMemo } from "react";
import { Truck, CheckCircle2, AlertCircle, MapPin, Fuel, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const LOG_PAGE_SIZE = 8;

// ── Fuel pill colours ─────────────────────────────────────────────────────────
const FUEL_COLORS = {
    "Unleaded 91": "bg-blue-100 text-blue-700",
    "Unleaded 95": "bg-violet-100 text-violet-700",
    "Diesel": "bg-amber-100 text-amber-700",
    "LPG Bulk": "bg-emerald-100 text-emerald-700",
};
function fuelColor(name) { return FUEL_COLORS[name] || "bg-slate-100 text-slate-600"; }

// ── Shared log-table sub-components ───────────────────────────────────────────
function LogHeader({ icon: Icon, iconClass, title, count, query, onQuery }) {
    return (
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <Icon size={16} className={iconClass} />
                <h2 className="font-bold text-sm text-blue-950 tracking-wide">{title}</h2>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {count} entries
                </span>
            </div>
            <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={onQuery}
                    placeholder="Search fuel, ID, date…"
                    className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-blue-500 w-52"
                />
            </div>
        </div>
    );
}

function LogPagination({ page, total, onPrev, onNext }) {
    if (total <= 1) return null;
    return (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Page {page} of {total}</span>
            <div className="flex gap-1.5">
                <button disabled={page <= 1} onClick={onPrev}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft size={14} />
                </button>
                <button disabled={page >= total} onClick={onNext}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Operations({ dummyTanks, transactions, addTransaction, refreshData, selectedStationId, stations = [] }) {
    const { token, user } = useAuth();

    const stationName = selectedStationId
        ? (stations.find((s) => s.id === selectedStationId)?.name || `Station #${selectedStationId}`)
        : null;
    const isManager = user?.role === "manager";

    // ── Form state ──────────────────────────────────────────────────────────────
    const [salesForm, setSalesForm] = useState({ tank_id: "", liters_sold: "" });
    const [priceForm, setPriceForm] = useState({ tank_id: "", new_price: "" });
    const [deliveryForm, setDeliveryForm] = useState({ tank_id: "", liters_added: "", cost_per_liter: "" });

    // ── Status banners ─────────────────────────────────────────────────────────
    const [salesStatus, setSalesStatus] = useState({ error: "", success: "" });
    const [priceStatus, setPriceStatus] = useState({ error: "", success: "" });
    const [deliveryStatus, setDeliveryStatus] = useState({ error: "", success: "" });

    // ── Log search + pagination ────────────────────────────────────────────────
    const [salesQuery, setSalesQuery] = useState("");
    const [salesPage, setSalesPage] = useState(1);
    const [depotQuery, setDepotQuery] = useState("");
    const [depotPage, setDepotPage] = useState(1);

    // ── Derived data ───────────────────────────────────────────────────────────
    const tankPrices = {};
    dummyTanks.forEach((t) => { tankPrices[t.id] = t.price_per_liter; });

    const fuelNames = new Set(dummyTanks.map((t) => t.name));

    const estimatedRevenue = salesForm.tank_id && salesForm.liters_sold
        ? (parseFloat(salesForm.liters_sold) * (tankPrices[salesForm.tank_id] || 0)).toFixed(2)
        : "0.00";

    // Filter transactions by selected station
    const stationTransactions = useMemo(() => {
        if (selectedStationId === null) return transactions;
        return transactions.filter((t) => Number(t.station_id) === Number(selectedStationId));
    }, [transactions, selectedStationId]);

    // Fuel sales log (category = "sales", type must be a known fuel tank)
    const fuelSalesLog = useMemo(() =>
        stationTransactions.filter((t) => t.category === "sales" && fuelNames.has(t.type)),
        [stationTransactions, fuelNames]);

    // Depot delivery log (category = "delivery")
    const depotLog = useMemo(() =>
        stationTransactions.filter((t) => t.category === "delivery"),
        [stationTransactions]);

    // Filtered & paged — sales
    const filteredSales = useMemo(() => {
        const q = salesQuery.toLowerCase().trim();
        return q
            ? fuelSalesLog.filter((t) => t.type.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.date.includes(q))
            : fuelSalesLog;
    }, [fuelSalesLog, salesQuery]);

    const totalSalesPages = Math.max(1, Math.ceil(filteredSales.length / LOG_PAGE_SIZE));
    const safeSalesPage = Math.min(salesPage, totalSalesPages);
    const pagedSales = filteredSales.slice((safeSalesPage - 1) * LOG_PAGE_SIZE, safeSalesPage * LOG_PAGE_SIZE);

    // Filtered & paged — depot
    const filteredDepot = useMemo(() => {
        const q = depotQuery.toLowerCase().trim();
        return q
            ? depotLog.filter((t) => t.type.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.date.includes(q))
            : depotLog;
    }, [depotLog, depotQuery]);

    const totalDepotPages = Math.max(1, Math.ceil(filteredDepot.length / LOG_PAGE_SIZE));
    const safeDepotPage = Math.min(depotPage, totalDepotPages);
    const pagedDepot = filteredDepot.slice((safeDepotPage - 1) * LOG_PAGE_SIZE, safeDepotPage * LOG_PAGE_SIZE);

    // ── Financials ─────────────────────────────────────────────────────────────
    const total_revenue = fuelSalesLog.reduce((s, t) => s + Number(t.amount), 0);
    const total_liters_sold = fuelSalesLog.reduce((s, t) => s + Number(t.liters), 0);
    const total_cost = depotLog.reduce((s, t) => s + Number(t.amount), 0);
    const net_profit_loss = total_revenue - total_cost;

    // ── Handlers ───────────────────────────────────────────────────────────────

    // 1. Log a sale
    async function handleSalesSubmit(e) {
        e.preventDefault();
        setSalesStatus({ error: "", success: "" });
        const tankId = salesForm.tank_id;
        const liters = parseFloat(salesForm.liters_sold);

        if (!tankId || isNaN(liters) || liters <= 0) return setSalesStatus({ error: "Please enter a valid volume", success: "" });
        const tank = dummyTanks.find((t) => String(t.id) === String(tankId));
        if (!tank) return setSalesStatus({ error: "Selected tank not found", success: "" });
        if (liters > tank.volume_liters) return setSalesStatus({ error: `Not enough fuel — tank only has ${tank.vol}`, success: "" });

        const newVolume = Math.max(0, tank.volume_liters - liters);
        try {
            const res = await fetch(`${API_URL}/tanks/${tankId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ volume_liters: newVolume }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update tank volume");

            const revenue = liters * tank.price_per_liter;
            addTransaction({
                id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                station_id: tank.station_id,
                time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
                type: tank.name,
                amount: revenue,
                liters: liters,
                price_per_liter: tank.price_per_liter,   // ← stored for the log column
                date: new Date().toISOString().slice(0, 10),
                category: "sales",
            });
            refreshData();
            setSalesForm({ tank_id: "", liters_sold: "" });
            setSalesPage(1);
            setSalesStatus({ error: "", success: `Logged ${liters.toLocaleString()} L of ${tank.name} at ₱${tank.price_per_liter}/L → ₱${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` });
        } catch (err) { setSalesStatus({ error: err.message, success: "" }); }
    }

    // 2. Update retail pump price
    async function handlePriceSubmit(e) {
        e.preventDefault();
        setPriceStatus({ error: "", success: "" });
        const tankId = priceForm.tank_id;
        const newPrice = parseFloat(priceForm.new_price);

        if (!tankId || isNaN(newPrice) || newPrice <= 0) return setPriceStatus({ error: "Please enter a valid price", success: "" });
        const tank = dummyTanks.find((t) => String(t.id) === String(tankId));
        if (!tank) return setPriceStatus({ error: "Selected tank not found", success: "" });

        try {
            const res = await fetch(`${API_URL}/tanks/${tankId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ price_per_liter: newPrice }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update price");
            refreshData();
            setPriceForm({ tank_id: "", new_price: "" });
            setPriceStatus({ error: "", success: `${tank.name} retail price updated → ₱${newPrice.toFixed(2)}/L` });
        } catch (err) { setPriceStatus({ error: err.message, success: "" }); }
    }

    // 3. Log a depot delivery
    async function handleDeliverySubmit(e) {
        e.preventDefault();
        setDeliveryStatus({ error: "", success: "" });
        const tankId = deliveryForm.tank_id;
        const liters = parseFloat(deliveryForm.liters_added);
        const cost = parseFloat(deliveryForm.cost_per_liter);

        if (!tankId || isNaN(liters) || liters <= 0 || isNaN(cost) || cost <= 0)
            return setDeliveryStatus({ error: "Please enter a valid volume and cost", success: "" });
        const tank = dummyTanks.find((t) => String(t.id) === String(tankId));
        if (!tank) return setDeliveryStatus({ error: "Selected tank not found", success: "" });

        const newVolume = Math.min(tank.capacity_liters, tank.volume_liters + liters);
        try {
            const res = await fetch(`${API_URL}/tanks/${tankId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ volume_liters: newVolume }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update tank volume");

            const deliveryCost = liters * cost;
            addTransaction({
                id: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
                station_id: tank.station_id,
                time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
                type: tank.name,
                amount: deliveryCost,
                liters: liters,
                price_per_liter: cost,            // ← depot cost/L stored for the log column
                date: new Date().toISOString().slice(0, 10),
                category: "delivery",
            });
            refreshData();
            setDeliveryForm({ tank_id: "", liters_added: "", cost_per_liter: "" });
            setDepotPage(1);
            setDeliveryStatus({ error: "", success: `Logged ${liters.toLocaleString()} L delivery for ${tank.name} at ₱${cost.toFixed(2)}/L` });
        } catch (err) { setDeliveryStatus({ error: err.message, success: "" }); }
    }

    // ── Shared table-column templates ──────────────────────────────────────────
    // 6-column layout: ID | Fuel | Date & Time | Price/L | Liters | Amount
    const TABLE_COLS = "grid-cols-[160px_1fr_160px_90px_100px_120px]";

    // ── JSX ─────────────────────────────────────────────────────────────────────
    return (
        <div className="animate-in fade-in duration-300">

            {/* PAGE HEADER */}
            <div className="mb-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="font-bold text-2xl tracking-wide text-blue-950">SALES &amp; LOGISTICS</h1>
                        <div className="text-xs text-slate-500 font-medium mt-1">Manage fuel outflow, pricing, and deliveries</div>
                    </div>
                    {stationName && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${isManager ? "bg-yellow-50 border-yellow-300 text-yellow-800" : "bg-blue-50 border-blue-200 text-blue-700"
                            }`}>
                            <MapPin size={13} className="shrink-0" />
                            <span>{isManager ? "Managing:" : "Station:"} {stationName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* KPI BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "FUEL REVENUE", value: `₱${total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-emerald-600" },
                    { label: "TOTAL LITERS SOLD", value: `${total_liters_sold.toLocaleString(undefined, { maximumFractionDigits: 1 })} L`, color: "text-blue-700" },
                    { label: "ACQUISITION COST", value: `₱${total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-rose-600" },
                    { label: "NET PROFIT / LOSS", value: `${net_profit_loss >= 0 ? "+" : "-"}₱${Math.abs(net_profit_loss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: net_profit_loss >= 0 ? "text-blue-700" : "text-rose-600" },
                ].map((kpi) => (
                    <div key={kpi.label} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                        <div className="text-[10px] font-bold text-slate-400 tracking-wide mb-1">{kpi.label}</div>
                        <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* FORMS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* LEFT: SALES + PRICING */}
                <div className="space-y-6">

                    {/* Log Daily Sales */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-4">LOG DAILY SALES OUTFLOW</h2>
                        {salesStatus.error && <Banner type="error" msg={salesStatus.error} />}
                        {salesStatus.success && <Banner type="success" msg={salesStatus.success} />}
                        <form onSubmit={handleSalesSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Select Dispenser / Tank</label>
                                <select className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500"
                                    value={salesForm.tank_id} onChange={(e) => setSalesForm({ ...salesForm, tank_id: e.target.value })} required>
                                    <option value="">Select Fuel Type…</option>
                                    {dummyTanks.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name} — {t.vol} available · ₱{t.price_per_liter}/L</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Liters Sold</label>
                                    <div className="relative">
                                        <input type="number" step="0.01" required placeholder="0.00"
                                            className="w-full border border-slate-200 bg-slate-50 p-2.5 pr-8 rounded-lg text-sm outline-none focus:border-blue-500"
                                            value={salesForm.liters_sold} onChange={(e) => setSalesForm({ ...salesForm, liters_sold: e.target.value })} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">L</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Auto-Calculated Revenue</label>
                                    <div className="w-full border border-emerald-200 bg-emerald-50 p-2.5 rounded-lg text-sm font-bold text-emerald-700">
                                        ₱ {Number(estimatedRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold tracking-wide hover:bg-blue-700 transition-colors mt-2">
                                Deduct Inventory &amp; Log Revenue
                            </button>
                        </form>
                    </div>

                    {/* Update Retail Price */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-4">UPDATE RETAIL PUMP PRICE</h2>
                        {priceStatus.error && <Banner type="error" msg={priceStatus.error} />}
                        {priceStatus.success && <Banner type="success" msg={priceStatus.success} />}
                        <form onSubmit={handlePriceSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Fuel Category</label>
                                    <select className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500"
                                        value={priceForm.tank_id} onChange={(e) => setPriceForm({ ...priceForm, tank_id: e.target.value })} required>
                                        <option value="">Select Fuel…</option>
                                        {dummyTanks.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name} — ₱{t.price_per_liter}/L</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">New Price per Liter</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                        <input type="number" step="0.01" required placeholder="0.00"
                                            className="w-full border border-slate-200 bg-slate-50 p-2.5 pl-7 rounded-lg text-sm outline-none focus:border-blue-500"
                                            value={priceForm.new_price} onChange={(e) => setPriceForm({ ...priceForm, new_price: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-bold tracking-wide hover:bg-slate-900 transition-colors">
                                Apply New Price
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: BULK FUEL DELIVERY */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide">LOG BULK FUEL DELIVERY</h2>
                        <Truck size={18} className="text-slate-400" />
                    </div>
                    {deliveryStatus.error && <Banner type="error" msg={deliveryStatus.error} />}
                    {deliveryStatus.success && <Banner type="success" msg={deliveryStatus.success} />}
                    <form onSubmit={handleDeliverySubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Receiving Underground Tank</label>
                            <select className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500"
                                value={deliveryForm.tank_id} onChange={(e) => setDeliveryForm({ ...deliveryForm, tank_id: e.target.value })} required>
                                <option value="">Select Target Tank…</option>
                                {dummyTanks.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name} — {t.vol} / {t.cap}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Volume Deposited</label>
                                <div className="relative">
                                    <input type="number" required placeholder="0"
                                        className="w-full border border-slate-200 bg-slate-50 p-2.5 pr-8 rounded-lg text-sm outline-none focus:border-blue-500"
                                        value={deliveryForm.liters_added} onChange={(e) => setDeliveryForm({ ...deliveryForm, liters_added: e.target.value })} />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">L</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Depot Cost per Liter</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                    <input type="number" step="0.01" required placeholder="0.00"
                                        className="w-full border border-slate-200 bg-slate-50 p-2.5 pl-7 rounded-lg text-sm outline-none focus:border-blue-500"
                                        value={deliveryForm.cost_per_liter} onChange={(e) => setDeliveryForm({ ...deliveryForm, cost_per_liter: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-yellow-400 text-blue-950 py-2.5 rounded-lg text-sm font-bold tracking-wide hover:bg-yellow-500 transition-colors mt-4">
                            Confirm Delivery &amp; Update P&amp;L
                        </button>
                    </form>
                </div>
            </div>

            {/* ── FUEL SALES LOG ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <LogHeader
                    icon={Fuel} iconClass="text-blue-600"
                    title="FUEL SALES LOG"
                    count={filteredSales.length}
                    query={salesQuery}
                    onQuery={(e) => { setSalesQuery(e.target.value); setSalesPage(1); }}
                />

                {/* Column headers */}
                <div className={`grid ${TABLE_COLS} px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-widest uppercase`}>
                    <div>Transaction ID</div>
                    <div>Fuel Type</div>
                    <div>Date &amp; Time</div>
                    <div className="text-right">Price/L</div>
                    <div className="text-right">Liters</div>
                    <div className="text-right">Revenue</div>
                </div>

                {pagedSales.length === 0 ? (
                    <EmptyState icon={Fuel} label="No fuel sales recorded yet" hint="Use the form above to log a sale" />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {pagedSales.map((txn) => (
                            <div key={txn.id} className={`grid ${TABLE_COLS} px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors`}>
                                <div className="font-mono text-xs font-semibold text-slate-700">{txn.id}</div>
                                <div>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${fuelColor(txn.type)}`}>{txn.type}</span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-slate-700 font-medium">{txn.date}</span>
                                    <span className="ml-1.5 text-slate-400">{txn.time}</span>
                                </div>
                                <div className="text-right text-xs font-semibold text-slate-600">
                                    {txn.price_per_liter != null
                                        ? `₱${Number(txn.price_per_liter).toFixed(2)}`
                                        : <span className="text-slate-300">—</span>}
                                </div>
                                <div className="text-right text-xs font-semibold text-slate-700">
                                    {Number(txn.liters).toLocaleString(undefined, { maximumFractionDigits: 2 })} L
                                </div>
                                <div className="text-right text-sm font-bold text-emerald-600">
                                    ₱{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <LogPagination
                    page={safeSalesPage} total={totalSalesPages}
                    onPrev={() => setSalesPage((p) => p - 1)}
                    onNext={() => setSalesPage((p) => p + 1)}
                />
            </div>

            {/* ── DEPOT DELIVERY LOG ────────────────────────────────────────────*/}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <LogHeader
                    icon={Truck} iconClass="text-amber-500"
                    title="DEPOT DELIVERY LOG"
                    count={filteredDepot.length}
                    query={depotQuery}
                    onQuery={(e) => { setDepotQuery(e.target.value); setDepotPage(1); }}
                />

                {/* Column headers */}
                <div className={`grid ${TABLE_COLS} px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-widest uppercase`}>
                    <div>Delivery ID</div>
                    <div>Fuel Type</div>
                    <div>Date &amp; Time</div>
                    <div className="text-right">Cost/L</div>
                    <div className="text-right">Liters</div>
                    <div className="text-right">Total Cost</div>
                </div>

                {pagedDepot.length === 0 ? (
                    <EmptyState icon={Truck} label="No depot deliveries recorded yet" hint="Use the form above to log a delivery" />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {pagedDepot.map((txn) => (
                            <div key={txn.id} className={`grid ${TABLE_COLS} px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors`}>
                                <div className="font-mono text-xs font-semibold text-slate-700">{txn.id}</div>
                                <div>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${fuelColor(txn.type)}`}>{txn.type}</span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-slate-700 font-medium">{txn.date}</span>
                                    <span className="ml-1.5 text-slate-400">{txn.time}</span>
                                </div>
                                <div className="text-right text-xs font-semibold text-slate-600">
                                    {txn.price_per_liter != null
                                        ? `₱${Number(txn.price_per_liter).toFixed(2)}`
                                        : <span className="text-slate-300">—</span>}
                                </div>
                                <div className="text-right text-xs font-semibold text-slate-700">
                                    {Number(txn.liters).toLocaleString(undefined, { maximumFractionDigits: 2 })} L
                                </div>
                                <div className="text-right text-sm font-bold text-rose-500">
                                    ₱{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <LogPagination
                    page={safeDepotPage} total={totalDepotPages}
                    onPrev={() => setDepotPage((p) => p - 1)}
                    onNext={() => setDepotPage((p) => p + 1)}
                />
            </div>
        </div>
    );
}

// ── Tiny reusable helpers ─────────────────────────────────────────────────────
function Banner({ type, msg }) {
    const s = type === "error"
        ? "bg-red-50 border-red-200 text-red-700"
        : "bg-emerald-50 border-emerald-200 text-emerald-700";
    const Icon = type === "error" ? AlertCircle : CheckCircle2;
    return (
        <div className={`${s} border text-xs rounded-lg px-3.5 py-2.5 mb-4 flex items-center gap-2`}>
            <Icon size={15} /> {msg}
        </div>
    );
}

function EmptyState({ icon: Icon, label, hint }) {
    return (
        <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
            <Icon size={28} className="opacity-30" />
            <div className="text-sm font-medium">{label}</div>
            <div className="text-xs">{hint}</div>
        </div>
    );
}