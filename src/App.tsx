import { CalendarDays, CalendarRange, Home, Settings, TentTree } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AppStateProvider } from "./state/AppContext";
import { DashboardPage } from "./pages/DashboardPage";
import { PlannerPage } from "./pages/PlannerPage";
import { LeavesPage } from "./pages/LeavesPage";
import { EventsPage } from "./pages/EventsPage";
import { SettingsPage } from "./pages/SettingsPage";

type TabKey = "dashboard" | "planner" | "leaves" | "events" | "settings";

const tabs: Array<{ key: TabKey; label: string; icon: ReactNode }> = [
  { key: "dashboard", label: "Dashboard", icon: <Home size={16} /> },
  { key: "planner", label: "Planner", icon: <CalendarDays size={16} /> },
  { key: "leaves", label: "Leaves", icon: <CalendarRange size={16} /> },
  { key: "events", label: "Events", icon: <TentTree size={16} /> },
  { key: "settings", label: "Settings", icon: <Settings size={16} /> }
];

const AppLayout = () => {
  const [tab, setTab] = useState<TabKey>("dashboard");

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-3 pb-20 pt-4 sm:px-6 sm:pb-6">
      <header className="mb-4 hidden rounded-2xl bg-white/80 p-2 shadow-panel sm:block">
        <nav className="grid grid-cols-5 gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm ${
                tab === item.key
                  ? "bg-ink text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        {tab === "dashboard" && <DashboardPage />}
        {tab === "planner" && <PlannerPage />}
        {tab === "leaves" && <LeavesPage />}
        {tab === "events" && <EventsPage />}
        {tab === "settings" && <SettingsPage />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t border-slate-200 bg-white/95 p-2 sm:hidden">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] ${
              tab === item.key ? "text-brand" : "text-slate-500"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppStateProvider>
      <AppLayout />
    </AppStateProvider>
  );
}
