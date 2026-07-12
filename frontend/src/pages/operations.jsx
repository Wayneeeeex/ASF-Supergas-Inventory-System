import React, { useState } from "react";
import { Truck } from "lucide-react";

export default function Operations({ dummyTanks }) {
    const [salesForm, setSalesForm] = useState({ tank_id: "", liters_sold: "" });
    const [priceForm, setPriceForm] = useState({ tank_id: "", new_price: "" });
    const [deliveryForm, setDeliveryForm] = useState({ tank_id: "", liters_added: "", cost_per_liter: "" });

    const [financials] = useState({
        total_revenue: 124500.00,
        total_cost: 98000.00,
        net_profit_loss: 26500.00
    });

    const tankPrices = {
        "1": 60.50, // Unleaded 91
        "2": 65.20, // Unleaded 95
        "3": 58.00, // Diesel
        "4": 45.00  // LPG
    };

    const currentEstimatedRevenue = salesForm.tank_id && salesForm.liters_sold
        ? (parseFloat(salesForm.liters_sold) * tankPrices[salesForm.tank_id]).toFixed(2)
        : "0.00";

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6">
                <h1 className="font-bold text-2xl tracking-wide text-blue-950">SALES & LOGISTICS</h1>
                <div className="text-xs text-slate-500 font-medium mt-1">Manage fuel outflow, pricing, and deliveries</div>
            </div>

            {/* FINANCIAL OVERVIEW CARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 tracking-wide mb-1">TOTAL REVENUE</div>
                    <div className="text-2xl font-bold text-emerald-600">₱{financials.total_revenue.toLocaleString()}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 tracking-wide mb-1">ACQUISITION COST</div>
                    <div className="text-2xl font-bold text-rose-600">₱{financials.total_cost.toLocaleString()}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
                    <div className="text-xs font-bold text-slate-400 tracking-wide mb-1">NET PROFIT / LOSS</div>
                    <div className={`text-2xl font-bold ${financials.net_profit_loss >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {financials.net_profit_loss >= 0 ? "+" : "-"}₱{Math.abs(financials.net_profit_loss).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN: SALES & PRICING */}
                <div className="space-y-6">
                    {/* Log Daily Sales */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-4">LOG DAILY SALES OUTFLOW</h2>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Sales Logged!"); }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Select Dispenser / Tank</label>
                                <select
                                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500"
                                    value={salesForm.tank_id}
                                    onChange={e => setSalesForm({...salesForm, tank_id: e.target.value})}
                                >
                                    <option value="">Select Fuel Type...</option>
                                    {dummyTanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Liters Sold</label>
                                    <div className="relative">
                                        <input type="number" step="0.01" className="w-full border border-slate-200 bg-slate-50 p-2.5 pr-8 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="0.00"
                                               value={salesForm.liters_sold} onChange={e => setSalesForm({...salesForm, liters_sold: e.target.value})} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">L</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Auto-Calculated Revenue</label>
                                    <div className="w-full border border-emerald-200 bg-emerald-50 p-2.5 rounded-lg text-sm font-bold text-emerald-700">
                                        ₱ {currentEstimatedRevenue}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold tracking-wide hover:bg-blue-700 transition-colors mt-2">
                                Deduct Inventory & Log Revenue
                            </button>
                        </form>
                    </div>

                    {/* Change Retail Price */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-4">UPDATE RETAIL PUMP PRICE</h2>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Price Updated!"); }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Fuel Category</label>
                                    <select
                                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500"
                                        value={priceForm.tank_id}
                                        onChange={e => setPriceForm({...priceForm, tank_id: e.target.value})}
                                    >
                                        <option value="">Select Fuel...</option>
                                        {dummyTanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">New Price per Liter</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                        <input type="number" step="0.01" className="w-full border border-slate-200 bg-slate-50 p-2.5 pl-7 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="0.00"
                                               value={priceForm.new_price} onChange={e => setPriceForm({...priceForm, new_price: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-bold tracking-wide hover:bg-slate-900 transition-colors">
                                Apply New Price
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: FUEL INFLOW LOGGING */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide">LOG BULK FUEL DELIVERY</h2>
                        <Truck size={18} className="text-slate-400" />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); alert("Delivery Logged!"); }} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Receiving Underground Tank</label>
                            <select
                                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500"
                                value={deliveryForm.tank_id}
                                onChange={e => setDeliveryForm({...deliveryForm, tank_id: e.target.value})}
                            >
                                <option value="">Select Target Tank...</option>
                                {dummyTanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Volume Deposited</label>
                                <div className="relative">
                                    <input type="number" className="w-full border border-slate-200 bg-slate-50 p-2.5 pr-8 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="0"
                                           value={deliveryForm.liters_added} onChange={e => setDeliveryForm({...deliveryForm, liters_added: e.target.value})} />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">L</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Depot Cost per Liter</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                    <input type="number" step="0.01" className="w-full border border-slate-200 bg-slate-50 p-2.5 pl-7 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="0.00"
                                           value={deliveryForm.cost_per_liter} onChange={e => setDeliveryForm({...deliveryForm, cost_per_liter: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-yellow-400 text-blue-950 py-2.5 rounded-lg text-sm font-bold tracking-wide hover:bg-yellow-500 transition-colors mt-4">
                            Confirm Delivery & Update P&L
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}