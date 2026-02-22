import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import type {
  AppState,
  Holiday,
  KeyEvent,
  LeaveBlock,
  WorkScheduleRange,
  YearPlan,
  YearSettings
} from "../types/app";
import { makeInitialState, makeYearPlan } from "../lib/defaults";
import { loadState, saveState, getStorageKey } from "../lib/storage";
import { loadRemoteState, saveRemoteState } from "../lib/remoteState";
import { isSupabaseConfigured } from "../lib/supabase";

export type AppContextValue = {
  state: AppState;
  activePlan: YearPlan;
  setActiveYear: (year: number) => void;
  ensureYear: (year: number) => void;
  updateSettings: (patch: Partial<YearSettings>) => void;
  setScheduleRanges: (ranges: WorkScheduleRange[]) => void;
  addLeave: (leave: LeaveBlock) => void;
  updateLeave: (leave: LeaveBlock) => void;
  removeLeave: (leaveId: string) => void;
  setLeaveStatus: (leaveId: string, status: LeaveBlock["status"]) => void;
  addEvent: (event: KeyEvent) => void;
  updateEvent: (event: KeyEvent) => void;
  removeEvent: (eventId: string) => void;
  addHoliday: (holiday: Holiday) => void;
  removeHoliday: (holidayId: string) => void;
  addPublicHolidays: (holidays: Holiday[]) => void;
  replaceYearPlan: (yearPlan: YearPlan) => void;
  replaceState: (nextState: AppState) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const getYearPlan = (state: AppState, year: number): YearPlan => {
  const key = String(year);
  return state.years[key] ?? makeYearPlan(year);
};

const updateYearPlan = (
  state: AppState,
  year: number,
  updater: (plan: YearPlan) => YearPlan
): AppState => {
  const key = String(year);
  const current = getYearPlan(state, year);

  return {
    ...state,
    years: {
      ...state.years,
      [key]: updater(current)
    }
  };
};

export const AppStateProvider = ({
  children,
  storageKey,
  userId
}: {
  children: ReactNode;
  storageKey?: string;
  userId?: string;
}) => {
  const resolvedStorageKey = storageKey ?? getStorageKey();
  const [state, setState] = useState<AppState>(makeInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>("Loading planner...");
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const localState = loadState(resolvedStorageKey) ?? makeInitialState();
      if (cancelled) {
        return;
      }

      setState(localState);

      if (!userId || !isSupabaseConfigured) {
        setHydrated(true);
        setLoadingMessage(null);
        return;
      }

      try {
        const remoteState = await loadRemoteState(userId);
        if (cancelled) {
          return;
        }

        if (remoteState) {
          setState(remoteState);
          saveState(remoteState, resolvedStorageKey);
        } else {
          await saveRemoteState(userId, localState);
        }

        setLoadingMessage(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not sync with Supabase. Using local data for now.";
        setLoadingMessage(message);
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [resolvedStorageKey, userId]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveState(state, resolvedStorageKey);
  }, [hydrated, resolvedStorageKey, state]);

  useEffect(() => {
    if (!hydrated || !userId || !isSupabaseConfigured) {
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(async () => {
      try {
        await saveRemoteState(userId, state);
      } catch (_error) {
        // Keep local state authoritative during temporary network/database issues.
      }
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [hydrated, state, userId]);

  const activePlan = useMemo(
    () => getYearPlan(state, state.activeYear),
    [state, state.activeYear]
  );

  const value: AppContextValue = {
    state,
    activePlan,
    setActiveYear: (year) => {
      setState((prev) => {
        const ensured = prev.years[String(year)]
          ? prev
          : {
              ...prev,
              years: {
                ...prev.years,
                [String(year)]: makeYearPlan(year)
              }
            };

        return {
          ...ensured,
          activeYear: year
        };
      });
    },
    ensureYear: (year) => {
      setState((prev) => {
        if (prev.years[String(year)]) {
          return prev;
        }

        return {
          ...prev,
          years: {
            ...prev.years,
            [String(year)]: makeYearPlan(year)
          }
        };
      });
    },
    updateSettings: (patch) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          settings: {
            ...plan.settings,
            ...patch
          }
        }))
      );
    },
    setScheduleRanges: (ranges) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          settings: {
            ...plan.settings,
            scheduleRanges: ranges
          }
        }))
      );
    },
    addLeave: (leave) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          leaves: [leave, ...plan.leaves]
        }))
      );
    },
    updateLeave: (leave) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          leaves: plan.leaves.map((item) => (item.id === leave.id ? leave : item))
        }))
      );
    },
    removeLeave: (leaveId) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          leaves: plan.leaves.filter((item) => item.id !== leaveId)
        }))
      );
    },
    setLeaveStatus: (leaveId, status) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          leaves: plan.leaves.map((leave) =>
            leave.id === leaveId ? { ...leave, status } : leave
          )
        }))
      );
    },
    addEvent: (event) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          events: [event, ...plan.events]
        }))
      );
    },
    updateEvent: (event) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          events: plan.events.map((item) => (item.id === event.id ? event : item))
        }))
      );
    },
    removeEvent: (eventId) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          events: plan.events.filter((item) => item.id !== eventId),
          leaves: plan.leaves.map((leave) =>
            leave.linkedEventId === eventId
              ? { ...leave, linkedEventId: undefined }
              : leave
          )
        }))
      );
    },
    addHoliday: (holiday) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          holidays: [holiday, ...plan.holidays]
        }))
      );
    },
    removeHoliday: (holidayId) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => ({
          ...plan,
          holidays: plan.holidays.filter((holiday) => holiday.id !== holidayId)
        }))
      );
    },
    addPublicHolidays: (holidays) => {
      setState((prev) =>
        updateYearPlan(prev, prev.activeYear, (plan) => {
          const existingDates = new Set(plan.holidays.map((holiday) => holiday.date));
          const unique = holidays.filter((holiday) => !existingDates.has(holiday.date));
          return {
            ...plan,
            holidays: [...unique, ...plan.holidays]
          };
        })
      );
    },
    replaceYearPlan: (yearPlan) => {
      setState((prev) => ({
        ...prev,
        years: {
          ...prev.years,
          [String(yearPlan.year)]: yearPlan
        },
        activeYear: yearPlan.year
      }));
    },
    replaceState: (nextState) => {
      setState(nextState);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm text-slate-500">{loadingMessage ?? "Loading planner..."}</p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = (): AppContextValue => {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return value;
};
