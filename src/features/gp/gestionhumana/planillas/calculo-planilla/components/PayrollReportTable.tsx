"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PayrollReportData } from "../lib/payroll-calculation.interface";

interface Props {
  data: PayrollReportData;
}

function fmt(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

const COLS = [
  { key: "empresa", label: "Empresa", align: "left" },
  { key: "nombre", label: "Nombre", align: "left" },
  { key: "dni", label: "DNI", align: "left" },
  { key: "days_worked", label: "Días T", align: "right" },
  { key: "days_vacation", label: "Días V", align: "right" },
  {
    key: "vacation_hour_value",
    label: "Valor H.Vac.",
    align: "right",
    money: true,
  },
  {
    key: "vacation_amount",
    label: "Monto Vac.",
    align: "right",
    money: true,
  },
  { key: "basic_salary", label: "Básico", align: "right", money: true },
  { key: "night_bonus", label: "Bono Noc.", align: "right", money: true },
  { key: "gross_salary", label: "Bruto", align: "right", money: true },
  { key: "overtime_25", label: "HH.EE 25%", align: "right", money: true },
  { key: "overtime_35", label: "HH.EE 35%", align: "right", money: true },
  { key: "holiday_pay", label: "Feriados", align: "right", money: true },
  {
    key: "compensatory_pay",
    label: "Descansos",
    align: "right",
    money: true,
  },
  { key: "net_salary", label: "Neto", align: "right", money: true },
] as const;

export default function PayrollReportTable({ data }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.rows;
    return data.rows.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        r.empresa.toLowerCase().includes(q) ||
        r.dni.includes(q),
    );
  }, [data.rows, search]);

  if (!data.rows || data.rows.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No hay datos en el reporte para este período.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nombre, empresa o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              {COLS.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 font-semibold whitespace-nowrap ${col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={COLS.length}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Sin resultados para &quot;{search}&quot;
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2 whitespace-nowrap">{row.empresa}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">
                    {row.nombre}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{row.dni}</td>
                  <td className="px-3 py-2 text-right">{row.days_worked}</td>
                  <td className="px-3 py-2 text-right">{row.days_vacation}</td>
                  <td className="px-3 py-2 text-right">
                    {row.vacation_hour_value}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {row.vacation_amount}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fmt(row.basic_salary)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fmt(row.night_bonus)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fmt(row.gross_salary)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fmt(row.overtime_25)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fmt(row.overtime_35)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fmt(row.holiday_pay)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fmt(row.compensatory_pay)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-green-700 dark:text-green-400">
                    {fmt(row.net_salary)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/50 font-semibold">
              <td colSpan={3} className="px-3 py-2">
                Totales ({data.rows.length} trabajador
                {data.rows.length !== 1 ? "es" : ""})
              </td>
              <td className="px-3 py-2 text-right">
                {data.totals.days_worked}
              </td>
              <td className="px-3 py-2 text-right">
                {data.totals.days_vacation}
              </td>
              <td className="px-3 py-2 text-right">
                {data.totals.vacation_hour_value}
              </td>
              <td className="px-3 py-2 text-right">
                {data.totals.vacation_amount}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(data.totals.basic_salary)}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(data.totals.night_bonus)}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(data.totals.gross_salary)}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(data.totals.overtime_25)}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(data.totals.overtime_35)}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(data.totals.holiday_pay)}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(data.totals.compensatory_pay)}
              </td>
              <td className="px-3 py-2 text-right font-bold text-green-700 dark:text-green-400">
                {fmt(data.totals.net_salary)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
