import React from "react";
import { Store, Bell, Globe, Database, Save } from "lucide-react";

export default function Settings() {
    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-bold text-2xl tracking-wide text-blue-950">STATION SETTINGS</h1>
                    <div className="text-xs text-slate-500 font-medium mt-1">Configure global preferences and notifications</div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm text-sm font-bold hover:bg-blue-700 transition-colors">
                    <Save size={16} /> Save Configurations
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* GENERAL SETTINGS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-5 flex items-center gap-2">
                        <Store size={16} className="text-blue-600" />
                        STATION INFORMATION
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Station Name</label>
                            <input type="text" defaultValue="ASF Super Gas - Bunawan" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Operating Location</label>
                            <textarea rows={2} defaultValue="Bunawan Depot, Davao Region, Philippines" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Opening Time</label>
                                <input type="time" defaultValue="05:00" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Closing Time</label>
                                <input type="time" defaultValue="23:00" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* NOTIFICATIONS & ALERTS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-5 flex items-center gap-2">
                        <Bell size={16} className="text-blue-600" />
                        ALERT PREFERENCES
                    </h2>
                    <div className="space-y-4">
                        {[
                            { label: "Critical Stock Alerts", desc: "Notify when tanks or items drop below 15%" },
                            { label: "Daily Shift Reports", desc: "Email automated financial summaries at closing" },
                            { label: "Price Change Logs", desc: "Require confirmation for retail pump price updates" },
                            { label: "New Purchase Orders", desc: "Alert managers when a new PO is generated" }
                        ].map((setting, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">{setting.label}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{setting.desc}</div>
                                </div>
                                <div className="w-10 h-6 bg-blue-600 rounded-full relative shadow-inner">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SYSTEM CONFIG */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-5 flex items-center gap-2">
                        <Database size={16} className="text-blue-600" />
                        SYSTEM CONFIGURATION
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Currency Setup</label>
                            <select className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500">
                                <option value="PHP">Philippine Peso (₱)</option>
                                <option value="USD">US Dollar ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Volume Metric</label>
                            <select className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500">
                                <option value="Liters">Liters (L)</option>
                                <option value="Gallons">Gallons (Gal)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                                <Globe size={12} /> Timezone
                            </label>
                            <select className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500">
                                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}