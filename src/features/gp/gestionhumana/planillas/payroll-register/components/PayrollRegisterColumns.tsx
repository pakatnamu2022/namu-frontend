"use client";

import { ColumnDef, Column } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PayrollRegisterResource } from "../lib/payroll-register.interface";

const pen = (val: number | null | undefined) =>
  `S/ ${(val ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

const num = (val: number | null | undefined) =>
  (val ?? 0).toLocaleString("es-PE");

type Col = ColumnDef<PayrollRegisterResource>;

// ── Header ordenable (clic = asc → desc → sin orden) ────────────────────────
// `tooltip` explica de dónde sale el concepto (fórmula y/o fuente de datos) —
// se muestra al pasar el mouse sobre el encabezado, apoyado en un ícono ⓘ
// para que se note que hay explicación disponible.
function SortableHeader({
  column,
  label,
  align = "left",
  tooltip,
}: {
  column: Column<PayrollRegisterResource, unknown>;
  label: string;
  align?: "left" | "right";
  tooltip?: string;
}) {
  const sorted = column.getIsSorted();
  const button = (
    <Button
      variant="ghost"
      size="sm"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "h-6 px-1 gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground w-full",
        align === "right" ? "justify-end -mr-1" : "justify-start -ml-1",
      )}
    >
      {align === "right" && tooltip && (
        <Info className="size-3 shrink-0 opacity-50" />
      )}
      <span>{label}</span>
      {align !== "right" && tooltip && (
        <Info className="size-3 shrink-0 opacity-50" />
      )}
      {sorted === "asc" ? (
        <ArrowUp className="size-3 shrink-0" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3 shrink-0" />
      ) : (
        <ArrowUpDown className="size-3 shrink-0 opacity-40" />
      )}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        align={align === "right" ? "end" : "start"}
        className="max-w-72 whitespace-pre-line text-left"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

const sortableHeader = (
  label: string,
  align: "left" | "right" = "left",
  tooltip?: string,
) =>
  function Header({ column }: { column: Column<PayrollRegisterResource, unknown> }) {
    return (
      <SortableHeader column={column} label={label} align={align} tooltip={tooltip} />
    );
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
    header: sortableHeader(
      "Trabajador",
      "left",
      "Nombre completo del trabajador, tomado tal cual estaba al generar el registro (snapshot; no se actualiza solo si el trabajador cambia de nombre después).",
    ),
    cell: ({ getValue }) => (
      <span className="font-semibold whitespace-nowrap">
        {(getValue() as string) ?? "—"}
      </span>
    ),
    size: 220,
  },
  {
    accessorKey: "worker_vat",
    header: sortableHeader("DNI", "left", "Documento de identidad del trabajador."),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{(getValue() as string) ?? "—"}</span>
    ),
    size: 90,
  },
  {
    accessorKey: "occupation",
    header: sortableHeader("Cargo", "left", "Cargo/puesto vigente del trabajador (worker.position)."),
    cell: ({ getValue }) => (
      <span className="text-xs whitespace-nowrap">
        {(getValue() as string) ?? "—"}
      </span>
    ),
    size: 160,
  },
  {
    accessorKey: "cost_center",
    header: sortableHeader("C. Costo", "left", "Sede / centro de costo al que pertenece el trabajador."),
    cell: ({ getValue }) => (
      <span className="text-xs">{(getValue() as string) ?? "—"}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "monthly_salary",
    header: sortableHeader(
      "Sueldo",
      "right",
      "Sueldo mensual vigente EN EL PERÍODO, resuelto desde el historial de contratos (WorkerContract) a la fecha de fin del período — no el sueldo actual del trabajador, para que los períodos pasados reflejen el contrato que regía entonces.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{pen(getValue() as number)}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_affiliation",
    header: sortableHeader(
      "AFP",
      "left",
      "Sistema de pensión al que está afiliado el trabajador (AFP u ONP), según rrhh_persona.sis_pensiones_id.",
    ),
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
    header: sortableHeader(
      "Trabajados",
      "right",
      "Con cálculo de asistencias: días de PayrollCalculation (ya prorateados). Sin cálculo: 30 − vacaciones − licencia sin goce (LSGH); descanso médico y licencia con goce (DM/LCGH) se pagan como día trabajado.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "days_vacation",
    header: sortableHeader(
      "Vacaciones",
      "right",
      "Días de vacación tomados en el período: código VC en gh_payroll_schedules, o si no hay cálculo de asistencias corrido, directo de rrhh_vacaciones (solicitudes APROBADAS) que caen dentro del período.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "days_medical_rest",
    header: sortableHeader(
      "Desc. Médico",
      "right",
      "Días de descanso médico: código DM en gh_payroll_schedules, o si no hay cálculo de asistencias, desde rrhh_ausentismo_laboral aprobado (tipo descanso médico) dentro del período.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "days_absence",
    header: sortableHeader(
      "Faltas",
      "right",
      "Días con código F (falta injustificada) contados en gh_payroll_schedules para el período.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {num(getValue() as number)}
      </span>
    ),
    size: 70,
  },
  {
    accessorKey: "days_effective",
    header: sortableHeader(
      "Efectivos",
      "right",
      "Fórmula: Días trabajados + días de vacación. (Días trabajados ya incluye descanso médico/licencia con goce como día pagado, por eso no se suman de nuevo aquí).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-semibold">
        {num(getValue() as number)}
      </span>
    ),
    size: 80,
  },
  {
    accessorKey: "normal_hours",
    header: sortableHeader(
      "Horas",
      "right",
      "Total de horas normales trabajadas en el período, desde PayrollCalculation (cálculo de asistencias). 0 si no se ha corrido el cálculo.",
    ),
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
    header: sortableHeader(
      "Básico",
      "right",
      "Sueldo básico GANADO en el período. Con cálculo de asistencias: PayrollCalculation.basic_salary. Sin cálculo: Sueldo mensual ÷ 30 × días trabajados.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "family_allowance",
    header: sortableHeader(
      "Asig. Familiar",
      "right",
      "10% de la RMV vigente (GeneralMaster 'FAMILY_ALLOWANCE', S/ 113.00 por defecto). Automática si rrhh_persona.asignacion = 'SI' y no hay exclusión puntual (gh_payroll_exclusions) para ese trabajador/período.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "overtime_25",
    header: sortableHeader(
      "HE 25%",
      "right",
      "Horas extra pagadas al 25% de sobretasa, desde PayrollCalculation.overtime_25 (cálculo de asistencias).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "overtime_35",
    header: sortableHeader(
      "HE 35%",
      "right",
      "Horas extra pagadas al 35% de sobretasa, desde PayrollCalculation.overtime_35 (cálculo de asistencias).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "work_conditions",
    header: sortableHeader(
      "Cond. Trabajo",
      "right",
      "Monto de condiciones de trabajo registrado en gh_payroll_working_conditions para el trabajador/período.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "vacation_pay",
    header: sortableHeader(
      "Vacaciones",
      "right",
      "Fórmula: días de vacación × valor del día vacacional. Con cálculo de asistencias, el valor del día usa el promedio de los últimos 6 meses; sin cálculo, se aproxima a Sueldo ÷ 30.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "production_bonus",
    header: sortableHeader(
      "Bono Prod.",
      "right",
      "Suma de bonificaciones tipo 'Producción' registradas en gh_payroll_bonuses (status activo) para el trabajador/período.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "food_benefit",
    header: sortableHeader(
      "Alimentación",
      "right",
      "Sin fuente de datos implementada aún — queda fijo en 0.00 (pendiente).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "night_bonus",
    header: sortableHeader(
      "Bonif. Noc.",
      "right",
      "Bonificación por trabajo nocturno, desde PayrollCalculation.night_bonus (cálculo de asistencias).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "commercial_bonus",
    header: sortableHeader(
      "Bono Comerc.",
      "right",
      "Suma de bonificaciones tipo 'Comercial' registradas en gh_payroll_bonuses (status activo) para el trabajador/período.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "total_income",
    header: sortableHeader(
      "TOTAL ING.",
      "right",
      "Fórmula: Básico + Asig. Familiar + HE 25% + HE 35% + Feriado + Descanso trabajado + Bonif. Noc. + Bono Prod. + Bono Comerc. + Cond. Trabajo + Vacaciones.",
    ),
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
    header: sortableHeader(
      "CTS Trunca",
      "right",
      "Monto cargado manualmente en el módulo 'Liquidación BB.SS.' (tipo CTS_TRUNCADA) para el trabajador/período — típicamente al cese.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "gratification",
    header: sortableHeader(
      "Gratif.",
      "right",
      "Gratificación trunca cargada en Liquidación BB.SS. (tipo GRATIFICACION_TRUNCADA). Inafecta: se suma completa al neto final, sin descuentos.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "extraordinary_bonus",
    header: sortableHeader(
      "Bonif. Extr.",
      "right",
      "Bonificación extraordinaria (9% del aporte a EsSalud que el empleador se ahorra) sobre la gratificación trunca, tipo BONIFICACION_EXTRAORDINARIA en Liquidación BB.SS. Inafecta, se suma completa al neto.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "vacation_truncated",
    header: sortableHeader(
      "Vac. Truncas",
      "right",
      "Vacaciones truncas cargadas manualmente en Liquidación BB.SS. (tipo VACACIONES_TRUNCADAS) para el trabajador/período.",
    ),
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
    header: sortableHeader(
      "ONP",
      "right",
      "Fórmula: Total de Ingresos × tasa ONP (13%, configurable en rrhh_sist_pensiones.obl). Solo se calcula si el trabajador está afiliado a ONP; si tiene AFP, sale en 0.00.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "afp_mandatory",
    header: sortableHeader(
      "AFP Oblig.",
      "right",
      "Fórmula: Total de Ingresos × tasa de aporte obligatorio de la AFP del trabajador (rrhh_sist_pensiones.obl, ~10%). Solo aplica si el trabajador está afiliado a una AFP.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_insurance",
    header: sortableHeader(
      "AFP Seguro",
      "right",
      "Fórmula: Total de Ingresos × prima de seguro de la AFP (rrhh_sist_pensiones.prima_seg, ~1.37%).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_commission",
    header: sortableHeader(
      "AFP Comis.",
      "right",
      "Fórmula: Total de Ingresos × comisión variable de la AFP afiliada (rrhh_sist_pensiones.com_var — cambia según la AFP).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "afp_total",
    header: sortableHeader(
      "AFP Total",
      "right",
      "Fórmula: AFP Oblig. + AFP Seguro + AFP Comis.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-semibold">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "income_tax_5th",
    header: sortableHeader(
      "Imp. 5ta",
      "right",
      "Renta de 5ta categoría (proyección simplificada): (Total Ingresos × 12) − 7 UIT = base imponible anual; se aplican tramos progresivos 8/14/17/20/30% y el impuesto anual se prorratea a cuota mensual. No incluye gratificaciones/bonos extraordinarios.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "oncosalud_plan",
    header: sortableHeader(
      "Oncosalud",
      "right",
      "Suma de gh_payroll_insurances.rate_with_tax del trabajador para el período (planes de seguro tipo Oncosalud/Fesalud, con impuesto incluido).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "advances_loans",
    header: sortableHeader(
      "Préstamos",
      "right",
      "Sin fuente de datos identificada aún — queda fijo en 0.00 (pendiente).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "other_deductions",
    header: sortableHeader(
      "Otros Desc.",
      "right",
      "Sin fuente de datos identificada aún — queda fijo en 0.00 (pendiente).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "total_deductions",
    header: sortableHeader(
      "TOTAL DESC.",
      "right",
      "Fórmula: ONP + AFP Total + Imp. 5ta + Oncosalud + Préstamos + Otros Desc. (+ descuentos judiciales/gracia si existieran, hoy en 0.00).",
    ),
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
    header: sortableHeader(
      "EsSalud",
      "right",
      "Fórmula: máx(Total Ingresos, 1 RMV) × 9% (tasa configurable en GeneralMaster). Aplica a todos los trabajadores, con piso de 1 RMV.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "cts_employer",
    header: sortableHeader(
      "CTS",
      "right",
      "Pendiente de implementar (depósito semestral mayo/noviembre, Fase 3 del módulo) — se muestra en 0.00 hasta que se calcule.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "sctr_health",
    header: sortableHeader(
      "SCTR Salud",
      "right",
      "Fórmula: Total de Ingresos × 0.50% (tasa configurable). Solo si el trabajador está afiliado a SCTR (rrhh_persona.estado_sctr = 'SI'); si no, sale en 0.00.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "sctr_pension",
    header: sortableHeader(
      "SCTR Pensión",
      "right",
      "Fórmula: mín(Total Ingresos, Remuneración Máxima Asegurable) × 0.50%. Solo si el trabajador está afiliado a SCTR (rrhh_persona.estado_sctr = 'SI').",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "life_insurance",
    header: sortableHeader(
      "Seg. Vida",
      "right",
      "Vida Ley: (Sueldo básico × 3.12%) × (1 + IGV) ÷ 12 — prima anual con IGV, prorrateada a cuota mensual (fórmula confirmada contra el cálculo real de la póliza).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "employer_contributions_total",
    header: sortableHeader(
      "TOTAL APOR.",
      "right",
      "Fórmula: EsSalud + CTS + SCTR Salud + SCTR Pensión + Seg. Vida.",
    ),
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
    header: sortableHeader(
      "Neto Prelim.",
      "right",
      "Fórmula: Total Ingresos − Total Descuentos (aún sin sumar gratificación/aguinaldo, que son inafectos).",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "aguinaldo",
    header: sortableHeader(
      "Aguinaldo",
      "right",
      "Monto cargado manualmente en Liquidación BB.SS. (tipo AGUINALDO) para el trabajador/período. Inafecto: se suma completo al neto final.",
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block">
        {pen(getValue() as number)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "net_pay_final",
    header: sortableHeader(
      "NETO FINAL",
      "right",
      "Fórmula: Neto Prelim. + Gratificación + Bonif. Extraordinaria + Gratificación Navidad + Bonif. Extr. Navidad + Aguinaldo. Estos últimos son inafectos (sin descuentos) y se suman completos.",
    ),
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
