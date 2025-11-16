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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  PositionSchema,
  positionSchemaCreate,
  positionSchemaUpdate,
} from "../lib/position.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { POSITION } from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { FormSelect } from "@/shared/components/FormSelect";
import { FileForm } from "@/shared/components/FileForm";
import { useAllAreas, useAllPositions } from "../lib/position.hook";
import { useAllHierarchicalCategories } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.hook";
import TitleFormComponent from "@/shared/components/TitleFormComponent";

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
  const { MODEL } = POSITION;

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? positionSchemaCreate : positionSchemaUpdate
    ),
    defaultValues: {
      name: defaultValues?.name || "",
      descripcion: defaultValues?.descripcion || "",
      area_id: defaultValues?.area_id || undefined,
      hierarchical_category_id: defaultValues?.hierarchical_category_id || undefined,
      cargo_id: defaultValues?.cargo_id || undefined,
      ntrabajadores: defaultValues?.ntrabajadores || undefined,
      banda_salarial_min: defaultValues?.banda_salarial_min || undefined,
      banda_salarial_media: defaultValues?.banda_salarial_media || undefined,
      banda_salarial_max: defaultValues?.banda_salarial_max || undefined,
      tipo_onboarding_id: defaultValues?.tipo_onboarding_id || undefined,
      plazo_proceso_seleccion: defaultValues?.plazo_proceso_seleccion || undefined,
      presupuesto: defaultValues?.presupuesto || undefined,
      mof_adjunto: defaultValues?.mof_adjunto || undefined,
      files: defaultValues?.files || undefined,
    },
    mode: "onChange",
  });

  // Hooks para obtener datos
  const { data: areas = [], isLoading: isLoadingAreas } = useAllAreas();
  const { data: positions = [], isLoading: isLoadingPositions } =
    useAllPositions();
  const { data: hierarchicalCategories = [], isLoading: isLoadingCategories } =
    useAllHierarchicalCategories();

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <TitleFormComponent
          title={
            mode === "create" ? `Agregar ${MODEL.name}` : `Editar ${MODEL.name}`
          }
        />

        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Información Básica</h3>

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
                    value={field.value?.toString() ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="cargo_id"
              label="Jefatura del Cargo"
              placeholder="Selecciona una jefatura"
              options={cargoOptions}
              isLoadingOptions={isLoadingPositions}
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
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Banda Salarial */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Banda Salarial</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="banda_salarial_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banda Salarial Mínima</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
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
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
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
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Proceso de Selección */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Proceso de Selección y Presupuesto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="tipo_onboarding_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Onboarding</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="ID del tipo"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
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
              name="plazo_proceso_seleccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plazo Proceso Selección (días)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
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
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Archivos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Archivos</h3>

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
        </div>

        <div className="flex gap-4 w-full justify-end pt-4">
          <Link to={mode === "create" ? "./" : "../"}>
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
