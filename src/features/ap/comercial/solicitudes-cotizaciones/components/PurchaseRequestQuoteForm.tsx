import {
  PurchaseRequestQuoteSchema,
  purchaseRequestQuoteSchemaCreate,
  purchaseRequestQuoteSchemaUpdate,
} from "../lib/purchaseRequestQuote.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Building2, Gift, Loader, PackagePlus, Calculator } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useMyOpportunities } from "../../oportunidades/lib/opportunities.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllCustomers } from "../../clientes/lib/customers.hook";
import { useAllModelsVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { useAllVehicleColor } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.hook";
import { useEffect, useState, useRef } from "react";
import { BonusDiscountTable } from "./BonusDiscountTable";
import { ApprovedAccessoriesTable } from "./ApprovedAccessoriesTable";
import { useAllConceptDiscountBond } from "../lib/purchaseRequestQuote.hook";
import { useAllApprovedAccesories } from "../../../post-venta/accesorios-homologados/lib/approvedAccessories.hook";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { EMPRESA_AP } from "@/core/core.constants";
import { useAllVehiclesWithCosts } from "../../vehiculos/lib/vehicles.hook";

interface PurchaseRequestQuoteFormProps {
  defaultValues: Partial<PurchaseRequestQuoteSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

const typeDocOptions = [
  {
    label: "Cotización",
    value: "COTIZACION",
  },
  {
    label: "Solicitud de Compra",
    value: "SOLICITUD_COMPRA",
  },
];

export const PurchaseRequestQuoteForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: PurchaseRequestQuoteFormProps) => {
  const router = useNavigate();
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? purchaseRequestQuoteSchemaCreate
        : purchaseRequestQuoteSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Estados
  const [copyClientToHolder, setCopyClientToHolder] = useState(false);
  const [bonusDiscountRows, setBonusDiscountRows] = useState<any[]>([]);
  const [accessoriesRows, setAccessoriesRows] = useState<any[]>([]);
  const [invoiceCurrencyId, setInvoiceCurrencyId] = useState<string>("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | undefined>(
    undefined
  );

  // Hooks de datos
  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });
  const { data: opportunities = [], isLoading: isLoadingOpportunities } =
    useMyOpportunities({
      has_purchase_request_quote: 0,
      opportunity_id:
        mode === "update" && defaultValues.opportunity_id
          ? Number(defaultValues.opportunity_id)
          : undefined,
    });
  const { data: clients = [], isLoading: isLoadingClients } = useAllCustomers();
  const { data: modelsVn = [], isLoading: isLoadingModelsVn } = useAllModelsVn({
    family_id: selectedFamilyId,
  });
  const { data: color = [], isLoading: isLoadingColor } = useAllVehicleColor();
  const {
    data: conceptDiscountBond = [],
    isLoading: isLoadingConceptDiscountBond,
  } = useAllConceptDiscountBond();
  const {
    data: approvedAccesories = [],
    isLoading: isLoadingApprovedAccesories,
  } = useAllApprovedAccesories();
  const { data: vehiclesVn = [], isLoading: isLoadingVehiclesVn } =
    useAllVehiclesWithCosts();
  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes();

  // Refs
  const isFirstLoadRef = useRef(true);
  const hasInitializedCheckboxRef = useRef(false);
  const hasInitializedSwitchRef = useRef(false);
  const hasInitializedFamilyIdRef = useRef(false);

  // Form watchers
  const modelVnWatch = form.watch("ap_models_vn_id");
  const withVinWatch = form.watch("with_vin");
  const vehicleVnWatch = form.watch("ap_vehicle_id");
  const opportunityWatch = form.watch("opportunity_id");
  const salePriceWatch = form.watch("sale_price");
  const docTypeCurrencyWatch = form.watch("doc_type_currency_id");
  const holderWatch = form.watch("holder_id");

  // Datos iniciales para las tablas (solo en modo update)
  const [initialBonusDiscounts, setInitialBonusDiscounts] = useState<any[]>([]);
  const [initialAccessories, setInitialAccessories] = useState<any[]>([]);

  // Effect para cargar datos iniciales en modo update
  useEffect(() => {
    if (mode === "update" && defaultValues) {
      const dataWithArrays = defaultValues as any;

      // Transformar bonos/descuentos desde la respuesta del API
      if (
        dataWithArrays.bonus_discounts &&
        dataWithArrays.bonus_discounts.length > 0
      ) {
        const transformedBonusDiscounts = dataWithArrays.bonus_discounts.map(
          (bonus: any) => {
            // Usar el campo 'type' del API para determinar si es porcentaje o monto fijo
            const isPercentage = bonus.type === "PORCENTAJE";

            // Si es porcentaje, usar el valor de 'percentage', si es fijo usar 'amount'
            const valor = isPercentage
              ? Number(bonus.percentage)
              : Number(bonus.amount);

            return {
              id: bonus.id?.toString() || Date.now().toString(),
              concept_id: bonus.concept_code_id.toString(),
              descripcion: bonus.description,
              isPercentage: isPercentage,
              valor: valor,
            };
          }
        );
        setInitialBonusDiscounts(transformedBonusDiscounts);
        setBonusDiscountRows(transformedBonusDiscounts);
      }

      // Transformar accesorios desde la respuesta del API
      if (dataWithArrays.accessories && dataWithArrays.accessories.length > 0) {
        const transformedAccessories = dataWithArrays.accessories.map(
          (acc: any) => ({
            id: acc.id?.toString() || Date.now().toString(),
            accessory_id: Number(acc.approved_accessory_id),
            quantity: Number(acc.quantity),
            type: acc.type || "ACCESORIO_ADICIONAL",
          })
        );
        setInitialAccessories(transformedAccessories);
        setAccessoriesRows(transformedAccessories);
      }

      setIsInitialLoad(false);
    } else {
      setIsInitialLoad(false);
    }
  }, [mode]);

  // Obtener el modelo seleccionado y su precio original
  const selectedModel = modelsVn.find(
    (model) => model.id === Number(modelVnWatch)
  );
  const originalPrice = selectedModel?.sale_price || 0;
  const currencySymbol = selectedModel?.currency_symbol || "S/";

  // Effect para limpiar campos cuando se cambia el switch (solo si no es carga inicial)
  useEffect(() => {
    if (!isInitialLoad) {
      form.setValue("ap_models_vn_id", "");
      form.setValue("vehicle_color_id", "");
      form.setValue("sale_price", "0");
      form.setValue("ap_vehicle_id", "");
    }
  }, [withVinWatch, form]);

  // Effect para actualizar el precio cuando cambia el modelo (solo si no es carga inicial y es modo create)
  useEffect(() => {
    if (!isInitialLoad && mode === "create" && originalPrice > 0) {
      form.setValue("sale_price", originalPrice.toString());
    }
  }, [modelVnWatch, originalPrice, form, isInitialLoad, mode]);

  // Effect para auto-completar campos cuando se selecciona un vehículo VN (solo si no es carga inicial)
  useEffect(() => {
    if (!isInitialLoad && withVinWatch && vehicleVnWatch) {
      const selectedVehicle = vehiclesVn.find(
        (vehicle) => vehicle.id === Number(vehicleVnWatch)
      );
      if (selectedVehicle) {
        form.setValue(
          "ap_models_vn_id",
          String(selectedVehicle.ap_models_vn_id)
        );
        form.setValue(
          "vehicle_color_id",
          String(selectedVehicle.vehicle_color_id)
        );
      }
    }
  }, [vehicleVnWatch, withVinWatch, vehiclesVn, form, isInitialLoad]);

  // Effect para inicializar el switch en modo actualizar (solo una vez)
  useEffect(() => {
    if (
      mode === "update" &&
      !isInitialLoad &&
      defaultValues &&
      !hasInitializedSwitchRef.current
    ) {
      const dataWithVehicle = defaultValues as any;
      // Si tiene ap_vehicle_id, el switch debe estar en true (Con VIN)
      const hasVehiclePurchaseOrderId = Boolean(dataWithVehicle.ap_vehicle_id);
      form.setValue("with_vin", hasVehiclePurchaseOrderId);
      hasInitializedSwitchRef.current = true;
    }
  }, [mode, isInitialLoad, defaultValues, form]);

  // Effect para inicializar el checkbox en modo actualizar (solo una vez)
  useEffect(() => {
    if (
      mode === "update" &&
      !isInitialLoad &&
      opportunityWatch &&
      holderWatch &&
      opportunities.length > 0 &&
      !hasInitializedCheckboxRef.current
    ) {
      const selectedOpportunity = opportunities.find(
        (opp) => opp.id.toString() === opportunityWatch
      );
      if (selectedOpportunity) {
        const isSameClient =
          selectedOpportunity.client.id.toString() === holderWatch;
        if (isSameClient) {
          setCopyClientToHolder(true);
          isFirstLoadRef.current = false; // Marcar que ya pasó la primera carga
        }
        hasInitializedCheckboxRef.current = true;
      }
    }
  }, [mode, isInitialLoad, opportunityWatch, holderWatch, opportunities]);

  // Effect para manejar cambios en el checkbox (solo interacciones del usuario)
  useEffect(() => {
    // Skip en la primera carga
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    // Solo ejecutar si NO estamos en el proceso de inicialización
    if (hasInitializedCheckboxRef.current || mode === "create") {
      if (copyClientToHolder && opportunityWatch) {
        const selectedOpportunity = opportunities.find(
          (opp) => opp.id.toString() === opportunityWatch
        );
        if (selectedOpportunity) {
          form.setValue("holder_id", selectedOpportunity.client.id.toString());
        }
      } else if (!copyClientToHolder) {
        form.setValue("holder_id", "");
      }
    }
  }, [copyClientToHolder]);

  // Effect para actualizar family_id cuando cambia la oportunidad seleccionada
  useEffect(() => {
    if (opportunityWatch && opportunities.length > 0) {
      const selectedOpportunity = opportunities.find(
        (opp) => opp.id.toString() === opportunityWatch
      );
      if (selectedOpportunity && selectedOpportunity.family_id) {
        const newFamilyId = selectedOpportunity.family_id;
        const familyChanged = selectedFamilyId !== newFamilyId;

        setSelectedFamilyId(newFamilyId);

        // Solo limpiar el modelo si:
        // 1. No estamos en carga inicial
        // 2. Ya se inicializó el family_id previamente (para detectar cambios reales)
        // 3. La familia realmente cambió
        if (
          !isInitialLoad &&
          hasInitializedFamilyIdRef.current &&
          familyChanged
        ) {
          form.setValue("ap_models_vn_id", "");
        }

        // Marcar que ya se inicializó
        if (!hasInitializedFamilyIdRef.current) {
          hasInitializedFamilyIdRef.current = true;
        }
      }
    } else if (!opportunityWatch) {
      setSelectedFamilyId(undefined);
      hasInitializedFamilyIdRef.current = false;
    }
  }, [opportunityWatch, opportunities, form, isInitialLoad, selectedFamilyId]);

  // Effect para sincronizar la moneda de facturación seleccionada
  useEffect(() => {
    if (docTypeCurrencyWatch) {
      setInvoiceCurrencyId(docTypeCurrencyWatch);
    }
  }, [docTypeCurrencyWatch]);

  // Obtener la moneda del vehículo (modelo VN o vehículo VN)
  const getVehicleCurrency = () => {
    if (withVinWatch && vehicleVnWatch) {
      const selectedVehicle = vehiclesVn.find(
        (vehicle) => vehicle.id === Number(vehicleVnWatch)
      );
      if (selectedVehicle) {
        const modelOfVehicle = modelsVn.find(
          (model) => model.id === Number(selectedVehicle.ap_models_vn_id)
        );
        return {
          currencyId: modelOfVehicle?.currency_type_id || 0,
          symbol: modelOfVehicle?.currency_symbol || "S/",
        };
      }
    } else if (modelVnWatch) {
      const model = modelsVn.find((m) => m.id === Number(modelVnWatch));
      return {
        currencyId: model?.currency_type_id || 0,
        symbol: model?.currency_symbol || "S/",
      };
    }
    return { currencyId: 0, symbol: "S/" };
  };

  const vehicleCurrency = getVehicleCurrency();

  // Obtener tipo de cambio de una moneda
  const getExchangeRate = (currencyId: number): number => {
    const currency = currencyTypes.find((c) => c.id === currencyId);
    return currency?.current_exchange_rate ?? 1;
  };

  // Convertir monto de una moneda a otra
  const convertAmount = (
    amount: number,
    fromCurrencyId: number,
    toCurrencyId: number
  ) => {
    if (fromCurrencyId === toCurrencyId) return amount;

    const fromRate = getExchangeRate(fromCurrencyId);
    const toRate = getExchangeRate(toCurrencyId);

    // Convertir a moneda base (soles) primero, luego a moneda destino
    const amountInSoles = amount * fromRate;
    return amountInSoles / toRate;
  };

  // Calcular totales
  const calculateTotals = () => {
    const salePrice = parseFloat(salePriceWatch || "0");
    const vehicleCurrencyId = vehicleCurrency.currencyId;

    // Calcular bonos/descuentos (ya están en la moneda del vehículo)
    // NOTA: Los bonos/descuentos NO afectan el precio final, solo se muestran informativamente
    const bonusDiscountTotal = bonusDiscountRows.reduce((total, row) => {
      if (row.isPercentage) {
        return total + (salePrice * row.valor) / 100;
      }
      return total + row.valor;
    }, 0);

    // Calcular accesorios (siempre en soles, necesitan conversión)
    // Excluir obsequios del cálculo
    const solesId = currencyTypes.find((c) => c.code === "PEN")?.id || 1;
    const accessoriesTotal = accessoriesRows.reduce((total, row) => {
      if (row.type === "OBSEQUIO") {
        return total;
      }

      const accessory = approvedAccesories.find(
        (acc) => acc.id === row.accessory_id
      );
      if (accessory) {
        const accessoryPrice = accessory.price * row.quantity;

        // Convertir de soles a la moneda del vehículo
        return (
          total + convertAmount(accessoryPrice, solesId, vehicleCurrencyId)
        );
      }
      return total;
    }, 0);

    // Subtotal SIN incluir bonos/descuentos (no afectan al precio final)
    const subtotal = salePrice + accessoriesTotal;

    return {
      salePrice,
      bonusDiscountTotal,
      accessoriesTotal,
      subtotal,
      vehicleCurrencyId,
    };
  };

  const totals = calculateTotals();

  // Calcular el total en la moneda de facturación seleccionada
  const getFinalTotal = () => {
    if (!invoiceCurrencyId) return totals.subtotal;

    return convertAmount(
      totals.subtotal,
      totals.vehicleCurrencyId,
      Number(invoiceCurrencyId)
    );
  };

  const finalTotal = getFinalTotal();
  const selectedInvoiceCurrency = currencyTypes.find(
    (c) => c.id === Number(invoiceCurrencyId)
  );

  // Transformar datos de bonos/descuentos para el envío
  const transformBonusDiscountData = () => {
    return bonusDiscountRows.map((row) => {
      return {
        concept_id: row.concept_id,
        description: row.descripcion,
        type: row.isPercentage ? "PORCENTAJE" : "FIJO",
        value: row.valor,
      };
    });
  };

  // Transformar datos de accesorios para el envío
  const transformAccessoriesData = () => {
    return accessoriesRows.map((row) => ({
      accessory_id: row.accessory_id,
      quantity: row.quantity,
      type: row.type,
    }));
  };

  // Función de envío personalizada
  const handleFormSubmit = (data: any) => {
    const bonusDiscountData = transformBonusDiscountData();
    const accessoriesData = transformAccessoriesData();

    const finalData = {
      ...data,
      bonus_discounts: bonusDiscountData,
      accessories: accessoriesData,
      type_currency_id: vehicleCurrency.currencyId,
      base_selling_price: totals.salePrice,
      sale_price: totals.subtotal,
      doc_sale_price: finalTotal,
    };

    onSubmit(finalData);
  };

  if (
    isLoadingOpportunities ||
    isLoadingClients ||
    isLoadingColor ||
    isLoadingConceptDiscountBond ||
    isLoadingApprovedAccesories ||
    isLoadingCurrencyTypes ||
    isLoadingMySedes
  )
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full"
      >
        {/*Seccion Información General*/}
        <GroupFormSection
          title="Información General"
          icon={Building2}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona una sede"
            options={mySedes.map((item) => ({
              label: item.abreviatura,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            name="type_document"
            label="Tipo de Documento"
            placeholder="Selecciona el tipo"
            options={typeDocOptions}
            control={form.control}
          />
          <FormSelect
            name="opportunity_id"
            label="Oportunidad"
            placeholder="Selecciona una oportunidad"
            options={opportunities.map((item) => ({
              label: item.client.full_name,
              description: item.family.brand + " - " + item.family.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />
          <div className="relative">
            <FormSelect
              name="holder_id"
              label="Titular"
              placeholder="Selecciona un titular"
              options={clients.map((item) => ({
                label: item.full_name,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
            />
            <div className="flex items-center space-x-2 absolute top-0 right-0">
              <Checkbox
                id="copyClient"
                checked={copyClientToHolder}
                onCheckedChange={(checked) =>
                  setCopyClientToHolder(checked as boolean)
                }
              />
              <label
                htmlFor="copyClient"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Es cliente
              </label>
            </div>
          </div>
        </GroupFormSection>

        {/*Seccion Información de Vehiculo*/}
        <GroupFormSection
          title="Información del Vehículo"
          icon={Building2}
          iconColor="text-gray-500"
          bgColor="bg-gray-50"
          cols={{ sm: 2, md: 3 }}
        >
          {/* Switch para seleccionar Con VIN o Sin VIN */}
          <FormField
            control={form.control}
            name="with_vin"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {field.value ? "Con VIN" : "Sin VIN"}
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Mostrar campo de Vehículo VN cuando with_vin es true */}
          {withVinWatch && (
            <FormSelect
              name="ap_vehicle_id"
              label="Vehículo VN"
              placeholder="Selecciona un vehículo"
              options={vehiclesVn.map((item) => ({
                label: item.vin + " | " + item.family,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={isLoadingVehiclesVn}
            />
          )}

          {/* Mostrar campos de Modelo VN y Color cuando with_vin es false */}
          {!withVinWatch && (
            <>
              <FormSelect
                name="ap_models_vn_id"
                label="Modelo VN"
                placeholder="Selecciona un modelo"
                options={modelsVn.map((item) => ({
                  label: item.code + " - " + item.version,
                  value: item.id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
                disabled={isLoadingModelsVn}
              />

              <FormSelect
                name="vehicle_color_id"
                label="Color"
                placeholder="Selecciona un color"
                options={color.map((item) => ({
                  label: item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
                startsWith={true}
                sortByLength={true}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 relative">
                  Precio Venta
                  <div className="absolute left-36 text-primary whitespace-nowrap bg-blue-50 px-2 rounded">
                    {originalPrice > 0 && (
                      <span className="text-xs text-primary bg-blue-50 px-1 rounded">
                        Original: {currencySymbol}{" "}
                        {originalPrice.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Ingrese precio de venta"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="warranty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Garantía</FormLabel>
                <FormControl>
                  <Input placeholder="3 años o 100.000km" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/*Seccion de Bonos y Descuentos*/}
        <GroupFormSection
          title="Bonos / Descuentos"
          icon={Gift}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 1 }}
        >
          <BonusDiscountTable
            conceptsOptions={conceptDiscountBond}
            costoReferencia={parseFloat(salePriceWatch || "0")}
            currencySymbol={currencySymbol}
            onRowsChange={setBonusDiscountRows}
            initialData={initialBonusDiscounts}
          />
        </GroupFormSection>

        {/*Seccion Accesorios Homologados*/}
        <GroupFormSection
          title="Accesorios Homologados / Obsequios"
          icon={PackagePlus}
          iconColor="text-gray-500"
          bgColor="bg-gray-50"
          cols={{ sm: 1 }}
        >
          <ApprovedAccessoriesTable
            accessories={approvedAccesories}
            onAccessoriesChange={setAccessoriesRows}
            initialData={initialAccessories}
          />
        </GroupFormSection>

        {/*Seccion Resumen de Facturación*/}
        <GroupFormSection
          title="Resumen de Facturación"
          icon={Calculator}
          iconColor="text-green-700"
          bgColor="bg-green-50"
          cols={{ sm: 2, md: 3 }}
        >
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Precio de Venta:</span>
                <span className="font-medium">
                  {vehicleCurrency.symbol}{" "}
                  {totals.salePrice.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Bonos/Descuentos (no afecta):
                </span>
                <span className="font-medium text-gray-400">
                  {vehicleCurrency.symbol}{" "}
                  {totals.bonusDiscountTotal.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Accesorios:</span>
                <span className="font-medium text-primary">
                  + {vehicleCurrency.symbol}{" "}
                  {totals.accessoriesTotal.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal:</span>
                  <span>
                    {vehicleCurrency.symbol}{" "}
                    {totals.subtotal.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <FormSelect
                name="doc_type_currency_id"
                label="Moneda de Facturación"
                placeholder="Selecciona la moneda"
                options={currencyTypes.map((item) => ({
                  label: `${item.name} (${item.symbol})`,
                  value: item.id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
              />
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-primary">
                    Total a Facturar:
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {selectedInvoiceCurrency?.symbol || vehicleCurrency.symbol}{" "}
                    {finalTotal.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {invoiceCurrencyId &&
                  Number(invoiceCurrencyId) !== vehicleCurrency.currencyId && (
                    <p className="text-xs text-primary mt-1">
                      T.C.:{" "}
                      {Number(
                        getExchangeRate(Number(invoiceCurrencyId))
                      ).toFixed(3)}
                    </p>
                  )}
              </div>
            </div>
          </div>

          <div className="col-span-full mt-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios/Notas (Opcional)</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Agregue cualquier comentario o nota adicional sobre esta cotización/solicitud..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <ConfirmationDialog
            trigger={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
            title="¿Cancelar registro?"
            variant="destructive"
            icon="warning"
            onConfirm={() => {
              router(mode === "create" ? "./" : "../");
            }}
          />

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Solicitud / Cotización"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
