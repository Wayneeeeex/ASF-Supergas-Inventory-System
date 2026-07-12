import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Inventory from "./pages/inventory";
import Operations from "./pages/operations";
import Dashboard from "./pages/dashboard";
import Analytics from "./pages/analytics";
import Orders from "./pages/orders";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import { Menu } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Global State
  const [tanks, setTanks] = useState([]);
  const [categoryBars, setCategoryBars] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States for Inventory
  const [activeCat, setActiveCat] = useState("all");
  const [activeStatus, setActiveStatus] = useState(null);
  const [query, setQuery] = useState("");
  const [alertOpen, setAlertOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        // Using Promise.allSettled logic to prevent API crash while frontend builds
        const [tanksData, barsData, poData, productsData] = await Promise.all([
          getJSON("/tanks").catch(() => []),
          getJSON("/products/stock-by-category").catch(() => []),
          getJSON("/purchase-orders").catch(() => []),
          getJSON("/products").catch(() => []),
        ]);
        if (cancelled) return;

        // Fallback dummy data if API fails so the UI still renders
        setTanks(tanksData.length ? tanksData : [
          {id: 1, name: "Unleaded 91", pct: 68, vol: "12,240", cap: "18,000 L", status: "healthy"},
          {id: 2, name: "Unleaded 95", pct: 22, vol: "3,960", cap: "18,000 L", status: "low"},
          {id: 3, name: "Diesel", pct: 81, vol: "16,200", cap: "20,000 L", status: "healthy"},
          {id: 4, name: "LPG Bulk", pct: 9, vol: "900", cap: "10,000 L", status: "critical"}
        ]);
        setCategoryBars(barsData.length ? barsData : []);
        setPurchaseOrders(poData.length ? poData : []);
        setProducts(productsData.length ? productsData : []);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const criticalCount = useMemo(
      () => products.filter((p) => p.status === "Critical").length,
      [products]
  );

  const criticalNames = useMemo(
      () => products.filter((p) => p.status === "Critical").map((p) => p.name).slice(0, 3),
      [products]
  );

  if (loading) {
    return (
        <div
            className="min-h-screen w-full bg-white flex items-center justify-center text-slate-500 text-sm font-medium">
          Loading station data…
        </div>
    );
  }

  return (
      <div
          className="min-h-screen w-full bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row relative overflow-hidden">

        {/* MOBILE TOP BAR (Only visible on small screens) */}
        <div className="md:hidden flex items-center justify-between bg-blue-950 p-4 text-white shrink-0 z-20 shadow-md">
          <div>
            <h2 className="text-lg font-black tracking-wider">ASF SUPER</h2>
            <p className="text-blue-300 text-[10px] font-bold tracking-widest uppercase">Gas Station</p>
          </div>
          <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Menu size={20}/>
          </button>
        </div>

        {/* SIDEBAR (Pass the new props for mobile control) */}
        <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={isMobileMenuOpen}
            setIsOpen={setIsMobileMenuOpen}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 bg-slate-50 h-[calc(100vh-72px)] md:h-screen overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-12 py-6 md:py-8">

            {/* VIEW ROUTING */}
            {activeTab === "Dashboard" && <Dashboard tanks={tanks}/>}
            {activeTab === "Inventory" && (
                <Inventory
                    tanks={tanks}
                    products={products}
                    categoryBars={categoryBars}
                    purchaseOrders={purchaseOrders}
                    alertOpen={alertOpen}
                    setAlertOpen={setAlertOpen}
                    criticalCount={criticalCount}
                    criticalNames={criticalNames}
                    query={query}
                    setQuery={setQuery}
                    activeCat={activeCat}
                    setActiveCat={setActiveCat}
                    activeStatus={activeStatus}
                    setActiveStatus={setActiveStatus}
                />
            )}
            {activeTab === "Operations" && <Operations dummyTanks={tanks}/>}
            {activeTab === "Analytics" && <Analytics/>}
            {activeTab === "Orders" && <Orders purchaseOrders={purchaseOrders}/>}
            {activeTab === "Profile" && <Profile/>}
            {activeTab === "Settings" && <Settings/>}

            {/* Fallback */}
            {activeTab !== "Dashboard" && activeTab !== "Inventory" && activeTab !== "Operations" && activeTab !== "Analytics" && activeTab !== "Orders" && activeTab !== "Profile" && activeTab !== "Settings" && (
                <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
                  {activeTab} module is under construction.
                </div>
            )}
          </div>
        </main>
      </div>
  );
}