"use client";

import { useState } from "react";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FilterMultiSelect } from "@/shared/components/FilterMultiSelect";
import { useAllCompetences } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.hook";
import { useProcessCompetences } from "../lib/interview.hook.ts";
import { RecruitmentProcessResource } from "../lib/recruitmentProcess.interface.ts";

interface Props {
  process: RecruitmentProcessResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (subCompetencias: { id: number; orden: number }[]) => Promise<void>;
  isLoading?: boolean;
}

export default function ProcessCompetencesDialog({
  process,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const processId = process?.id ?? null;
  const { data: competences, isLoading: isLoadingCompetences } = useAllCompetences();
  const { data: current } = useProcessCompetences(open ? processId : null);
  const [localSelected, setLocalSelected] = useState<string[] | null>(null);
  const selectedIds =
    localSelected ?? (current ?? []).map((c) => String(c.sub_competencia_id));

  const options = (competences ?? []).flatMap((c) =>
    (c.subcompetences ?? []).map((sc) => ({
      value: String(sc.id),
      label: sc.nombre,
      description: c.nombre,
    })),
  );

  const handleClose = () => {
    setLocalSelected(null);
    onOpenChange(false);
  };

  const handleChange = (values: string[]) => {
    if (values.length > 5) return;
    setLocalSelected(values);
  };

  const submit = async () => {
    await onConfirm(selectedIds.map((id, index) => ({ id: Number(id), orden: index + 1 })));
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Subcompetencias de entrevista"
      subtitle={process?.nombre_postulacion}
      icon="ListChecks"
    >
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Selecciona hasta 5 subcompetencias que se evaluarán en las entrevistas
          de este proceso.
        </p>
        <FilterMultiSelect
          value={selectedIds}
          onChange={handleChange}
          options={options}
          label="Subcompetencias"
          placeholder="Seleccionar subcompetencias..."
          isLoadingOptions={isLoadingCompetences}
        />
        <p className="text-[11px] text-muted-foreground">
          {selectedIds.length} / 5 seleccionadas
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isLoading || selectedIds.length === 0}
            onClick={submit}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isLoading ? "hidden" : "animate-spin"}`}
            />
            Guardar
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
