"use client";

import { useState } from "react";
import { useParams } from "react-router-dom";
import { format, startOfMonth } from "date-fns";
import { CalendarDays, Clock, TrendingUp, TrendingDown } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { DataTable } from "@/shared/components/DataTable";
import FilterWrapper from "@/shared/components/FilterWrapper";
import DatePicker from "@/shared/components/DatePicker";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { cn } from "@/lib/utils";

import { ATTENDANCE } from "../lib/attendance.constants";
import { useAttendancePersonDashboard } from "../lib/attendance.hook";
import type { AttendanceDailyRecord } from "../lib/attendance.interface";

const today = format(new Date(), "yyyy-MM-dd");
const firstOfMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

function timeStr(t: string | null | undefined) {
  return t ? t.slice(0, 5) : "-";
}

function hoursStr(h: string | null | undefined) {
  if (h == null) return "-";
  return h;
}

const dailyColumns: ColumnDef<AttendanceDailyRecord>[] = [
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium">{row.original.date}</span>
    ),
  },
  {
    accessorKey: "check_in",
    header: "Entrada",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{timeStr(row.original.check_in)}</span>
    ),
  },
  {
    accessorKey: "lunch_out",
    header: "Sal. Almuerzo",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{timeStr(row.original.lunch_out)}</span>
    ),
  },
  {
    accessorKey: "lunch_in",
    header: "Ret. Almuerzo",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{timeStr(row.original.lunch_in)}</span>
    ),
  },
  {
    accessorKey: "check_out",
    header: "Salida",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{timeStr(row.original.check_out)}</span>
    ),
  },
  {
    accessorKey: "expected_hours",
    header: "H. Esperadas",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{row.original.expected_hours}</span>
    ),
  },
  {
    accessorKey: "hours_worked",
    header: "H. Trabajadas",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{hoursStr(row.original.hours_worked)}</span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const b = row.original.balance;
      if (b == null) return <span className="text-sm text-muted-foreground">-</span>;
      const isNegative = b.startsWith("-");
      return (
        <span
          className={cn(
            "tabular-nums text-sm font-medium",
            isNegative ? "text-red-600" : "text-green-600",
          )}
        >
          {hoursStr(b)}
        </span>
      );
    },
  },
];

function toStr(d: Date | undefined): string | undefined {
  return d ? format(d, "yyyy-MM-dd") : undefined;
}

export default function AttendancePersonDashboard() {
  const { ROUTE } = ATTENDANCE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { personId } = useParams<{ personId: string }>();
  const parsedPersonId = personId ? parseInt(personId, 10) : null;

  const [dateFrom, setDateFrom] = useState<string>(firstOfMonth);
  const [dateTo, setDateTo] = useState<string>(today);

  const { data, isLoading } = useAttendancePersonDashboard(parsedPersonId, {
    date_from: dateFrom,
    date_to: dateTo,
  });

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  const balance = data?.balance ?? null;
  const balancePositive = balance == null || !balance.startsWith("-");

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={data?.full_name ?? "Detalle de persona"}
          subtitle={data ? `Código: ${data.emp_code} · DNI: ${data.vat}` : "Cargando..."}
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      {/* Filtros de fecha */}
      <FilterWrapper>
        <DatePicker
          value={dateFrom}
          onChange={(d) => setDateFrom(toStr(d) ?? firstOfMonth)}
          placeholder="Desde"
        />
        <DatePicker
          value={dateTo}
          onChange={(d) => setDateTo(toStr(d) ?? today)}
          placeholder="Hasta"
        />
      </FilterWrapper>

      {/* Cards de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardCard
          title="Días presentes"
          value={isLoading ? "-" : (data?.days_present ?? 0)}
          icon={CalendarDays}
          color="blue"
        />
        <DashboardCard
          title="H. Esperadas"
          value={isLoading ? "-" : (data?.expected_hours ?? "-")}
          icon={Clock}
          color="slate"
        />
        <DashboardCard
          title="H. Trabajadas"
          value={isLoading ? "-" : (data?.hours_worked ?? "-")}
          icon={Clock}
          color="indigo"
        />
        <DashboardCard
          title="Balance"
          value={isLoading ? "-" : hoursStr(balance)}
          icon={balancePositive ? TrendingUp : TrendingDown}
          color={balancePositive ? "green" : "red"}
        />
      </div>

      {/* Tabla diaria */}
      <DataTable
        columns={dailyColumns}
        data={data?.daily ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
