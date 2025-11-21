"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAllHierarchicalCategories } from "../../categorias-jerarquicas/lib/hierarchicalCategory.hook";
import { MultiSelectTags } from "@/shared/components/MultiSelectTags";
import {
  evaluationModelSchemaCreate,
  type EvaluationModelSchema,
} from "../lib/evaluationModel.schema";
import type { EvaluationModelResource } from "../lib/evaluationModel.interface";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface EvaluationModelFormProps {
  defaultValues?: EvaluationModelResource;
  onSubmit: (values: EvaluationModelSchema) => void;
  isPending?: boolean;
}

export function EvaluationModelForm({
  defaultValues,
  onSubmit,
  isPending = false,
}: EvaluationModelFormProps) {
  const { data: hierarchicalCategories = [], isLoading } =
    useAllHierarchicalCategories();

  const form = useForm<EvaluationModelSchema>({
    resolver: zodResolver(evaluationModelSchemaCreate) as any,
    defaultValues: {
      leadership_weight: 0,
      self_weight: 0,
      par_weight: 0,
      report_weight: 0,
      categories: [],
    },
  });

  useEffect(() => {
    if (defaultValues) {
      const categoryIds =
        defaultValues.category_details?.map((cat) => cat.id) || [];

      form.reset({
        leadership_weight: parseFloat(defaultValues.leadership_weight),
        self_weight: parseFloat(defaultValues.self_weight),
        par_weight: parseFloat(defaultValues.par_weight),
        report_weight: parseFloat(defaultValues.report_weight),
        categories: categoryIds,
      });
    }
  }, [defaultValues, form]);

  // Calcular el total de pesos
  const weights = form.watch([
    "leadership_weight",
    "self_weight",
    "par_weight",
    "report_weight",
  ]);
  const totalWeight = weights.reduce((sum, weight) => sum + (weight || 0), 0);
  const isValidWeight = totalWeight === 100;

  const handleSubmit = (values: EvaluationModelSchema) => {
    // Las categorías ya vienen como array de IDs desde el MultiSelectTags
    onSubmit(values as any);
  };

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pesos de Evaluación</CardTitle>
            <FormDescription>
              La suma de todos los pesos debe ser igual a 100%
            </FormDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="leadership_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Liderazgo (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="self_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Autoevaluación (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="par_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Evaluación de Pares (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="report_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Evaluación de Reportes (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div
              className={`text-sm font-medium ${
                isValidWeight
                  ? "text-green-600"
                  : totalWeight > 100
                  ? "text-red-600"
                  : "text-orange-600"
              }`}
            >
              Total: {totalWeight.toFixed(2)}%
              {!isValidWeight && (
                <span className="ml-2">
                  {totalWeight > 100
                    ? `(Excede por ${(totalWeight - 100).toFixed(2)}%)`
                    : `(Faltan ${(100 - totalWeight).toFixed(2)}%)`}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías Jerárquicas</CardTitle>
            <FormDescription>
              Selecciona las categorías que aplicarán a este modelo de
              evaluación
            </FormDescription>
          </CardHeader>
          <CardContent>
            <MultiSelectTags
              control={form.control}
              name="categories"
              label="Categorías"
              placeholder="Selecciona las categorías"
              searchPlaceholder="Buscar categoría..."
              emptyMessage="No se encontró categoría."
              options={hierarchicalCategories
                .filter((cat) => cat && cat.id != null)
                .map((cat) => ({
                  id: cat.id,
                  name: cat.name,
                  description: cat.description,
                  excluded_from_evaluation: cat.excluded_from_evaluation,
                  hasObjectives: cat.hasObjectives,
                }))}
              getDisplayValue={(item) => item.name}
              getSecondaryText={(item) => item.description}
              className="max-w-full"
              required
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending || !isValidWeight}>
            {isPending
              ? "Guardando..."
              : defaultValues
              ? "Actualizar"
              : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
