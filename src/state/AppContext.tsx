import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type {
  AppState,
  KeyEvent,
  LeaveBlock,
  WorkScheduleRange,
  YearPlan,
  YearSettings
} from "../types/app";
import { makeInitialState, makeYearPlan } from "../lib/defaults";
import { loadState, saveState } from "../lib/storage";

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

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => loadState() ?? makeInitialState());

  useEffect(() => {
    saveState(state);
  }, [state]);

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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = (): AppContextValue => {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return value;
};
