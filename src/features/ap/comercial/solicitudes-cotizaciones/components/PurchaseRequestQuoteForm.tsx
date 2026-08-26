import {
  PurchaseRequestQuoteSchema,
  purchaseRequestQuoteSchemaCreate,
  purchaseRequestQuoteSchemaUpdate,
} from "../lib/purchaseRequestQuote.schema";
import {
  localDatePlusDays,
  getTodayPeruDateString,
} from "@/core/core.function";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Handshake } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { PurchaseRequestQuoteSummary } from "./PurchaseRequestQuoteSummary";
import { useMyOpportunities } from "../../oportunidades/lib/opportunities.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useCustomersById } from "../../clientes/lib/customers.hook";
import { CustomersResource } from "../../clientes/lib/customers.interface";
import { useAllModelsVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { useAllVehicleColor } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.hook";
import { useEffect, useState, useRef, useMemo } from "react";
import { BonusDiscountTable } from "./BonusDiscountTable";
import { ApprovedAccessoriesTable } from "./ApprovedAccessoriesTable";
import { OthersTable, OthersRow } from "./OthersTable";
import { useAllConceptDiscountBond } from "../lib/purchaseRequestQuote.hook";
import { useGeneralMasterByCode } from "@/features/gp/maestros-generales/lib/generalMasters.hook";
import { useAllApprovedAccesories } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { EMPRESA_AP, STATUS_ACTIVE } from "@/core/core.constants";
import {
  useAllVehicles,
  useAllVehiclesWithCosts,
  useVehiclePurchaseOrder,
} from "../../vehiculos/lib/vehicles.hook";
import { PURCHASE_REQUEST_QUOTE } from "../lib/purchaseRequestQuote.constants";
import { OpportunityInfoCard } from "./OpportunityInfoCard";
import { OpportunityResource } from "../../oportunidades/lib/opportunities.interface";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import VehicleColorModal from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/components/VehicleColorModal";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { VehicleInfoSection } from "./VehicleInfoSection";
import { CreditInsuranceGpsSection } from "./CreditInsuranceGpsSection";
import { useQueryClient } from "@tanstack/react-query";
import { VEHICLE_COLOR } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.constants";
import { useExchangeRateByDateAndCurrency } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface PurchaseRequestQuoteFormProps {
  defaultValues: Partial<PurchaseRequestQuoteSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  opportunity?: OpportunityResource;
  onCancel: () => void;
  /** Ya fue aprobada (con o sin facturar). Bloquea precio/vehículo/accesorios/descuentos. */
  isApproved?: boolean;
  /** Pagada en su totalidad. Bloquea todo el formulario. */
  isPaid?: boolean;
}

export const PurchaseRequestQuoteForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  opportunity,
  onCancel,
  isApproved = false,
  isPaid = false,
}: PurchaseRequestQuoteFormProps) => {
  // Una vez aprobada (y mientras no esté pagada en su totalidad), el precio
  // de venta y la moneda de facturación quedan fijos, junto con los
  // accesorios que afectan el precio y los descuentos. El vehículo/modelo/
  // color, bonos, obsequios y "Otros" (margen) siguen editables.
  const priceLocked = mode === "update" && isApproved && !isPaid;
  const fullyLocked = mode === "update" && isPaid;
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { ROUTE } = PURCHASE_REQUEST_QUOTE;
  const defaultDeadline = localDatePlusDays(30);

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? purchaseRequestQuoteSchemaCreate
        : purchaseRequestQuoteSchemaUpdate,
    ),
    defaultValues: {
      quote_deadline: defaultDeadline,
      has_gps_hunter: false,
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { canAssign, canManage } = useModulePermissions(ROUTE);

  // Estados
  const [copyClientToHolder, setCopyClientToHolder] = useState(false);
  const [bonusDiscountRows, setBonusDiscountRows] = useState<any[]>([]);
  const [accessoriesRows, setAccessoriesRows] = useState<any[]>([]);
  const [othersRows, setOthersRows] = useState<OthersRow[]>([]);
  const [invoiceCurrencyId, setInvoiceCurrencyId] = useState<string>("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | undefined>(
    undefined,
  );
  const [selectedHolder, setSelectedHolder] = useState<
    CustomersResource | undefined
  >(undefined);
  // Texto de VIN (debounced) que se busca fuera del filtro de familia,
  // para poder avisar si el VIN existe pero pertenece a otra familia.
  const [vinCrossFamilyQuery, setVinCrossFamilyQuery] = useState("");

  // Hooks de datos
  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });
  // Solo cargar oportunidades si NO viene la prop opportunity
  const shouldFetchOpportunities = !opportunity;
  const { data: opportunitiesResponse, isLoading: isLoadingOpportunities } =
    useMyOpportunities({
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

  const { data: modelsVn = [] } = useAllModelsVn({
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
      is_editing: mode === "update" ? true : false,
    });
  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes({
      enable_commercial: STATUS_ACTIVE,
    });
  const { data: freightMaster } = useGeneralMasterByCode("FREIGHT_COMMERCIAL");

  // Refs
  const isFirstLoadRef = useRef(true);
  const hasInitializedCheckboxRef = useRef(false);
  const hasInitializedSwitchRef = useRef(false);
  const hasInitializedFamilyIdRef = useRef(false);
  const previousVehicleVnRef = useRef<string | undefined>(undefined);
  const previousModelVnRef = useRef<string | undefined>(undefined);
  // Cuando el usuario reasigna la familia manualmente desde OpportunityInfoCard,
  // este ref evita que el effect de sincronización con `opportunity` la sobrescriba de vuelta.
  const familyManuallyEditedRef = useRef(false);
  const vinSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Form watchers
  const modelVnWatch = form.watch("ap_models_vn_id");
  const withVinWatch = form.watch("with_vin");
  const vehicleVnWatch = form.watch("ap_vehicle_id");
  const vehicleColorWatch = form.watch("vehicle_color_id");
  const opportunityWatch = form.watch("opportunity_id");
  const salePriceWatch = form.watch("sale_price");
  const docTypeCurrencyWatch = form.watch("doc_type_currency_id");
  const holderWatch = form.watch("holder_id");
  const sedeIdWatch = form.watch("sede_id");

  // Etiqueta de sede para mostrar en el resumen (el campo ya no es editable en el form)
  const sedeLabel = opportunity?.lead?.sede
    ? opportunity.lead.sede
    : mySedes.find((s) => s.id.toString() === sedeIdWatch)?.abreviatura;

  // Hook para obtener datos de la orden de compra del vehículo
  const { data: vehiclePurchaseOrderData } = useVehiclePurchaseOrder(
    withVinWatch && vehicleVnWatch ? Number(vehicleVnWatch) : null,
  );

  // Búsqueda de VIN sin filtrar por familia, solo para detectar el caso
  // "el VIN existe y está activo, pero pertenece a otra familia".
  const { data: vinCrossFamilyResults = [] } = useAllVehicles(
    withVinWatch && vinCrossFamilyQuery.length >= 5
      ? { search: vinCrossFamilyQuery }
      : undefined,
  );

  // Datos iniciales para las tablas (solo en modo update)
  const [initialBonusDiscounts, setInitialBonusDiscounts] = useState<any[]>([]);
  const [initialAccessories, setInitialAccessories] = useState<any[]>([]);
  const [initialOthers, setInitialOthers] = useState<OthersRow[]>([]);

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
              parent_concept_id: (
                bonus.concept_code_parent_id ?? bonus.concept_code_id
              ).toString(),
              concept_id: bonus.concept_code_id.toString(),
              concept_label: bonus.concept_code,
              isPercentage: isPercentage,
              valor: valor,
              isNegative: bonus.is_negative || false,
              hasRetention: bonus.has_retention || false,
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
            additional_price: Number(acc.additional_price ?? 0),
          }),
        );
        setInitialAccessories(transformedAccessories);
        setAccessoriesRows(transformedAccessories);
      }

      // Transformar otros costos internos desde la respuesta del API
      if (dataWithArrays.others && dataWithArrays.others.length > 0) {
        const transformedOthers: OthersRow[] = dataWithArrays.others.map(
          (other: any) => ({
            id: other.id?.toString() || Date.now().toString(),
            description: other.description,
            type: other.type as "FIJO" | "PORCENTAJE",
            value: Number(other.value),
            isLocked: other.description === "FLETE E INMATRICULACIÓN",
          }),
        );
        setInitialOthers(transformedOthers);
        setOthersRows(transformedOthers);
      }

      setIsInitialLoad(false);
    } else {
      setIsInitialLoad(false);
    }
  }, [mode]);

  // En modo create, pre-cargar el flete como default locked en others
  useEffect(() => {
    if (mode === "create" && freightMaster && initialOthers.length === 0) {
      const freightValue = parseFloat(freightMaster.value ?? "0") || 0;
      if (freightValue > 0) {
        const defaultOthers: OthersRow[] = [
          {
            id: "flete-default",
            description: "FLETE E INMATRICULACIÓN",
            type: "FIJO",
            value: freightValue,
            isLocked: true,
          },
        ];
        // Setear también othersRows para garantizar que el flete se envíe
        // incluso si OthersTable no se renderiza (usuario sin canManage)
        setInitialOthers(defaultOthers);
        setOthersRows(defaultOthers);
      }
    }
  }, [mode, freightMaster]);

  // Obtener el vehiculo seleccionado
  const vehicleVnSelected = vehiclesVn.find(
    (vehicle) => vehicle.id === Number(vehicleVnWatch),
  );

  // Detecta si el VIN escrito por el usuario existe y está activo, pero en
  // una familia distinta a la seleccionada (por eso no aparece en el listado filtrado).
  const vinFamilyMismatch = useMemo(() => {
    if (!vinCrossFamilyQuery || !selectedFamilyId) return null;

    const match = vinCrossFamilyResults.find(
      (vehicle) =>
        vehicle.vin?.toUpperCase() === vinCrossFamilyQuery.toUpperCase(),
    );
    if (!match) return null;
    if (match.model?.family_id === selectedFamilyId) return null;
    if (!match.status) return null; // solo avisar si está activo

    return match;
  }, [vinCrossFamilyResults, vinCrossFamilyQuery, selectedFamilyId]);

  // Debounce del texto de búsqueda del VIN para no disparar una consulta por tecla
  const handleVinSearch = (value: string) => {
    if (vinSearchTimeoutRef.current) {
      clearTimeout(vinSearchTimeoutRef.current);
    }
    vinSearchTimeoutRef.current = setTimeout(() => {
      setVinCrossFamilyQuery(value.trim());
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (vinSearchTimeoutRef.current) {
        clearTimeout(vinSearchTimeoutRef.current);
      }
    };
  }, []);

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

  // Effect para limpiar campos cuando se cambia el switch (solo si no es carga inicial)
  useEffect(() => {
    if (!isInitialLoad) {
      form.setValue("ap_models_vn_id", "");
      form.setValue("vehicle_color_id", "");
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
        // Solo actualizar el precio si actualmente no hay precio o es 0
        const currentSalePrice = parseFloat(
          form.getValues("sale_price") || "0",
        );
        if (!currentSalePrice) {
          form.setValue("sale_price", originalPrice.toString());
        }
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
            // Solo actualizar el precio si actualmente no hay precio o es 0
            const currentSalePrice = parseFloat(
              form.getValues("sale_price") || "0",
            );
            if (!currentSalePrice) {
              const newPrice = modelOfSelectedVehicle.sale_price || 0;
              form.setValue("sale_price", newPrice.toString());
            }
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

  // Effect para setear sede_id automáticamente cuando viene la prop opportunity con sede desde el lead
  useEffect(() => {
    if (opportunity?.lead?.sede_id) {
      form.setValue("sede_id", opportunity.lead.sede_id.toString());
    }
  }, [opportunity]);

  // Effect para setear sede_id automáticamente con la (única) sede del usuario
  // cuando no viene definida por la oportunidad. El campo ya no se muestra en
  // el formulario, así que se resuelve solo.
  useEffect(() => {
    if (
      mode === "create" &&
      !opportunity?.lead?.sede_id &&
      mySedes.length > 0 &&
      !form.getValues("sede_id")
    ) {
      form.setValue("sede_id", mySedes[0].id.toString());
    }
  }, [mode, opportunity, mySedes]);

  // Effect para setear type_document automáticamente según el switch Con/Sin VIN:
  // Con VIN -> Cotización, Sin VIN -> Solicitud de Compra. Ya no es un campo editable.
  useEffect(() => {
    form.setValue(
      "type_document",
      withVinWatch ? "COTIZACION" : "SOLICITUD_COMPRA",
    );
  }, [withVinWatch]);

  // Effect para actualizar family_id cuando cambia la oportunidad seleccionada o viene la prop opportunity
  useEffect(() => {
    // Si viene la prop opportunity directamente, usar su family_id
    // (salvo que el usuario ya la haya reasignado manualmente desde la tarjeta).
    if (opportunity && opportunity.family_id) {
      if (!familyManuallyEditedRef.current) {
        setSelectedFamilyId(opportunity.family_id);
      }
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

  // Tipo de cambio oficial (SBS) para USD
  const today = getTodayPeruDateString();
  const usdCurrencyId = currencyTypes.find((c) => c.code === "USD")?.id ?? null;
  const { data: usdExchangeRateData } = useExchangeRateByDateAndCurrency(
    usdCurrencyId,
    today,
  );

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
  // Para USD usa el tipo de cambio oficial SBS del día; para otras monedas usa current_exchange_rate
  const getExchangeRate = (currencyId: number): number => {
    if (usdCurrencyId && currencyId === usdCurrencyId) {
      return (
        usdExchangeRateData?.rate ??
        currencyTypes.find((c) => c.id === currencyId)?.current_exchange_rate ??
        1
      );
    }
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

    // Calcular accesorios con la moneda correcta según type_operation_id
    // 794 = Comercial → USD | 804 = Posventa → PEN
    // Excluir obsequios del cálculo
    const solesId = currencyTypes.find((c) => c.code === "PEN")?.id || 3;
    const usdId = currencyTypes.find((c) => c.code === "USD")?.id || 1;
    const accessoriesTotal = accessoriesRows.reduce((total, row) => {
      if (row.type === "OBSEQUIO") {
        return total;
      }

      const accessory = approvedAccesories.find(
        (acc) => acc.id === row.accessory_id,
      );
      if (accessory) {
        const unitPrice = Number(accessory.price) + (row.additional_price ?? 0);
        const accessoryPrice = unitPrice * row.quantity;
        const accessoryCurrencyId =
          accessory.type_operation_id === CM_COMERCIAL_ID ? usdId : solesId;

        return (
          total +
          convertAmount(accessoryPrice, accessoryCurrencyId, vehicleCurrencyId)
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

    const round2 = (n: number) => Math.round(n * 100) / 100;
    return {
      salePrice: round2(salePrice),
      bonusDiscountTotal: round2(bonusDiscountTotal),
      accessoriesTotal: round2(accessoriesTotal),
      negativeDiscounts: round2(negativeDiscounts),
      subtotal: round2(subtotal),
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
        type: row.isPercentage ? "PORCENTAJE" : "FIJO",
        value: row.valor,
        has_retention: row.hasRetention || false,
      };
    });
  };

  const round2 = (n: number) => Math.round(n * 100) / 100;

  // Transformar datos de accesorios para el envío
  const transformAccessoriesData = () => {
    return accessoriesRows.map((row) => ({
      accessory_id: row.accessory_id,
      quantity: row.quantity,
      type: row.type,
      ...(row.additional_price && row.additional_price > 0
        ? { additional_price: round2(row.additional_price) }
        : {}),
    }));
  };

  // Función de envío personalizada
  const handleFormSubmit = (data: any) => {
    const bonusDiscountData = transformBonusDiscountData();
    const accessoriesData = transformAccessoriesData();
    const othersData = othersRows.map((row) => ({
      description: row.description,
      type: row.type,
      value: row.value,
      is_locked: row.isLocked,
    }));

    const finalData = {
      ...data,
      bonus_discounts: bonusDiscountData,
      accessories: accessoriesData,
      others: othersData,
      type_currency_id: vehicleCurrency.currencyId,
      base_selling_price: round2(totals.salePrice),
      sale_price: round2(totals.salePrice + totals.accessoriesTotal),
      doc_sale_price: round2(finalTotal),
      down_payment: data.down_payment
        ? parseFloat(data.down_payment)
        : undefined,
      credit_type_id: data.credit_type_id ? Number(data.credit_type_id) : null,
      credit_entity_id: data.credit_entity_id
        ? Number(data.credit_entity_id)
        : null,
      insurance_entity_id: data.insurance_entity_id
        ? Number(data.insurance_entity_id)
        : null,
      has_gps_hunter: !!data.has_gps_hunter,
      gps_hunter_years:
        data.has_gps_hunter && data.gps_hunter_years
          ? parseInt(data.gps_hunter_years, 10)
          : null,
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
        {fullyLocked && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Pagada en su totalidad</AlertTitle>
            <AlertDescription>
              Esta {form.watch("type_document") === "COTIZACION" ? "cotización" : "solicitud de compra"} ya
              fue pagada en su totalidad y no puede modificarse.
            </AlertDescription>
          </Alert>
        )}
        {priceLocked && (
          <Alert variant="warning" className="mb-6">
            <AlertTitle>Aprobada</AlertTitle>
            <AlertDescription>
              Ya fue aprobada: el precio de venta, la moneda de facturación,
              los accesorios que afectan el precio y los descuentos ya no se
              pueden modificar. Aún puedes cambiar el vehículo/modelo/color,
              agregar bonos, obsequios (no afectan el precio), ajustar
              "Otros" (margen) y editar los demás datos.
            </AlertDescription>
          </Alert>
        )}
        <fieldset
          disabled={fullyLocked}
          className="contents m-0 p-0 border-0 min-w-0"
        >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Formulario (3 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/*Seccion Oportunidad + Información General, lado a lado*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarjeta de la oportunidad cuando viene por prop; si no, selector */}
              {opportunity ? (
                <OpportunityInfoCard
                  opportunity={opportunity}
                  canEditFamily
                  onFamilyChange={(familyId) => {
                    familyManuallyEditedRef.current = true;
                    setSelectedFamilyId(familyId);
                    form.setValue("ap_models_vn_id", "");
                    form.setValue("vehicle_color_id", "");
                    form.setValue("ap_vehicle_id", "");
                  }}
                />
              ) : (
                <GroupFormSection
                  title="Oportunidad"
                  icon={Handshake}
                  color="blue"
                  cols={{ sm: 1, md: 1 }}
                >
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
                </GroupFormSection>
              )}

              <GeneralInfoSection
                control={form.control}
                copyClientToHolder={copyClientToHolder}
                setCopyClientToHolder={setCopyClientToHolder}
                holderDefaultOption={holderDefaultOption}
                setSelectedHolder={setSelectedHolder}
                currencyTypes={currencyTypes}
                disableCurrency={priceLocked}
              />
            </div>

            {/*Seccion Información de Vehiculo*/}
            <VehicleInfoSection
              control={form.control}
              canAssign={canAssign}
              canManage={canManage}
              withVinWatch={withVinWatch}
              vehiclesVn={vehiclesVn}
              isLoadingVehiclesVn={isLoadingVehiclesVn}
              handleVinSearch={handleVinSearch}
              vinFamilyMismatch={vinFamilyMismatch}
              vehicleVnWatch={vehicleVnWatch}
              vehiclePurchaseOrderData={vehiclePurchaseOrderData}
              selectedFamilyId={selectedFamilyId}
              setIsColorModalOpen={setIsColorModalOpen}
              salePriceWatch={salePriceWatch}
              originalPrice={originalPrice}
              currencySymbol={currencySymbol}
              modelVnWatch={modelVnWatch}
              selectedModel={selectedModel}
              billedCost={billedCost}
              priceLocked={priceLocked}
            />

            {/*Seccion Créditos, Seguros y GPS*/}
            <CreditInsuranceGpsSection
              control={form.control}
              setValue={form.setValue}
            />

            {/*Seccion de Bonos y Descuentos*/}

            <BonusDiscountTable
              conceptsOptions={conceptDiscountBond}
              costoReferencia={parseFloat(salePriceWatch || "0")}
              currencySymbol={currencySymbol}
              onRowsChange={setBonusDiscountRows}
              initialData={initialBonusDiscounts}
              lockDiscounts={priceLocked}
            />

            {/*Seccion Accesorios Homologados*/}
            <ApprovedAccessoriesTable
              accessories={approvedAccesories}
              onAccessoriesChange={setAccessoriesRows}
              initialData={initialAccessories}
              canCreateApprovedAccessory={canAssign}
              invoiceCurrencyId={
                invoiceCurrencyId ? Number(invoiceCurrencyId) : undefined
              }
              getExchangeRate={getExchangeRate}
              lockPaidAccessories={priceLocked}
            />

            {/*Seccion Otros Costos Internos — solo ADV (canManage)*/}
            {canManage && (
              <OthersTable
                currencySymbol={currencySymbol}
                salePrice={parseFloat(salePriceWatch || "0")}
                onRowsChange={setOthersRows}
                initialData={initialOthers}
                showCommissionSuggestion={true}
                freightValue={
                  freightMaster
                    ? parseFloat(freightMaster.value ?? "0") || undefined
                    : undefined
                }
              />
            )}
          </div>

          {/* Columna derecha: Oportunidad + Resumen - sticky */}
          <div className="lg:col-span-1 lg:row-start-1 lg:col-start-3 space-y-6">
            <PurchaseRequestQuoteSummary
              form={form}
              mode={mode}
              isSubmitting={isSubmitting}
              sedeLabel={sedeLabel}
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
              currencyTypes={currencyTypes}
              billedCost={billedCost}
              bonusDiscountRows={bonusDiscountRows}
              accessoriesRows={accessoriesRows}
              othersRows={othersRows}
              approvedAccesories={approvedAccesories}
              canManage={canManage}
              onCancel={onCancel}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
        </fieldset>
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
