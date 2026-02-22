import type { AppState } from "../types/app";
import { appStateSchema, yearPlanSchema } from "./schema";

const STORAGE_KEY = "pto-planner-app-state-v1";

export const loadState = (storageKey = STORAGE_KEY): AppState | null => {
  try {
    const raw = localStorage.getItem(storageKey);
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

export const saveState = (state: AppState, storageKey = STORAGE_KEY): void => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

export const exportYearPlan = (yearPlan: unknown): string =>
  JSON.stringify(yearPlanSchema.parse(yearPlan), null, 2);

export const exportAllYears = (state: AppState): string =>
  JSON.stringify(state, null, 2);

export const importYearPlanFromJson = (json: string) =>
  yearPlanSchema.parse(JSON.parse(json));

export const importAppStateFromJson = (json: string) =>
  appStateSchema.parse(JSON.parse(json));

export const getStorageKey = (userId?: string) =>
  userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
