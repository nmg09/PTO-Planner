import {
  CalendarDays,
  CalendarRange,
  Home,
  LogOut,
  PartyPopper,
  Settings
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { AppStateProvider } from "./state/AppContext";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { PlannerPage } from "./pages/PlannerPage";
import { LeavesPage } from "./pages/LeavesPage";
import { EventsPage } from "./pages/EventsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AuthPage } from "./pages/AuthPage";
import { getStorageKey } from "./lib/storage";

type TabKey = "dashboard" | "planner" | "leaves" | "events" | "settings";

const tabs: Array<{ key: TabKey; label: string; icon: ReactNode }> = [
  { key: "dashboard", label: "Dashboard", icon: <Home size={16} /> },
  { key: "planner", label: "Planner", icon: <CalendarDays size={16} /> },
  { key: "leaves", label: "Leaves", icon: <CalendarRange size={16} /> },
  { key: "events", label: "Events", icon: <PartyPopper size={16} /> },
  { key: "settings", label: "Settings", icon: <Settings size={16} /> }
];

const AppLayout = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<TabKey>("dashboard");

  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-3 pb-28 pt-4 sm:px-6 sm:pb-8">
        <header className="mb-5 hidden rounded-3xl border border-white/70 bg-white/90 p-2 shadow-[0_16px_30px_rgba(15,23,42,0.08)] backdrop-blur md:block">
          <div className="mb-2 flex items-center justify-between px-2 pt-1">
            <div>
              <p className="text-sm font-semibold tracking-tight text-primary">Leave Harmony</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs text-slate-500 hover:bg-white"
              onClick={() => signOut()}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
          <nav className="grid grid-cols-5 gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm ${
                  tab === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
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

        <nav className="fixed bottom-[calc(env(safe-area-inset-bottom)+8px)] inset-x-3 z-40 mx-auto grid max-w-md grid-cols-5 rounded-2xl border border-white/70 bg-white/90 p-2 shadow-[0_18px_28px_rgba(15,23,42,0.18)] backdrop-blur nav-safe-bottom md:hidden">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] ${
                tab === item.key ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

const AuthedApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppStateProvider key={user.id} storageKey={getStorageKey(user.id)} userId={user.id}>
      <AppLayout />
    </AppStateProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthedApp />
    </AuthProvider>
  );
}
