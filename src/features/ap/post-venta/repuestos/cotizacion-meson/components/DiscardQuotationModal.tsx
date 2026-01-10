import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllReasonDiscardingSparePart } from "@/features/ap/configuraciones/postventa/motivos-descarte-repuesto/lib/reasonDiscardingSparePart.hook";
import { FormInputText } from "@/shared/components/FormInputText";
import { discardOrderQuotation } from "../lib/quotationMeson.actions";

const discardQuotationSchema = z.object({
  discard_reason_id: z.string().min(1, "El motivo es requerido"),
  discarded_note: z.string().optional(),
});

type DiscardQuotationSchema = z.infer<typeof discardQuotationSchema>;

interface DiscardQuotationModalProps {
  open: boolean;
  onClose: () => void;
  quotationId: number;
  onSuccess?: () => void;
}

export const DiscardQuotationModal = ({
  open,
  onClose,
  quotationId,
  onSuccess,
}: DiscardQuotationModalProps) => {
  const queryClient = useQueryClient();
  const { data: reasons = [], isLoading: loadingReasons } =
    useAllReasonDiscardingSparePart();

  const form = useForm<DiscardQuotationSchema>({
    resolver: zodResolver(discardQuotationSchema),
    defaultValues: {
      discard_reason_id: "",
      discarded_note: "",
    },
  });

  const { mutate: discardQuotation, isPending } = useMutation({
    mutationFn: async (data: DiscardQuotationSchema) => {
      return await discardOrderQuotation(quotationId, {
        discard_reason_id: Number(data.discard_reason_id),
        discarded_note: data.discarded_note || null,
      });
    },
    onSuccess: () => {
      successToast("Cotización descartada correctamente");
      queryClient.invalidateQueries({ queryKey: ["order-quotation"] });
      onSuccess?.();
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al descartar la cotización";
      errorToast(message);
    },
  });

  const handleSubmit = (data: DiscardQuotationSchema) => {
    discardQuotation(data);
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Descartar Cotización</DialogTitle>
          <DialogDescription>
            Seleccione el motivo por el cual desea descartar esta cotización.
            Puede agregar notas adicionales si lo desea.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormSelect
              control={form.control}
              name="discard_reason_id"
              label="Motivo de Descarte"
              placeholder="Seleccione un motivo"
              options={reasons.map((reason) => ({
                label: reason.description,
                value: reason.id.toString(),
              }))}
              required
              disabled={loadingReasons}
            />

            <FormInputText
              control={form.control}
              name="discarded_note"
              label="Notas (Opcional)"
              placeholder="Agregar notas adicionales..."
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
                variant="destructive"
              >
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Descartando..." : "Descartar Cotización"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
