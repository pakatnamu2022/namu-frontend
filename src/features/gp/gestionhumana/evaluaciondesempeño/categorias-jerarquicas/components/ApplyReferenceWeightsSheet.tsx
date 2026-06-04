"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { applyReferenceWeights } from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.actions";
import { CATEGORY_OBJECTIVE } from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.constants";
import {
  ApplyReferenceWeightsObjective,
  CategoryWeightReport,
  type CategoryReferenceObjective,
} from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.interface";
import {
  errorToast,
  getErrorMessage,
  successToast,
} from "@/core/core.function";

interface Props {
  open: boolean;
  onClose: () => void;
  categoryId: number;
  categoryName: string;
  totalWorkers: number;
  referenceObjectives: CategoryReferenceObjective[];
  onSuccess: (report: CategoryWeightReport) => void;
}

export function ApplyReferenceWeightsSheet({
  open,
  onClose,
  categoryId,
  categoryName,
  totalWorkers,
  referenceObjectives,
  onSuccess,
}: Props) {
  const { QUERY_KEY } = CATEGORY_OBJECTIVE;
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<ApplyReferenceWeightsObjective[]>(() =>
    referenceObjectives.map((o) => ({
      objective_id: o.objective_id,
      weight: o.weight,
      goal: o.goal_reference,
      active: true,
    })),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totalWeight = rows.reduce(
    (sum, r) => sum + ((r.active ?? true) ? Number(r.weight) || 0 : 0),
    0,
  );
  const isValid = Math.abs(totalWeight - 100) < 0.01;

  const updateRow = (idx: number, field: "weight" | "goal", value: string) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, [field]: value === "" ? 0 : Number(value) } : r,
      ),
    );
  };

  const toggleActive = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, active: !(r.active ?? true) } : r,
      ),
    );
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => applyReferenceWeights(categoryId, { objectives: rows }),
    onSuccess: async (report) => {
      successToast("Pesos aplicados a todos los trabajadores");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY + "WeightReport", categoryId],
      });
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY + "GlobalWeightReport"],
      });
      setConfirmOpen(false);
      onSuccess(report);
      onClose();
    },
    onError: (error: any) => {
      errorToast(getErrorMessage(error) || "No se pudieron aplicar los pesos");
      setConfirmOpen(false);
    },
  });

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        title={`Pesos de referencia · ${categoryName}`}
        subtitle="Edita los pesos y metas que se aplicarán a todos los trabajadores"
        icon="Scale"
        size="2xl"
        childrenFooter={
          <div className="w-full flex justify-between items-center gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              disabled={!isValid || isPending}
              onClick={() => setConfirmOpen(true)}
            >
              Aplicar a todos ({totalWorkers})
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div
            className={cn(
              "text-sm font-semibold px-3 py-2 rounded-md w-fit",
              isValid
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700",
            )}
          >
            Suma de pesos: {totalWeight.toFixed(0)} / 100
          </div>

          <div className="rounded overflow-hidden shadow-sm">
            <Table className="text-sm">
              <TableHeader className="bg-muted">
                <TableRow className="h-8">
                  <TableHead className="h-8">Objetivo</TableHead>
                  <TableHead className="h-8 w-28">Peso (%)</TableHead>
                  <TableHead className="h-8 w-28">Meta</TableHead>
                  <TableHead className="h-8 w-20 text-center">Activo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => {
                  const ref = referenceObjectives[idx];
                  const name = ref?.objective_name ?? `#${row.objective_id}`;
                  const active = row.active ?? true;
                  return (
                    <TableRow
                      key={row.objective_id}
                      className={cn(!active && "opacity-50")}
                    >
                      <TableCell className="py-1">{name}</TableCell>
                      <TableCell className="py-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          disabled={!active}
                          className={cn(
                            "h-7 w-24 text-sm",
                            active && row.weight === 0 && "border-destructive",
                          )}
                          value={row.weight}
                          onChange={(e) =>
                            updateRow(idx, "weight", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="py-1">
                        <Input
                          type="number"
                          min={0}
                          disabled={!active}
                          className="h-7 w-24 text-sm"
                          value={row.goal}
                          onChange={(e) =>
                            updateRow(idx, "goal", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="py-1 text-center">
                        <Switch
                          checked={active}
                          onCheckedChange={() => toggleActive(idx)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </GeneralSheet>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar aplicación masiva</DialogTitle>
            <DialogDescription>
              ¿Aplicar estos pesos a los{" "}
              <strong>{totalWorkers} trabajadores</strong> de{" "}
              <strong>{categoryName}</strong>? Esta acción sobreescribirá las
              configuraciones individuales.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button onClick={() => mutate()} disabled={isPending}>
              {isPending ? "Aplicando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
