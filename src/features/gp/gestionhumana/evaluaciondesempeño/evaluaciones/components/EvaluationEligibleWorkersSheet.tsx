"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import SearchInput from "@/shared/components/SearchInput";
import {
  useAddWorkersToEvaluation,
  useEligibleWorkersInEvaluation,
} from "../lib/evaluation.hook";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  evaluationId: number;
}

export default function EvaluationEligibleWorkersSheet({
  open,
  onClose,
  evaluationId,
}: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const { data: workers = [], isLoading } = useEligibleWorkersInEvaluation(
    evaluationId,
    open,
  );
  const addMutation = useAddWorkersToEvaluation();

  useEffect(() => {
    if (!open) {
      setSelected([]);
      setSearch("");
    }
  }, [open]);

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.dni.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleWorker = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selected.length === filtered.length && filtered.length > 0) {
      setSelected([]);
    } else {
      setSelected(filtered.map((w) => w.person_id));
    }
  };

  const handleSave = async () => {
    try {
      const result = await addMutation.mutateAsync({
        evaluationId,
        workerIds: selected,
      });
      toast.success(
        `${result.persons_added} trabajador(es) agregado(s) correctamente.`,
      );
      if (result.errors.length > 0) {
        result.errors.forEach((error) => toast.error(error));
      }
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Error al agregar los trabajadores.",
      );
    }
  };

  const footer = (
    <div className="flex justify-end items-center gap-2">
      <Button variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button
        disabled={selected.length === 0 || addMutation.isPending}
        onClick={handleSave}
      >
        {addMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Guardando...
          </>
        ) : (
          `Guardar (${selected.length})`
        )}
      </Button>
    </div>
  );

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Agregar Trabajadores"
      subtitle="Selecciona los trabajadores elegibles para agregar a la evaluación"
      size="2xl"
      icon="Users"
      childrenFooter={footer}
    >
      <div className="space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar trabajador..."
        />

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No hay trabajadores elegibles disponibles.
          </p>
        )}

        {!isLoading && filtered.length > 0 && (
          <>
            <div
              className="flex items-center gap-2 pb-2 border-b cursor-pointer"
              onClick={toggleAll}
            >
              <Checkbox
                checked={
                  selected.length === filtered.length && filtered.length > 0
                }
                onCheckedChange={toggleAll}
              />
              <span className="text-sm font-medium">
                Seleccionar todos ({filtered.length})
              </span>
            </div>

            <div className="space-y-1">
              {filtered.map((worker) => (
                <div
                  key={worker.person_id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleWorker(worker.person_id)}
                >
                  <Checkbox
                    checked={selected.includes(worker.person_id)}
                    onCheckedChange={() => toggleWorker(worker.person_id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {worker.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {worker.dni} · {worker.position} ·{" "}
                      {worker.hierarchical_category}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Evaluador: {worker.evaluator}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-muted-foreground block">
                      {worker.sede}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {worker.will_have.objectives != null
                        ? `${worker.will_have.objectives} objetivo(s)`
                        : worker.will_have.competences != null
                          ? `${worker.will_have.competences} competencia(s)`
                          : null}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
