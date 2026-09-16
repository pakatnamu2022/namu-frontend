"use client";

import { useState } from "react";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { InterviewResource } from "../lib/interview.interface.ts";

interface Props {
  interview: InterviewResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scores: { sub_competencia_id: number; puntaje: number }[]) => Promise<void>;
  isLoading?: boolean;
}

function ScoreForm({
  interview,
  onClose,
  onConfirm,
  isLoading,
}: {
  interview: InterviewResource;
  onClose: () => void;
  onConfirm: (scores: { sub_competencia_id: number; puntaje: number }[]) => Promise<void>;
  isLoading: boolean;
}) {
  const [values, setValues] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    interview.scores.forEach((s) => {
      initial[s.sub_competencia_id] =
        s.puntaje !== null && s.puntaje !== undefined ? String(s.puntaje) : "";
    });
    return initial;
  });

  const isValid =
    interview.scores.length > 0 &&
    interview.scores.every((s) => {
      const v = values[s.sub_competencia_id];
      return v !== undefined && v !== "" && Number(v) >= 0 && Number(v) <= 5;
    });

  const submit = async () => {
    const scores = interview.scores.map((s) => ({
      sub_competencia_id: s.sub_competencia_id,
      puntaje: Number(values[s.sub_competencia_id]),
    }));
    await onConfirm(scores);
  };

  return (
    <div className="space-y-4">
      {interview.scores.length === 0 && (
        <p className="text-sm text-muted-foreground">
          El proceso no tiene subcompetencias configuradas para la etapa de
          entrevista.
        </p>
      )}
      {interview.scores.map((score) => (
        <div key={score.id} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{score.sub_competencia}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {score.competencia}
            </p>
          </div>
          <Input
            type="number"
            min={0}
            max={5}
            step={0.1}
            className="w-24"
            value={values[score.sub_competencia_id] ?? ""}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                [score.sub_competencia_id]: e.target.value,
              }))
            }
          />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Escala de 0 a 5. El promedio se calcula automáticamente.
      </p>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" disabled={isLoading || !isValid} onClick={submit}>
          <Loader
            className={`mr-2 h-4 w-4 ${!isLoading ? "hidden" : "animate-spin"}`}
          />
          Guardar calificación
        </Button>
      </div>
    </div>
  );
}

export default function InterviewScoreDialog({
  interview,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const handleClose = () => onOpenChange(false);

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Calificar entrevista"
      subtitle={interview?.postulante}
      icon="Star"
    >
      {interview && (
        <ScoreForm
          key={interview.id}
          interview={interview}
          onClose={handleClose}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
      )}
    </GeneralModal>
  );
}
