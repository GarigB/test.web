"use client";

import { useEffect, useMemo, useState } from "react";

type DateBoxesProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function safeParts(dateValue: string) {
  const parsed = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return { year: "2025", month: "01", day: "01" };
  }

  return {
    year: parsed.getFullYear().toString(),
    month: (parsed.getMonth() + 1).toString().padStart(2, "0"),
    day: parsed.getDate().toString().padStart(2, "0"),
  };
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function DateBoxes({
  value,
  onChange,
  disabled = false,
  className = "",
}: DateBoxesProps) {
  const currentValue = value || getTodayISO();
  const summary = safeParts(currentValue);
  const [yearInput, setYearInput] = useState(summary.year);

  useEffect(() => {
    setYearInput(summary.year);
  }, [summary.year]);

  const days = useMemo(() => {
    const totalDays = new Date(
      Number(summary.year),
      Number(summary.month),
      0
    ).getDate();
    return Array.from({ length: totalDays }, (_, index) =>
      (index + 1).toString().padStart(2, "0")
    );
  }, [summary.year, summary.month]);

  function updateDate(parts: Partial<typeof summary>) {
    if (disabled) {
      return;
    }
    const nextYear = parts.year ?? summary.year;
    const nextMonth = parts.month ?? summary.month;
    const nextDay = parts.day ?? summary.day;
    onChange(`${nextYear}-${nextMonth}-${nextDay}`);
  }

  return (
    <div
      className={`mt-4 flex flex-wrap items-end gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-zinc-900 dark:text-white ${
        disabled ? "opacity-60" : ""
      } ${className}`}
    >
      <div className="flex flex-col">
        <label className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Year
        </label>
        <input
          type="number"
          value={yearInput}
          disabled={disabled}
          onChange={(event) => {
            const clean = event.target.value.replace(/[^\d]/g, "").slice(0, 4);
            setYearInput(clean);
            if (clean.length === 4) {
              updateDate({ year: clean });
            }
          }}
          onBlur={() => {
            if (yearInput.length !== 4) {
              setYearInput(summary.year);
            }
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Month
        </label>
        <select
          value={summary.month}
          disabled={disabled}
          onChange={(event) => updateDate({ month: event.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-zinc-900 dark:text-white"
        >
          {MONTH_LABELS.map((label, index) => {
            const monthValue = (index + 1).toString().padStart(2, "0");
            return (
              <option key={label} value={monthValue}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Day
        </label>
        <select
          value={summary.day}
          disabled={disabled}
          onChange={(event) => updateDate({ day: event.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-zinc-900 dark:text-white"
        >
          {days.map((dayValue) => (
            <option key={dayValue} value={dayValue}>
              {dayValue}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
