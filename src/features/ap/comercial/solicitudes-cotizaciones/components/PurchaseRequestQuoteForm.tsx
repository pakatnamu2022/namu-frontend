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
import { Building2, Plus } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { FormInput } from "@/shared/components/FormInput";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { PurchaseRequestQuoteSummary } from "./PurchaseRequestQuoteSummary";
import { useMyOpportunities } from "../../oportunidades/lib/opportunities.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  useCustomers,
  useCustomersById,
} from "../../clientes/lib/customers.hook";
import { CustomersResource } from "../../clientes/lib/customers.interface";
import { useAllModelsVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { useAllVehicleColor } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.hook";
import { useEffect, useState, useRef, useMemo } from "react";
import { BonusDiscountTable } from "./BonusDiscountTable";
import { ApprovedAccessoriesTable } from "./ApprovedAccessoriesTable";
import { useAllConceptDiscountBond } from "../lib/purchaseRequestQuote.hook";
import { useAllApprovedAccesories } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.hook";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { EMPRESA_AP, STATUS_ACTIVE } from "@/core/core.constants";
import {
  useAllVehiclesWithCosts,
  useVehiclePurchaseOrder,
} from "../../vehiculos/lib/vehicles.hook";
import { PURCHASE_REQUEST_QUOTE } from "../lib/purchaseRequestQuote.constants";
import { PurchaseOrderAccessoriesCard } from "./PurchaseOrderAccessoriesCard";
import { OpportunityInfoCard } from "./OpportunityInfoCard";
import { OpportunityResource } from "../../oportunidades/lib/opportunities.interface";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import VehicleColorModal from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/components/VehicleColorModal";
import { useQueryClient } from "@tanstack/react-query";
import { VEHICLE_COLOR } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.constants";

interface PurchaseRequestQuoteFormProps {
  defaultValues: Partial<PurchaseRequestQuoteSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  opportunity?: OpportunityResource;
  onCancel: () => void;
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
  opportunity,
  onCancel,
}: PurchaseRequestQuoteFormProps) => {
  const isMobile = useIsMobile();
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { ROUTE } = PURCHASE_REQUEST_QUOTE;
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? purchaseRequestQuoteSchemaCreate
        : purchaseRequestQuoteSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { canAssign } = useModulePermissions(ROUTE);

  // Estados
  const [copyClientToHolder, setCopyClientToHolder] = useState(false);
  const [bonusDiscountRows, setBonusDiscountRows] = useState<any[]>([]);
  const [accessoriesRows, setAccessoriesRows] = useState<any[]>([]);
  const [invoiceCurrencyId, setInvoiceCurrencyId] = useState<string>("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | undefined>(
    undefined,
  );
  const [selectedHolder, setSelectedHolder] = useState<
    CustomersResource | undefined
  >(undefined);

  // Hooks de datos
  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });
  // Solo cargar oportunidades si NO viene la prop opportunity
  const shouldFetchOpportunities = !opportunity;
  const {
    data: opportunitiesResponse,
    isLoading: isLoadingOpportunities,
  } = useMyOpportunities({
    has_purchase_request_quote: 0,
    opportunity_id:
      mode === "update" && defaultValues.opportunity_id
        ? Number(defaultValues.opportunity_id)
        : undefined,
  });

  // Usar un array vacío si no debemos cargar oportunidades (cuando viene la prop opportunity)
  const opportunities: OpportunityResource[] = shouldFetchOpportunities
    ? (opportunitiesResponse?.data ?? [])
    : [];

  // Hook para cargar el holder inicial en modo update
  const { data: loadedHolder } = useCustomersById(
    defaultValues.holder_id ? Number(defaultValues.holder_id) : 0,
  );

  // Sincronizar con el holder cargado cuando cambie
  useEffect(() => {
    if (loadedHolder && loadedHolder.id !== selectedHolder?.id) {
      setSelectedHolder(loadedHolder);
    }
  }, [loadedHolder]);

  // Default option para el FormSelectAsync de holder
  const holderDefaultOption = useMemo(() => {
    if (selectedHolder) {
      return {
        value: selectedHolder.id.toString(),
        label: selectedHolder.full_name,
      };
    }
    return undefined;
  }, [selectedHolder]);

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
    useAllVehiclesWithCosts({
      family_id: selectedFamilyId,
    });
  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes({
      enable_commercial: STATUS_ACTIVE,
    });

  // Refs
  const isFirstLoadRef = useRef(true);
  const hasInitializedCheckboxRef = useRef(false);
  const hasInitializedSwitchRef = useRef(false);
  const hasInitializedFamilyIdRef = useRef(false);
  const previousVehicleVnRef = useRef<string | undefined>(undefined);
  const previousModelVnRef = useRef<string | undefined>(undefined);

  // Form watchers
  const modelVnWatch = form.watch("ap_models_vn_id");
  const withVinWatch = form.watch("with_vin");
  const vehicleVnWatch = form.watch("ap_vehicle_id");
  const vehicleColorWatch = form.watch("vehicle_color_id");
  const opportunityWatch = form.watch("opportunity_id");
  const salePriceWatch = form.watch("sale_price");
  const docTypeCurrencyWatch = form.watch("doc_type_currency_id");
  const holderWatch = form.watch("holder_id");

  // Hook para obtener datos de la orden de compra del vehículo
  const { data: vehiclePurchaseOrderData } = useVehiclePurchaseOrder(
    withVinWatch && vehicleVnWatch ? Number(vehicleVnWatch) : null,
  );

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
              isNegative: bonus.is_negative || false,
            };
          },
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
          }),
        );
        setInitialAccessories(transformedAccessories);
        setAccessoriesRows(transformedAccessories);
      }

      setIsInitialLoad(false);
    } else {
      setIsInitialLoad(false);
    }
  }, [mode]);

  // Obtener el vehiculo seleccionado
  const vehicleVnSelected = vehiclesVn.find(
    (vehicle) => vehicle.id === Number(vehicleVnWatch),
  );

  // Obtener el modelo seleccionado y su precio original
  // Si está CON VIN: buscar por el modelo del vehículo
  // Si está SIN VIN: buscar directamente por el modelVnWatch
  const selectedModel = withVinWatch
    ? modelsVn.find((model) => model.id === vehicleVnSelected?.ap_models_vn_id)
    : modelsVn.find((model) => model.id === Number(modelVnWatch));

  const originalPrice = selectedModel?.sale_price || 0;
  const currencySymbol = selectedModel?.currency_symbol || "S/";

  // Obtener el billed_cost del vehículo seleccionado (cuando se selecciona con VIN)
  const billedCost = vehicleVnSelected?.billed_cost
    ? parseFloat(vehicleVnSelected.billed_cost.toString())
    : 0;

  // Calcular el margen de ganancia
  const calculateMargin = () => {
    const salePrice = parseFloat(salePriceWatch || "0");
    const basePrice = withVinWatch ? billedCost : 0;

    if (basePrice === 0 || salePrice === 0) return { amount: 0, percentage: 0 };

    const marginAmount = salePrice - basePrice;
    const marginPercentage = (marginAmount / basePrice) * 100;

    return {
      amount: marginAmount,
      percentage: marginPercentage,
    };
  };

  const margin = calculateMargin();

  // Effect para limpiar campos cuando se cambia el switch (solo si no es carga inicial)
  useEffect(() => {
    if (!isInitialLoad) {
      form.setValue("ap_models_vn_id", "");
      form.setValue("vehicle_color_id", "");
      form.setValue("sale_price", "0");
      form.setValue("ap_vehicle_id", "");
      // Limpiar las referencias
      previousVehicleVnRef.current = undefined;
      previousModelVnRef.current = undefined;
    }
  }, [withVinWatch]);

  // Effect para re-validar cuando cambian los campos relevantes
  useEffect(() => {
    if (!isInitialLoad) {
      // Disparar validación del campo with_vin cuando cambian los valores
      form.trigger("with_vin");
    }
  }, [
    withVinWatch,
    vehicleVnWatch,
    modelVnWatch,
    vehicleColorWatch,
    isInitialLoad,
    form,
  ]);

  // Effect para actualizar el precio cuando cambia el modelo (solo si no es carga inicial y es modo create)
  useEffect(() => {
    if (!isInitialLoad && mode === "create" && !withVinWatch && modelVnWatch) {
      // Solo actualizar si el modelo realmente cambió
      if (previousModelVnRef.current !== modelVnWatch) {
        previousModelVnRef.current = modelVnWatch;
        // Siempre actualizar el precio, incluso si es 0
        form.setValue("sale_price", originalPrice.toString());
      }
    }
  }, [modelVnWatch, originalPrice, isInitialLoad, withVinWatch]);

  // Effect para auto-completar campos cuando se selecciona un vehículo VN (solo si no es carga inicial)
  useEffect(() => {
    if (!isInitialLoad && withVinWatch && vehicleVnWatch) {
      // Solo actualizar si el vehículo realmente cambió
      if (previousVehicleVnRef.current !== vehicleVnWatch) {
        previousVehicleVnRef.current = vehicleVnWatch;

        const selectedVehicle = vehiclesVn.find(
          (vehicle) => vehicle.id === Number(vehicleVnWatch),
        );
        if (selectedVehicle) {
          form.setValue(
            "ap_models_vn_id",
            String(selectedVehicle.ap_models_vn_id),
          );
          form.setValue(
            "vehicle_color_id",
            String(selectedVehicle.vehicle_color_id),
          );

          // Actualizar el precio de venta basado en el modelo del vehículo seleccionado
          const modelOfSelectedVehicle = modelsVn.find(
            (model) => model.id === Number(selectedVehicle.ap_models_vn_id),
          );
          if (modelOfSelectedVehicle && mode === "create") {
            // Siempre actualizar el precio, incluso si es 0
            const newPrice = modelOfSelectedVehicle.sale_price || 0;
            form.setValue("sale_price", newPrice.toString());
          }
        }
      }
    }
  }, [vehicleVnWatch, isInitialLoad, withVinWatch]);

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
  }, [isInitialLoad]);

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
        (opp) => opp.id.toString() === opportunityWatch,
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
  }, [isInitialLoad, opportunityWatch, holderWatch]);

  // Effect para manejar cambios en el checkbox (solo interacciones del usuario)
  useEffect(() => {
    // Skip en la primera carga
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    // Solo ejecutar si NO estamos en el proceso de inicialización
    if (hasInitializedCheckboxRef.current || mode === "create") {
      if (copyClientToHolder) {
        // Primero intentar usar la prop opportunity si está disponible
        if (opportunity) {
          form.setValue("holder_id", opportunity.client.id.toString());
          // Actualizar el selectedHolder con los datos del cliente de la oportunidad
          setSelectedHolder(opportunity.client as CustomersResource);
        } else if (opportunityWatch) {
          // Si no hay prop, buscar en el array de oportunidades
          const selectedOpportunity = opportunities.find(
            (opp) => opp.id.toString() === opportunityWatch,
          );
          if (selectedOpportunity) {
            form.setValue(
              "holder_id",
              selectedOpportunity.client.id.toString(),
            );
            // Actualizar el selectedHolder con los datos del cliente de la oportunidad
            setSelectedHolder(selectedOpportunity.client as CustomersResource);
          }
        }
      } else if (!copyClientToHolder) {
        form.setValue("holder_id", "");
        setSelectedHolder(undefined);
      }
    }
  }, [copyClientToHolder, opportunityWatch, opportunity]);

  // Effect para actualizar family_id cuando cambia la oportunidad seleccionada o viene la prop opportunity
  useEffect(() => {
    // Si viene la prop opportunity directamente, usar su family_id
    if (opportunity && opportunity.family_id) {
      setSelectedFamilyId(opportunity.family_id);
      if (!hasInitializedFamilyIdRef.current) {
        hasInitializedFamilyIdRef.current = true;
      }
      return;
    }

    // Si no, usar la lógica normal de selección desde el formulario
    if (opportunityWatch && opportunities.length > 0) {
      const selectedOpportunity = opportunities.find(
        (opp) => opp.id.toString() === opportunityWatch,
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
    } else if (!opportunityWatch && !opportunity) {
      setSelectedFamilyId(undefined);
      hasInitializedFamilyIdRef.current = false;
    }
  }, [opportunityWatch, isInitialLoad, selectedFamilyId, opportunity]);

  // Effect para sincronizar la moneda de facturación seleccionada
  useEffect(() => {
    if (docTypeCurrencyWatch) {
      setInvoiceCurrencyId(docTypeCurrencyWatch);
    }
  }, [docTypeCurrencyWatch]);

  // Effect para seleccionar la primera moneda por defecto en modo create
  useEffect(() => {
    if (
      mode === "create" &&
      currencyTypes.length > 0 &&
      !form.getValues("doc_type_currency_id")
    ) {
      form.setValue("doc_type_currency_id", currencyTypes[0].id.toString());
    }
  }, [currencyTypes, mode]);

  // Obtener la moneda del vehículo (modelo VN o vehículo VN)
  const getVehicleCurrency = () => {
    if (withVinWatch && vehicleVnWatch) {
      const selectedVehicle = vehiclesVn.find(
        (vehicle) => vehicle.id === Number(vehicleVnWatch),
      );
      if (selectedVehicle) {
        const modelOfVehicle = modelsVn.find(
          (model) => model.id === Number(selectedVehicle.ap_models_vn_id),
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
    toCurrencyId: number,
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
    // Los bonos/descuentos con isNegative SÍ afectan el precio final (se restan)
    const bonusDiscountTotal = bonusDiscountRows.reduce((total, row) => {
      const valor = row.isPercentage
        ? (salePrice * row.valor) / 100
        : row.valor;
      return row.isNegative ? 0 : total + valor;
    }, 0);

    // Calcular accesorios (siempre en soles, necesitan conversión)
    // Excluir obsequios del cálculo
    const solesId = currencyTypes.find((c) => c.code === "PEN")?.id || 1;
    const accessoriesTotal = accessoriesRows.reduce((total, row) => {
      if (row.type === "OBSEQUIO") {
        return total;
      }

      const accessory = approvedAccesories.find(
        (acc) => acc.id === row.accessory_id,
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

    // Calcular descuentos negativos (los que sí afectan el precio final)
    const negativeDiscounts = bonusDiscountRows.reduce((total, row) => {
      if (row.isNegative) {
        const valor = row.isPercentage
          ? (salePrice * row.valor) / 100
          : row.valor;
        return total + valor;
      }
      return total;
    }, 0);

    // Subtotal: precio de venta + accesorios - descuentos negativos

    const subtotal = salePrice + accessoriesTotal - negativeDiscounts;

    return {
      salePrice,
      bonusDiscountTotal,
      accessoriesTotal,
      negativeDiscounts,
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
      Number(invoiceCurrencyId),
    );
  };

  const finalTotal = getFinalTotal();
  const selectedInvoiceCurrency = currencyTypes.find(
    (c) => c.id === Number(invoiceCurrencyId),
  );

  // Transformar datos de bonos/descuentos para el envío
  const transformBonusDiscountData = () => {
    return bonusDiscountRows.map((row) => {
      return {
        concept_id: row.concept_id,
        description: row.descripcion,
        type: row.isPercentage ? "PORCENTAJE" : "FIJO",
        value: row.valor,
        is_negative: row.isNegative,
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
      sale_price: totals.salePrice + totals.accessoriesTotal,
      doc_sale_price: finalTotal,
    };

    onSubmit(finalData);
  };

  if (
    isLoadingOpportunities ||
    isLoadingColor ||
    isLoadingConceptDiscountBond ||
    isLoadingApprovedAccesories ||
    isLoadingCurrencyTypes ||
    isLoadingMySedes
  )
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Formulario (3 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mostrar la tarjeta de información de oportunidad cuando viene la prop */}
            {opportunity && (
              <div className="col-span-full">
                <OpportunityInfoCard opportunity={opportunity} />
              </div>
            )}

            {/*Seccion Información General*/}
            <GroupFormSection
              title="Información General"
              icon={Building2}
              iconColor="text-primary"
              bgColor="bg-blue-50"
              cols={{ sm: 1, md: 2 }}
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

              {/* Solo mostrar el selector de oportunidad si NO viene la prop opportunity */}
              {!opportunity && (
                <FormSelect
                  name="opportunity_id"
                  label="Oportunidad"
                  placeholder="Selecciona una oportunidad"
                  options={opportunities.map((item) => ({
                    label: item.client.full_name,
                    description:
                      item.family.brand + " - " + item.family.description,
                    value: item.id.toString(),
                  }))}
                  control={form.control}
                  strictFilter={true}
                />
              )}

              <div className="relative">
                <FormSelectAsync
                  name="holder_id"
                  label="Titular"
                  placeholder="Selecciona un titular"
                  control={form.control}
                  disabled={copyClientToHolder}
                  useQueryHook={useCustomers}
                  mapOptionFn={(customer: CustomersResource) => ({
                    value: customer.id.toString(),
                    label: customer.full_name,
                  })}
                  perPage={10}
                  debounceMs={500}
                  defaultOption={holderDefaultOption}
                  onValueChange={(_, customer) => {
                    setSelectedHolder(
                      customer as CustomersResource | undefined,
                    );
                  }}
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
                    Mismo que la Oportunidad
                  </label>
                </div>
              </div>

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
            </GroupFormSection>

            {/*Seccion Información de Vehiculo*/}
            <GroupFormSection
              title="Información del Vehículo"
              icon={Building2}
              iconColor="text-gray-500"
              bgColor="bg-gray-50"
              cols={{ sm: 1, md: 2 }}
            >
              {/* Switch para seleccionar Con VIN o Sin VIN */}
              {canAssign && (
                <FormSwitch
                  control={form.control}
                  name="with_vin"
                  label="Modo de Selección de Vehículo"
                  text={withVinWatch ? "Con VIN" : "Sin VIN"}
                />
              )}
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

              {/* Mostrar accesorios de la orden de compra cuando se selecciona un VIN */}
              {withVinWatch &&
                vehicleVnWatch &&
                vehiclePurchaseOrderData?.purchase_order?.items && (
                  <div className="col-span-full">
                    <PurchaseOrderAccessoriesCard
                      items={vehiclePurchaseOrderData.purchase_order.items}
                      purchaseOrderNumber={
                        vehiclePurchaseOrderData.purchase_order.number
                      }
                      currencySymbol={
                        vehiclePurchaseOrderData.purchase_order.currency_code
                      }
                    />
                  </div>
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
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size={isMobile ? "icon-sm" : "icon-lg"}
                      className="aspect-square"
                      onClick={() => setIsColorModalOpen(true)}
                      title="Agregar nuevo color"
                    >
                      <Plus className="size-2 md:size-4" />
                    </Button>
                  </FormSelect>
                </>
              )}

              <FormInput
                control={form.control}
                name="sale_price"
                label={
                  <div className="flex items-center gap-2 relative">
                    Precio Venta
                    <div className="absolute left-36 text-primary whitespace-nowrap bg-blue-50 px-2 rounded">
                      {originalPrice > 0 && !withVinWatch && (
                        <span className="text-xs text-primary bg-blue-50 px-1 rounded">
                          Original: {currencySymbol}{" "}
                          {originalPrice.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                      {originalPrice === 0 && !withVinWatch && modelVnWatch && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-1 rounded">
                          ⚠️ Modelo sin precio configurado
                        </span>
                      )}
                    </div>
                  </div>
                }
                type="text"
                placeholder="Ingrese precio de venta"
              >
                {/* Mostrar información adicional según el modo */}
                {withVinWatch && vehicleVnWatch && (
                  <div className="mt-2 space-y-1 w-full">
                    {billedCost > 0 ? (
                      <>
                        <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          <span className="font-medium">Costo Facturado:</span>{" "}
                          {currencySymbol}{" "}
                          {billedCost.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        {margin.amount !== 0 && (
                          <div
                            className={`text-xs px-2 py-1 rounded ${
                              margin.amount > 0
                                ? "text-green-700 bg-green-50"
                                : "text-red-700 bg-red-50"
                            }`}
                          >
                            <span className="font-medium">Margen:</span>{" "}
                            {currencySymbol}{" "}
                            {margin.amount.toLocaleString("es-PE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            ({margin.percentage > 0 ? "+" : ""}
                            {margin.percentage.toFixed(2)}%)
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        ⚠️ Este vehículo no tiene costo de compra registrado.
                        Revisar el registro del vehículo.
                      </div>
                    )}
                    {parseFloat(salePriceWatch || "0") === 0 && (
                      <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded font-medium">
                        {!selectedModel ? (
                          <>
                            ⚠️ <strong>Precio de venta en 0:</strong> No se pudo
                            cargar la información del modelo de este vehículo.
                            Verifique que el vehículo pertenezca a la familia de
                            la oportunidad seleccionada.
                          </>
                        ) : originalPrice === 0 ? (
                          <>
                            ⚠️ <strong>Precio de venta en 0:</strong> El modelo{" "}
                            <strong>"{selectedModel.code}"</strong> (ID:{" "}
                            {selectedModel.id}) de este vehículo no tiene precio
                            de venta configurado. Ir a Configuraciones → Modelos
                            VN para agregarlo.
                          </>
                        ) : (
                          <>
                            ⚠️ <strong>Precio de venta en 0:</strong> Se
                            estableció manualmente, pero el modelo tiene
                            configurado {currencySymbol}{" "}
                            {originalPrice.toLocaleString("es-PE", {
                              minimumFractionDigits: 2,
                            })}
                            . Verifique si esto es correcto.
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Mostrar diagnóstico cuando NO hay VIN y el precio es 0 */}
                {!withVinWatch &&
                  modelVnWatch &&
                  parseFloat(salePriceWatch || "0") === 0 && (
                    <div className="mt-2 w-full">
                      <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded font-medium">
                        {!selectedModel ? (
                          <>
                            ⚠️ <strong>Precio de venta en 0:</strong> No se pudo
                            cargar la información del modelo seleccionado.
                          </>
                        ) : originalPrice === 0 ? (
                          <>
                            ⚠️ <strong>Precio de venta en 0:</strong> El modelo{" "}
                            <strong>"{selectedModel.code}"</strong> (ID:{" "}
                            {selectedModel.id}) no tiene precio de venta
                            configurado. Ir a Configuraciones → Modelos VN para
                            agregarlo.
                          </>
                        ) : (
                          <>
                            ⚠️ <strong>Precio de venta en 0:</strong> Se
                            estableció manualmente, pero el modelo tiene
                            configurado {currencySymbol}{" "}
                            {originalPrice.toLocaleString("es-PE", {
                              minimumFractionDigits: 2,
                            })}
                            . Verifique si esto es correcto.
                          </>
                        )}
                      </div>
                    </div>
                  )}
              </FormInput>

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

            <BonusDiscountTable
              conceptsOptions={conceptDiscountBond}
              costoReferencia={parseFloat(salePriceWatch || "0")}
              currencySymbol={currencySymbol}
              onRowsChange={setBonusDiscountRows}
              initialData={initialBonusDiscounts}
            />

            {/*Seccion Accesorios Homologados*/}
            <ApprovedAccessoriesTable
              accessories={approvedAccesories}
              onAccessoriesChange={setAccessoriesRows}
              initialData={initialAccessories}
            />
          </div>

          {/* Columna derecha: Resumen - sticky */}
          <PurchaseRequestQuoteSummary
            form={form}
            mode={mode}
            isSubmitting={isSubmitting}
            selectedHolder={selectedHolder}
            modelsVn={modelsVn}
            vehiclesVn={vehiclesVn}
            vehicleColors={color}
            withVinWatch={withVinWatch}
            vehicleVnWatch={vehicleVnWatch}
            modelVnWatch={modelVnWatch}
            vehicleColorWatch={vehicleColorWatch}
            selectedModel={selectedModel}
            vehicleCurrency={vehicleCurrency}
            totals={totals}
            finalTotal={finalTotal}
            invoiceCurrencyId={invoiceCurrencyId}
            selectedInvoiceCurrency={selectedInvoiceCurrency}
            getExchangeRate={getExchangeRate}
            onCancel={onCancel}
            onSubmit={handleFormSubmit}
          />
        </div>
      </form>
      <VehicleColorModal
        open={isColorModalOpen}
        onClose={async () => {
          setIsColorModalOpen(false);
          await queryClient.invalidateQueries({
            queryKey: [VEHICLE_COLOR.QUERY_KEY],
          });
        }}
        title="Nuevo Color de Vehículo"
        mode="create"
      />
    </Form>
  );
};
