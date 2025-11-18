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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  HierarchicalCategorySchema,
  hierarchicalCategorySchemaCreate,
  hierarchicalCategorySchemaUpdate,
} from "../lib/hierarchicalCategory.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { HIERARCHICAL_CATEGORY } from "../lib/hierarchicalCategory.constants";

interface HierarchicalCategoryFormProps {
  defaultValues: Partial<HierarchicalCategorySchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const HierarchicalCategoryForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: HierarchicalCategoryFormProps) => {
  const { ABSOLUTE_ROUTE } = HIERARCHICAL_CATEGORY;

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? hierarchicalCategorySchemaCreate
        : hierarchicalCategorySchemaUpdate
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
        className="space-y-4 w-full bg-background p-4 rounded-lg shadow"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Categoría</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Productividad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Se encarga ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excluded_from_evaluation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs bg-background hover:bg-muted hover:cursor-pointer">
                <div>
                  <FormLabel> Excluida de Evaluación</FormLabel>
                  <FormDescription className="font-normal">
                    Marcar si la categoría jerárquica está excluida de la
                    evaluación.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasObjectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs bg-background hover:bg-muted hover:cursor-pointer">
                <div>
                  <FormLabel> Categoría con Objetivos</FormLabel>
                  <FormDescription className="font-normal">
                    Marcar solo si la categoría jerárquica si tiene objetivos.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormLabel>
            </FormItem>
          )}
        />

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
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Categoría Jerárquica"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
