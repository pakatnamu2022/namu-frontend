"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PurchaseRequestSchema,
  purchaseRequestSchemaCreate,
  purchaseRequestSchemaUpdate,
  PurchaseRequestDetailSchema,
} from "../lib/purchaseRequest.schema";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useInventory } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.hook";
import { InventoryResource } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.interface";
import { getAllOrderQuotations } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import { QuotationSelectionModal } from "../../cotizacion/components/QuotationSelectionModal";
import { errorToast } from "@/core/core.function";
import { FormInputText } from "@/shared/components/FormInputText";

interface PurchaseRequestFormProps {
  defaultValues: Partial<PurchaseRequestSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export default function PurchaseRequestForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: PurchaseRequestFormProps) {
  const [details, setDetails] = useState<PurchaseRequestDetailSchema[]>(() => {
    // Transformar los detalles del backend al formato esperado
    if (defaultValues.details && defaultValues.details.length > 0) {
      const transformed = defaultValues.details.map((detail: any) => ({
        product_id: detail.product_id?.toString() || "",
        product_name: detail.product?.name || "",
        quantity: Number(detail.quantity) || 1,
        notes: detail.notes || "",
      }));
      console.log("🔄 Transformando detalles en edición:", {
        original: defaultValues.details,
        transformed,
      });
      return transformed;
    }
    console.log("📝 Modo creación - sin detalles");
    return [];
  });
  const [quotations, setQuotations] = useState<OrderQuotationResource[]>([]);
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState<string>("");

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({
      is_physical_warehouse: 1,
    });

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? purchaseRequestSchemaCreate
        : purchaseRequestSchemaUpdate
    ),
    defaultValues: {
      warehouse_id: "",
      requested_date: new Date(),
      observations: "",
      has_appointment: false,
      ...defaultValues,
      // Usar los details ya transformados
      details: details,
    },
    mode: "onChange",
  });

  const selectedWarehouseId = form.watch("warehouse_id");
  const hasAppointment = form.watch("has_appointment");
  const selectedQuotationId = form.watch("ap_order_quotation_id");

  // Formulario separado para selección de productos
  const productSelectorForm = useForm({
    defaultValues: {
      product_id: "",
    },
  });

  const selectedProductId = productSelectorForm.watch("product_id");

  // Hook para obtener los productos del inventario
  const { data: inventoryData } = useInventory(
    {
      warehouse_id: selectedWarehouseId,
      all: true,
    },
    {
      enabled: !!selectedWarehouseId,
    }
  );

  // useEffect para actualizar el nombre del producto seleccionado
  useEffect(() => {
    if (selectedProductId && inventoryData?.data) {
      const selectedProduct = inventoryData.data.find(
        (inventory) => inventory.product_id.toString() === selectedProductId
      );
      if (selectedProduct) {
        setSelectedProductName(selectedProduct.product.name);
      }
    } else {
      setSelectedProductName("");
    }
  }, [selectedProductId, inventoryData]);

  // Sincronizar details con el formulario
  useEffect(() => {
    form.setValue("details", details);
    // Validar inmediatamente después de setear
    form.trigger("details");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details]);

  useEffect(() => {
    if (!hasAppointment) {
      form.setValue("ap_order_quotation_id", "");
    }
  }, [hasAppointment]);

  useEffect(() => {
    if (selectedQuotationId) {
      loadQuotationDetails(selectedQuotationId);
    }
  }, [selectedQuotationId]);

  const loadQuotations = async () => {
    try {
      setIsLoadingQuotations(true);
      const response = await getAllOrderQuotations({
        is_take: 0,
      });
      setQuotations(response || []);
    } catch (error: any) {
      const msgError =
        error?.response?.data?.message || "Error al cargar las cotizaciones.";
      errorToast(msgError);
      setQuotations([]);
    } finally {
      setIsLoadingQuotations(false);
    }
  };

  const loadQuotationDetails = useCallback(
    async (quotationId: string) => {
      const selectedQuotation = quotations.find(
        (q) => q.id.toString() === quotationId
      );

      if (!selectedQuotation || !selectedQuotation.details) return;

      // Filtrar solo los productos (item_type = "PRODUCT")
      const productDetails = selectedQuotation.details.filter(
        (detail) => detail.item_type === "PRODUCT"
      );

      // Mapear a PurchaseRequestDetailSchema
      const newDetails: PurchaseRequestDetailSchema[] = productDetails.map(
        (detail) => ({
          product_id: detail.product_id.toString(),
          product_name: detail.product_name,
          quantity: Number(detail.quantity) || 1, // Asegurar que sea number
          notes: "",
        })
      );

      // Setear los detalles en la tabla
      setDetails(newDetails);
    },
    [quotations]
  );

  if (isLoadingWarehouses) {
    return <FormSkeleton />;
  }

  const handleAddProduct = (
    productId: string,
    productData?: InventoryResource
  ) => {
    if (!productId) {
      return;
    }

    // Verificar si el producto ya está en la lista
    const productExists = details.some(
      (detail) => detail.product_id === productId
    );

    if (productExists) {
      errorToast("El producto ya ha sido agregado a la solicitud.");
      return;
    }

    const newDetail: PurchaseRequestDetailSchema = {
      product_id: productId,
      product_name: productData?.product.name,
      quantity: 1,
      notes: "",
    };

    setDetails([...details, newDetail]);
  };

  const handleRemoveProduct = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      quantity: quantity > 0 ? quantity : 1,
    };
    setDetails(updatedDetails);
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      notes,
    };
    setDetails(updatedDetails);
  };

  const handleSelectQuotation = (quotationId: string) => {
    form.setValue("ap_order_quotation_id", quotationId);
  };

  const getSelectedQuotationLabel = () => {
    if (!selectedQuotationId || quotations.length === 0) return null;

    const quotation = quotations.find(
      (q) => q.id.toString() === selectedQuotationId
    );

    if (!quotation) return null;

    return `${quotation.quotation_number} - ${quotation.vehicle.plate} (${
      quotation.vehicle.model.brand
    } ${quotation.vehicle.model.family}) - S/ ${quotation.total_amount.toFixed(
      2
    )}`;
  };

  console.log("🎯 RENDER - Estado details:", details);
  console.log("🎯 RENDER - details.length:", details.length);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información General */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Información General</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              name="warehouse_id"
              label="Almacén"
              placeholder="Seleccione un almacén"
              options={warehouses.map((warehouse) => ({
                label: warehouse.description,
                value: warehouse.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
            />

            <DatePickerFormField
              control={form.control}
              name="requested_date"
              label="Fecha de Solicitud"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              disabledRange={{ before: new Date() }}
            />
          </div>

          {/* Checkbox para adjuntar cotización */}
          <div className="mt-4">
            <FormField
              control={form.control}
              name="has_appointment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿Adjuntar Cotización?</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marque esta opción si desea adjuntar una cotización a la
                      solicitud de compra.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Selector de Cotización - Solo visible si has_appointment es true */}
          {hasAppointment && (
            <div className="mt-4">
              <FormField
                control={form.control}
                name="ap_order_quotation_id"
                render={() => (
                  <FormItem>
                    <FormLabel>Cotización</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            loadQuotations();
                            setIsQuotationModalOpen(true);
                          }}
                          disabled={isLoadingQuotations}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          {isLoadingQuotations
                            ? "Cargando cotizaciones..."
                            : getSelectedQuotationLabel() ||
                              "Buscar y seleccionar cotización"}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="mt-4">
            <FormInputText
              name="observations"
              label="Observaciones"
              placeholder="Notas adicionales sobre la solicitud..."
              control={form.control}
            />
          </div>
        </Card>

        {/* Productos */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Productos Solicitados</h3>
          </div>

          {!selectedWarehouseId ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Seleccione un almacén para agregar productos
              </p>
            </div>
          ) : (
            <>
              {/* Selector de productos con búsqueda */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Seleccionar Producto
                </label>
                <Form {...productSelectorForm}>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <FormSelectAsync
                        name="product_id"
                        placeholder="Buscar y seleccionar producto para agregar"
                        control={productSelectorForm.control}
                        useQueryHook={useInventory}
                        additionalParams={{
                          warehouse_id: selectedWarehouseId,
                        }}
                        mapOptionFn={(inventory: InventoryResource) => ({
                          label: () => (
                            <div className="flex items-center justify-between gap-2 w-full">
                              <span className="font-medium truncate">
                                {inventory.product.name}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${
                                  inventory.available_quantity > 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                Stock: {inventory.available_quantity}
                              </span>
                            </div>
                          ),
                          value: inventory.product_id.toString(),
                        })}
                        perPage={15}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        const productId =
                          productSelectorForm.getValues("product_id");
                        if (productId && selectedProductName) {
                          // Crear objeto InventoryResource simplificado con solo el nombre
                          const inventoryData: InventoryResource = {
                            product: {
                              name: selectedProductName,
                            },
                          } as InventoryResource;

                          handleAddProduct(productId, inventoryData);
                          productSelectorForm.reset();
                        }
                      }}
                      disabled={!productSelectorForm.watch("product_id")}
                      className="self-end sm:w-auto w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Lista de Productos */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <h4 className="font-semibold text-gray-700">
                    Items de Productos
                  </h4>
                  <Badge variant="secondary" className="font-semibold">
                    {details.length} item(s)
                  </Badge>
                </div>

                {details.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      No hay productos agregados
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    {/* Cabecera de tabla - Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 border-b">
                      <div className="col-span-5">Producto</div>
                      <div className="col-span-2">Cantidad</div>
                      <div className="col-span-4">Notas</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Items */}
                    <div className="divide-y">
                      {details.map((detail, index) => {
                        console.log(`📦 Producto ${index}:`, detail);
                        return (
                          <div key={index}>
                            {/* Vista Desktop */}
                            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 hover:bg-gray-50 transition-colors items-center">
                              <div className="col-span-5">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {detail.product_name ||
                                    `Producto #${detail.product_id}`}
                                </p>
                              </div>

                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={detail.quantity}
                                  onChange={(e) =>
                                    handleUpdateQuantity(
                                      index,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="h-9 text-sm"
                                />
                              </div>

                              <div className="col-span-4">
                                <Input
                                  type="text"
                                  value={detail.notes || ""}
                                  onChange={(e) =>
                                    handleUpdateNotes(index, e.target.value)
                                  }
                                  placeholder="Notas opcionales..."
                                  className="h-9 text-sm"
                                />
                              </div>

                              <div className="col-span-1 flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRemoveProduct(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Vista Mobile */}
                            <div className="md:hidden px-4 py-3 space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {detail.product_name ||
                                      `Producto #${detail.product_id}`}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                                  onClick={() => handleRemoveProduct(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Cantidad
                                  </label>
                                  <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={detail.quantity}
                                    onChange={(e) =>
                                      handleUpdateQuantity(
                                        index,
                                        Number(e.target.value)
                                      )
                                    }
                                    className="h-9 text-sm w-full"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Notas
                                  </label>
                                  <Input
                                    type="text"
                                    value={detail.notes || ""}
                                    onChange={(e) =>
                                      handleUpdateNotes(index, e.target.value)
                                    }
                                    placeholder="Notas opcionales..."
                                    className="h-9 text-sm w-full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <FormMessage>{form.formState.errors.details?.message}</FormMessage>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting || details.length === 0 || !form.formState.isValid
            }
          >
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
              ? "Crear Solicitud"
              : "Actualizar Solicitud"}
          </Button>
        </div>

        {/* Modal de Selección de Cotización */}
        <QuotationSelectionModal
          open={isQuotationModalOpen}
          onOpenChange={setIsQuotationModalOpen}
          onSelectQuotation={handleSelectQuotation}
        />
      </form>
    </Form>
  );
}
