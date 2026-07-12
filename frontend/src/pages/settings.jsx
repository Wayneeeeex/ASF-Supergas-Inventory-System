import React, { useState, useEffect } from "react";
import { Store, Bell, Globe, Database, Save, CheckCircle2 } from "lucide-react";

export default function Settings() {
    const [stationName, setStationName] = useState("ASF Super Gas - Bunawan");
    const [location, setLocation] = useState("Bunawan Depot, Davao Region, Philippines");
    const [openingTime, setOpeningTime] = useState("05:00");
    const [closingTime, setClosingTime] = useState("23:00");

    const [alerts, setAlerts] = useState({
        criticalStock: true,
        dailyShift: true,
        priceChange: true,
        newPO: false,
    });

    const [currency, setCurrency] = useState("PHP");
    const [metric, setMetric] = useState("Liters");
    const [timezone, setTimezone] = useState("Asia/Manila");

    const [savedSuccessfully, setSavedSuccessfully] = useState(false);

    // Load configurations from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem("asf_settings");
        if (savedSettings) {
            try {
                const data = JSON.parse(savedSettings);
                if (data.stationName) setStationName(data.stationName);
                if (data.location) setLocation(data.location);
                if (data.openingTime) setOpeningTime(data.openingTime);
                if (data.closingTime) setClosingTime(data.closingTime);
                if (data.alerts) setAlerts(data.alerts);
                if (data.currency) setCurrency(data.currency);
                if (data.metric) setMetric(data.metric);
                if (data.timezone) setTimezone(data.timezone);
            } catch (err) {
                console.error("Failed to parse settings", err);
            }
        }
    }, []);

    // Save configurations
    function handleSave(e) {
        if (e) e.preventDefault();
        const data = {
            stationName,
            location,
            openingTime,
            closingTime,
            alerts,
            currency,
            metric,
            timezone,
        };
        localStorage.setItem("asf_settings", JSON.stringify(data));
        setSavedSuccessfully(true);
        setTimeout(() => setSavedSuccessfully(false), 3000);
    }

    const toggleAlert = (key) => {
        setAlerts((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="font-bold text-2xl tracking-wide text-blue-950">STATION SETTINGS</h1>
                    <div className="text-xs text-slate-500 font-medium mt-1">Configure global preferences and notifications</div>
                </div>
                <div className="flex items-center gap-3">
                    {savedSuccessfully && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3.5 py-2 rounded-lg font-semibold animate-in slide-in-from-right-3">
                            <CheckCircle2 size={14} /> Saved!
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                        <Save size={16} /> Save Configurations
                    </button>
                </div>
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
                            <input
                                type="text"
                                value={stationName}
                                onChange={(e) => setStationName(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Operating Location</label>
                            <textarea
                                rows={2}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Opening Time</label>
                                <input
                                    type="time"
                                    value={openingTime}
                                    onChange={(e) => setOpeningTime(e.target.value)}
                                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Closing Time</label>
                                <input
                                    type="time"
                                    value={closingTime}
                                    onChange={(e) => setClosingTime(e.target.value)}
                                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
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
                            { key: "criticalStock", label: "Critical Stock Alerts", desc: "Notify when tanks or items drop below 15%" },
                            { key: "dailyShift", label: "Daily Shift Reports", desc: "Email automated financial summaries at closing" },
                            { key: "priceChange", label: "Price Change Logs", desc: "Require confirmation for retail pump price updates" },
                            { key: "newPO", label: "New Purchase Orders", desc: "Alert managers when a new PO is generated" }
                        ].map((setting) => (
                            <div
                                key={setting.key}
                                onClick={() => toggleAlert(setting.key)}
                                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <div>
                                    <div className="text-sm font-bold text-slate-800">{setting.label}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{setting.desc}</div>
                                </div>
                                <button
                                    type="button"
                                    className={`w-10 h-6 rounded-full relative transition-colors ${alerts[setting.key] ? "bg-blue-600" : "bg-slate-300"}`}
                                >
                                    <div
                                        className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${alerts[setting.key] ? "right-1" : "left-1"}`}
                                    />
                                </button>
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
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                            >
                                <option value="PHP">Philippine Peso (₱)</option>
                                <option value="USD">US Dollar ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Volume Metric</label>
                            <select
                                value={metric}
                                onChange={(e) => setMetric(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                            >
                                <option value="Liters">Liters (L)</option>
                                <option value="Gallons">Gallons (Gal)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                                <Globe size={12} /> Timezone
                            </label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                            >
                                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}