import {
  ProductSchema,
  productSchemaCreate,
  productSchemaUpdate,
} from "../lib/product.schema";
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
  CircleDollarSign,
  Layers,
  LibraryBig,
  Loader,
  Shapes,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook";
import { useAllProductCategory } from "../../categorias-producto/lib/productCategory.hook";
import { useAllUnitMeasurement } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.hook";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import { Textarea } from "@/components/ui/textarea";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { STATUS_ACTIVE } from "@/core/core.constants";

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
    },
    mode: "onChange",
  });

  const { data: brands = [], isLoading: isLoadingBrands } = useAllBrands({
    is_commercial: STATUS_ACTIVE,
  });
  const { data: categories = [], isLoading: isLoadingCategories } =
    useAllProductCategory();
  const { data: unitMeasurements = [], isLoading: isLoadingUnitMeasurements } =
    useAllUnitMeasurement();
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse();
  const { data: classArticles = [], isLoading: isLoadingClassArticles } =
    useAllClassArticle();

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
                  <Input placeholder="Ej: PROD001" {...field} />
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
                <FormLabel>Código Dynamic</FormLabel>
                <FormControl>
                  <Input placeholder="Código dynamic" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nubefac_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Nubefact</FormLabel>
                <FormControl>
                  <Input placeholder="Código Nubefact" {...field} />
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
          <FormField
            control={form.control}
            name="sunat_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código SUNAT</FormLabel>
                <FormControl>
                  <Input placeholder="Código SUNAT" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        <GroupFormSection
          title="Clasificación"
          icon={Shapes}
          iconColor="text-secondary"
          bgColor="bg-red-50"
          cols={{ sm: 2, md: 3 }}
        >
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
              label: classArticle.description,
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
          <FormSelect
            name="warehouse_id"
            label="Almacén"
            placeholder="Selecciona un almacén"
            options={warehouses.map((warehouse) => ({
              label: warehouse.description,
              value: warehouse.id.toString(),
            }))}
            control={form.control}
          />
        </GroupFormSection>

        {/* Inventario */}

        <GroupFormSection
          title="Inventario"
          icon={Layers}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormField
            control={form.control}
            name="current_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Actual</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
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
            name="minimum_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Mínimo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
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
            name="maximum_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Máximo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
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
            name="warranty_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Garantía (Meses)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
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

        {/* Precios e Impuestos */}
        <GroupFormSection
          title="Precios e Impuestos"
          icon={CircleDollarSign}
          iconColor="text-secondary"
          bgColor="bg-red-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormField
            control={form.control}
            name="cost_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Costo</FormLabel>
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
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Venta</FormLabel>
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
            name="tax_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tasa de Impuesto (%)</FormLabel>
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
          <FormSwitch
            name="is_taxable"
            label="¿Aplicar Impuesto?"
            text={form.watch("is_taxable") ? "Sí" : "No"}
            control={form.control}
          />
        </GroupFormSection>

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
