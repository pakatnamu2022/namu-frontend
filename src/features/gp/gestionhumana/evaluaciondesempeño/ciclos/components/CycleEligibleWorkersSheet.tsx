"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import SearchInput from "@/shared/components/SearchInput";
import {
  useAssignWorkersToCycle,
  useEligibleWorkers,
} from "../lib/cycle.hook";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  cycleId: number;
}

export default function CycleEligibleWorkersSheet({
  open,
  onClose,
  cycleId,
}: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const { data: workers = [], isLoading } = useEligibleWorkers(cycleId, open);
  const assignMutation = useAssignWorkersToCycle();

  useEffect(() => {
    if (!open) {
      setSelected([]);
      setSearch("");
    }
  }, [open]);

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.document.toLowerCase().includes(search.toLowerCase()),
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
      setSelected(filtered.map((w) => w.id));
    }
  };

  const handleSave = async () => {
    try {
      await assignMutation.mutateAsync({ cycleId, workerIds: selected });
      toast.success("Trabajadores asignados correctamente.");
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Error al asignar los trabajadores.",
      );
    }
  };

  const footer = (
    <div className="flex justify-end items-center gap-2">
      <Button variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button
        disabled={selected.length === 0 || assignMutation.isPending}
        onClick={handleSave}
      >
        {assignMutation.isPending ? (
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
      title="Asignar Trabajadores"
      subtitle="Selecciona los trabajadores elegibles para asignar al ciclo"
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
                  key={worker.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleWorker(worker.id)}
                >
                  <Checkbox
                    checked={selected.includes(worker.id)}
                    onCheckedChange={() => toggleWorker(worker.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{worker.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {worker.document} · {worker.position}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {worker.sede}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
