"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GeneralSheet from "@/shared/components/GeneralSheet";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { cn } from "@/lib/utils";
import { useGlobalAssignmentReport } from "../../categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.hook";
import { GlobalCompetenceReportItem } from "../../categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.interface";
import { fillAllMissingCompetences } from "../../categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.actions";
import { CategoryCompetenceDetailSheet } from "./CategoryCompetenceDetailSheet";
import { Check, ChevronRight, RefreshCw, TriangleAlert } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { errorToast, getErrorMessage, successToast } from "@/core/core.function";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GlobalCompetenceReportSheet({ open, onClose }: Props) {
  const { data, isLoading, refetch } = useGlobalAssignmentReport(open);
  const [selectedCategory, setSelectedCategory] =
    useState<GlobalCompetenceReportItem | null>(null);

  const validCount = data?.filter((c) => c.is_valid).length ?? 0;
  const invalidCount = data?.filter((c) => !c.is_valid).length ?? 0;

  const { mutate: fillAll, isPending: isFilling } = useMutation({
    mutationFn: fillAllMissingCompetences,
    onSuccess: async (res) => {
      const msg =
        res.assignments_created > 0
          ? `Se crearon ${res.assignments_created} asignaciones en ${res.categories_processed} categorías`
          : "No había competencias faltantes";
      successToast(msg);
      await refetch();
    },
    onError: (error: any) => {
      errorToast(getErrorMessage(error) || "Error al asignar competencias faltantes");
    },
  });

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        title="Reporte global de competencias"
        subtitle="Estado de asignación de competencias por categoría jerárquica"
        icon="BookmarkCheck"
        size="2xl"
        childrenFooter={
          <div className="w-full flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => fillAll()}
              disabled={isFilling || invalidCount === 0}
            >
              <RefreshCw className={cn("size-4 mr-2", isFilling && "animate-spin")} />
              Asignar todos los faltantes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <FormSkeleton />
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <span className="text-green-700">
                <strong>{validCount}</strong> con competencias completas
              </span>
              <span className="text-destructive">
                <strong>{invalidCount}</strong> con problemas
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {data.map((category) => (
                <button
                  key={category.category_id}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors",
                    "hover:bg-muted/60",
                    category.is_valid
                      ? "shadow-sm"
                      : "shadow-sm border border-destructive/20 bg-red-50/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center size-8 rounded-full shrink-0",
                        category.is_valid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-destructive"
                      )}
                    >
                      {category.is_valid ? (
                        <Check className="size-4" />
                      ) : (
                        <TriangleAlert className="size-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {category.category_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.total_workers} trabajadores
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {category.is_valid ? (
                      <Badge
                        variant="outline"
                        className="text-primary font-semibold flex gap-1"
                      >
                        <Check className="size-3" />
                        Completo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-destructive font-semibold flex gap-1"
                      >
                        <TriangleAlert className="size-3" />
                        {category.invalid_workers} con faltantes
                      </Badge>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay categorías con competencias configuradas.
          </p>
        )}
      </GeneralSheet>

      {selectedCategory && (
        <CategoryCompetenceDetailSheet
          open={true}
          onClose={() => setSelectedCategory(null)}
          categoryId={selectedCategory.category_id}
          categoryName={selectedCategory.category_name}
        />
      )}
    </>
  );
}
