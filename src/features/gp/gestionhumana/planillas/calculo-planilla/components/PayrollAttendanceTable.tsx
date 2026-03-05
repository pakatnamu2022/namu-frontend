"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AttendancesData,
  WorkerAttendance,
} from "../lib/payroll-calculation.interface";

interface Props {
  data: AttendancesData;
}

/** Extrae solo la parte YYYY-MM-DD de cualquier string de fecha (con o sin hora/timezone) */
function toDateOnly(dateStr: string): string {
  return dateStr.slice(0, 10);
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const startOnly = toDateOnly(start);
  const endOnly = toDateOnly(end);
  // Parsear como local para evitar desfases de timezone
  const [sy, sm, sd] = startOnly.split("-").map(Number);
  const [ey, em, ed] = endOnly.split("-").map(Number);
  const current = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);
  while (current <= endDate) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDay(date: string): string {
  return date.slice(8, 10);
}

function formatMonth(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("es-PE", { month: "short" }).replace(".", "");
}

const CODE_COLORS: Record<string, string> = {
  D: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  N: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  V: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  F: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  EXT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  L: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  P: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

function AttendanceCell({ code }: { code?: string }) {
  if (!code) {
    return (
      <td className="px-1 py-1 text-center text-xs text-muted-foreground/30">
        —
      </td>
    );
  }
  const colorClass =
    CODE_COLORS[code] ??
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  return (
    <td className="px-0.5 py-1 text-center">
      <span
        className={`inline-block rounded px-1 py-0.5 text-[10px] font-semibold leading-none ${colorClass}`}
      >
        {code}
      </span>
    </td>
  );
}

function SummaryBadges({ summary }: { summary: WorkerAttendance["summary"] }) {
  const entries = Object.entries(summary.codes).filter(([, v]) => v > 0);
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([code, count]) => {
        const colorClass =
          CODE_COLORS[code] ??
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
        return (
          <span
            key={code}
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${colorClass}`}
          >
            {code}: {count}
          </span>
        );
      })}
    </div>
  );
}

export default function PayrollAttendanceTable({ data }: Props) {
  const [copiedWorkerId, setCopiedWorkerId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const handleCopyDoc = async (doc: string, workerId: number) => {
    try {
      await navigator.clipboard.writeText(doc);
      setCopiedWorkerId(workerId);
      setTimeout(() => setCopiedWorkerId(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const dates = useMemo(
    () => getDatesInRange(data.start_date, data.end_date),
    [data.start_date, data.end_date],
  );

  const filteredAttendances = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.attendances;
    return data.attendances.filter(
      (w) =>
        w.worker_name.toLowerCase().includes(q) ||
        w.document_number.toLowerCase().includes(q),
    );
  }, [data.attendances, search]);

  // Build a lookup: worker_id -> date -> code
  const lookup = useMemo(() => {
    const map: Record<number, Record<string, string>> = {};
    for (const worker of data.attendances) {
      map[worker.worker_id] = {};
      for (const da of worker.daily_attendances) {
        map[worker.worker_id][da.date] = da.code;
      }
    }
    return map;
  }, [data.attendances]);

  if (data.attendances.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No hay asistencias registradas para este período.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm border-collapse">
          <thead>
            {/* Month row */}
            <tr className="bg-muted/50 border-b">
              <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[200px]">
                Colaborador
              </th>
              {dates.map((date, i) => {
                const isFirstOfMonth =
                  i === 0 || date.slice(5, 7) !== dates[i - 1].slice(5, 7);
                return isFirstOfMonth ? (
                  <th
                    key={date}
                    colSpan={
                      dates.filter((d) => d.slice(5, 7) === date.slice(5, 7))
                        .length
                    }
                    className="px-1 py-1 text-center text-[10px] font-semibold text-muted-foreground border-l uppercase tracking-wide"
                  >
                    {formatMonth(date)}
                  </th>
                ) : null;
              })}
              <th className="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-40">
                Resumen
              </th>
            </tr>
            {/* Day numbers row */}
            <tr className="bg-muted/30 border-b">
              <th className="sticky left-0 z-10 bg-muted/30 px-3 py-1 text-left text-[10px] text-muted-foreground" />
              {dates.map((date) => (
                <th
                  key={date}
                  className="px-0.5 py-1 text-center text-[10px] text-muted-foreground w-7"
                >
                  {formatDay(date)}
                </th>
              ))}
              <th className="px-3 py-1" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAttendances.length === 0 ? (
              <tr>
                <td
                  colSpan={dates.length + 2}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Sin resultados para &quot;{search}&quot;
                </td>
              </tr>
            ) : (
              filteredAttendances.map((worker, idx) => (
                <tr
                  key={worker.worker_id}
                  className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  {/* Worker name */}
                  <td className="sticky left-0 z-10 px-3 py-2 font-medium whitespace-nowrap bg-inherit text-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">
                        {worker.worker_name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {worker.document_number}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-slate-200"
                          onClick={() =>
                            handleCopyDoc(
                              worker.document_number,
                              worker.worker_id,
                            )
                          }
                        >
                          {copiedWorkerId === worker.worker_id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </td>
                  {/* Daily attendance cells */}
                  {dates.map((date) => (
                    <AttendanceCell
                      key={date}
                      code={lookup[worker.worker_id]?.[date]}
                    />
                  ))}
                  {/* Summary */}
                  <td className="px-3 py-2">
                    <SummaryBadges summary={worker.summary} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
