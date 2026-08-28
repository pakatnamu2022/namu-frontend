"use client";

import { ColumnDef, Column } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PayrollRegisterResource } from "../lib/payroll-register.interface";

const pen = (val: number | null | undefined) =>
  `S/ ${(val ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

const num = (val: number | null | undefined) =>
  (val ?? 0).toLocaleString("es-PE");

type Col = ColumnDef<PayrollRegisterResource>;

// ── Header ordenable (clic = asc → desc → sin orden) ────────────────────────
function SortableHeader({
  column,
  label,
  align = "left",
}: {
  column: Column<PayrollRegisterResource, unknown>;
  label: string;
  align?: "left" | "right";
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "h-6 px-1 gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground w-full",
        align === "right" ? "justify-end -mr-1" : "justify-start -ml-1",
      )}
    >
      <span>{label}</span>
      {sorted === "asc" ? (
        <ArrowUp className="size-3 shrink-0" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3 shrink-0" />
      ) : (
        <ArrowUpDown className="size-3 shrink-0 opacity-40" />
      )}
    </Button>
  );
}

const sortableHeader = (label: string, align: "left" | "right" = "left") =>
  function Header({ column }: { column: Column<PayrollRegisterResource, unknown> }) {
    return <SortableHeader column={column} label={label} align={align} />;
  };

// ── Identidad (sticky) ──────────────────────────────────────────────────────
export const colsIdentidad: Col[] = [
  {
    id: "n",
    header: "N°",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.index + 1}</span>
    ),
    size: 48,
    enableSorting: false,
  },
  {
    accessorKey: "worker_name",
    header: sortableHeader("Trabajador"),
    cell: ({ getValue }) => (
      <span className="font-semibold whitespace-nowrap">
        {(getValue() as string) ?? "—"}
      </span>
    ),
    size: 220,
  },
  {
    accessorKey: "worker_vat",
    header: sortableHeader("DNI"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{(getValue() as string) ?? "—"}</span>
    ),
    size: 90,
  },
  {
    accessorKey: "occupation",
    header: sortableHeader("Cargo"),
    cell: ({ getValue }) => (
      <span className="text-xs whitespace-nowrap">
        {(getValue() as string) ?? "—"}
      </span>
    ),
    size: 160,
  },
  {
    accessorKey: "cost_center",
    header: sortableHeader("C. Costo"),
    cell: ({ getValue }) => (
      <span className="text-xs">{(getValue() as string) ?? "—"}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "monthly_salary",
    header: sortableHeader("Sueldo", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{pen(getValue() as number)}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_affiliation",
    header: sortableHeader("AFP"),
    cell: ({ getValue }) => (
      <span className="text-xs">{(getValue() as string) ?? "—"}</span>
    ),
    size: 80,
  },
];

// ── Días ────────────────────────────────────────────────────────────────────
export const colsDias: Col[] = [
  {
    accessorKey: "days_worked",
    header: sortableHeader("Trabajados", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "days_vacation",
    header: sortableHeader("Vacaciones", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "days_medical_rest",
    header: sortableHeader("Desc. Médico", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "days_absence",
    header: sortableHeader("Faltas", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 70,
  },
  {
    accessorKey: "days_effective",
    header: sortableHeader("Efectivos", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-semibold">
        {num(getValue() as number)}
      </span>
    ),
    size: 80,
  },
  {
    accessorKey: "normal_hours",
    header: sortableHeader("Horas", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 70,
  },
];

// ── Ingresos ────────────────────────────────────────────────────────────────
export const colsIngresos: Col[] = [
  {
    accessorKey: "basic_salary",
    header: sortableHeader("Básico", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "family_allowance",
    header: sortableHeader("Asig. Familiar", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "overtime_25",
    header: sortableHeader("HE 25%", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "overtime_35",
    header: sortableHeader("HE 35%", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "work_conditions",
    header: sortableHeader("Cond. Trabajo", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "vacation_pay",
    header: sortableHeader("Vacaciones", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "production_bonus",
    header: sortableHeader("Bono Prod.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "food_benefit",
    header: sortableHeader("Alimentación", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "night_bonus",
    header: sortableHeader("Bonif. Noc.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "commercial_bonus",
    header: sortableHeader("Bono Comerc.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "total_income",
    header: sortableHeader("TOTAL ING.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-bold text-green-700 dark:text-green-400">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
];

// ── BB.SS Truncos ────────────────────────────────────────────────────────────
export const colsBbss: Col[] = [
  {
    accessorKey: "cts_truncated",
    header: sortableHeader("CTS Trunca", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "gratification",
    header: sortableHeader("Gratif.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "extraordinary_bonus",
    header: sortableHeader("Bonif. Extr.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "vacation_truncated",
    header: sortableHeader("Vac. Truncas", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
];

// ── Descuentos ───────────────────────────────────────────────────────────────
export const colsDescuentos: Col[] = [
  {
    accessorKey: "onp_deduction",
    header: sortableHeader("ONP", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "afp_mandatory",
    header: sortableHeader("AFP Oblig.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_insurance",
    header: sortableHeader("AFP Seguro", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_commission",
    header: sortableHeader("AFP Comis.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_total",
    header: sortableHeader("AFP Total", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-semibold">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "income_tax_5th",
    header: sortableHeader("Imp. 5ta", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "oncosalud_plan",
    header: sortableHeader("Oncosalud", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "advances_loans",
    header: sortableHeader("Préstamos", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "other_deductions",
    header: sortableHeader("Otros Desc.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "total_deductions",
    header: sortableHeader("TOTAL DESC.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-bold text-red-600 dark:text-red-400">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
];

// ── Aportes Empleador ────────────────────────────────────────────────────────
export const colsAportes: Col[] = [
  {
    accessorKey: "essalud_employer",
    header: sortableHeader("EsSalud", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "cts_employer",
    header: sortableHeader("CTS", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "sctr_health",
    header: sortableHeader("SCTR Salud", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "sctr_pension",
    header: sortableHeader("SCTR Pensión", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "life_insurance",
    header: sortableHeader("Seg. Vida", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "employer_contributions_total",
    header: sortableHeader("TOTAL APOR.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-bold text-blue-600 dark:text-blue-400">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
];

// ── Netos ────────────────────────────────────────────────────────────────────
export const colsNetos: Col[] = [
  {
    accessorKey: "net_pay_preliminary",
    header: sortableHeader("Neto Prelim.", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "aguinaldo",
    header: sortableHeader("Aguinaldo", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "net_pay_final",
    header: sortableHeader("NETO FINAL", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-bold text-emerald-700 dark:text-emerald-400">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
];

// ── Grupos ───────────────────────────────────────────────────────────────────
export interface ColumnGroup {
  id: string;
  label: string;
  color: string;
  columns: Col[];
}

export const COLUMN_GROUPS: ColumnGroup[] = [
  {
    id: "identidad",
    label: "Trabajador",
    color: "bg-slate-100 dark:bg-slate-800",
    columns: colsIdentidad,
  },
  {
    id: "dias",
    label: "Días",
    color: "bg-sky-50 dark:bg-sky-950",
    columns: colsDias,
  },
  {
    id: "ingresos",
    label: "Ingresos",
    color: "bg-green-50 dark:bg-green-950",
    columns: colsIngresos,
  },
  {
    id: "bbss",
    label: "BB.SS Truncos",
    color: "bg-amber-50 dark:bg-amber-950",
    columns: colsBbss,
  },
  {
    id: "descuentos",
    label: "Descuentos",
    color: "bg-red-50 dark:bg-red-950",
    columns: colsDescuentos,
  },
  {
    id: "aportes",
    label: "Aportes Empleador",
    color: "bg-blue-50 dark:bg-blue-950",
    columns: colsAportes,
  },
  {
    id: "netos",
    label: "Netos",
    color: "bg-emerald-50 dark:bg-emerald-950",
    columns: colsNetos,
  },
];
