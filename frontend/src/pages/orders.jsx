import React, { useState } from "react";
import { Package, Truck, CheckCircle2, Clock, Search, Filter, Plus } from "lucide-react";

export default function Orders({ purchaseOrders }) {
    const [searchQuery, setSearchQuery] = useState("");

    // Use the props from App.jsx, but provide rich dummy data if the API is empty during development
    const orders = purchaseOrders?.length > 0 ? purchaseOrders : [
        { id: "PO-1042", vendor: "Pilipinas Shell Petroleum", type: "Bulk Fuel", amount: "₱ 450,000", status: "In Transit", eta: "Today, 2:00 PM", items: "18,000L Diesel" },
        { id: "PO-1043", vendor: "Petron Corporation", type: "Bulk Fuel", amount: "₱ 120,000", status: "Pending", eta: "Tomorrow", items: "4,000L Unleaded 95" },
        { id: "PO-1044", vendor: "Motul Distributors", type: "Lubricants", amount: "₱ 15,500", status: "Delivered", eta: "Yesterday", items: "48x Synthetic Motor Oil 1L" },
        { id: "PO-1045", vendor: "Solane LPG", type: "Cylinders", amount: "₱ 22,000", status: "Delayed", eta: "Pending Update", items: "20x 11kg Cylinders" },
    ];

    const statusStyles = {
        "Pending": "bg-yellow-50 text-yellow-700 border-yellow-200",
        "In Transit": "bg-blue-50 text-blue-700 border-blue-200",
        "Delivered": "bg-emerald-50 text-emerald-700 border-emerald-200",
        "Delayed": "bg-rose-50 text-rose-700 border-rose-200"
    };

    const statusIcons = {
        "Pending": <Clock size={14} />,
        "In Transit": <Truck size={14} />,
        "Delivered": <CheckCircle2 size={14} />,
        "Delayed": <Clock size={14} />
    };

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                    <h1 className="font-bold text-2xl tracking-wide text-blue-950">PURCHASE ORDERS</h1>
                    <div className="text-xs text-slate-500 font-medium mt-1">Manage station supplies and fuel deliveries</div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm text-sm font-bold hover:bg-blue-700 transition-colors">
                    <Plus size={16} />
                    Create New PO
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-t-2xl border border-slate-200 border-b-0 flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search PO number or vendor..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter size={16} />
                    Filter Status
                </button>
            </div>

            {/* ORDERS LIST */}
            <div className="bg-white border border-slate-200 rounded-b-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                        <tr>
                            {["PO NUMBER", "VENDOR", "ITEMS", "TOTAL AMOUNT", "STATUS", "ETA"].map((h) => (
                                <th key={h} className="text-left text-[10px] text-slate-400 font-bold tracking-wider py-3.5 px-5 border-b border-slate-200 bg-slate-50">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                                <td className="py-4 px-5 border-b border-slate-100">
                                    <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        <Package size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                        {order.id}
                                    </div>
                                </td>
                                <td className="py-4 px-5 border-b border-slate-100">
                                    <div className="font-semibold text-slate-800 text-sm">{order.vendor}</div>
                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">{order.type}</div>
                                </td>
                                <td className="py-4 px-5 border-b border-slate-100">
                                    <div className="text-sm text-slate-600 font-medium">{order.items}</div>
                                </td>
                                <td className="py-4 px-5 border-b border-slate-100">
                                    <div className="font-bold text-emerald-700 text-sm">{order.amount}</div>
                                </td>
                                <td className="py-4 px-5 border-b border-slate-100">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${statusStyles[order.status]}`}>
                      {statusIcons[order.status]}
                        {order.status}
                    </span>
                                </td>
                                <td className="py-4 px-5 border-b border-slate-100 text-slate-500 text-sm font-medium">
                                    {order.eta}
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