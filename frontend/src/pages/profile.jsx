import React from "react";
import { User, Mail, Phone, Shield, Key, Camera } from "lucide-react";

export default function Profile() {
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
                            MR
                        </div>
                        <div className="absolute inset-0 bg-blue-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-blue-950">Marcus Reilly</h2>
                    <div className="text-sm text-slate-500 font-medium mb-4">Station Manager</div>

                    <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-3 text-left">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail size={16} className="text-slate-400" />
                            m.reilly@asfsupergas.com
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Phone size={16} className="text-slate-400" />
                            +63 917 555 0192
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Shield size={16} className="text-emerald-500" />
                            Admin Privileges
                        </div>
                    </div>
                </div>

                {/* EDIT DETAILS & SECURITY */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-5 flex items-center gap-2">
                            <User size={16} className="text-blue-600" />
                            PERSONAL DETAILS
                        </h2>
                        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">First Name</label>
                                <input type="text" defaultValue="Marcus" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Last Name</label>
                                <input type="text" defaultValue="Reilly" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
                                <input type="email" defaultValue="m.reilly@asfsupergas.com" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone Number</label>
                                <input type="text" defaultValue="+63 917 555 0192" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white" />
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-2">
                                <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold tracking-wide hover:bg-blue-700 transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold text-blue-950 tracking-wide mb-5 flex items-center gap-2">
                            <Key size={16} className="text-blue-600" />
                            SECURITY & PASSWORD
                        </h2>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Current Password</label>
                                <input type="password" placeholder="••••••••" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirm New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white" />
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold tracking-wide hover:bg-slate-900 transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}