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
import {
  ViewSchema,
  viewSchemaCreate,
  viewSchemaUpdate,
} from "../lib/view.schema";
import { Loader } from "lucide-react";
import { Link } from 'react-router-dom'
import { Switch } from "@/components/ui/switch";
import { FormSelect } from "@/shared/components/FormSelect";
import { ViewResource } from "../lib/view.interface";
import { CompanyResource } from "../../empresa/lib/company.interface";
import RequiredField from "@/shared/components/RequiredField";
import { IconPicker } from "@/components/ui/icon-picker";

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
  views = [],
  companies = [],
}: ViewFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? viewSchemaCreate : viewSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Descripción <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Módulo de Ventas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="route"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ruta</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: configuracion" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ícono <RequiredField />
                </FormLabel>
                <FormControl>
                  <IconPicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="parent_id"
            description="Selecciona el módulo padre si aplica"
            label={() => (
              <FormLabel className="mb-0">
                Modulo Superior <RequiredField />
              </FormLabel>
            )}
            placeholder="Selecciona la vista padre"
            options={views.map((v) => ({
              label: v.descripcion,
              value: String(v.id),
              description: v.parent ?? v.company,
            }))}
            withValue={false}
            strictFilter={true}
          />

          <FormSelect
            control={form.control}
            name="company_id"
            label={() => (
              <FormLabel className="inline-flex">
                Empresa <RequiredField />
              </FormLabel>
            )}
            placeholder="Selecciona la empresa"
            options={companies.map((company) => ({
              label: company.name,
              value: company.id.toString(),
            }))}
          />
          <FormField
            control={form.control}
            name="submodule"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex flex-col gap-1">
                  <div className="h-6 flex items-center">Tiene submódulos</div>
                  <div className="flex flex-row items-center justify-between rounded-md border h-10 px-3 bg-background hover:bg-accent transition-colors hover:cursor-pointer">
                    <p className="text-sm font-medium text-muted-foreground">
                      Marcar si la vista tiene submódulos.
                    </p>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ruta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {/* Cambiar luego de cambiar todo, no es obligatorio|CODE : 500 */}
                  Ruta Milla <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: /ap/configuracion" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícono de Milla</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: fa fas-user" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="idPadre"
            label="Padre"
            placeholder="Seleccionar padre"
            options={views.map((v) => ({
              label: v.descripcion,
              value: String(v.id),
              description: v.parent ?? v.company,
            }))}
          />

          <FormSelect
            control={form.control}
            name="idSubPadre"
            label="Sub Padre"
            placeholder="Seleccionar sub padre"
            options={views.map((v) => ({
              label: v.descripcion,
              value: String(v.id),
              description: v.parent ?? v.company,
            }))}
          />

          <FormSelect
            control={form.control}
            name="idHijo"
            label="Hijo"
            placeholder="Seleccionar hijo"
            options={views.map((v) => ({
              label: v.descripcion,
              value: String(v.id),
              description: v.parent ?? v.company,
            }))}
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
