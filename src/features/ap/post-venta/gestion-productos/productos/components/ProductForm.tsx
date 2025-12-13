import {
  ProductSchema,
  productSchemaCreate,
  productSchemaUpdate,
} from "../lib/product.schema";
import { useForm, useFieldArray } from "react-hook-form";
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
import { LibraryBig, Loader, Plus, Trash2, Warehouse } from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook";
import { useAllProductCategory } from "../../categorias-producto/lib/productCategory.hook";
import { useAllUnitMeasurement } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import { Textarea } from "@/components/ui/textarea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { CM_COMERCIAL_ID, CM_POSTVENTA_ID } from "@/core/core.constants";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useEffect } from "react";

interface ProductFormProps {
  defaultValues: Partial<ProductSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const ProductForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: ProductFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? productSchemaCreate : productSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      warehouses: defaultValues.warehouses || [],
      cost_price: 0,
      sale_price: 0,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "warehouses",
  });

  const { data: brands = [], isLoading: isLoadingBrands } = useAllBrands({
    type_operation_id: CM_COMERCIAL_ID,
  });
  const { data: categories = [], isLoading: isLoadingCategories } =
    useAllProductCategory();
  const { data: unitMeasurements = [], isLoading: isLoadingUnitMeasurements } =
    useAllUnitMeasurement();
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({
      type_operation_id: CM_POSTVENTA_ID,
      is_physical_warehouse: 1,
    });
  const { data: classArticles = [], isLoading: isLoadingClassArticles } =
    useAllClassArticle();

  // Watch para generar código automáticamente
  const watchedCategoryId = form.watch("product_category_id");
  const watchedBrandId = form.watch("brand_id");
  const watchedClassId = form.watch("ap_class_article_id");

  // Generar código automáticamente
  useEffect(() => {
    if (watchedCategoryId && watchedBrandId && watchedClassId) {
      const category = categories.find(
        (c) => c.id.toString() === watchedCategoryId
      );
      const brand = brands.find((b) => b.id.toString() === watchedBrandId);
      const classArticle = classArticles.find(
        (ca) => ca.id.toString() === watchedClassId
      );

      if (category && brand && classArticle) {
        const generatedCode = `${category.code || ""}${brand.dyn_code || ""}${
          classArticle.id || ""
        }X`;
        form.setValue("dyn_code", generatedCode, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [
    watchedCategoryId,
    watchedBrandId,
    watchedClassId,
    categories,
    brands,
    classArticles,
    form,
  ]);

  if (
    isLoadingBrands ||
    isLoadingCategories ||
    isLoadingUnitMeasurements ||
    isLoadingWarehouses ||
    isLoadingClassArticles
  ) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información Básica */}
        <GroupFormSection
          title="Información Básica"
          icon={LibraryBig}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Código producto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dyn_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Dynamic (Generado)</FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    placeholder="Generado automáticamente"
                    {...field}
                    className="bg-slate-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Filtro de aceite" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="product_category_id"
            label="Categoría"
            placeholder="Selecciona una categoría"
            options={categories.map((category) => ({
              label: category.description,
              value: category.id.toString(),
            }))}
            control={form.control}
          />
          <FormSelect
            name="brand_id"
            label="Marca"
            placeholder="Selecciona una marca"
            options={brands.map((brand) => ({
              label: brand.name,
              value: brand.id.toString(),
            }))}
            control={form.control}
          />
          <FormSelect
            name="ap_class_article_id"
            label="Clase de Artículo"
            placeholder="Selecciona una clase"
            options={classArticles.map((classArticle) => ({
              label: classArticle.description + ` (${classArticle.id})`,
              value: classArticle.id.toString(),
            }))}
            control={form.control}
          />
          <FormSelect
            name="unit_measurement_id"
            label="Unidad de Medida"
            placeholder="Selecciona una unidad"
            options={unitMeasurements.map((unit) => ({
              label: unit.description,
              value: unit.id.toString(),
            }))}
            control={form.control}
          />
          <FormField
            control={form.control}
            name="warranty_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Garantía (Meses)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        field.onChange("");
                      } else {
                        const num = parseInt(e.target.value);
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

        {/* Configuración de Almacenes - Solo en modo crear */}
        {mode === "create" && (
          <GroupFormSection
            title="Configuración de Almacenes"
            icon={Warehouse}
            iconColor="text-primary"
            bgColor="bg-blue-50"
          >
            <div className="col-span-full space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200 hover:border-slate-300 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-primary" />
                      Almacén #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Almacén Select */}
                  <div className="mb-3">
                    <FormSelect
                      name={`warehouses.${index}.warehouse_id`}
                      label="Almacén"
                      placeholder="Selecciona un almacén"
                      options={warehouses.map((warehouse) => ({
                        label: warehouse.dyn_code,
                        description:
                          warehouse.sede + " - " + warehouse.type_operation,
                        value: warehouse.id.toString(),
                      }))}
                      control={form.control}
                      withValue={false}
                    />
                  </div>

                  {/* Cantidades en Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`warehouses.${index}.minimum_stock`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Stock Mín.</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-9"
                              value={
                                typeof field.value === "number"
                                  ? field.value
                                  : ""
                              }
                              onChange={(e) => {
                                if (e.target.value === "") {
                                  field.onChange(undefined);
                                } else {
                                  const num = parseFloat(e.target.value);
                                  field.onChange(isNaN(num) ? undefined : num);
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
                      name={`warehouses.${index}.maximum_stock`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Stock Máx.</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-9"
                              value={
                                typeof field.value === "number"
                                  ? field.value
                                  : ""
                              }
                              onChange={(e) => {
                                if (e.target.value === "") {
                                  field.onChange(undefined);
                                } else {
                                  const num = parseFloat(e.target.value);
                                  field.onChange(isNaN(num) ? undefined : num);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    warehouse_id: "",
                    minimum_stock: undefined,
                    maximum_stock: undefined,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Almacén
              </Button>
            </div>
          </GroupFormSection>
        )}

        {/* Notas */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción / Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción o notas del producto"
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isSubmitting ? "Guardando" : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
