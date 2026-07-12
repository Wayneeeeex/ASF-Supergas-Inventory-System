import React, { useState } from "react";
import { User, Mail, Phone, Shield, Key, Camera, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Profile() {
    const { user, token, updateProfile } = useAuth();

    // Split name
    const [first, ...lastParts] = (user?.name || "").split(" ");
    const initialFirst = first || "";
    const initialLast = lastParts.join(" ") || "";

    const [firstName, setFirstName] = useState(initialFirst);
    const [lastName, setLastName] = useState(initialLast);
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "+63 917 555 0192");

    // Passwords
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Message alerts
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");
    const [securityError, setSecurityError] = useState("");
    const [securitySuccess, setSecuritySuccess] = useState("");

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingSecurity, setSavingSecurity] = useState(false);

    // Initial letters for avatar
    const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "SG";

    async function handleProfileSubmit(e) {
        e.preventDefault();
        setProfileError("");
        setProfileSuccess("");
        setSavingProfile(true);

        try {
            const name = `${firstName} ${lastName}`.trim();
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, phone })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update profile");

            updateProfile(data.user, data.token);
            setProfileSuccess("Personal details updated successfully!");
        } catch (err) {
            setProfileError(err.message);
        } finally {
            setSavingProfile(false);
        }
    }

    async function handlePasswordSubmit(e) {
        e.preventDefault();
        setSecurityError("");
        setSecuritySuccess("");

        if (!currentPassword) {
            setSecurityError("Current password is required");
            return;
        }
        if (newPassword !== confirmPassword) {
            setSecurityError("New passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setSecurityError("New password must be at least 6 characters long");
            return;
        }

        setSavingSecurity(true);
        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update password");

            updateProfile(data.user, data.token);
            setSecuritySuccess("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setSecurityError(err.message);
        } finally {
            setSavingSecurity(false);
        }
    }

    const roleLabel = user?.role === "admin" ? "System Admin" : user?.role === "manager" ? "Station Manager" : "Staff Member";

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6">
                <h1 className="font-bold text-2xl tracking-wide text-blue-950">MY PROFILE</h1>
                <div className="text-xs text-slate-500 font-medium mt-1">Manage your account details and security</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
                {/* PROFILE CARD */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit flex flex-col items-center text-center">
                    <div className="relative mb-4 group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-yellow-400 text-blue-950 flex items-center justify-center text-3xl font-bold shadow-inner">
                            {initials}
                        </div>
                        <div className="absolute inset-0 bg-blue-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-blue-950">{user?.name}</h2>
                    <div className="text-sm text-slate-500 font-medium mb-4">{roleLabel}</div>

                    <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-3 text-left">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail size={16} className="text-slate-400" />
                            <span className="truncate">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Phone size={16} className="text-slate-400" />
                            {user?.phone || "+63 917 555 0192"}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Shield size={16} className="text-emerald-500" />
                            {user?.role === "admin" ? "Admin Privileges" : "Manager Privileges"}
                        </div>
                    </div>
                </div>

                {/* EDIT DETAILS & SECURITY */}
                <div className="space-y-6">
                    {/* Personal details form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-5 flex items-center gap-2">
                            <User size={16} className="text-blue-600" />
                            PERSONAL DETAILS
                        </h2>
                        {profileError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3.5 py-2.5 mb-4 flex items-center gap-2">
                                <AlertCircle size={15} />
                                {profileError}
                            </div>
                        )}
                        {profileSuccess && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg px-3.5 py-2.5 mb-4 flex items-center gap-2">
                                <CheckCircle2 size={15} />
                                {profileSuccess}
                            </div>
                        )}
                        <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone Number</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold tracking-wide hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {savingProfile ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Password update form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-5 flex items-center gap-2">
                            <Key size={16} className="text-blue-600" />
                            SECURITY & PASSWORD
                        </h2>
                        {securityError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3.5 py-2.5 mb-4 flex items-center gap-2">
                                <AlertCircle size={15} />
                                {securityError}
                            </div>
                        )}
                        {securitySuccess && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg px-3.5 py-2.5 mb-4 flex items-center gap-2">
                                <CheckCircle2 size={15} />
                                {securitySuccess}
                            </div>
                        )}
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Current Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirm New Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={savingSecurity}
                                    className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold tracking-wide hover:bg-slate-900 transition-colors disabled:opacity-50"
                                >
                                    {savingSecurity ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}