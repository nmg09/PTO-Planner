import type { AppState } from "../types/app";
import { appStateSchema, yearPlanSchema } from "./schema";

const STORAGE_KEY = "pto-planner-app-state-v1";

export const loadState = (): AppState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const validated = appStateSchema.safeParse(parsed);
    if (!validated.success) {
      return null;
    }

    return validated.data;
  } catch (_error) {
    return null;
  }
};

export const saveState = (state: AppState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const exportYearPlan = (yearPlan: unknown): string =>
  JSON.stringify(yearPlanSchema.parse(yearPlan), null, 2);

export const exportAllYears = (state: AppState): string =>
  JSON.stringify(state, null, 2);

export const importYearPlanFromJson = (json: string) =>
  yearPlanSchema.parse(JSON.parse(json));

export const importAppStateFromJson = (json: string) =>
  appStateSchema.parse(JSON.parse(json));

export const getStorageKey = () => STORAGE_KEY;
