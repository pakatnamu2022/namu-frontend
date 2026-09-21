"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/core/core.function";
import { ChartAreaDefault } from "@/shared/charts/ChartAreaDefault";
import { useWorkerContractsSummary } from "../lib/worker.hook";
import SalaryIncreaseModal from "./SalaryIncreaseModal";

const money = (value: number | null | undefined) =>
  `S/ ${(value ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function WorkerContractsTab({ workerId }: { workerId: number }) {
  const { data, isLoading, isError } = useWorkerContractsSummary(workerId);
  const [increaseOpen, setIncreaseOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No se pudo cargar la información de contratos.
      </p>
    );
  }

  const today = todayIso();
  const chartData = data.salary_history.map((point) => ({
    name: formatDate(point.date, "MMM yy"),
    value: point.salary,
  }));

  // Contratos y aumentos de sueldo en una sola línea de tiempo (más reciente primero).
  const rows = [
    ...data.contracts.map((contract) => ({
      kind: "contract" as const,
      key: `c-${contract.id}`,
      date: contract.fecha_inicio ?? "",
      contract,
    })),
    ...(data.increases ?? []).map((increase) => ({
      kind: "increase" as const,
      key: `i-${increase.id}`,
      date: increase.fecha,
      increase,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
      {/* Izquierda: resumen de contratos y sueldo */}
      <Card className="pt-0">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 border-b py-5 sm:min-h-[77px]">
          <div className="grid gap-1">
            <CardTitle>Contratos ({data.contracts.length})</CardTitle>
            <CardDescription>Resumen de contratos y sueldo</CardDescription>
          </div>
          {data.can_register_increase && (
            <Button size="sm" variant="outline" onClick={() => setIncreaseOpen(true)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Registrar aumento
            </Button>
          )}
        </CardHeader>
        <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-6 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sueldo actual
          </p>
          <p className="text-lg font-semibold">
            {data.current_salary != null ? money(data.current_salary) : "-"}
          </p>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Sin contratos registrados
          </p>
        ) : (
          <div className="max-h-[420px] flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted">
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead className="text-right">Sueldo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  if (row.kind === "increase") {
                    const { increase } = row;
                    return (
                      <TableRow key={row.key}>
                        <TableCell>
                          <p className="font-medium leading-snug">
                            Aumento de sueldo
                          </p>
                          <p className="text-xs text-muted-foreground leading-snug">
                            {[
                              `${money(increase.sueldo_anterior)} → ${money(increase.sueldo_nuevo)}`,
                              increase.motivo,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(increase.fecha)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">-</TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {money(increase.sueldo_nuevo)}
                        </TableCell>
                        <TableCell>
                          <Badge color="tertiary">Aumento</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  const { contract } = row;
                  const active =
                    !!contract.fecha_inicio &&
                    contract.fecha_inicio <= today &&
                    (!contract.fecha_fin || contract.fecha_fin >= today);
                  return (
                    <TableRow key={row.key}>
                      <TableCell>
                        <p className="font-medium leading-snug">
                          {contract.tipo_contrato ?? "-"}
                        </p>
                        <p className="text-xs text-muted-foreground leading-snug">
                          {[contract.es_adenda ? "Adenda" : null, contract.cargo]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(contract.fecha_inicio)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {contract.fecha_fin
                          ? formatDate(contract.fecha_fin)
                          : "Indefinido"}
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">
                        {money(contract.sueldo)}
                      </TableCell>
                      <TableCell>
                        <Badge color={active ? "green" : "gray"}>
                          {active ? "Vigente" : "Vencido"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Derecha: evolución del sueldo */}
      {chartData.length >= 2 ? (
        <ChartAreaDefault
          title="Evolución del sueldo"
          description={`Sueldo actual: ${money(data.current_salary)}`}
          data={chartData}
          valueLabel="Sueldo"
          valueFormatter={money}
          defaultRange="all"
          showYAxis
          showDots
          fillHeight
        />
      ) : (
        <Card className="pt-0">
          <CardHeader className="flex flex-col justify-center gap-1 space-y-0 border-b py-5 sm:min-h-[77px]">
            <CardTitle>Evolución del sueldo</CardTitle>
          </CardHeader>
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {chartData.length === 1
              ? `Sin cambios de sueldo registrados. Sueldo: ${money(chartData[0].value)}`
              : "Sin historial de sueldo registrado"}
          </p>
        </Card>
      )}

      <SalaryIncreaseModal
        open={increaseOpen}
        onClose={() => setIncreaseOpen(false)}
        workerId={workerId}
        currentSalary={data.current_salary}
      />
    </div>
  );
}
