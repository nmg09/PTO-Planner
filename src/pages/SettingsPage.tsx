import { useMemo, useRef, useState } from "react";
import { LogOut, Settings2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Inputs";
import { COUNTRY_OPTIONS, PUBLIC_HOLIDAYS, WEEKDAY_OPTIONS } from "../lib/constants";
import { readFileText, downloadJson } from "../lib/files";
import { normalizeRangeDates, toggleWorkDay, validateNoOverlap } from "../lib/schedule";
import {
  exportAllYears,
  exportYearPlan,
  importAppStateFromJson,
  importYearPlanFromJson
} from "../lib/storage";
import { useAppState } from "../state/AppContext";
import { useAuth } from "../state/AuthContext";
import type { WorkScheduleRange } from "../types/app";

const currentYear = new Date().getFullYear();

export const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const {
    state,
    activePlan,
    setActiveYear,
    updateSettings,
    setScheduleRanges,
    addHoliday,
    removeHoliday,
    addPublicHolidays,
    replaceState,
    replaceYearPlan,
    ensureYear
  } = useAppState();

  const [importError, setImportError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [customHolidayName, setCustomHolidayName] = useState("");
  const [customHolidayDate, setCustomHolidayDate] = useState("");
  const yearInputRef = useRef<HTMLInputElement>(null);

  const validation = useMemo(
    () => validateNoOverlap(activePlan.settings.scheduleRanges),
    [activePlan.settings.scheduleRanges]
  );

  const addRange = () => {
    const draft: WorkScheduleRange = {
      id: crypto.randomUUID(),
      startDate: `${activePlan.year}-01-01`,
      endDate: `${activePlan.year}-12-31`,
      workDays: [1, 2, 3, 4, 5]
    };

    setScheduleRanges([...activePlan.settings.scheduleRanges, draft]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Settings2 className="h-5 w-5 text-sky-600" />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <Card title="Account">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">{user?.email}</p>
          <Button variant="secondary" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </Card>

      <Card title="Active year">
        <div className="flex items-center gap-2">
          <Input
            ref={yearInputRef}
            type="number"
            defaultValue={activePlan.year}
            min={2000}
            max={2100}
          />
          <Button
            className="!w-28 justify-center"
            onClick={() => {
              const nextYear = Number(yearInputRef.current?.value ?? activePlan.year);
              ensureYear(nextYear);
              setActiveYear(nextYear);
            }}
          >
            Switch
          </Button>
          <Button
            variant="secondary"
            className="!w-28 justify-center"
            onClick={() => {
              ensureYear(currentYear);
              setActiveYear(currentYear);
            }}
          >
            Current year
          </Button>
        </div>
      </Card>

      <Card title="Leave policy">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="space-y-1 text-xs">
            Vacation entitlement days
            <Input
              type="number"
              value={activePlan.settings.vacationEntitlementDays}
              onChange={(event) =>
                updateSettings({ vacationEntitlementDays: Number(event.target.value) })
              }
            />
          </label>
          <label className="space-y-1 text-xs">
            Carryover cap days
            <Input
              type="number"
              value={activePlan.settings.carryoverCapDays}
              onChange={(event) =>
                updateSettings({ carryoverCapDays: Number(event.target.value) })
              }
            />
          </label>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activePlan.settings.defaultCountOnlyWorkdays}
            onChange={(event) =>
              updateSettings({ defaultCountOnlyWorkdays: event.target.checked })
            }
          />
          New leave defaults to count only workdays
        </label>
      </Card>

      <Card title="Work schedule ranges" subtitle="No overlaps allowed">
        {!validation.valid && (
          <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {validation.message}
          </p>
        )}
        {scheduleError && (
          <p className="mb-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {scheduleError}
          </p>
        )}

        <div className="space-y-3">
          {activePlan.settings.scheduleRanges.map((range) => (
            <div key={range.id} className="rounded-xl border border-slate-200 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="space-y-1 text-xs">
                  Start date
                  <Input
                    type="date"
                    value={range.startDate}
                    onChange={(event) => {
                      setScheduleError(null);
                      const normalized = normalizeRangeDates(
                        event.target.value,
                        range.endDate
                      );

                      setScheduleRanges(
                        activePlan.settings.scheduleRanges.map((item) =>
                          item.id === range.id
                            ? {
                                ...item,
                                startDate: normalized.startDate,
                                endDate: normalized.endDate
                              }
                            : item
                        )
                      );
                    }}
                  />
                </label>
                <label className="space-y-1 text-xs">
                  End date
                  <Input
                    type="date"
                    value={range.endDate ?? ""}
                    onChange={(event) => {
                      setScheduleError(null);
                      const nextEndDate = event.target.value || null;
                      const normalized = normalizeRangeDates(range.startDate, nextEndDate);

                      setScheduleRanges(
                        activePlan.settings.scheduleRanges.map((item) =>
                          item.id === range.id
                            ? {
                                ...item,
                                startDate: normalized.startDate,
                                endDate: normalized.endDate
                              }
                            : item
                        )
                      );
                    }}
                  />
                </label>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {WEEKDAY_OPTIONS.map((day) => {
                  const selected = range.workDays.includes(day.value);
                  return (
                    <button
                      type="button"
                      key={day.value}
                      className={`rounded-lg px-2 py-1 text-xs ${
                        selected ? "bg-ink text-white" : "bg-slate-100 text-slate-600"
                      }`}
                      onClick={() => {
                        setScheduleError(null);
                        const nextDays = toggleWorkDay(range.workDays, day.value);
                        if (nextDays === range.workDays) {
                          setScheduleError("At least one workday must remain selected.");
                          return;
                        }

                        setScheduleRanges(
                          activePlan.settings.scheduleRanges.map((item) =>
                            item.id === range.id ? { ...item, workDays: nextDays } : item
                          )
                        );
                      }}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2">
                <Button
                  variant="danger"
                  className="!text-xs"
                  disabled={activePlan.settings.scheduleRanges.length === 1}
                  onClick={() => {
                    setScheduleError(null);
                    if (activePlan.settings.scheduleRanges.length === 1) {
                      setScheduleError("At least one schedule range is required.");
                      return;
                    }

                    setScheduleRanges(
                      activePlan.settings.scheduleRanges.filter((item) => item.id !== range.id)
                    );
                  }}
                >
                  Delete range
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <Button variant="secondary" onClick={addRange}>
            Add schedule range
          </Button>
        </div>
      </Card>

      <Card title="Holidays" subtitle="Used when counting workdays">
        <div className="flex flex-wrap gap-2">
          <select
            className="w-[190px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={selectedCountry}
            onChange={(event) => setSelectedCountry(event.target.value)}
          >
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => {
              const templates = PUBLIC_HOLIDAYS[selectedCountry] ?? [];
              addPublicHolidays(
                templates.map((holiday) => ({
                  id: crypto.randomUUID(),
                  name: holiday.name,
                  date: `${activePlan.year}${holiday.date}`,
                  country: selectedCountry,
                  source: "public"
                }))
              );
            }}
          >
            Load public holidays
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            value={customHolidayName}
            onChange={(event) => setCustomHolidayName(event.target.value)}
            placeholder="Holiday name"
          />
          <Input
            type="date"
            value={customHolidayDate}
            onChange={(event) => setCustomHolidayDate(event.target.value)}
          />
          <Button
            onClick={() => {
              if (!customHolidayName || !customHolidayDate) {
                return;
              }
              addHoliday({
                id: crypto.randomUUID(),
                name: customHolidayName,
                date: customHolidayDate,
                source: "custom"
              });
              setCustomHolidayName("");
              setCustomHolidayDate("");
            }}
          >
            Add holiday
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          {activePlan.holidays.length === 0 && (
            <p className="text-sm text-slate-500">No holidays loaded.</p>
          )}
          {activePlan.holidays
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span>
                  {holiday.name}{" "}
                  <span className="text-slate-500">- {holiday.date}</span>{" "}
                  {holiday.country && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {holiday.country}
                    </span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  className="!px-2 !py-1 text-xs text-rose-600"
                  onClick={() => removeHoliday(holiday.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
        </div>
      </Card>

      <Card title="Import / Export">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              downloadJson(
                `year-plan-${activePlan.year}.json`,
                exportYearPlan(activePlan)
              )
            }
          >
            Export active year
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              downloadJson(`pto-planner-all-years.json`, exportAllYears(state))
            }
          >
            Export all years
          </Button>
          <label className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
            Import year JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (event) => {
                setImportError(null);
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }

                try {
                  const text = await readFileText(file);
                  const imported = importYearPlanFromJson(text);
                  replaceYearPlan(imported);
                } catch (error) {
                  setImportError(error instanceof Error ? error.message : "Import failed");
                } finally {
                  event.currentTarget.value = "";
                }
              }}
            />
          </label>
          <label className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
            Import all years JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (event) => {
                setImportError(null);
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }

                try {
                  const text = await readFileText(file);
                  const imported = importAppStateFromJson(text);
                  replaceState(imported);
                } catch (error) {
                  setImportError(error instanceof Error ? error.message : "Import failed");
                } finally {
                  event.currentTarget.value = "";
                }
              }}
            />
          </label>
        </div>

        {importError && (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {importError}
          </p>
        )}
      </Card>
    </div>
  );
};
