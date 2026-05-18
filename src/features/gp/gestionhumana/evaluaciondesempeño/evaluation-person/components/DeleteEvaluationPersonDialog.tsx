"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormSwitch } from "@/shared/components/FormSwitch";

type FormValues = {
  alsoRemoveFromCycle: boolean;
};

interface DeleteEvaluationPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (alsoRemoveFromCycle: boolean) => Promise<void>;
}

export function DeleteEvaluationPersonDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteEvaluationPersonDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { alsoRemoveFromCycle: false },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(form.getValues("alsoRemoveFromCycle"));
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Eliminar persona de la evaluación"
      subtitle="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este registro?"
      size="md"
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
      <Form {...form}>
        <FormSwitch
          control={form.control}
          name="alsoRemoveFromCycle"
          text="También eliminar del ciclo"
          textDescription="Esto removerá a la persona de todos los objetivos del ciclo y de las demás evaluaciones asociadas"
          autoHeight
        />
      </Form>
    </GeneralModal>
  );
}
