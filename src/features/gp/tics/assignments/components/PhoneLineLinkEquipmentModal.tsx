"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useEquipments } from "@/features/gp/tics/equipment/lib/equipment.hook";
import { linkEquipmentToPhoneLine } from "../lib/assignments.actions";
import { PhoneLineWorkerResource } from "../lib/assignments.interface";
import { errorToast, successToast } from "@/core/core.function";

interface Props {
  open: boolean;
  assignment: PhoneLineWorkerResource;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PhoneLineLinkEquipmentModal({
  open,
  assignment,
  onClose,
  onSuccess,
}: Props) {
  const isLinked = !!assignment.equipo_id;
  const [changing, setChanging] = useState(false);
  const showSelector = !isLinked || changing;

  const form = useForm<{ equipo_id: string }>({
    defaultValues: { equipo_id: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (equipo_id: number | null) =>
      linkEquipmentToPhoneLine(assignment.id, { equipo_id }),
    onSuccess: (_data, variables) => {
      successToast(
        variables === null
          ? "Equipo desvinculado correctamente."
          : "Equipo vinculado correctamente.",
      );
      form.reset();
      setChanging(false);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al actualizar el vínculo.",
      );
    },
  });

  const handleClose = () => {
    form.reset();
    setChanging(false);
    onClose();
  };

  const handleLink = form.handleSubmit((values) => {
    if (!values.equipo_id) return;
    mutate(Number(values.equipo_id));
  });

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Vincular equipo"
      subtitle={`Línea: ${assignment.phone_line}`}
      icon="Link2"
      size="md"
    >
      <div className="space-y-4 p-2">
        {isLinked && !changing ? (
          <div className="space-y-3">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Equipo vinculado
              </p>
              <p className="text-sm font-medium">{assignment.equipo_nombre}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cerrar
              </Button>
              <Button
                type="button"
                variant="outline"
                color="rose"
                onClick={() => mutate(null)}
                disabled={isPending}
              >
                {isPending ? "Desvinculando..." : "Desvincular"}
              </Button>
              <Button
                type="button"
                onClick={() => setChanging(true)}
                disabled={isPending}
              >
                Cambiar
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={handleLink} className="space-y-4">
              <FormSelectAsync
                name="equipo_id"
                label="Equipo"
                placeholder="Selecciona un equipo"
                control={form.control}
                useQueryHook={useEquipments}
                mapOptionFn={(item) => ({
                  label: `${item.equipo} - ${item.serie}`,
                  value: item.id.toString(),
                  description: item.tipo_equipo,
                })}
                additionalParams={{ worker_id: assignment.worker_id }}
                perPage={10}
                debounceMs={500}
                required
              />

              {showSelector && (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      changing ? () => { setChanging(false); form.reset(); } : handleClose
                    }
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Vinculando..." : "Vincular"}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        )}
      </div>
    </GeneralModal>
  );
}
