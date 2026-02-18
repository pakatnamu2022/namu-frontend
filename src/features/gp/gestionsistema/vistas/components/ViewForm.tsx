"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  ViewSchema,
  viewSchemaCreate,
  viewSchemaUpdate,
} from "../lib/view.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { ViewResource } from "../lib/view.interface";
import { CompanyResource } from "../../empresa/lib/company.interface";
import RequiredField from "@/shared/components/RequiredField";
import { IconPicker } from "@/components/ui/icon-picker";
import { VIEW } from "../lib/view.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useViews } from "../lib/view.hook";

interface ViewFormProps {
  defaultValues: Partial<ViewSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  views: ViewResource[];
  companies: CompanyResource[];
}

export const ViewForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  companies = [],
}: ViewFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? viewSchemaCreate : viewSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = VIEW;

  // Función para generar slug desde texto
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, "") // Eliminar caracteres especiales
      .trim()
      .replace(/\s+/g, "-") // Reemplazar espacios con guiones
      .replace(/-+/g, "-"); // Reemplazar múltiples guiones con uno solo
  };

  // Observar cambios en el campo descripcion
  const descripcion = form.watch("descripcion");

  // Auto-generar slug para el campo route cuando cambia descripcion
  useEffect(() => {
    if (descripcion && mode === "create") {
      const slug = generateSlug(descripcion);
      form.setValue("route", slug, { shouldValidate: true });
    }
  }, [descripcion, mode, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="descripcion"
            label="Descripción"
            placeholder="Ej: Módulo de Ventas"
            description="Nombre descriptivo de la vista o módulo"
            required
          />

          <FormInput
            control={form.control}
            name="route"
            label="Ruta"
            placeholder="Ej: configuracion"
            description="Ruta de navegación del módulo"
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs md:text-sm">
                  Ícono <RequiredField />
                </FormLabel>
                <FormControl>
                  <IconPicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Selecciona un ícono representativo para la vista en el sistema
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelectAsync
            control={form.control}
            name="parent_id"
            description="Selecciona el módulo padre al que pertenece esta vista"
            label="Módulo Superior"
            required={true}
            placeholder="Selecciona la vista padre"
            useQueryHook={useViews}
            mapOptionFn={(v) => ({
              label: v.descripcion,
              value: String(v.id),
              description: `${v.parent ? v.parent + " | " : ""} ${v.company}`,
            })}
          />

          <FormSelect
            control={form.control}
            name="company_id"
            label={() => (
              <FormLabel className="inline-flex">
                Empresa <RequiredField />
              </FormLabel>
            )}
            description="Empresa a la que pertenece este módulo"
            placeholder="Selecciona la empresa"
            options={companies.map((company) => ({
              label: company.name,
              value: company.id.toString(),
            }))}
          />

          <FormSwitch
            control={form.control}
            name="submodule"
            label="Tiene submódulos"
            text="Marcar si la vista tiene submódulos"
            description="Indica si este módulo contiene submódulos en su estructura"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="ruta"
            label="Ruta Milla"
            placeholder="Ej: /ap/configuracion"
            description="Ruta completa del módulo en el sistema Milla"
            required
          />

          <FormInput
            control={form.control}
            name="icono"
            label="Ícono de Milla"
            placeholder="Ej: fa fas-user"
            description="Clase del ícono FontAwesome para Milla"
          />

          <FormSelectAsync
            control={form.control}
            name="idPadre"
            label="Padre"
            description="Módulo padre en la jerarquía de Milla"
            placeholder="Seleccionar padre"
            useQueryHook={useViews}
            mapOptionFn={(v) => ({
              label: v.descripcion,
              value: String(v.id),
              description: `${v.parent ? v.parent + " | " : ""} ${v.company}`,
            })}
          />

          <FormSelectAsync
            control={form.control}
            name="idSubPadre"
            label="Sub Padre"
            description="Módulo sub-padre en la jerarquía de Milla"
            placeholder="Seleccionar sub padre"
            useQueryHook={useViews}
            mapOptionFn={(v) => ({
              label: v.descripcion,
              value: String(v.id),
              description: `${v.parent ? v.parent + " | " : ""} ${v.company}`,
            })}
          />

          <FormSelectAsync
            control={form.control}
            name="idHijo"
            label="Hijo"
            description="Módulo hijo en la jerarquía de Milla"
            placeholder="Seleccionar hijo"
            useQueryHook={useViews}
            mapOptionFn={(v) => ({
              label: v.descripcion,
              value: String(v.id),
              description: `${v.parent ? v.parent + " | " : ""} ${v.company}`,
            })}
          />
        </div>

        {/* <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
          </code>
        </pre> */}

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
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
            {isSubmitting ? "Guardando" : "Guardar Vista"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
