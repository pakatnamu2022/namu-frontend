import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Image, Loader, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllBrandGroup } from "../../grupos-marcas/lib/brandGroup.hook";
import {
  brandSchemaCreate,
  brandSchemaUpdate,
  BrandsSchema,
} from "../lib/brands.schema";
import { BrandsRequest } from "../lib/brands.interface";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { BRAND } from "../lib/brands.constants";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { FormInput } from "@/shared/components/FormInput";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import BrandGroupModal from "../../grupos-marcas/components/BrandGroupModal";
import { BRAND_GROUP } from "../../grupos-marcas/lib/brandGroup.constants";

interface BrandsFormProps {
  defaultValues: Partial<BrandsSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  hideModalFields?: boolean;
}

export const BrandsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  hideModalFields = false,
}: BrandsFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? brandSchemaCreate : (brandSchemaUpdate as any),
    ),
    defaultValues: {
      ...defaultValues,
      type_operation_id:
        defaultValues.type_operation_id ?? String(CM_COMERCIAL_ID),
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = BRAND;
  const queryClient = useQueryClient();
  const [isBrandGroupModalOpen, setIsBrandGroupModalOpen] = useState(false);

  const { data: brandGroups = [], isLoading: isLoadingbrandGroups } =
    useAllBrandGroup();

  const isCommercial = useWatch({
    control: form.control,
    name: "type_operation_id",
    defaultValue: defaultValues.type_operation_id ?? String(CM_COMERCIAL_ID),
  });

  const handleSubmit = (data: BrandsRequest) => {
    onSubmit(data);
  };

  if (isLoadingbrandGroups) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hideModalFields && (
            <>
              <FormInput
                name="code"
                label="Cod."
                placeholder="Ej: CHA"
                control={form.control}
              />

              <FormInput
                name="dyn_code"
                label="Cod. Dyn"
                placeholder="Ej: 01"
                control={form.control}
              />
            </>
          )}

          <FormInput
            name="name"
            label="Nombre"
            placeholder="Ej: Changan"
            control={form.control}
          />

          <FormInput
            name="description"
            label="Descripción"
            placeholder="Ej: Changan"
            control={form.control}
          />

          <FormSelect
            name="group_id"
            label="Grupo"
            placeholder="Selecciona un grupo"
            options={brandGroups.map((brandGroup) => ({
              label: brandGroup.description,
              value: brandGroup.id.toString(),
            }))}
            control={form.control}
          >
            {!hideModalFields && (
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="aspect-square"
                onClick={() => setIsBrandGroupModalOpen(true)}
                tooltip="Agregar nuevo grupo de marca"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </FormSelect>
          {!hideModalFields && (
            <>
              <FormField
                control={form.control}
                name="logo"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                          }}
                          className="pl-10"
                          {...field}
                          value={undefined}
                        />
                        <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_min"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Logo Min</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                          }}
                          className="pl-10"
                          {...field}
                          value={undefined}
                        />
                        <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <div className="flex gap-4 w-full justify-end">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          ) : (
            <Link
              to={
                isCommercial === String(CM_COMERCIAL_ID)
                  ? ABSOLUTE_ROUTE!
                  : "/ap/post-venta/gestion-de-almacen/marcas-producto"
              }
            >
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Marca"}
          </Button>
        </div>
      </form>

      <BrandGroupModal
        open={isBrandGroupModalOpen}
        onClose={() => {
          setIsBrandGroupModalOpen(false);
          queryClient.invalidateQueries({ queryKey: [BRAND_GROUP.QUERY_KEY] });
        }}
        title="Agregar Nuevo Grupo de Marca"
        mode="create"
      />
    </Form>
  );
};
