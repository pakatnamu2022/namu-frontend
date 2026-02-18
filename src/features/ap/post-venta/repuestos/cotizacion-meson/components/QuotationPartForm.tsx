import {
  ProductSchema,
  productSchemaCreate,
} from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, Warehouse } from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook";
import { useAllProductCategory } from "@/features/ap/post-venta/gestion-almacen/categorias-producto/lib/productCategory.hook";
import { useAllUnitMeasurement } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import { useMyPhysicalWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useEffect } from "react";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";
import {
  CM_COMERCIAL_ID,
  CM_POSTVENTA_ID,
} from "@/features/ap/ap-master/lib/apMaster.constants";

interface QuotationPartFormProps {
  defaultValues?: Partial<ProductSchema>;
  onSubmit: (data: ProductSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const QuotationPartForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: QuotationPartFormProps) => {
  const form = useForm({
    resolver: zodResolver(productSchemaCreate),
    defaultValues: {
      ...defaultValues,
      warehouses: [],
      cost_price: 0,
      sale_price: 0,
    },
    mode: "onChange",
  });

  const { data: brands = [], isLoading: isLoadingBrands } = useAllBrands({
    type_operation_id: CM_COMERCIAL_ID,
  });
  const { data: categories = [], isLoading: isLoadingCategories } =
    useAllProductCategory();
  const { data: unitMeasurements = [], isLoading: isLoadingUnitMeasurements } =
    useAllUnitMeasurement();
  const { data: classArticles = [], isLoading: isLoadingClassArticles } =
    useAllClassArticle({
      type_operation_id: CM_POSTVENTA_ID,
    });
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useMyPhysicalWarehouse();

  // Watch para generar código automáticamente
  const watchedCategoryId = form.watch("product_category_id");
  const watchedBrandId = form.watch("brand_id");
  const watchedClassId = form.watch("ap_class_article_id");

  // Asignar el primer almacén por defecto cuando carguen los datos
  useEffect(() => {
    if (warehouses.length > 0) {
      const currentWarehouses = form.getValues("warehouses");
      if (!currentWarehouses || currentWarehouses.length === 0) {
        form.setValue("warehouses", [
          {
            warehouse_id: warehouses[0].id.toString(),
            minimum_stock: undefined,
            maximum_stock: undefined,
          },
        ]);
      }
    }
  }, [warehouses, form]);

  // Generar código automáticamente
  useEffect(() => {
    if (watchedCategoryId && watchedBrandId && watchedClassId) {
      const category = categories.find(
        (c) => c.id.toString() === watchedCategoryId,
      );
      const brand = brands.find((b) => b.id.toString() === watchedBrandId);
      const classArticle = classArticles.find(
        (ca) => ca.id.toString() === watchedClassId,
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
    isLoadingClassArticles ||
    isLoadingWarehouses
  ) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Selector o indicador de almacén */}
        {warehouses.length > 0 && (
          <div className="space-y-2">
            {warehouses.length === 1 ? (
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Warehouse className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  Almacén asignado:{" "}
                  <span className="font-medium text-slate-800">
                    {warehouses[0].dyn_code} - {warehouses[0].sede}
                  </span>
                </span>
              </div>
            ) : (
              <FormSelect
                name="warehouses.0.warehouse_id"
                label="Almacén"
                placeholder="Selecciona un almacén"
                options={warehouses.map((warehouse) => ({
                  label: `${warehouse.dyn_code} - ${warehouse.sede}`,
                  value: warehouse.id.toString(),
                }))}
                control={form.control}
                required
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="dyn_code"
            label="Código Dyn (Generado)"
            placeholder="Generado automáticamente"
            readOnly
            className="bg-slate-100"
            control={form.control}
          />

          <FormInput
            name="code"
            label="Código"
            placeholder="Código producto"
            control={form.control}
          />

          <FormInput
            name="name"
            label="Nombre"
            placeholder="Ej: Filtro de aceite"
            control={form.control}
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
        </div>

        <FormInputText
          name="description"
          label="Descripción / Notas"
          placeholder="Descripción o notas del producto"
          control={form.control}
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
            {isSubmitting ? "Guardando" : "Guardar Repuesto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
