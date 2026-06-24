"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  PositionSchema,
  positionSchemaCreate,
  positionSchemaUpdate,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.schema.ts";
import {
  CircleDollarSign,
  ClipboardMinus,
  FileStack,
  LassoSelect,
  Loader,
} from "lucide-react";

import { usePositions } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.hook.ts";
import { useEffect, useRef } from "react";
import { POSITION } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant.ts";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync.tsx";
import { FormSwitch } from "@/shared/components/FormSwitch.tsx";
import { FormInput } from "@/shared/components/FormInput.tsx";
import { FormTextArea } from "@/shared/components/FormTextArea.tsx";
import { FileForm } from "@/shared/components/FileForm.tsx";
import { GroupFormSection } from "@/shared/components/GroupFormSection.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { useAllTypeOnboarding } from "@/features/gp/gestionsistema/tipo-onbording/lib/typeOnboarding.hook.ts";
import { useHierarchicalCategorys } from "../../../evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.hook.ts";
import { Link } from "react-router-dom";
import { useAreas } from "../../areas/lib/area.hook.ts";
import { Option } from "@/core/core.interface.ts";

interface PositionFormProps {
  defaultValues?: Partial<PositionSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  defaultOptions?: {
    area?: Option;
    hierarchicalCategory?: Option;
    cargo?: Option;
  };
}

export const PositionForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  defaultOptions,
}: PositionFormProps) => {
  const { MODEL, ABSOLUTE_ROUTE } = POSITION;

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? positionSchemaCreate : positionSchemaUpdate,
    ),
    defaultValues: {
      name: "",
      descripcion: "",
      area_id: "",
      hierarchical_category_id: "",
      tiene_jefatura: false,
      no_attendance_required: false,
      cargo_id: "",
      ntrabajadores: 0,
      banda_salarial_min: 0,
      banda_salarial_media: 0,
      banda_salarial_max: 0,
      tipo_onboarding_id: "",
      plazo_proceso_seleccion: 0,
      presupuesto: 0,
      mof_adjunto: undefined,
      files: undefined,
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: typeOnboarding = [], isLoading: isLoadingTypeOnboarding } =
    useAllTypeOnboarding();

  const tieneJefatura = form.watch("tiene_jefatura");

  const isInitialized = useRef(false);

  useEffect(() => {
    if (mode === "update" && defaultValues) {
      const cargoId = defaultValues.cargo_id;
      if (cargoId && cargoId !== "") {
        form.setValue("tiene_jefatura", true);
        form.setValue("cargo_id", cargoId);
      }
    }
    setTimeout(() => {
      isInitialized.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    if (isInitialized.current && !tieneJefatura) {
      form.setValue("cargo_id", "");
    }
  }, [tieneJefatura, form]);

  if (isLoadingTypeOnboarding) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <GroupFormSection
          title="Información Básica"
          icon={ClipboardMinus}
          color="blue"
          cols={{ sm: 2, md: 3 }}
        >
          <FormInput
            control={form.control}
            name="name"
            label="Nombre"
            required
            placeholder="Nombre de la posición"
          />

          <FormSelectAsync
            control={form.control}
            name="area_id"
            label="Área"
            placeholder="Selecciona un área"
            useQueryHook={useAreas}
            mapOptionFn={(area) => ({
              value: String(area.id),
              label: area.name,
              description: area.sede || "",
            })}
            defaultOption={defaultOptions?.area}
            required
          />

          <FormSelectAsync
            control={form.control}
            name="hierarchical_category_id"
            label="Categoría Jerárquica"
            placeholder="Selecciona una categoría"
            useQueryHook={useHierarchicalCategorys}
            mapOptionFn={(cat) => ({
              value: String(cat.id),
              label: cat.name,
            })}
            defaultOption={defaultOptions?.hierarchicalCategory}
            required
          />

          <FormInput
            control={form.control}
            name="ntrabajadores"
            label="Número de Trabajadores"
            type="number"
            min="0"
            placeholder="0"
          />

          <div className="col-span-full">
            <FormTextArea
              control={form.control}
              name="descripcion"
              label="Descripción"
              placeholder="Descripción de la posición"
            />
          </div>

          <div className="col-span-full">
            <FormSwitch
              control={form.control}
              name="tiene_jefatura"
              text="Este cargo tiene una jefatura"
              textDescription="Indica si este cargo reporta a un cargo superior"
              autoHeight
            />
          </div>

          <div className="col-span-full">
            <FormSwitch
              control={form.control}
              name="no_attendance_required"
              text="No requiere control de asistencia"
              textDescription="Si está activo, no se fiscalizará la asistencia de este cargo"
              autoHeight
            />
          </div>

          {tieneJefatura && (
            <div className="col-span-full">
              <FormSelectAsync
                control={form.control}
                name="cargo_id"
                label="Jefatura del Cargo"
                placeholder="Selecciona una jefatura"
                useQueryHook={usePositions}
                mapOptionFn={(pos) => ({
                  value: String(pos.id),
                  label: pos.name,
                })}
                defaultOption={defaultOptions?.cargo}
              />
            </div>
          )}
        </GroupFormSection>

        <GroupFormSection
          title="Banda Salarial"
          icon={CircleDollarSign}
          color="red"
          cols={{ sm: 2, md: 3 }}
        >
          <FormInput
            control={form.control}
            name="banda_salarial_min"
            label="Banda Salarial Mínima"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />

          <FormInput
            control={form.control}
            name="banda_salarial_media"
            label="Banda Salarial Media"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />

          <FormInput
            control={form.control}
            name="banda_salarial_max"
            label="Banda Salarial Máxima"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </GroupFormSection>

        <GroupFormSection
          title="Proceso de Selección y Presupuesto"
          icon={LassoSelect}
          color="blue"
          cols={{ sm: 2, md: 3 }}
        >
          <FormSelect
            control={form.control}
            name="tipo_onboarding_id"
            label="Tipo de Onboarding"
            placeholder="Selecciona un tipo"
            options={typeOnboarding.map((type) => ({
              value: type.id.toString(),
              label: type.name,
            }))}
            isLoadingOptions={isLoadingTypeOnboarding}
            strictFilter={true}
          />

          <FormInput
            control={form.control}
            name="plazo_proceso_seleccion"
            label="Plazo Proceso Selección (días)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />

          <FormInput
            control={form.control}
            name="presupuesto"
            label="Presupuesto"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </GroupFormSection>

        <GroupFormSection
          title="Archivos"
          icon={FileStack}
          color="red"
          cols={{ sm: 2, md: 3 }}
        >
          <FormField
            control={form.control}
            name="mof_adjunto"
            render={({ field }) => (
              <FileForm
                label={`MOF Adjunto ${mode === "create" ? "*" : ""}`}
                accept=".pdf,.doc,.docx"
                multiple={false}
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />

          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FileForm
                label="Archivos Adicionales (máximo 6)"
                accept=".pdf,.doc,.docx"
                multiple={true}
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end pt-4">
          <Link to={ABSOLUTE_ROUTE!}>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${
                !isSubmitting ? "hidden" : "animate-spin"
              }`}
            />
            {isSubmitting ? "Guardando..." : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
