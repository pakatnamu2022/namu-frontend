"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCategoryWeightReport } from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.hook";
import { CategoryWeightReport } from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.interface";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ApplyReferenceWeightsSheet } from "./ApplyReferenceWeightsSheet";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { Check, RefreshCw, Scale, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  homogeneousWeightsPerson,
  regeneratePersonObjectives,
} from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.actions";
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
}

export function CategoryWeightDetailSheet({
  open,
  onClose,
  categoryId,
  categoryName,
}: Props) {
  const { data, isLoading, refetch } = useCategoryWeightReport(
    categoryId,
    open,
  );
  const [applyOpen, setApplyOpen] = useState(false);
  const [pendingPersonId, setPendingPersonId] = useState<number | null>(null);

  const referenceObjectives = data?.objectives ?? [];

  const handleApplySuccess = (_report: CategoryWeightReport) => {
    refetch();
  };

  const { mutate: regenerate, isPending: isRegenerating } = useMutation({
    mutationFn: (personId: number) =>
      regeneratePersonObjectives(categoryId, personId),
    onMutate: (personId) => setPendingPersonId(personId),
    onSuccess: async () => {
      successToast("Objetivos faltantes agregados correctamente");
      await refetch();
    },
    onError: (error: any) => {
      errorToast(getErrorMessage(error) || "No se pudieron agregar los objetivos faltantes");
    },
    onSettled: () => setPendingPersonId(null),
  });

  const { mutate: homogenize, isPending: isHomogenizing } = useMutation({
    mutationFn: (personId: number) =>
      homogeneousWeightsPerson(categoryId, personId),
    onMutate: (personId) => setPendingPersonId(personId),
    onSuccess: async () => {
      successToast("Pesos homogeneizados correctamente");
      await refetch();
    },
    onError: (error: any) => {
      errorToast(getErrorMessage(error) || "No se pudieron homogeneizar los pesos");
    },
    onSettled: () => setPendingPersonId(null),
  });

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        title={`Pesos por trabajador · ${categoryName}`}
        subtitle="Detalle de validez de pesos para cada trabajador de esta categoría"
        icon="BarChart2"
        size="7xl"
        childrenFooter={
          <div className="w-full flex justify-between items-center gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {data && referenceObjectives.length > 0 && (
              <Button variant="outline" onClick={() => setApplyOpen(true)}>
                <Scale className="size-4 mr-2" />
                Editar pesos de referencia
              </Button>
            )}
          </div>
        }
      >
        {isLoading ? (
          <FormSkeleton />
        ) : data ? (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap text-sm">
              <span className="text-muted-foreground">
                Total: <strong>{data.total_workers}</strong>
              </span>
              <span className="text-green-700">
                Válidos: <strong>{data.valid_workers}</strong>
              </span>
              <span className="text-destructive">
                Inválidos: <strong>{data.invalid_workers}</strong>
              </span>
            </div>

            <div className="rounded overflow-hidden shadow-sm">
              <Table className="text-xs">
                <TableHeader className="bg-muted">
                  <TableRow className="h-8">
                    <TableHead className="h-8">Trabajador</TableHead>
                    {referenceObjectives.map((obj) => (
                      <TableHead
                        key={obj.objective_id}
                        className="h-8 text-center whitespace-nowrap max-w-32 truncate"
                      >
                        {obj.objective_name}
                      </TableHead>
                    ))}
                    <TableHead className="h-8 text-center">Suma</TableHead>
                    <TableHead className="h-8 text-center">Estado</TableHead>
                    <TableHead className="h-8 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.workers.map((worker) => {
                    const hasMissing =
                      worker.objectives.length < referenceObjectives.length;
                    const isNotHomogeneous =
                      Math.abs(worker.total_weight - 100) > 0.01 ||
                      worker.objectives.some((o) => o.weight === 0);
                    const isPending = pendingPersonId === worker.person_id;
                    const difference = 100 - worker.total_weight;

                    return (
                    <TableRow
                      key={worker.person_id}
                      className={cn(!worker.valid && "bg-red-50")}
                    >
                      <TableCell className="py-1 font-medium whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{worker.name}</span>
                          {worker.issues.length > 0 && (
                            <span className="text-destructive text-[10px]">
                              {worker.issues.join(" · ")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {referenceObjectives.map((refObj) => {
                        const obj = worker.objectives.find(
                          (o) => o.objective_id === refObj.objective_id,
                        );
                        return (
                          <TableCell
                            key={refObj.objective_id}
                            className={cn(
                              "py-1 text-center",
                              obj && !obj.valid && "text-destructive font-bold",
                            )}
                          >
                            {obj ? `${obj.weight}%` : "—"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="py-1 text-center">
                        {worker.total_weight}%
                      </TableCell>
                      <TableCell className="py-1 text-center">
                        <Badge
                          className={cn(
                            "flex gap-0.5 w-fit mx-auto font-semibold",
                            worker.valid ? "text-primary" : "text-destructive",
                          )}
                          variant="outline"
                        >
                          {worker.valid ? (
                            <Check className="size-3" />
                          ) : (
                            <X className="size-3" />
                          )}
                          {worker.valid ? "OK" : "Error"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ButtonAction
                            icon={RefreshCw}
                            canRender={hasMissing}
                            disabled={isPending || isRegenerating || isHomogenizing}
                            onClick={() => regenerate(worker.person_id)}
                            tooltip="Agregar objetivos faltantes"
                          />
                          <ButtonAction
                            icon={Scale}
                            canRender={isNotHomogeneous}
                            disabled={isPending || isRegenerating || isHomogenizing}
                            onClick={() => homogenize(worker.person_id)}
                            tooltip={`Homogenizar pesos · ${difference > 0 ? "+" : ""}${difference.toFixed(0)}%`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin datos.</p>
        )}
      </GeneralSheet>

      {applyOpen && data && (
        <ApplyReferenceWeightsSheet
          open={applyOpen}
          onClose={() => setApplyOpen(false)}
          categoryId={categoryId}
          categoryName={categoryName}
          totalWorkers={data.total_workers}
          referenceObjectives={referenceObjectives}
          workers={data.workers}
          onSuccess={handleApplySuccess}
        />
      )}
    </>
  );
}
