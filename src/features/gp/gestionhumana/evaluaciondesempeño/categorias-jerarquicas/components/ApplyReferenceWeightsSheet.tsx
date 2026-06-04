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
  CategoryWeightReportWorker,
  type CategoryReferenceObjective,
} from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.interface";
import {
  errorToast,
  getErrorMessage,
  successToast,
} from "@/core/core.function";
import { Sparkles } from "lucide-react";

function suggestWeights(
  workers: CategoryWeightReportWorker[],
  referenceObjectives: CategoryReferenceObjective[],
): number[] {
  const n = referenceObjectives.length;
  if (n === 0) return [];

  const weightsByObjective = referenceObjectives.map((refObj) =>
    workers
      .flatMap((w) => w.objectives)
      .filter((o) => o.objective_id === refObj.objective_id && o.weight > 0)
      .map((o) => o.weight),
  );

  const modes = weightsByObjective.map((weights) => {
    if (weights.length === 0) {
      // fallback: split equally in multiples of 10
      return Math.round((100 / n) / 10) * 10;
    }
    const freq: Record<number, number> = {};
    for (const w of weights) freq[w] = (freq[w] || 0) + 1;
    return Number(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
  });

  const sum = modes.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) < 0.01) return modes;

  // Normalize proportionally then round to multiples of 10
  const normalized = modes.map((m) => Math.round((m / sum) * 10) * 10);
  const normalizedSum = normalized.reduce((a, b) => a + b, 0);
  const diff = 100 - normalizedSum;
  if (diff !== 0) {
    const maxIdx = normalized.indexOf(Math.max(...normalized));
    normalized[maxIdx] = Math.max(0, normalized[maxIdx] + diff);
  }
  return normalized;
}

interface Props {
  open: boolean;
  onClose: () => void;
  categoryId: number;
  categoryName: string;
  totalWorkers: number;
  referenceObjectives: CategoryReferenceObjective[];
  workers: CategoryWeightReportWorker[];
  onSuccess: (report: CategoryWeightReport) => void;
}

export function ApplyReferenceWeightsSheet({
  open,
  onClose,
  categoryId,
  categoryName,
  totalWorkers,
  referenceObjectives,
  workers,
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

  const applySuggestion = () => {
    const activeReferenceObjectives = referenceObjectives.filter((refObj) =>
      rows.find((r) => r.objective_id === refObj.objective_id)?.active ?? true,
    );
    const suggested = suggestWeights(workers, activeReferenceObjectives);
    const suggestionMap = new Map(
      activeReferenceObjectives.map((obj, i) => [obj.objective_id, suggested[i]]),
    );
    setRows((prev) =>
      prev.map((r) => {
        const active = r.active ?? true;
        if (!active) return { ...r, weight: 0 };
        return { ...r, weight: suggestionMap.get(r.objective_id) ?? r.weight };
      }),
    );
  };

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
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className={cn(
                "text-sm font-semibold px-3 py-2 rounded-md",
                isValid
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              Suma de pesos: {totalWeight.toFixed(0)} / 100
            </div>
            {workers.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={applySuggestion}
              >
                <Sparkles className="size-3.5" />
                Sugerir pesos
              </Button>
            )}
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
