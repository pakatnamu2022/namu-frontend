"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { errorToast, successToast } from "@/core/core.function";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { PayrollPeriodResource } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.interface";
import { FoodCardResource, FoodCardRequest } from "../lib/food-card.interface";
import { storeOrUpdateFoodCard } from "../lib/food-card.actions";

const DEFAULT_AMOUNT = 200;

interface FoodCardAssignTableProps {
  workers: WorkerResource[];
  periods: PayrollPeriodResource[];
  existingCards: FoodCardResource[];
  isLoading: boolean;
  onSaved: () => void;
}

type CellKey = `${number}-${number}`;

interface CellState {
  applies: boolean;
  saving: boolean;
}

function buildInitialState(
  workers: WorkerResource[],
  periods: PayrollPeriodResource[],
  existingCards: FoodCardResource[],
): Record<CellKey, CellState> {
  const state: Record<CellKey, CellState> = {};
  for (const worker of workers) {
    for (const period of periods) {
      const key: CellKey = `${worker.id}-${period.id}`;
      const card = existingCards.find(
        (c) => c.worker_id === worker.id && c.period_id === period.id,
      );
      state[key] = { applies: card ? card.applies : false, saving: false };
    }
  }
  return state;
}

export default function FoodCardAssignTable({
  workers,
  periods,
  existingCards,
  isLoading,
  onSaved,
}: FoodCardAssignTableProps) {
  const [cells, setCells] = useState<Record<CellKey, CellState>>({});

  useEffect(() => {
    if (workers.length && periods.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCells(buildInitialState(workers, periods, existingCards));
    }
  }, [workers, periods, existingCards]);

  const { mutate } = useMutation({
    mutationFn: (payload: FoodCardRequest) => storeOrUpdateFoodCard(payload),
    onSuccess: () => {
      successToast("Tarjeta de alimentos actualizada correctamente.");
      onSaved();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? "Error al guardar la tarjeta.",
      );
    },
  });

  const handleToggle = (
    workerId: number,
    periodId: number,
    checked: boolean,
  ) => {
    const key: CellKey = `${workerId}-${periodId}`;
    setCells((prev) => ({
      ...prev,
      [key]: { ...prev[key], applies: checked, saving: true },
    }));

    mutate(
      {
        worker_id: workerId,
        period_id: periodId,
        amount: DEFAULT_AMOUNT,
        applies: checked,
      },
      {
        onSettled: () => {
          setCells((prev) => ({
            ...prev,
            [key]: { ...prev[key], saving: false },
          }));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (!workers.length || !periods.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Seleccione una empresa y al menos un periodo para visualizar los
        trabajadores.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead className="min-w-52">Trabajador</TableHead>
            {periods.map((period) => (
              <TableHead key={period.id} className="text-center min-w-36">
                {period.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker, index) => (
            <TableRow key={worker.id}>
              <TableCell className="text-center text-muted-foreground text-xs">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium text-sm">
                {worker.name}
              </TableCell>
              {periods.map((period) => {
                const key: CellKey = `${worker.id}-${period.id}`;
                const cell = cells[key];
                return (
                  <TableCell key={period.id} className="text-center">
                    <Checkbox
                      checked={cell?.applies ?? false}
                      disabled={cell?.saving}
                      onCheckedChange={(checked) =>
                        handleToggle(worker.id, period.id, !!checked)
                      }
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
