import React, { useState } from "react";
import { Fuel, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-xl bg-yellow-400 text-blue-950 font-bold flex items-center justify-center text-lg mb-3">
                        ASF
                    </div>
                    <div className="font-semibold text-lg text-blue-950 tracking-wide">ASF SUPER GAS</div>
                    <div className="text-xs text-slate-500 mt-1">Station Inventory System</div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h1 className="font-bold text-xl text-slate-800 mb-1">Sign in</h1>
                    <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the dashboard.</p>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-4">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                    <div className="relative mb-4">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="you@asfsupergas.com"
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                        />
                    </div>

                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                    <div className="relative mb-6">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
                    >
                        <Fuel size={15} />
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}