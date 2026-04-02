"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { usePhoneLines } from "@/features/gp/tics/phoneLine/lib/phoneLine.hook";
import { linkPhoneLineToEquipment } from "../lib/assignments.actions";
import { EquipmentAssignmentResource } from "../lib/assignments.interface";
import { errorToast, successToast } from "@/core/core.function";

interface Props {
  open: boolean;
  assignment: EquipmentAssignmentResource;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EquipmentLinkPhoneLineModal({
  open,
  assignment,
  onClose,
  onSuccess,
}: Props) {
  const isLinked = !!assignment.phone_line_id;
  const [changing, setChanging] = useState(false);
  const showSelector = !isLinked || changing;

  const form = useForm<{ phone_line_id: string }>({
    defaultValues: { phone_line_id: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (phone_line_id: number | null) =>
      linkPhoneLineToEquipment(assignment.id, { phone_line_id }),
    onSuccess: (_data, variables) => {
      successToast(
        variables === null
          ? "Línea desvinculada correctamente."
          : "Línea vinculada correctamente.",
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
    if (!values.phone_line_id) return;
    mutate(Number(values.phone_line_id));
  });

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Vincular línea telefónica"
      subtitle={`Asignación de ${assignment.worker_name}`}
      icon="Link2"
      size="md"
    >
      <div className="space-y-4 p-2">
        {isLinked && !changing ? (
          <div className="space-y-3">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Línea vinculada
              </p>
              <p className="text-sm font-medium">
                {assignment.phone_line_number}
              </p>
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
                name="phone_line_id"
                label="Línea telefónica"
                placeholder="Selecciona una línea"
                control={form.control}
                useQueryHook={usePhoneLines}
                mapOptionFn={(item) => ({
                  label: item.line_number,
                  value: item.id.toString(),
                  description: item.company,
                })}
                additionalParams={{ is_active: 1, isAssigned: 0 }}
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
                      changing
                        ? () => {
                            setChanging(false);
                            form.reset();
                          }
                        : handleClose
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
