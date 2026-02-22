import type { AppState } from "../types/app";
import { appStateSchema } from "./schema";
import { supabase } from "./supabase";

type PlannerStateRow = {
  user_id: string;
  state: unknown;
};

export const loadRemoteState = async (userId: string): Promise<AppState | null> => {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("planner_states")
    .select("user_id,state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as PlannerStateRow | null;
  if (!row) {
    return null;
  }

  const parsed = appStateSchema.safeParse(row.state);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};

export const saveRemoteState = async (userId: string, state: AppState): Promise<void> => {
  if (!supabase) {
    return;
  }

  const safeState = appStateSchema.parse(state);
  const { error } = await supabase
    .from("planner_states")
    .upsert({ user_id: userId, state: safeState }, { onConflict: "user_id" });

  if (error) {
    throw new Error(error.message);
  }
};
