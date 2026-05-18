"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormSwitch } from "@/shared/components/FormSwitch";

type FormValues = {
  deleteAll: boolean;
  deactivateCategory: boolean;
};

interface DeleteCyclePersonDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deleteAll: boolean, deactivateCategory: boolean) => Promise<void>;
}

export function DeleteCyclePersonDetailDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteCyclePersonDetailDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { deleteAll: false, deactivateCategory: false },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(form.getValues("deleteAll"), form.getValues("deactivateCategory"));
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Eliminar objetivo del ciclo"
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
        <div className="space-y-3">
          <FormSwitch
            control={form.control}
            name="deleteAll"
            text="Eliminar también todos los demás objetivos de esta persona en el ciclo"
            textDescription="Limpia toda la data de esta persona en las evaluaciones asociadas al ciclo"
            autoHeight
          />
          <FormSwitch
            control={form.control}
            name="deactivateCategory"
            text="Desactivar el objetivo en la configuración de categoría"
            textDescription="Desactiva (active=0, weight=0) el objetivo correspondiente para que no aparezca en futuros ciclos"
            autoHeight
          />
        </div>
      </Form>
    </GeneralModal>
  );
}
