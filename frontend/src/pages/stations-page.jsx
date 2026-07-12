import React, { useState, useEffect } from "react";
import { MapPin, User, Plus, X, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Stations() {
    const { token } = useAuth();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalStation, setModalStation] = useState(null);

    async function load() {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/stations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to load stations");
            setStations(await res.json());
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    if (loading) return <div className="text-slate-400 text-sm py-10 text-center">Loading stations…</div>;
    if (error) return <div className="text-red-600 text-sm py-10 text-center">{error}</div>;

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6">
                <h1 className="font-bold text-xl sm:text-2xl tracking-wide text-blue-950">STATIONS</h1>
                <div className="text-xs text-slate-500 font-medium mt-1">
                    Manage locations and assign station managers
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stations.map((s) => (
                    <div key={s.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Building2 size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <MapPin size={11} /> {s.address}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">
                                Station Manager
                            </div>
                            {s.manager ? (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
                                            <User size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-slate-800 truncate">{s.manager.name}</div>
                                            <div className="text-[11px] text-slate-400 truncate">{s.manager.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setModalStation(s)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setModalStation(s)}
                                    className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg py-2.5 text-sm font-semibold text-slate-500 hover:border-blue-600 hover:text-blue-600 transition-colors"
                                >
                                    <Plus size={14} /> Assign a manager
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {modalStation && (
                <ManagerModal
                    station={modalStation}
                    token={token}
                    onClose={() => setModalStation(null)}
                    onSaved={() => { setModalStation(null); load(); }}
                />
            )}
        </div>
    );
}

function ManagerModal({ station, token, onClose, onSaved }) {
    const isEditing = !!station.manager;
    const [name, setName] = useState(station.manager?.name || "");
    const [email, setEmail] = useState(station.manager?.email || "");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const url = isEditing ? `${API_URL}/users/${station.manager.id}` : `${API_URL}/users`;
            const method = isEditing ? "PUT" : "POST";
            const body = isEditing
                ? { name, station_id: station.id, role: "manager" }
                : { name, email, password, role: "manager", station_id: station.id };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save manager");
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="font-bold text-lg text-slate-800">
                        {isEditing ? "Update Manager" : "Assign Manager"}
                    </h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>
                <p className="text-xs text-slate-500 mb-5">{station.name}</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4">
                        {error}
                    </div>
                )}

                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full mb-4 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600"
                />

                {!isEditing && (
                    <>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full mb-4 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600"
                        />

                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Temporary Password</label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="They can change this later"
                            className="w-full mb-5 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600"
                        />
                    </>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm py-2.5 rounded-lg disabled:opacity-60"
                >
                    {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Manager Account"}
                </button>
            </form>
        </div>
    );
}