"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PayrollRegisterResource } from "../lib/payroll-register.interface";

const pen = (val: number | null | undefined) =>
  `S/ ${(val ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

const num = (val: number | null | undefined) =>
  (val ?? 0).toLocaleString("es-PE");

type Col = ColumnDef<PayrollRegisterResource>;

// ── Identidad (sticky) ──────────────────────────────────────────────────────
export const colsIdentidad: Col[] = [
  {
    id: "n",
    header: "N°",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.index + 1}</span>
    ),
    size: 48,
  },
  {
    accessorKey: "worker_name",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold whitespace-nowrap">
        {(getValue() as string) ?? "—"}
      </span>
    ),
    size: 220,
  },
  {
    accessorKey: "worker_vat",
    header: "DNI",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{(getValue() as string) ?? "—"}</span>
    ),
    size: 90,
  },
  {
    accessorKey: "occupation",
    header: "Cargo",
    cell: ({ getValue }) => (
      <span className="text-xs whitespace-nowrap">
        {(getValue() as string) ?? "—"}
      </span>
    ),
    size: 160,
  },
  {
    accessorKey: "cost_center",
    header: "C. Costo",
    cell: ({ getValue }) => (
      <span className="text-xs">{(getValue() as string) ?? "—"}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "monthly_salary",
    header: "Sueldo",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{pen(getValue() as number)}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_affiliation",
    header: "AFP",
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
    header: "Trabajados",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "days_vacation",
    header: "Vacaciones",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "days_medical_rest",
    header: "Desc. Médico",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "days_absence",
    header: "Faltas",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 70,
  },
  {
    accessorKey: "days_effective",
    header: "Efectivos",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-semibold">
        {num(getValue() as number)}
      </span>
    ),
    size: 80,
  },
  {
    accessorKey: "normal_hours",
    header: "Horas",
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
    header: "Básico",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "family_allowance",
    header: "Asig. Familiar",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "overtime_25",
    header: "HE 25%",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "overtime_35",
    header: "HE 35%",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "work_conditions",
    header: "Cond. Trabajo",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "vacation_pay",
    header: "Vacaciones",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "production_bonus",
    header: "Bono Prod.",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "food_benefit",
    header: "Alimentación",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "night_bonus",
    header: "Bonif. Noc.",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "commercial_bonus",
    header: "Bono Comerc.",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "total_income",
    header: "TOTAL ING.",
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
    header: "CTS Trunca",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "gratification",
    header: "Gratif.",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "extraordinary_bonus",
    header: "Bonif. Extr.",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "vacation_truncated",
    header: "Vac. Truncas",
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
    header: "ONP",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "afp_mandatory",
    header: "AFP Oblig.",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_insurance",
    header: "AFP Seguro",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_commission",
    header: "AFP Comis.",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_total",
    header: "AFP Total",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-semibold">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "income_tax_5th",
    header: "Imp. 5ta",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "oncosalud_plan",
    header: "Oncosalud",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "advances_loans",
    header: "Préstamos",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "other_deductions",
    header: "Otros Desc.",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "total_deductions",
    header: "TOTAL DESC.",
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
    header: "EsSalud",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "cts_employer",
    header: "CTS",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "sctr_health",
    header: "SCTR Salud",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "sctr_pension",
    header: "SCTR Pensión",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "life_insurance",
    header: "Seg. Vida",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "employer_contributions_total",
    header: "TOTAL APOR.",
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
    header: "Neto Prelim.",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "aguinaldo",
    header: "Aguinaldo",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "net_pay_final",
    header: "NETO FINAL",
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
