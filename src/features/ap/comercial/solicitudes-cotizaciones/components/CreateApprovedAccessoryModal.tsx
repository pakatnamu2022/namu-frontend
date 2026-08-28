import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader, Plus, Trash2 } from "lucide-react";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";
import { MultiSelectTags } from "@/shared/components/MultiSelectTags";
import { useAllBodyType } from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/lib/bodyType.hook";
import { storeApprovedAccesories } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.actions";
import { APPROVED_ACCESSORIES } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.constants";
import {
  approvedAccesoriesSchemaCreate,
  ApprovedAccesoriesSchema,
  flattenPriceGroups,
} from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.schema";
import { previewAccessoryCode } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.code";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface CreateApprovedAccessoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (accessoryId: number) => void;
  /** Recibe el accesorio recién creado para cachearlo en el formulario padre. */
  onCreated?: (accessory: ApprovedAccesoriesResource) => void;
  /** Carrocería del modelo/VIN seleccionado: se pre-carga en el primer grupo de precio. */
  defaultBodyTypeId?: number;
}

export function CreateApprovedAccessoryModal({
  open,
  onClose,
  onSuccess,
  onCreated,
  defaultBodyTypeId,
}: CreateApprovedAccessoryModalProps) {
  const queryClient = useQueryClient();
  const { data: typesBody = [] } = useAllBodyType();

  const form = useForm<ApprovedAccesoriesSchema>({
    resolver: zodResolver(approvedAccesoriesSchemaCreate) as any,
    defaultValues: {
      description: "",
      type_operation_id: CM_COMERCIAL_ID,
      priceGroups: [
        { body_type_ids: defaultBodyTypeId ? [defaultBodyTypeId] : [], price: 0 },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "priceGroups",
  });

  const description = form.watch("description");
  const previewCode = previewAccessoryCode(description ?? "");
  const groups = (form.watch("priceGroups") ?? []) as {
    body_type_ids?: number[];
  }[];

  const { mutate: createAccessory, isPending } = useMutation({
    mutationFn: storeApprovedAccesories,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [APPROVED_ACCESSORIES.QUERY_KEY],
      });
      toast.success("Accesorio homologado creado correctamente");
      form.reset();
      onClose();
      if (onCreated) onCreated(data);
      onSuccess(data.id);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Error al crear el accesorio homologado",
      );
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.handleSubmit((data: any) => {
    const { priceGroups, ...rest } = data;
    createAccessory({ ...rest, prices: flattenPriceGroups(priceGroups) } as any);
  });

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Nuevo Accesorio Homologado"
      subtitle="Solo disponible para Comercial"
      icon="PackagePlus"
      size="xl"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Este accesorio se creará para usarse en el cotizador comercial. No
          aplica para los accesorios de post-venta.
        </div>

        <Form {...form}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="description"
                label="Descripción"
                control={form.control}
                placeholder="Ej: Láminas de Seguridad"
                uppercase
                required
              />
              <FormInput
                name="code"
                label="Código (automático)"
                value={previewCode}
                disabled
                description="Se genera solo a partir de la descripción."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Precios por carrocería</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    append({ body_type_ids: [], price: 0 })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Agregar grupo de precio
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-xs text-destructive">
                  Agrega al menos un grupo de precio.
                </p>
              )}

              {fields.map((field, index) => {
                const current: number[] = groups[index]?.body_type_ids ?? [];
                const takenElsewhere = new Set(
                  groups.flatMap((g, i) =>
                    i === index ? [] : g.body_type_ids ?? [],
                  ),
                );
                const options = typesBody.filter(
                  (item) =>
                    current.includes(item.id) ||
                    !takenElsewhere.has(item.id),
                );
                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_160px_auto] gap-3 items-start rounded-lg bg-muted/40 p-3"
                  >
                    <MultiSelectTags
                      control={form.control}
                      name={`priceGroups.${index}.body_type_ids`}
                      label="Carrocerías"
                      placeholder="Selecciona carrocerías"
                      options={options}
                      getDisplayValue={(item) =>
                        `${item.code} - ${item.description}`
                      }
                      required
                    />
                    <FormInput
                      name={`priceGroups.${index}.price`}
                      label="Precio"
                      control={form.control}
                      placeholder="Ej: 390"
                      type="number"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6 text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
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
                onClick={handleSubmit}
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
