import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader } from "lucide-react";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllBodyType } from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/lib/bodyType.hook";
import { storeApprovedAccesories } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.actions";
import { APPROVED_ACCESSORIES } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.constants";
import {
  approvedAccesoriesSchemaCreate,
  ApprovedAccesoriesSchema,
} from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.schema";

interface CreateApprovedAccessoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (accessoryId: number) => void;
}

export function CreateApprovedAccessoryModal({
  open,
  onClose,
  onSuccess,
}: CreateApprovedAccessoryModalProps) {
  const queryClient = useQueryClient();
  const { data: typesBody = [] } = useAllBodyType();

  const form = useForm<ApprovedAccesoriesSchema>({
    resolver: zodResolver(approvedAccesoriesSchemaCreate) as any,
    defaultValues: {
      code: "",
      description: "",
      price: 0,
      type_operation_id: 794,
    },
    mode: "onChange",
  });

  const { mutate: createAccessory, isPending } = useMutation({
    mutationFn: storeApprovedAccesories,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [APPROVED_ACCESSORIES.QUERY_KEY] });
      toast.success("Accesorio homologado creado correctamente");
      form.reset();
      onClose();
      onSuccess(data.id);
    },
    onError: () => {
      toast.error("Error al crear el accesorio homologado");
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Nuevo Accesorio Homologado"
      subtitle="Solo disponible para Comercial"
      icon="PackagePlus"
      size="lg"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Este accesorio se creará para usarse en el cotizador comercial.
          No aplica para los accesorios de post-venta.
        </div>

        <Form {...form}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="code"
                label="Código"
                control={form.control}
                placeholder="Ej: LS"
                uppercase
              />
              <FormInput
                name="description"
                label="Descripción"
                control={form.control}
                placeholder="Ej: Láminas de Seguridad"
                uppercase
              />
              <FormInput
                name="price"
                label="Precio"
                control={form.control}
                placeholder="Ej: 390"
                type="number"
              />
              <FormSelect
                name="body_type_id"
                label="Carrocería"
                placeholder="Selecciona una carrocería"
                options={typesBody.map((item) => ({
                  label: item.code + " - " + item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={form.handleSubmit((data) => createAccessory(data))}
                className="flex-1"
              >
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Guardando..." : "Guardar Accesorio"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </GeneralModal>
  );
}
