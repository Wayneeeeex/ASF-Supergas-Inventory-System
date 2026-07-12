import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Inventory from "./pages/Inventory";
import Operations from "./pages/Operations";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
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
          { id: 1, name: "Unleaded 91", pct: 68, vol: "12,240", cap: "18,000 L", status: "healthy" },
          { id: 2, name: "Unleaded 95", pct: 22, vol: "3,960", cap: "18,000 L", status: "low" },
          { id: 3, name: "Diesel", pct: 81, vol: "16,200", cap: "20,000 L", status: "healthy" },
          { id: 4, name: "LPG Bulk", pct: 9, vol: "900", cap: "10,000 L", status: "critical" }
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
    return () => { cancelled = true; };
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
        <div className="min-h-screen w-full bg-white flex items-center justify-center text-slate-500 text-sm font-medium">
          Loading station data…
        </div>
    );
  }

  return (
      <div className="min-h-screen w-full bg-white text-slate-800 font-sans flex">
        {/* SIDEBAR IMPORT */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 bg-slate-50 h-screen overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-6 py-8 md:px-10 lg:px-12">

            {/* VIEW ROUTING */}
            {activeTab === "Dashboard" && (
                <Dashboard tanks={tanks} />

            )}
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

            {activeTab === "Operations" && (
                <Operations dummyTanks={tanks} />
            )}
            {activeTab === "Analytics" && (
                <Analytics />
            )}
            {activeTab === "Orders" && (
                <Orders purchaseOrders={purchaseOrders} />
            )}
            {activeTab === "Profile" && (
                <Profile />
            )}
            {activeTab === "Settings" && (
                <Settings />
            )}


            {activeTab !== "Orders" && activeTab!== "Analytics" && activeTab !== "Dashboard" && activeTab !== "Inventory" && activeTab !== "Operations" && (
                <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
                  {activeTab} module is under construction.
                </div>
            )}

          </div>
        </main>
      </div>
  );
}