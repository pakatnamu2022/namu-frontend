"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
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

import { useAllAreas } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.hook.ts";
import { useAllPositions } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.hook.ts";
import { useEffect, useRef } from "react";
import { POSITION } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant.ts";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { FileForm } from "@/shared/components/FileForm.tsx";
import { GroupFormSection } from "@/shared/components/GroupFormSection.tsx";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { useAllTypeOnboarding } from "@/features/gp/gestionsistema/tipo-onbording/lib/typeOnboarding.hook.ts";
import { useAllHierarchicalCategories } from "../../../evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.hook.ts";
import { Link } from "react-router-dom";

interface PositionFormProps {
  defaultValues?: Partial<PositionSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const PositionForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: PositionFormProps) => {
  const { MODEL, ABSOLUTE_ROUTE } = POSITION;

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? positionSchemaCreate : positionSchemaUpdate
    ),
    defaultValues: {
      name: "",
      descripcion: "",
      area_id: "",
      hierarchical_category_id: "",
      tiene_jefatura: false,
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

  // Hooks para obtener datos
  const { data: areas = [], isLoading: isLoadingAreas } = useAllAreas();
  const { data: typeOnboarding = [], isLoading: isLoadingTypeOnboarding } =
    useAllTypeOnboarding();
  const { data: positions = [], isLoading: isLoadingPositions } =
    useAllPositions();
  const { data: hierarchicalCategories = [], isLoading: isLoadingCategories } =
    useAllHierarchicalCategories();

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

  const areaOptions =
    areas?.map((area) => ({
      value: area.id.toString() || "0",
      label: area.name,
      description: area.sede || "",
    })) || [];

  const cargoOptions =
    positions?.map((position) => ({
      value: position.id.toString(),
      label: position.name,
    })) || [];

  const categoryOptions =
    hierarchicalCategories.map((category) => ({
      value: category.id.toString(),
      label: category.name,
    })) || [];

  if (
    isLoadingAreas ||
    isLoadingPositions ||
    isLoadingCategories ||
    isLoadingTypeOnboarding
  )
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <TitleFormComponent
          title={
            mode === "create" ? `Agregar ${MODEL.name}` : `Editar ${MODEL.name}`
          }
        />

        <GroupFormSection
          title="Información Básica"
          icon={ClipboardMinus}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la posición" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="area_id"
            label="Área"
            placeholder="Selecciona un área"
            options={areaOptions}
            isLoadingOptions={isLoadingAreas}
          />

          <FormSelect
            control={form.control}
            name="hierarchical_category_id"
            label="Categoría Jerárquica"
            placeholder="Selecciona una categoría"
            options={categoryOptions}
            isLoadingOptions={isLoadingCategories}
          />

          <FormField
            control={form.control}
            name="ntrabajadores"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Trabajadores</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value) || ""
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descripción ocupa las 3 columnas y se posiciona al final */}
          <div className="col-span-full">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la posición"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Checkbox para indicar si tiene jefatura */}
          <div className="col-span-full">
            <FormField
              control={form.control}
              name="tiene_jefatura"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Este cargo tiene una jefatura
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Indica si este cargo reporta a un cargo superior
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Select de Jefatura - Solo si está marcado el checkbox */}
          {tieneJefatura && (
            <div className="col-span-full">
              <FormSelect
                control={form.control}
                name="cargo_id"
                label="Jefatura del Cargo"
                placeholder="Selecciona una jefatura"
                options={cargoOptions}
                isLoadingOptions={isLoadingPositions}
                strictFilter={true}
              />
            </div>
          )}
        </GroupFormSection>

        {/* Banda Salarial */}
        <GroupFormSection
          title="Banda Salarial"
          icon={CircleDollarSign}
          iconColor="text-secondary"
          bgColor="bg-red-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormField
            control={form.control}
            name="banda_salarial_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banda Salarial Mínima</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? ""
                          : parseFloat(e.target.value) || ""
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="banda_salarial_media"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banda Salarial Media</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? ""
                          : parseFloat(e.target.value) || ""
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="banda_salarial_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banda Salarial Máxima</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        field.onChange("");
                      } else {
                        const num = parseFloat(e.target.value);
                        field.onChange(isNaN(num) ? "" : num);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Proceso de Selección */}
        <GroupFormSection
          title="Proceso de Selección y Presupuesto"
          icon={LassoSelect}
          iconColor="text-primary"
          bgColor="bg-blue-50"
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

          <FormField
            control={form.control}
            name="plazo_proceso_seleccion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plazo Proceso Selección (días)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        field.onChange("");
                      } else {
                        const num = parseFloat(e.target.value);
                        field.onChange(isNaN(num) ? "" : num);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="presupuesto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Presupuesto</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        field.onChange("");
                      } else {
                        const num = parseFloat(e.target.value);
                        field.onChange(isNaN(num) ? "" : num);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Archivos */}
        <GroupFormSection
          title="Archivos"
          icon={FileStack}
          iconColor="text-secondary"
          bgColor="bg-red-50"
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
