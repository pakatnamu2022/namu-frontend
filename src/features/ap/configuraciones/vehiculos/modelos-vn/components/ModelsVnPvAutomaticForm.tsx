"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Loader, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClipboardMinus } from "lucide-react";
import { useAllBrands } from "../../marcas/lib/brands.hook";
import { FormSelect } from "@/shared/components/FormSelect";
import { useState } from "react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import {
  ModelsVnPvAutomaticSchema,
  modelsVnPvAutomaticSchema,
} from "../lib/modelsVnPv.schema";
import { FormInput } from "@/shared/components/FormInput";
import { CLASS_ARTICLE_ID } from "../../../maestros-general/clase-articulo/lib/classArticle.constants";
import BrandsModal from "../../marcas/components/BrandsModal";
import { BrandsResource } from "../../marcas/lib/brands.interface";

interface ModelsVnPvAutomaticFormProps {
  defaultValues: Partial<ModelsVnPvAutomaticSchema>;
  onSubmit: (data: ModelsVnPvAutomaticSchema) => void;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export const ModelsVnPvAutomaticForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: ModelsVnPvAutomaticFormProps) => {
  const form = useForm({
    resolver: zodResolver(modelsVnPvAutomaticSchema),
    defaultValues: {
      ...defaultValues,
      type_operation_id:
        defaultValues.type_operation_id ?? String(CM_POSTVENTA_ID),
      class_id: String(CLASS_ARTICLE_ID.M_VEH_USA),
    },
    mode: "onChange",
  });
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const { data: brands = [], isLoading: isLoadingbrands } = useAllBrands();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="space-y-8">
          {/* Sección: Datos Generales */}
          <GroupFormSection
            title="Datos Generales"
            icon={ClipboardMinus}
            color="primary"
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
            >
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="aspect-square"
                onClick={() => setIsBrandModalOpen(true)}
                tooltip="Agregar nueva marca"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </FormSelect>
            <FormInput
              name="version"
              label="Modelo VN"
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

      <BrandsModal
        open={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSuccess={(newBrand: BrandsResource) => {
          form.setValue("brand_id", newBrand.id.toString(), {
            shouldValidate: true,
          });
        }}
        title="Agregar Nueva Marca"
      />
    </Form>
  );
};
