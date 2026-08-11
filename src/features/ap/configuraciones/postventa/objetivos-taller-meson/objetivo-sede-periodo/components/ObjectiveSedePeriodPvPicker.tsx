import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Car, Pencil, Plus, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog.tsx";
import { SearchableSelect } from "@/shared/components/SearchableSelect.tsx";
import { NumberFormat } from "@/shared/components/NumberFormat.tsx";
import { MetricCard } from "@/shared/components/MetricCard.tsx";
import {
  currentMonth,
  currentYear,
  ERROR_MESSAGE,
  errorToast,
  generateYear,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook.ts";
import { EMPRESA_AP, MONTH_OPTIONS } from "@/core/core.constants.ts";
import { cn } from "@/lib/utils.ts";
import { useAllObjectiveSedePeriodPv } from "../lib/objectiveSedePeriodPv.hook.ts";
import {
  bulkGenerateObjectiveSedePeriodPv,
  deleteObjectiveSedePeriodPv,
} from "../lib/objectiveSedePeriodPv.actions.ts";
import { OBJECTIVE_SEDE_PERIOD_PV } from "../lib/objectiveSedePeriodPv.constants.ts";
import ObjectiveSedePeriodPvSheet from "./ObjectiveSedePeriodPvSheet.tsx";
import ConceptObjectivePeriodPvSheet from "../../concepto-objetivo-periodo/components/ConceptObjectivePeriodPvSheet.tsx";
import { ObjectiveSedePeriodPvResource } from "../lib/objectiveSedePeriodPv.interface.ts";

export default function ObjectiveSedePeriodPvPicker() {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY } = OBJECTIVE_SEDE_PERIOD_PV;

  const [sedeId, setSedeId] = useState("");
  const [year, setYear] = useState(currentYear().toString());
  const [month, setMonth] = useState(currentMonth().toString());

  const [openObjectiveSheet, setOpenObjectiveSheet] = useState(false);
  const [editObjective, setEditObjective] =
    useState<ObjectiveSedePeriodPvResource | null>(null);
  const [conceptsObjective, setConceptsObjective] =
    useState<ObjectiveSedePeriodPvResource | null>(null);
  const [conceptId, setConceptId] = useState<number | undefined>(undefined);
  const [deleteObjective, setDeleteObjective] =
    useState<ObjectiveSedePeriodPvResource | null>(null);
  const [openBulkGenerate, setOpenBulkGenerate] = useState(false);
  const YEAR_OPTIONS = generateYear().map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const { data = [], isLoading } = useAllObjectiveSedePeriodPv(
    {
      sede_id: sedeId || undefined,
      year,
      month,
    },
    !!year && !!month,
  );

  const totalObjective = data.reduce(
    (sum, objective) => sum + Number(objective.amount),
    0,
  );

  const conceptTotalsMap = new Map<
    string,
    {
      description: string;
      is_vehicular_crossing: boolean;
      total: number;
    }
  >();

  data.forEach((objective) => {
    (objective.concept_objectives ?? []).forEach((concept) => {
      const key = `${concept.area_id}-${concept.description}`;
      const existing = conceptTotalsMap.get(key);
      const amount = Number(concept.sub_amount);
      if (existing) {
        existing.total += amount;
      } else {
        conceptTotalsMap.set(key, {
          description: concept.description,
          is_vehicular_crossing: concept.is_vehicular_crossing,
          total: amount,
        });
      }
    });
  });

  const conceptTotals = Array.from(conceptTotalsMap.values());
  const totalVehicularCrossing = conceptTotals
    .filter((item) => item.is_vehicular_crossing)
    .reduce((sum, item) => sum + item.total, 0);
  const totalConceptsAmount = conceptTotals
    .filter((item) => !item.is_vehicular_crossing)
    .reduce((sum, item) => sum + item.total, 0);

  const handleDelete = async () => {
    if (!deleteObjective) return;
    try {
      await deleteObjectiveSedePeriodPv(deleteObjective.id);
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteObjective(null);
    }
  };

  const { mutate: bulkGenerate, isPending: isBulkGenerating } = useMutation({
    mutationFn: () =>
      bulkGenerateObjectiveSedePeriodPv({
        year: Number(year),
        month: Number(month),
      }),
    onSuccess: async () => {
      successToast("Objetivos generados correctamente para todas las sedes.");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      setOpenBulkGenerate(false);
    },
    onError: (error: any) => {
      errorToast(
        "Error al generar los objetivos",
        error.response?.data?.message,
      );
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 flex-wrap">
        <SearchableSelect
          label="Sede"
          value={sedeId}
          onChange={setSedeId}
          options={sedes.map((item) => ({
            label: item.description,
            value: item.id.toString(),
          }))}
          placeholder={isLoadingSedes ? "Cargando..." : "Todas las sedes"}
          disabled={isLoadingSedes}
        />

        <SearchableSelect
          label="Año"
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          placeholder="Año"
          showSearch={false}
          allowClear={false}
        />

        <SearchableSelect
          label="Mes"
          value={month}
          onChange={setMonth}
          options={MONTH_OPTIONS}
          placeholder="Mes"
          showSearch={false}
          allowClear={false}
        />

        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => setOpenBulkGenerate(true)}
        >
          <Sparkles className="size-4 mr-2" />
          Generar todos
        </Button>

        <Button
          size="sm"
          onClick={() => {
            setEditObjective(null);
            setOpenObjectiveSheet(true);
          }}
        >
          <Plus className="size-4 mr-2" />
          Crear Objetivo
        </Button>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Objetivo total"
            value={`S/ ${totalObjective.toFixed(2)}`}
            subtitle={`${data.length} sede${data.length === 1 ? "" : "s"} · ${month}/${year}`}
            icon={Target}
            variant="default"
            color="blue"
          />

          <MetricCard
            title="Sedes con objetivo"
            value={data.length}
            subtitle="Consolidado del período"
            icon={Building2}
            variant="outline"
            color="gray"
          />

          <MetricCard
            title="Conceptos en soles"
            value={`S/ ${totalConceptsAmount.toFixed(2)}`}
            subtitle="Suma de conceptos monetarios"
            icon={Target}
            variant="outline"
            color="green"
          />

          <MetricCard
            title="Paso vehicular"
            value={totalVehicularCrossing.toFixed(0)}
            subtitle="Vehículos objetivo por recepción"
            icon={Car}
            variant="outline"
            color="amber"
          />
        </div>
      )}

      {!isLoading && data.length === 0 && (
        <div className="rounded-lg border border-dashed p-4">
          <p className="text-sm text-muted-foreground">
            {sedeId
              ? "No hay objetivo registrado para esta sede en el período seleccionado."
              : "No hay objetivos registrados para el período seleccionado."}
          </p>
        </div>
      )}

      {data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((objective) => {
            const concepts = objective.concept_objectives ?? [];
            const conceptsTotal = concepts.reduce(
              (sum, item) => sum + Number(item.sub_amount),
              0,
            );

            return (
              <div
                key={objective.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {objective.sede?.abreviatura} · {month}/{year}
                    </p>
                    <p className="text-lg font-semibold">
                      S/ <NumberFormat value={objective.amount} />
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditObjective(objective);
                        setOpenObjectiveSheet(true);
                      }}
                    >
                      <Pencil className="size-4 mr-2" />
                      Editar
                    </Button>
                    <DeleteButton
                      onClick={() => setDeleteObjective(objective)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap border-t pt-2">
                  {concepts.map((concept) => (
                    <button
                      key={concept.id}
                      type="button"
                      onClick={() => {
                        setConceptsObjective(objective);
                        setConceptId(concept.id);
                      }}
                      className={cn(
                        "text-xs rounded-full border px-2 py-1 transition-colors",
                        concept.status
                          ? "bg-green-100 border-green-400 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
                          : "bg-red-100 border-red-400 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
                      )}
                    >
                      <span className="mr-1">#{concept.order}</span>
                      {concept.description}
                      {concept.is_vehicular_crossing ? (
                        <>
                          {" · "}
                          <Car className="size-4 inline mx-1" />
                          <NumberFormat
                            value={Number(concept.sub_amount).toFixed(0)}
                          />
                        </>
                      ) : (
                        <>
                          {" · S/ "}
                          <NumberFormat
                            value={Number(concept.sub_amount).toFixed(2)}
                          />
                          {" · "}
                          {concept.advisors?.length || 0} asesor
                          {concept.advisors?.length === 1 ? "" : "es"}
                        </>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setConceptsObjective(objective);
                      setConceptId(undefined);
                    }}
                    className="text-xs rounded-full border border-dashed px-2 py-1 hover:bg-muted transition-colors"
                  >
                    <Plus className="size-3 inline mr-1" />
                    Agregar concepto
                  </button>
                  {concepts.length > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Total conceptos: S/{" "}
                      <NumberFormat value={conceptsTotal.toFixed(2)} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openObjectiveSheet && (
        <ObjectiveSedePeriodPvSheet
          open={true}
          onClose={() => {
            setOpenObjectiveSheet(false);
            setEditObjective(null);
          }}
          record={editObjective}
          prefill={{ sede_id: sedeId, year, month }}
        />
      )}

      {conceptsObjective && (
        <ConceptObjectivePeriodPvSheet
          open={true}
          onClose={() => {
            setConceptsObjective(null);
            setConceptId(undefined);
          }}
          objective={conceptsObjective}
          initialConceptId={conceptId}
        />
      )}

      {deleteObjective !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteObjective(null)}
          onConfirm={handleDelete}
          description="Esta acción eliminará el objetivo y TODOS sus conceptos y asesores asociados. Esta acción no se puede deshacer."
        />
      )}

      <SimpleConfirmDialog
        open={openBulkGenerate}
        onOpenChange={setOpenBulkGenerate}
        onConfirm={() => bulkGenerate()}
        title="Generar objetivos para todas las sedes"
        description={`Se generarán automáticamente los objetivos de todas las sedes para ${month}/${year}. Si ya existe un objetivo para una sede en este período, no se duplicará.`}
        confirmText="Generar todos"
        icon="warning"
        isLoading={isBulkGenerating}
      />
    </div>
  );
}
