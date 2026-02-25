"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClipboardMinus } from "lucide-react";
import { useAllBrands } from "../../marcas/lib/brands.hook";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllFamilies } from "../../familias/lib/families.hook";
import { useEffect } from "react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import {
  ModelsVnPvSchema,
  modelsVnPvSchemaCreate,
  modelsVnPvSchemaUpdate,
} from "../lib/modelsVnPv.schema";
import { FormInput } from "@/shared/components/FormInput";

interface ModelsVnFormProps {
  defaultValues: Partial<ModelsVnPvSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel: () => void;
}

export const ModelsVnPvForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: ModelsVnFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? modelsVnPvSchemaCreate
        : (modelsVnPvSchemaUpdate as any),
    ),
    defaultValues: {
      ...defaultValues,
      type_operation_id:
        defaultValues.type_operation_id ?? String(CM_POSTVENTA_ID),
    },
    mode: "onChange",
  });
  const marcaSeleccionada = form.watch("brand_id");
  const { data: brands = [], isLoading: isLoadingbrands } = useAllBrands();
  const { data: families = [], isLoading: isLoadingFamilies } = useAllFamilies({
    brand_id: marcaSeleccionada,
  });

  useEffect(() => {
    if (mode === "create") {
      if (marcaSeleccionada) {
        const familiaActual = form.getValues("family_id");
        if (familiaActual) {
          form.setValue("family_id", "", {
            shouldValidate: false,
            shouldDirty: true,
          });
        }
      } else {
        form.setValue("family_id", "", {
          shouldValidate: false,
          shouldDirty: true,
        });
      }
    }
  }, [marcaSeleccionada, form, mode]);

  const getFamilyOptions = () => {
    if (!marcaSeleccionada) {
      return [
        {
          label: "Primero seleccione una marca",
          value: "",
          disabled: true,
        },
      ];
    }

    if (isLoadingFamilies) {
      return [
        {
          label: "Cargando familias...",
          value: "",
          disabled: true,
        },
      ];
    }

    if (families.length === 0) {
      return [
        {
          label: "No hay familias disponibles",
          value: "",
          disabled: true,
        },
      ];
    }

    return families.map((family) => ({
      label: family.description,
      value: family.id.toString(),
    }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="space-y-8">
          {/* Sección: Datos Generales */}
          <GroupFormSection
            title="Datos Generales"
            icon={ClipboardMinus}
            iconColor="text-primary"
            bgColor="bg-blue-50"
            cols={{
              sm: 1,
            }}
            gap="gap-3"
          >
            <FormSelect
              name="brand_id"
              label="Marca"
              placeholder="Selecciona una Marca"
              options={brands.map((brand) => ({
                label: brand.description,
                value: brand.id.toString(),
              }))}
              control={form.control}
            />
            <FormSelect
              name="family_id"
              label="Familia"
              placeholder={
                !marcaSeleccionada
                  ? "Primero seleccione una marca"
                  : "Selecciona una Familia"
              }
              options={getFamilyOptions()}
              control={form.control}
              disabled={!marcaSeleccionada || isLoadingFamilies}
            />
            <FormInput
              name="version"
              label="Versión"
              placeholder="Ej: X7 PLUS LIMITED 1.5 MT 4X2"
              control={form.control}
              disabled={isLoadingbrands}
            />
          </GroupFormSection>
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Modelo VN"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
