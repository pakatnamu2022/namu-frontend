"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/shared/components/DataTable";
import {
  IndicatorsByUser,
  OpportunityStates,
} from "../lib/dashboard.interface";
import { Badge } from "@/components/ui/badge";

interface DashboardUserIndicatorsProps {
  data: IndicatorsByUser[];
}

const OPPORTUNITY_STATES = [
  {
    key: "FRIO",
    label: "Frío",
    color: "text-blue-600",
    bgColor: "bg-blue-600",
  },
  {
    key: "TEMPLADO",
    label: "Templado",
    color: "text-orange-500",
    bgColor: "bg-orange-500",
  },
  {
    key: "CALIENTE",
    label: "Caliente",
    color: "text-red-600",
    bgColor: "bg-red-600",
  },
  {
    key: "VENTA CONCRETADA",
    label: "Venta",
    color: "text-green-600",
    bgColor: "bg-green-600",
  },
  {
    key: "CERRADA",
    label: "Cerrada",
    color: "text-gray-600",
    bgColor: "bg-gray-600",
  },
] as const;

const getPercentage = (value: number, total: number): string => {
  if (total === 0) return "0";
  return ((value / total) * 100).toFixed(1);
};

const getTotalOportunidades = (
  porEstadoOportunidad: OpportunityStates | undefined,
): number => {
  if (!porEstadoOportunidad) return 0;
  return Object.values(porEstadoOportunidad).reduce(
    (sum, val) => sum + (val || 0),
    0,
  );
};

const UserNameCell = ({ user }: { user: IndicatorsByUser }) => (
  <span className="font-medium">{user.user_nombre || "Sin nombre"}</span>
);

const TotalLeadsCell = ({ total }: { total: number }) => (
  <span className="font-bold text-primary">{total}</span>
);

const StatusCell = ({
  value,
  total,
  colorClass,
}: {
  value: number;
  total: number;
  colorClass: string;
}) => (
  <div className="flex flex-row sm:flex-col justify-center items-center gap-1">
    <span className={`font-semibold ${colorClass}`}>{value}</span>
    <Badge variant="outline" size="xs">
      {getPercentage(value, total)}%
    </Badge>
  </div>
);

const OpportunityStateCell = ({
  value,
  percentage,
  color,
  bgColor,
}: {
  value: number;
  percentage: string;
  color: string;
  bgColor: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <span className={`font-semibold ${color}`}>{value}</span>
    {value > 0 && (
      <div className="w-full max-w-[60px]">
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${bgColor} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )}
  </div>
);

const SummaryStats = ({ data }: { data: IndicatorsByUser[] }) => {
  const totals = useMemo(
    () => ({
      usuarios: data.length,
      leads: data.reduce((sum, user) => sum + user.total_visitas, 0),
      atendidos: data.reduce(
        (sum, user) => sum + (user.estados_visita?.atendidos || 0),
        0,
      ),
      oportunidades: data.reduce(
        (sum, user) => sum + getTotalOportunidades(user.por_estado_oportunidad),
        0,
      ),
    }),
    [data],
  );

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Usuarios</p>
          <p className="text-2xl font-bold text-primary">{totals.usuarios}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Leads</p>
          <p className="text-2xl font-bold">{totals.leads}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Atendidos</p>
          <p className="text-2xl font-bold text-green-600">
            {totals.atendidos}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Total Oportunidades
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {totals.oportunidades}
          </p>
        </div>
      </div>
    </div>
  );
};

const createOpportunityStateColumn = (
  state: (typeof OPPORTUNITY_STATES)[number],
): ColumnDef<IndicatorsByUser> => ({
  id: state.key,
  header: () => <div className="text-center min-w-20">{state.label}</div>,
  cell: ({ row }) => {
    const value =
      row.original.por_estado_oportunidad?.[
        state.key as keyof OpportunityStates
      ] || 0;
    const totalOportunidades = getTotalOportunidades(
      row.original.por_estado_oportunidad,
    );
    const percentage = getPercentage(value, totalOportunidades);

    return (
      <OpportunityStateCell
        value={value}
        percentage={percentage}
        color={state.color}
        bgColor={state.bgColor}
      />
    );
  },
});

export default function DashboardUserIndicators({
  data,
}: DashboardUserIndicatorsProps) {
  const columns = useMemo<ColumnDef<IndicatorsByUser>[]>(
    () => [
      {
        accessorKey: "user_nombre",
        header: "Usuario",
        cell: ({ row }) => <UserNameCell user={row.original} />,
      },
      {
        accessorKey: "total_visitas",
        header: "Total Leads",
        cell: ({ row }) => (
          <div className="text-center">
            <TotalLeadsCell total={row.original.total_visitas} />
          </div>
        ),
      },
      {
        id: "atendidos",
        header: "Atendidos",
        cell: ({ row }) => (
          <StatusCell
            value={row.original.estados_visita?.atendidos || 0}
            total={row.original.total_visitas}
            colorClass="text-green-700 dark:text-green-400"
          />
        ),
      },
      {
        id: "no_atendidos",
        header: "No Atendidos",
        cell: ({ row }) => (
          <StatusCell
            value={row.original.estados_visita?.no_atendidos || 0}
            total={row.original.total_visitas}
            colorClass="text-yellow-700 dark:text-yellow-400"
          />
        ),
      },
      {
        id: "descartados",
        header: "Descartados",
        cell: ({ row }) => (
          <StatusCell
            value={row.original.estados_visita?.descartados || 0}
            total={row.original.total_visitas}
            colorClass="text-red-700 dark:text-red-400"
          />
        ),
      },
      ...OPPORTUNITY_STATES.map(createOpportunityStateColumn),
    ],
    [],
  );

  if (!data || data.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Importaciones Marketing</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay datos de usuarios disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Importaciones Marketing</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Comparativa de importación de leads por usuario y estado de
          oportunidad
        </p>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          isVisibleColumnFilter={false}
          variant="simple"
        />
        {data.length > 1 && <SummaryStats data={data} />}
      </CardContent>
    </Card>
  );
}
