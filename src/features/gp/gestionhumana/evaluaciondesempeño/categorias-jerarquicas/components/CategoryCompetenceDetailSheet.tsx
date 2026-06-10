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
import { useCategoryAssignmentReport } from "../../categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.hook";
import { regeneratePersonCompetences } from "../../categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.actions";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { Check, RefreshCw, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
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

export function CategoryCompetenceDetailSheet({
  open,
  onClose,
  categoryId,
  categoryName,
}: Props) {
  const { data, isLoading, refetch } = useCategoryAssignmentReport(
    categoryId,
    open,
  );
  const [pendingPersonId, setPendingPersonId] = useState<number | null>(null);

  const { mutate: regenerate, isPending: isRegenerating } = useMutation({
    mutationFn: (personId: number) =>
      regeneratePersonCompetences(categoryId, personId),
    onMutate: (personId) => setPendingPersonId(personId),
    onSuccess: async () => {
      successToast("Competencias faltantes agregadas correctamente");
      await refetch();
    },
    onError: (error: any) => {
      errorToast(
        getErrorMessage(error) || "No se pudieron agregar las competencias faltantes",
      );
    },
    onSettled: () => setPendingPersonId(null),
  });

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Competencias por trabajador · ${categoryName}`}
      subtitle="Detalle de asignación de competencias para cada trabajador de esta categoría"
      icon="BookmarkCheck"
      size="4xl"
      childrenFooter={
        <div className="w-full flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
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
              Completos: <strong>{data.valid_workers}</strong>
            </span>
            <span className="text-destructive">
              Con faltantes: <strong>{data.invalid_workers}</strong>
            </span>
            <span className="text-muted-foreground">
              Competencias configuradas: <strong>{data.competences.length}</strong>
            </span>
          </div>

          <div className="rounded overflow-hidden shadow-sm">
            <Table className="text-xs">
              <TableHeader className="bg-muted">
                <TableRow className="h-8">
                  <TableHead className="h-8">Trabajador</TableHead>
                  <TableHead className="h-8 text-center">Total</TableHead>
                  <TableHead className="h-8 text-center">Asignadas</TableHead>
                  <TableHead className="h-8 text-center">Faltantes</TableHead>
                  <TableHead className="h-8 text-center">Estado</TableHead>
                  <TableHead className="h-8 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.workers.map((worker) => {
                  const hasMissing = worker.assigned_competences < worker.total_competences;
                  const isPending = pendingPersonId === worker.person_id;

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
                      <TableCell className="py-1 text-center">
                        {worker.total_competences}
                      </TableCell>
                      <TableCell className="py-1 text-center">
                        {worker.assigned_competences}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-1 text-center font-semibold",
                          hasMissing && "text-destructive",
                        )}
                      >
                        {worker.total_competences - worker.assigned_competences}
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
                          {worker.valid ? "OK" : "Faltan"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 text-center">
                        <ButtonAction
                          icon={RefreshCw}
                          canRender={hasMissing}
                          disabled={isPending || isRegenerating}
                          onClick={() => regenerate(worker.person_id)}
                          tooltip="Asignar competencias faltantes"
                        />
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
  );
}
