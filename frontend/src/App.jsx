import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Inventory from "./pages/inventory";
import Operations from "./pages/operations";
import Dashboard from "./pages/dashboard";
import Analytics from "./pages/analytics";
import Orders from "./pages/orders";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import Stations from "./pages/stations-page";
import Login from "./pages/login";
import StationFilter from "./components/station-filter";
import { useAuth } from "./context/AuthContext";
import { Menu } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function getJSON(path, token) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export default function App() {
  const { user, token, checking, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("Dashboard");

  // Station filter — admin only. null = "All Stations". A manager's data is
  // always locked server-side to their own station regardless of this value,
  // so it's simply never shown to them.
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);

  // Global State
  const [tanks, setTanks] = useState([]);
  const [categoryBars, setCategoryBars] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [transactions, setTransactions] = useState([]);

  const addTransaction = async (newTxn) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newTxn)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save transaction");
    setTransactions((prev) => [newTxn, ...prev]);
  };

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Filter States for Inventory
  const [activeCat, setActiveCat] = useState("all");
  const [activeStatus, setActiveStatus] = useState(null);
  const [query, setQuery] = useState("");
  const [alertOpen, setAlertOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load the list of stations once logged in (used to populate the filter;
  // for a manager this just comes back as their one station, harmless).
  // Managers are automatically locked to their own station.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getJSON("/stations", token)
        .then((data) => {
          if (cancelled) return;
          setStations(data);
          // If the logged-in user is a manager, pin the station filter to
          // their station automatically so every page loads the right data.
          if (user.role === "manager" && user.station_id) {
            setSelectedStationId(user.station_id);
          }
        })
        .catch(() => {});
    return () => { cancelled = true; };
  }, [user, token]);

  // Set default tab based on user role when user logs in
  useEffect(() => {
    if (user) {
      if (user.role === "purchase_order") {
        setActiveTab("Orders");
      } else {
        setActiveTab("Dashboard");
      }
    }
  }, [user]);

  // Load station-scoped data. Re-runs whenever the admin's station filter
  // changes — every page reading tanks/products/purchaseOrders from this
  // shared state (Dashboard, Inventory, Orders, ...) reflects it automatically.
  useEffect(() => {
    if (!user) return; // not logged in yet — nothing to load
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const qs = selectedStationId ? `?station_id=${selectedStationId}` : "";
        const [tanksData, barsData, poData, productsData, transactionsData] = await Promise.all([
          getJSON(`/tanks${qs}`, token).catch(() => []),
          getJSON(`/products/stock-by-category${qs}`, token).catch(() => []),
          getJSON(`/purchase-orders${qs}`, token).catch(() => []),
          getJSON(`/products${qs}`, token).catch(() => []),
          getJSON(`/transactions${qs}`, token).catch(() => []),
        ]);
        if (cancelled) return;

        // Fallback dummy data if API fails so the UI still renders
        setTanks(tanksData.length ? tanksData : [
          {id: 1, name: "Unleaded 91", pct: 68, vol: "12,240 L", cap: "18,000 L", status: "healthy", price_per_liter: 60.50, volume_liters: 12240, capacity_liters: 18000},
          {id: 2, name: "Unleaded 95", pct: 22, vol: "3,960 L", cap: "18,000 L", status: "low", price_per_liter: 65.20, volume_liters: 3960, capacity_liters: 18000},
          {id: 3, name: "Diesel", pct: 81, vol: "16,200 L", cap: "20,000 L", status: "healthy", price_per_liter: 58.00, volume_liters: 16200, capacity_liters: 20000},
          {id: 4, name: "LPG Bulk", pct: 9, vol: "900 L", cap: "10,000 L", status: "critical", price_per_liter: 45.00, volume_liters: 900, capacity_liters: 10000}
        ]);
        setCategoryBars(barsData.length ? barsData : []);
        setPurchaseOrders(poData.length ? poData : []);
        setProducts(productsData.length ? productsData : []);
        setTransactions(transactionsData.length ? transactionsData : []);
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
  }, [user, token, selectedStationId, refreshKey]);

  const criticalCount = useMemo(
      () => products.filter((p) => p.status === "Critical").length,
      [products]
  );

  const criticalNames = useMemo(
      () => products.filter((p) => p.status === "Critical").map((p) => p.name).slice(0, 3),
      [products]
  );

  // Still verifying a stored token on first load — show a blank loader
  // rather than flashing the login page before we know the real answer.
  if (checking) {
    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center text-slate-500 text-sm font-medium">
          Loading…
        </div>
    );
  }

  // No valid session — show the login page instead of the dashboard
  if (!user) {
    return <Login />;
  }

  // Defense in depth: even if someone forces activeTab to "Stations" some
  // other way, a non-admin never actually renders that page.
  const canSeeStations = user.role === "admin";
  const safeActiveTab = activeTab === "Stations" && !canSeeStations ? "Dashboard" : activeTab;

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

        {/* SIDEBAR (Pass the new props for mobile control + auth) */}
        <Sidebar
            activeTab={safeActiveTab}
            setActiveTab={setActiveTab}
            isOpen={isMobileMenuOpen}
            setIsOpen={setIsMobileMenuOpen}
            user={user}
            onLogout={logout}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 bg-slate-50 h-[calc(100vh-72px)] md:h-screen overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-12 py-6 md:py-8">

            {/* STATION FILTER — admin only, applies to every page below */}
            {canSeeStations && safeActiveTab !== "Stations" && (
                <StationFilter
                    stations={stations}
                    selectedId={selectedStationId}
                    onSelect={setSelectedStationId}
                />
            )}

            {/* VIEW ROUTING */}
            {safeActiveTab === "Dashboard" && <Dashboard tanks={tanks} transactions={transactions} setActiveTab={setActiveTab} selectedStationId={selectedStationId} />}
            {safeActiveTab === "Inventory" && (
                <Inventory
                    stations={stations}
                    tanks={tanks}
                    transactions={transactions}
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
                    refreshData={refreshData}
                    selectedStationId={selectedStationId}
                />
            )}
            {safeActiveTab === "Operations" && (
                <Operations
                    dummyTanks={tanks}
                    transactions={transactions}
                    addTransaction={addTransaction}
                    refreshData={refreshData}
                    selectedStationId={selectedStationId}
                    stations={stations}
                />
            )}
            {safeActiveTab === "Analytics" && <Analytics transactions={transactions} tanks={tanks} selectedStationId={selectedStationId} />}
            {safeActiveTab === "Orders" && <Orders purchaseOrders={purchaseOrders} refreshData={refreshData} selectedStationId={selectedStationId} />}
            {safeActiveTab === "Profile" && <Profile />}
            {safeActiveTab === "Settings" && <Settings />}
            {safeActiveTab === "Stations" && canSeeStations && <Stations />}

            {/* Fallback */}
            {safeActiveTab !== "Dashboard" && safeActiveTab !== "Inventory" && safeActiveTab !== "Operations" && safeActiveTab !== "Analytics" && safeActiveTab !== "Orders" && safeActiveTab !== "Profile" && safeActiveTab !== "Settings" && safeActiveTab !== "Stations" && (
                <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
                  {safeActiveTab} module is under construction.
                </div>
            )}
          </div>
        </main>
      </div>
  );
}