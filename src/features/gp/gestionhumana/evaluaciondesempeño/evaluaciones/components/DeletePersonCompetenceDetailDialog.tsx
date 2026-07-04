"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { Badge } from "@/components/ui/badge";
import { EvaluationPersonCompetenceDetailResource } from "../lib/evaluationPersonCompetenceDetail.interface";

type FormValues = {
  cascade: boolean;
};

interface Props {
  open: boolean;
  records: EvaluationPersonCompetenceDetailResource[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (cascade: boolean) => Promise<void>;
}

export function DeletePersonCompetenceDetailDialog({
  open,
  records,
  onOpenChange,
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { cascade: false },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(form.getValues("cascade"));
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const count = records.length;

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Eliminar detalles de competencia"
      subtitle={`Esta acción no se puede deshacer. Se eliminarán ${count} ${
        count === 1 ? "registro" : "registros"
      }.`}
      size="lg"
      childrenFooter={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? "Eliminando..." : "Confirmar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto rounded-md border p-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {record.person}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {record.competence} · {record.sub_competence}
                </span>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {record.evaluator}
              </Badge>
            </div>
          ))}
        </div>

        <Form {...form}>
          <FormSwitch
            control={form.control}
            name="cascade"
            text="Eliminar también la asignación de la categoría"
            textDescription="Elimina en cascada la asignación de competencia (categoría-competencia) para cada persona afectada"
            autoHeight
          />
        </Form>
      </div>
    </GeneralModal>
  );
}
