"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormSwitch } from "@/shared/components/FormSwitch";

type FormValues = {
  deleteAll: boolean;
};

interface DeleteCyclePersonDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deleteAll: boolean) => Promise<void>;
}

export function DeleteCyclePersonDetailDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteCyclePersonDetailDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { deleteAll: false },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(form.getValues("deleteAll"));
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
        <FormSwitch
          control={form.control}
          name="deleteAll"
          text="Eliminar también todos los demás objetivos de esta persona en el ciclo"
          textDescription="Limpia toda la data de esta persona en las evaluaciones asociadas al ciclo"
          autoHeight
        />
      </Form>
    </GeneralModal>
  );
}
