import React from "react";
import { LayoutGrid, Fuel, ShoppingCart, BarChart3, Settings, LogOut, ClipboardList, User, X, Building2 } from "lucide-react";

const NAV_ITEMS = [
    { icon: LayoutGrid, label: "Dashboard" },
    { icon: Fuel, label: "Inventory" },
    { icon: ClipboardList, label: "Operations" },
    { icon: ShoppingCart, label: "Orders" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Building2, label: "Stations", adminOnly: true },
    { icon: User, label: "Profile"},
    { icon: Settings, label: "Settings" },
];

function initials(name) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, user, onLogout }) {
    const handleSelect = (label) => {
        setActiveTab(label);
        setIsOpen?.(false); // close the drawer after picking a page, on mobile
    };

    // "Stations" is hidden from anyone who isn't an admin — station managers
    // shouldn't even know the page exists, let alone see other stations in it.
    const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin");

    return (
        <>
            {/* Backdrop — only rendered/visible on mobile when the drawer is open */}
            <div
                onClick={() => setIsOpen?.(false)}
                className={`md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                className={`
                    w-64 md:w-56 shrink-0 bg-gradient-to-b from-blue-950 to-blue-800 text-white
                    flex flex-col p-4 h-screen overflow-y-auto
                    fixed md:sticky top-0 left-0 z-40
                    transition-transform duration-200 ease-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
                `}
            >
                <div className="flex items-center justify-between pb-5 mb-4 border-b border-white/15">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-400 text-blue-950 font-bold flex items-center justify-center text-sm">
                            ASF
                        </div>
                        <div>
                            <div className="font-semibold text-sm tracking-wide leading-tight">ASF</div>
                            <div className="text-[10px] text-yellow-400 font-semibold tracking-widest">SUPER GAS</div>
                        </div>
                    </div>
                    {/* Close button — mobile only */}
                    <button
                        onClick={() => setIsOpen?.(false)}
                        className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex flex-col gap-1">
                    {visibleItems.map(({ icon: Icon, label }) => {
                        const active = label === activeTab;
                        return (
                            <div
                                key={label}
                                onClick={() => handleSelect(label)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                                    active
                                        ? "bg-yellow-400 text-blue-950 font-bold"
                                        : "text-white/75 hover:bg-white/10 hover:text-white font-medium"
                                }`}
                            >
                                <Icon size={16} />
                                {label}
                            </div>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-4 border-t border-white/15 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-blue-950 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(user?.name)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{user?.name || "Unknown"}</div>
                        <div className="text-[10px] text-white/60 truncate capitalize">
                            {user?.role === "manager" ? "Station Manager" : user?.role || ""}
                        </div>
                    </div>
                    <button onClick={onLogout} className="ml-auto shrink-0" title="Log out">
                        <LogOut size={14} className="text-white/50 cursor-pointer hover:text-white" />
                    </button>
                </div>
            </aside>
        </>
    );
}