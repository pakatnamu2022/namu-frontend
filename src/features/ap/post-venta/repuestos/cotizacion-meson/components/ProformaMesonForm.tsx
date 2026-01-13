"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  quotationMesonWithProductsSchemaCreate,
  quotationMesonWithProductsSchemaUpdate,
  QuotationMesonWithProductsSchema,
} from "../lib/quotationMeson.schema";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllVehicles } from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { Car, User, Plus, Trash2, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { EMPRESA_AP } from "@/core/core.constants";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { AREA_PM_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import {
  useProduct,
  useProductById,
} from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { api } from "@/core/api";
import { format } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { Badge } from "@/components/ui/badge";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { getStockByProductIds } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.actions";
import { StockByProductIdsResponse } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.interface";
import { Warehouse, AlertCircle } from "lucide-react";

const onSelectSupplyType = [
  { label: "Stock", value: "STOCK" },
  { label: "Lima", value: "LIMA" },
  { label: "Importación", value: "IMPORTACION" },
];

// Componente auxiliar para manejar cada item de producto
function ProductDetailItem({
  index,
  form,
  onRemove,
  selectedCurrency,
  stockData,
}: {
  index: number;
  form: any;
  onRemove: () => void;
  selectedCurrency: any;
  stockData: StockByProductIdsResponse | null;
}) {
  const productId = form.watch(`details.${index}.product_id`);
  const { data: productData } = useProductById(Number(productId) || 0);

  // Buscar el stock del producto actual
  const currentProductStock = stockData?.data?.find(
    (stock) => stock.product_id === Number(productId)
  );

  // Auto-completar descripción y unidad de medida cuando se selecciona un producto
  useEffect(() => {
    if (productData) {
      // Siempre actualizar descripción con el nombre del producto
      form.setValue(`details.${index}.description`, productData.name || "");

      // Actualizar unidad de medida
      form.setValue(
        `details.${index}.unit_measure`,
        productData.unit_measurement_name || "UND"
      );
    }
  }, [productData, index, form]);

  return (
    <div className="border rounded-lg bg-white transition-colors">
      {/* Vista Desktop - Formato Tabla */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 items-start">
        <div className="col-span-1 flex justify-center pt-2">
          <Badge variant="secondary" className="text-xs">
            #{index + 1}
          </Badge>
        </div>

        <div className="col-span-3">
          <FormSelectAsync
            name={`details.${index}.product_id`}
            label=""
            placeholder="Seleccione repuesto"
            control={form.control}
            useQueryHook={useProduct}
            mapOptionFn={(product) => ({
              label: `${product.code} ${product.name}(${
                product.unit_measurement_name || "UND"
              })`,
              value: product.id.toString(),
            })}
            perPage={10}
            debounceMs={500}
          />

          {/* Mostrar stock inline debajo del selector */}
          {currentProductStock && productId && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-1 mb-1">
                <Warehouse className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">
                  Stock Disponible
                </span>
              </div>
              {currentProductStock.warehouses.length > 0 ? (
                <div className="space-y-1">
                  {currentProductStock.warehouses
                    .slice(0, 2)
                    .map((warehouse) => (
                      <div key={warehouse.warehouse_id} className="text-xs">
                        <span className="font-medium text-gray-700">
                          {warehouse.warehouse_name}:
                        </span>
                        <span className="ml-1 text-green-600 font-semibold">
                          {warehouse.available_quantity}
                        </span>
                        <span className="text-gray-500 text-xs"> disp.</span>
                        {warehouse.quantity_in_transit > 0 && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="text-blue-600 font-semibold">
                              {warehouse.quantity_in_transit}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {" "}
                              trán.
                            </span>
                          </>
                        )}
                        {warehouse.is_out_of_stock && (
                          <Badge
                            variant="destructive"
                            className="ml-1 text-xs py-0 px-1 h-4"
                          >
                            Sin Stock
                          </Badge>
                        )}
                      </div>
                    ))}
                  {currentProductStock.warehouses.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{currentProductStock.warehouses.length - 2} almacenes más
                    </div>
                  )}
                  <div className="pt-1 border-t border-blue-300 mt-1 text-xs font-semibold text-gray-700">
                    Total:{" "}
                    <span className="text-green-600">
                      {currentProductStock.total_available_quantity}
                    </span>{" "}
                    disponibles
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>Sin stock</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-1">
          <FormField
            control={form.control}
            name={`details.${index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Cant."
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name={`details.${index}.retail_price_external`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="P. Ext. ($)"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name={`details.${index}.unit_price`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    className="h-9 bg-gray-100 font-medium"
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name={`details.${index}.total_amount`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    className="h-9 bg-gray-100 font-bold text-primary"
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Observaciones en fila completa si existen */}
        {form.watch(`details.${index}.observations`) && (
          <div className="col-span-12 pt-2 border-t">
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Obs:</span>{" "}
              {form.watch(`details.${index}.observations`)}
            </p>
          </div>
        )}
      </div>

      {/* Vista Mobile - Formato Card */}
      <div className="md:hidden p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-xs">
            Repuesto #{index + 1}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <FormSelectAsync
          name={`details.${index}.product_id`}
          label="Repuesto"
          placeholder="Seleccione repuesto"
          control={form.control}
          useQueryHook={useProduct}
          mapOptionFn={(product) => ({
            label: product.name,
            value: product.id.toString(),
          })}
          perPage={10}
          debounceMs={500}
        />

        {/* Mostrar stock inline debajo del selector - Mobile */}
        {currentProductStock && productId && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-1 mb-2">
              <Warehouse className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">
                Stock Disponible
              </span>
            </div>
            {currentProductStock.warehouses.length > 0 ? (
              <div className="space-y-1.5">
                {currentProductStock.warehouses.slice(0, 3).map((warehouse) => (
                  <div
                    key={warehouse.warehouse_id}
                    className="text-xs bg-white p-1.5 rounded"
                  >
                    <div className="font-medium text-gray-700 mb-0.5">
                      {warehouse.warehouse_name}
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span>
                        <span className="text-gray-500">Disp:</span>
                        <span className="ml-1 text-green-600 font-semibold">
                          {warehouse.available_quantity}
                        </span>
                      </span>
                      {warehouse.quantity_in_transit > 0 && (
                        <span>
                          <span className="text-gray-500">Trán:</span>
                          <span className="ml-1 text-blue-600 font-semibold">
                            {warehouse.quantity_in_transit}
                          </span>
                        </span>
                      )}
                      {warehouse.is_out_of_stock && (
                        <Badge
                          variant="destructive"
                          className="text-xs py-0 px-1 h-4"
                        >
                          Sin Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {currentProductStock.warehouses.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{currentProductStock.warehouses.length - 3} almacenes más
                  </div>
                )}
                <div className="pt-1.5 border-t border-blue-300 text-xs font-semibold text-gray-700">
                  Total disponible:{" "}
                  <span className="text-green-600">
                    {currentProductStock.total_available_quantity}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <AlertCircle className="h-3 w-3" />
                <span>Sin stock en almacenes</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`details.${index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Cantidad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`details.${index}.retail_price_external`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">P. Ext. ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`details.${index}.unit_price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  P. Unit. ({selectedCurrency?.symbol || "S/."})
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    className="h-9 bg-gray-100"
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`details.${index}.total_amount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  Total ({selectedCurrency?.symbol || "S/."})
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    className="h-9 bg-gray-100 font-bold text-primary"
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`details.${index}.observations`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Observaciones</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Opcional"
                  className="h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

interface ProformaMesonFormProps {
  defaultValues?: Partial<QuotationMesonWithProductsSchema>;
  onSubmit: (data: QuotationMesonWithProductsSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export default function ProformaMesonForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: ProformaMesonFormProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [stockData, setStockData] = useState<StockByProductIdsResponse | null>(
    null
  );

  const form = useForm<QuotationMesonWithProductsSchema>({
    resolver: zodResolver(
      mode === "create"
        ? quotationMesonWithProductsSchemaCreate
        : quotationMesonWithProductsSchemaUpdate
    ) as any,
    defaultValues: {
      area_id: AREA_PM_ID.MESON,
      vehicle_id: "",
      sede_id: "",
      currency_id: CURRENCY_TYPE_IDS.SOLES,
      quotation_date: "",
      expiration_date: "",
      observations: "",
      details: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const quotationDate = form.watch("quotation_date");
  const vehicleId = form.watch("vehicle_id");
  const currencyId = form.watch("currency_id");

  // Usar useWatch para detectar cambios en details en tiempo real
  const watchedDetails = useWatch({
    control: form.control,
    name: "details",
  });

  const { data: vehicles = [], isLoading: isLoadingVehicles } =
    useAllVehicles();

  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const { data: currencyTypes = [] } = useAllCurrencyTypes();

  // Actualizar vehículo seleccionado
  useEffect(() => {
    if (vehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find((v) => v.id.toString() === vehicleId);
      setSelectedVehicle(vehicle || null);
    } else {
      setSelectedVehicle(null);
    }
  }, [vehicleId, vehicles]);

  // Actualizar moneda seleccionada
  useEffect(() => {
    if (currencyId && currencyTypes.length > 0) {
      const currency = currencyTypes.find(
        (c) => c.id.toString() === currencyId
      );
      setSelectedCurrency(currency || null);
    } else {
      setSelectedCurrency(null);
    }
  }, [currencyId, currencyTypes]);

  // Actualizar fecha de vencimiento automáticamente
  useEffect(() => {
    if (quotationDate) {
      const quotationDateObj = new Date(quotationDate);
      const expirationDateObj = new Date(quotationDateObj);
      expirationDateObj.setDate(quotationDateObj.getDate() + 7);
      form.setValue("expiration_date", expirationDateObj);
    } else {
      form.setValue("expiration_date", "");
    }
  }, [quotationDate, form]);

  // Consultar tipo de cambio cuando se monta el componente o cambia la fecha
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!quotationDate) return;

      setIsLoadingExchangeRate(true);
      try {
        const formattedDate = format(new Date(quotationDate), "yyyy-MM-dd");
        const response = await api.get(
          `/gp/mg/exchange-rate/by-date-and-currency?to_currency_id=${CURRENCY_TYPE_IDS.DOLLARS}&date=${formattedDate}`
        );

        if (response.data?.data?.rate) {
          const rate = parseFloat(response.data.data.rate);
          setExchangeRate(rate);
        }
      } catch (error) {
        console.error("Error al obtener tipo de cambio:", error);
        setExchangeRate(null);
      } finally {
        setIsLoadingExchangeRate(false);
      }
    };

    fetchExchangeRate();
  }, [quotationDate]);

  // Consultar stock de productos seleccionados
  // Crear un string con los IDs de productos para detectar cambios
  const productIdsString = useMemo(() => {
    if (!watchedDetails || watchedDetails.length === 0) return "";
    const ids = watchedDetails
      .map((detail: any) => Number(detail?.product_id || 0))
      .filter((id: number) => id > 0)
      .sort((a: number, b: number) => a - b); // Ordenar para que [1,2] sea igual a [2,1]
    return ids.join(",");
  }, [watchedDetails]);

  useEffect(() => {
    const fetchProductsStock = async () => {
      // Si no hay productos seleccionados, limpiar el stock
      if (!productIdsString) {
        setStockData(null);
        return;
      }

      const productIds = productIdsString.split(",").map(Number);

      try {
        const response = await getStockByProductIds(productIds);
        setStockData(response);
      } catch {
        setStockData(null);
      }
    };

    fetchProductsStock();
  }, [productIdsString]);

  const addProduct = () => {
    append({
      product_id: "",
      description: "",
      quantity: 1,
      unit_measure: "UND",
      unit_price: 0,
      discount: 0,
      total_amount: 0,
      observations: "",
      retail_price_external: 0,
      exchange_rate: exchangeRate || 0,
      freight_commission: 1.05,
    });
  };

  const calculateUnitPrice = (index: number) => {
    const detail = form.watch(`details.${index}`);
    const retail = detail?.retail_price_external || 0;
    const commission = detail?.freight_commission || 1.05;

    // Si la moneda seleccionada es USD (id: 1), no aplicar tipo de cambio
    // Si es PEN (id: 3), aplicar el tipo de cambio
    const isUSD = selectedCurrency?.code === "USD";
    const rate = isUSD ? 1 : exchangeRate || 1;

    return Math.round(retail * commission * rate * 100) / 100;
  };

  const calculateTotalAmount = (index: number) => {
    const detail = form.watch(`details.${index}`);
    const quantity = detail?.quantity || 0;
    const unitPrice = detail?.unit_price || 0;

    return quantity * unitPrice;
  };

  // Calcular automáticamente el precio unitario cuando cambian los valores
  const watchAllFields = form.watch();
  useEffect(() => {
    fields.forEach((_, index) => {
      const calculatedUnitPrice = calculateUnitPrice(index);
      const currentUnitPrice = form.getValues(`details.${index}.unit_price`);

      if (calculatedUnitPrice !== currentUnitPrice) {
        form.setValue(`details.${index}.unit_price`, calculatedUnitPrice);
      }

      const calculatedTotal = calculateTotalAmount(index);
      const currentTotal = form.getValues(`details.${index}.total_amount`);

      if (calculatedTotal !== currentTotal) {
        form.setValue(`details.${index}.total_amount`, calculatedTotal);
      }
    });
  }, [watchAllFields, exchangeRate, selectedCurrency]);

  const formatCurrency = (amount: number) => {
    const symbol = selectedCurrency?.symbol || "S/.";
    return `${symbol} ${amount.toFixed(2)}`;
  };

  const getTotalGeneral = () => {
    return fields.reduce((sum, _, index) => {
      return sum + calculateTotalAmount(index);
    }, 0);
  };

  if (isLoadingVehicles || isLoadingMySedes) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información de la Cotización */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Información de la Cotización
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              name="sede_id"
              label="Sede"
              placeholder="Selecciona una sede"
              options={mySedes.map((item) => ({
                label: item.abreviatura,
                value: item.id.toString(),
              }))}
              control={form.control}
              required
            />

            <FormSelect
              control={form.control}
              name="currency_id"
              options={currencyTypes.map((type) => ({
                value: type.id.toString(),
                label: type.name,
              }))}
              label="Moneda"
              placeholder="Seleccionar moneda"
              required
            />

            <FormSelect
              name="vehicle_id"
              label="Vehículo"
              placeholder="Seleccione vehículo"
              options={vehicles.map((item) => ({
                label: `${item.vin || "S/N"} | ${item.plate || ""} | ${
                  item.model?.brand || ""
                }`,
                value: item.id.toString(),
              }))}
              control={form.control}
              required
            />

            <DatePickerFormField
              control={form.control}
              name="quotation_date"
              label="Fecha de Apertura"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              disabledRange={{ before: new Date() }}
            />

            <DatePickerFormField
              control={form.control}
              name="expiration_date"
              label="Fecha de Vencimiento"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              disabled={true}
            />

            <FormSelect
              control={form.control}
              name="supply_type"
              options={onSelectSupplyType}
              label="Tipo de Abastecimiento"
              placeholder="Seleccionar un tipo"
              required
            />
          </div>

          {/* Información del Vehículo Seleccionado */}
          {selectedVehicle && (
            <div className="mt-4">
              <Card className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Car className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-gray-800">
                    Información del Vehículo
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">VIN</p>
                    <p className="font-semibold text-sm">
                      {selectedVehicle.vin || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Marca</p>
                    <p className="font-semibold text-sm">
                      {selectedVehicle.model?.brand || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Modelo</p>
                    <p className="font-semibold text-sm truncate">
                      {selectedVehicle.model?.version || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Año</p>
                    <p className="font-semibold text-sm">
                      {selectedVehicle.year || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Color</p>
                    <p className="font-semibold text-sm">
                      {selectedVehicle.vehicle_color || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Motor</p>
                    <p className="font-semibold text-sm">
                      {selectedVehicle.engine_type || "N/A"}
                    </p>
                  </div>
                  {selectedVehicle.owner !== null && (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 pt-2 border-t border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <p className="text-xs font-semibold text-gray-700">
                          Propietario
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Nombre</p>
                          <p className="font-medium text-sm">
                            {selectedVehicle.owner.full_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Documento</p>
                          <p className="font-medium text-sm">
                            {selectedVehicle.owner.num_doc}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Teléfono</p>
                          <p className="font-medium text-sm">
                            {selectedVehicle.owner.phone || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Notas adicionales sobre la cotización..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        {/* Sección de Repuestos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Repuestos</h3>
            </div>
            <Button
              type="button"
              onClick={addProduct}
              size="sm"
              disabled={!quotationDate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Repuesto
            </Button>
          </div>

          {/* Mensaje de tipo de cambio */}
          {quotationDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-4">
              <p className="text-xs text-primary">
                <span className="font-semibold">Comisión de flete:</span> 1.05
              </p>
              {isLoadingExchangeRate ? (
                <p className="text-xs text-primary">
                  <span className="font-semibold">Tipo de cambio:</span>{" "}
                  Cargando...
                </p>
              ) : exchangeRate ? (
                <p className="text-xs text-primary">
                  <span className="font-semibold">Tipo de cambio:</span> S/.{" "}
                  {exchangeRate.toFixed(4)}
                </p>
              ) : (
                <p className="text-xs text-red-600">
                  <span className="font-semibold">Tipo de cambio:</span> No
                  disponible
                </p>
              )}
            </div>
          )}

          {fields.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                No hay repuestos agregados
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona una fecha de cotización y haz clic en "Agregar
                Repuesto"
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Cabecera de tabla - Solo Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-100 px-4 py-2 rounded-t-lg text-xs font-semibold text-gray-700 border-b">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-3">Repuesto</div>
                <div className="col-span-1 text-center">Cant.</div>
                <div className="col-span-2 text-center">P. Ext. ($)</div>
                <div className="col-span-2 text-center">
                  P. Unit. ({selectedCurrency?.symbol || "S/."})
                </div>
                <div className="col-span-2 text-center">
                  Total ({selectedCurrency?.symbol || "S/."})
                </div>
                <div className="col-span-1 text-center">Acción</div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <ProductDetailItem
                    key={field.id}
                    index={index}
                    form={form}
                    onRemove={() => remove(index)}
                    selectedCurrency={selectedCurrency}
                    stockData={stockData}
                  />
                ))}
              </div>

              {/* Total General */}
              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total General</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(getTotalGeneral())}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting || !form.formState.isValid || fields.length === 0
            }
          >
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
              ? "Crear Cotización"
              : "Actualizar Cotización"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
