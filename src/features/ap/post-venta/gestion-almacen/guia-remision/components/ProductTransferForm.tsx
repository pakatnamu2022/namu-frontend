"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { Form, FormLabel } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Loader,
  Truck,
  Package,
  Plus,
  Trash2,
  Box,
  FileText,
  Search,
} from "lucide-react";
import {
  ProductTransferSchema,
  productTransferSchemaCreate,
  productTransferSchemaUpdate,
} from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.schema.ts";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField.tsx";
import { GroupFormSection } from "@/shared/components/GroupFormSection.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog.tsx";
import { useNavigate } from "react-router-dom";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.constants.ts";
import {
  useSuppliers,
  useSuppliersById,
} from "@/features/ap/comercial/proveedores/lib/suppliers.hook.ts";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook.ts";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook.ts";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface.ts";
import { EstablishmentsResource } from "@/features/ap/comercial/establecimientos/lib/establishments.interface.ts";
import { EstablishmentSelectorModal } from "@/features/ap/comercial/envios-recepciones/components/EstablishmentSelectorModal.tsx";
import {
  SUNAT_CONCEPTS_ID,
  SUNAT_CONCEPTS_TYPE,
} from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants.ts";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator.tsx";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus.tsx";
import { useLicenseValidation } from "@/shared/hooks/useDocumentValidation.ts";
import { Card } from "@/components/ui/card.tsx";
import { BUSINESS_PARTNERS } from "@/core/core.constants.ts";
import { TYPE_RECEIPT_SERIES } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants.ts";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook.ts";
import { useAllTypeClient } from "@/features/ap/configuraciones/maestros-general/tipos-persona/lib/typeClient.hook.ts";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync.tsx";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface.ts";
import { useInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";
import { InventoryResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface.ts";
import { TYPES_OPERATION_ID } from "@/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.constants.ts";
import { FormInput } from "@/shared/components/FormInput.tsx";
import { FormTextArea } from "@/shared/components/FormTextArea.tsx";
import { CopyCell } from "@/shared/components/CopyCell";

interface ProductTransferFormProps {
  defaultValues: Partial<ProductTransferSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  transferData?: any;
}

export const ProductTransferForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  transferData,
}: ProductTransferFormProps) => {
  const { ABSOLUTE_ROUTE } = PRODUCT_TRANSFER;
  const router = useNavigate();
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? productTransferSchemaCreate
        : productTransferSchemaUpdate,
    ) as any,
    defaultValues: {
      ...defaultValues,
      item_type: defaultValues.item_type || "PRODUCTO",
      issuer_type: defaultValues.issuer_type || "SYSTEM",
      transmitter_origin_id: defaultValues.transmitter_origin_id || "",
      receiver_destination_id: defaultValues.receiver_destination_id || "",
      transmitter_id: defaultValues.transmitter_id || "",
      receiver_id: defaultValues.receiver_id || "",
      details: defaultValues.details || [],
    },
    mode: "onChange",
  });

  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");
  const conductorDni = form.watch("driver_doc");
  const typePersonId = form.watch("type_person_id");
  const transferType = form.watch("item_type");
  const transferModalityId = form.watch("transfer_modality_id");
  const prevTransferTypeRef = useRef(transferType);

  const isTransportPrivate =
    transferModalityId === SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PRIVATE;
  const isTransportPublic =
    transferModalityId === SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PUBLIC;

  // Estados para los modales de establecimientos
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);

  // Estados para almacenar los establecimientos seleccionados
  const [selectedOriginEstablishment, setSelectedOriginEstablishment] =
    useState<EstablishmentsResource | null>(null);
  const [
    selectedDestinationEstablishment,
    setSelectedDestinationEstablishment,
  ] = useState<EstablishmentsResource | null>(null);

  // Estados para almacenar el proveedor/cliente seleccionado
  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Estado para almacenar los repuestos seleccionados (en modo create)
  const [selectedProducts, setSelectedProducts] = useState<
    Map<number, InventoryResource>
  >(new Map());

  // Determinar si es persona natural o jurídica
  const isPersonaNatural =
    typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID;
  const isPersonaJuridica =
    typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID;

  // Determinar si es repuesto o servicio
  const isRepuesto = transferType === "PRODUCTO";
  const isServicio = transferType === "SERVICIO";

  // Validar si ambos establecimientos tienen almacén para habilitar "Repuesto"
  const bothEstablishmentsHaveWarehouse =
    selectedOriginEstablishment?.warehouse_id !== null &&
    selectedOriginEstablishment?.warehouse_id !== undefined &&
    selectedDestinationEstablishment?.warehouse_id !== null &&
    selectedDestinationEstablishment?.warehouse_id !== undefined;

  const {
    data: conductorDniData,
    isLoading: isConductorDniLoading,
    error: conductorDniError,
  } = useLicenseValidation(
    conductorDni,
    !isFirstLoad &&
      isPersonaNatural &&
      !!conductorDni &&
      conductorDni.length === 8,
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const watchTransferReasonId = form.watch("transfer_reason_id");

  // Obtener clientes y proveedores
  const { data: typesPerson = [], isLoading: isLoadingTypesPerson } =
    useAllTypeClient();

  const { data: series = [], isLoading: isLoadingSeries } = useAuthorizedSeries(
    {
      type_operation_id: TYPES_OPERATION_ID.COMERCIAL,
      type_receipt_id: TYPE_RECEIPT_SERIES.GUIA_REMISION,
    },
  );

  // Filtrar series según la sede del establecimiento origen seleccionado
  const filteredSeries = series.filter((serie) => {
    if (!selectedOriginEstablishment?.sede_id) return true;
    return serie.sede_id === Number(selectedOriginEstablishment.sede_id);
  });

  // Obtener conceptos SUNAT
  const { data: sunatConcepts = [], isLoading: isLoadingSunatConcepts } =
    useAllSunatConcepts({
      type: [
        SUNAT_CONCEPTS_TYPE.TRANSFER_REASON,
        SUNAT_CONCEPTS_TYPE.TYPE_TRANSPORTATION,
      ],
    });

  const reasonTransfer = sunatConcepts.filter(
    (concept) => concept.type === SUNAT_CONCEPTS_TYPE.TRANSFER_REASON,
  );

  const typeTransportation = sunatConcepts.filter(
    (concept) => concept.type === SUNAT_CONCEPTS_TYPE.TYPE_TRANSPORTATION,
  );

  const filterReasonTransfer = reasonTransfer.filter((reason) => {
    return (
      reason.id.toString() === SUNAT_CONCEPTS_ID.TRANSFER_REASON_OTROS ||
      reason.id.toString() === SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE
    );
  });

  // UseEffect para conductor
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    if (conductorDniData?.success && conductorDniData.data) {
      const licenseInfo = conductorDniData.data;
      const currentLicense = form.getValues("license");
      const currentDriverName = form.getValues("driver_name");

      if (currentLicense !== (licenseInfo.licencia.numero || "")) {
        form.setValue("license", licenseInfo.licencia.numero || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (currentDriverName !== (licenseInfo.full_name || "")) {
        form.setValue("driver_name", licenseInfo.full_name || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else if (conductorDniData !== undefined) {
      const currentLicense = form.getValues("license");
      const currentDriverName = form.getValues("driver_name");

      if (currentLicense !== "") {
        form.setValue("license", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (currentDriverName !== "") {
        form.setValue("driver_name", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [conductorDniData, isFirstLoad, form]);

  // Forzar tipo de persona según modalidad de traslado
  useEffect(() => {
    if (isFirstLoad) return;

    if (isTransportPrivate) {
      form.setValue(
        "type_person_id",
        BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID,
        { shouldValidate: true },
      );
    } else if (isTransportPublic) {
      form.setValue(
        "type_person_id",
        BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID,
        { shouldValidate: true },
      );
    }
  }, [
    transferModalityId,
    isFirstLoad,
    form,
    isTransportPrivate,
    isTransportPublic,
  ]);

  // UseEffect para limpiar campos cuando cambia el tipo de persona
  useEffect(() => {
    if (isFirstLoad) return;

    // Limpiar campos de persona natural cuando se selecciona jurídica
    if (isPersonaJuridica) {
      form.setValue("driver_doc", "");
      form.setValue("driver_name", "");
      form.setValue("license", "");
    }

    // Limpiar campos de persona jurídica cuando se selecciona natural
    if (isPersonaNatural) {
      form.setValue("transport_company_id", "");
    }
  }, [typePersonId, isFirstLoad, form, isPersonaNatural, isPersonaJuridica]);

  // Setear valores por defecto en modo create
  useEffect(() => {
    if (mode !== "create") return;

    // Setear fecha de movimiento a hoy si no hay valor
    if (!form.getValues("movement_date")) {
      form.setValue("movement_date", new Date(), {
        shouldValidate: true,
      });
    }

    // Setear fecha de traslado a hoy si no hay valor
    if (!form.getValues("issue_date")) {
      form.setValue("issue_date", new Date(), {
        shouldValidate: true,
      });
    }
  }, [mode, form]);

  // Limpiar serie cuando cambia el establecimiento origen
  useEffect(() => {
    const currentSeriesId = form.getValues("document_series_id");
    if (currentSeriesId && selectedOriginEstablishment?.sede_id) {
      const isValidSeries = filteredSeries.some(
        (serie) => serie.id.toString() === currentSeriesId,
      );
      if (!isValidSeries && mode === "create") {
        form.setValue("document_series_id", "");
      }
    }
  }, [selectedOriginEstablishment?.sede_id, filteredSeries, form, mode]);

  // Limpiar detalles cuando cambia el tipo de transferencia (PRODUCTO <-> SERVICIO)
  useEffect(() => {
    if (isFirstLoad) return;

    // Solo limpiar si el tipo realmente cambió
    if (
      mode === "create" &&
      prevTransferTypeRef.current !== transferType &&
      fields.length > 0
    ) {
      form.setValue("details", []);
      // Limpiar repuestos seleccionados
      setSelectedProducts(new Map());
    }

    // Actualizar la referencia al tipo actual
    prevTransferTypeRef.current = transferType;
  }, [transferType, isFirstLoad, mode, form, fields.length]);

  // Forzar cambio a SERVICIO si no ambos establecimientos tienen almacén
  useEffect(() => {
    if (mode === "update") return;

    if (!bothEstablishmentsHaveWarehouse && transferType === "PRODUCTO") {
      form.setValue("item_type", "SERVICIO", {
        shouldValidate: true,
      });
      // Limpiar detalles de repuestos
      if (fields.length > 0) {
        form.setValue("details", []);
        // Limpiar repuestos seleccionados
        setSelectedProducts(new Map());
      }
    }
  }, [
    bothEstablishmentsHaveWarehouse,
    transferType,
    mode,
    form,
    fields.length,
  ]);

  const handleAddDetail = () => {
    if (isRepuesto) {
      append({
        product_id: "",
        quantity: 1,
        unit_cost: "0",
        notes: "",
      });
    } else {
      // Para servicios
      append({
        notes: "",
        quantity: 1,
      });
    }
  };

  const handleRemoveDetail = (index: number) => {
    remove(index);
    // Limpiar el repuesto seleccionado del mapa
    setSelectedProducts((prev) => {
      const newMap = new Map(prev);
      newMap.delete(index);
      // Reindexar los repuestos que vienen después del eliminado
      const reindexedMap = new Map();
      newMap.forEach((value, key) => {
        if (key > index) {
          reindexedMap.set(key - 1, value);
        } else {
          reindexedMap.set(key, value);
        }
      });
      return reindexedMap;
    });
  };

  if (isLoadingSunatConcepts || isLoadingSeries || isLoadingTypesPerson) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Sección: Información del Traslado */}
        <GroupFormSection
          icon={Truck}
          title="Información del Traslado"
          color="gray"
          cols={{
            sm: 1,
            md: 2,
            lg: 3,
          }}
        >
          <FormSelect
            name="transfer_reason_id"
            label="Motivo de Traslado"
            placeholder="Selecciona motivo"
            options={filterReasonTransfer.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          {/* Ubicación Origen */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 relative">
              <FormLabel className="leading-none">Ubicación Origen</FormLabel>
              {selectedSupplier && (
                <button
                  type="button"
                  onClick={() => setIsOriginModalOpen(true)}
                  className="p-1 rounded-md hover:bg-primary/10 transition-colors absolute -top-1 right-0"
                  title="Seleccionar establecimiento"
                >
                  <Search className="h-4 w-4 text-primary" />
                </button>
              )}
            </div>
            <FormSelectAsync
              name="transmitter_origin_id"
              placeholder="Buscar proveedor..."
              control={form.control}
              useQueryHook={useSuppliers}
              mapOptionFn={(item: SuppliersResource) => ({
                value: item.id.toString(),
                label: `${item.num_doc || "S/N"} | ${item.full_name}`,
              })}
              additionalParams={{
                type_person_id: BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID,
                status_ap: 1,
              }}
              perPage={10}
              debounceMs={500}
              useFindByIdHook={useSuppliersById}
              onValueChange={(value, item: SuppliersResource | undefined) => {
                if (value && item) {
                  setSelectedSupplier({ id: item.id, name: item.full_name });
                } else if (value && !item) {
                  // item aún no disponible en rawItemsRef; el useFindByIdHook lo cargará
                  setSelectedSupplier({ id: Number(value), name: "" });
                } else if (!value) {
                  setSelectedSupplier(null);
                  setSelectedOriginEstablishment(null);
                  form.setValue("transmitter_id", "", {
                    shouldValidate: false,
                    shouldDirty: false,
                    shouldTouch: false,
                  });
                }
              }}
            />
            {selectedOriginEstablishment && (
              <div className="text-xs text-primary space-y-0.5">
                <p className="font-medium">
                  {selectedOriginEstablishment.description ||
                    selectedOriginEstablishment.code}
                </p>
                <p>{selectedOriginEstablishment.full_address}</p>
              </div>
            )}
            {form.formState.errors.transmitter_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.transmitter_id.message as string}
              </p>
            )}
          </div>

          {/* Ubicación Destino */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 relative">
              <FormLabel className="leading-none">Ubicación Destino</FormLabel>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => setIsDestinationModalOpen(true)}
                  className="p-1 rounded-md hover:bg-primary/10 transition-colors absolute -top-1 right-0"
                  title="Seleccionar establecimiento"
                >
                  <Search className="h-4 w-4 text-primary" />
                </button>
              )}
            </div>
            <FormSelectAsync
              name="receiver_destination_id"
              placeholder="Buscar cliente..."
              control={form.control}
              useQueryHook={useCustomers}
              mapOptionFn={(item: CustomersResource) => ({
                value: item.id.toString(),
                label: `${item.num_doc || "S/N"} | ${item.full_name}`,
              })}
              additionalParams={{
                type_person_id: BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID,
                status_ap: 1,
              }}
              perPage={10}
              debounceMs={500}
              useFindByIdHook={useCustomersById}
              defaultOption={
                selectedCustomer
                  ? {
                      value: selectedCustomer.id.toString(),
                      label: selectedCustomer.name,
                    }
                  : undefined
              }
              disabled={
                watchTransferReasonId ===
                SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE
              }
              onValueChange={(value, item: CustomersResource | undefined) => {
                if (value && item) {
                  setSelectedCustomer({ id: item.id, name: item.full_name });
                } else if (!value) {
                  setSelectedCustomer(null);
                  setSelectedDestinationEstablishment(null);
                  form.setValue("receiver_id", "", {
                    shouldValidate: false,
                    shouldDirty: false,
                    shouldTouch: false,
                  });
                }
              }}
            />
            {selectedDestinationEstablishment && (
              <div className="text-xs text-primary space-y-0.5">
                <p className="font-medium">
                  {selectedDestinationEstablishment.description ||
                    selectedDestinationEstablishment.code}
                </p>
                <p>{selectedDestinationEstablishment.full_address}</p>
              </div>
            )}
            {form.formState.errors.receiver_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.receiver_id.message as string}
              </p>
            )}
          </div>

          <DatePickerFormField
            control={form.control}
            name="movement_date"
            label="Fecha de Emisión"
            disabled
          />

          <FormSelect
            name="document_series_id"
            label="Serie"
            placeholder="Selecciona serie"
            options={filteredSeries.map((item) => ({
              label: item.series + " " + item.sede,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
            disabled={!selectedOriginEstablishment?.sede_id}
          />

          <FormSelect
            name="transfer_modality_id"
            label="Modalidad de Traslado"
            placeholder="Selecciona modalidad"
            options={typeTransportation.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
          />

          <FormInput
            name="total_packages"
            label="Núm. Bultos"
            type="number"
            placeholder="0"
            control={form.control}
          />

          <FormInput
            name="total_weight"
            label="Peso Total (kg)"
            type="number"
            placeholder="0"
            control={form.control}
          />

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Translado"
            disabledRange={{ before: new Date() }}
          />
        </GroupFormSection>

        {/* Sección: Información del Conductor y Transporte */}
        <GroupFormSection
          icon={Truck}
          title="Conductor y Transporte"
          color="gray"
          cols={{
            sm: 1,
            md: 2,
            lg: 3,
          }}
        >
          <FormSelect
            name="type_person_id"
            label="Tipo de Persona"
            placeholder="Selecciona tipo"
            options={typesPerson
              .filter(
                (item) =>
                  item.id.toString() ===
                    BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID ||
                  item.id.toString() ===
                    BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID,
              )
              .map((item) => ({
                label: item.description,
                value: item.id.toString(),
              }))}
            control={form.control}
            strictFilter={true}
            disabled={isTransportPrivate || isTransportPublic}
          />

          {/* Campos para Persona Natural */}
          {isPersonaNatural && (
            <>
              <FormInput
                name="driver_doc"
                label={
                  <>
                    <span>DNI del Conductor</span>
                    <DocumentValidationStatus
                      shouldValidate={true}
                      documentNumber={conductorDni || ""}
                      expectedDigits={8}
                      isValidating={isConductorDniLoading}
                      leftPosition=""
                    />
                  </>
                }
                labelClassName="w-full justify-between gap-2"
                placeholder="Número de documento"
                maxLength={8}
                control={form.control}
                addonEnd={
                  <ValidationIndicator
                    show={!!conductorDni}
                    isValidating={isConductorDniLoading}
                    isValid={
                      conductorDniData?.success && !!conductorDniData.data
                    }
                    hasError={
                      !!conductorDniError ||
                      (conductorDniData && !conductorDniData.success)
                    }
                    positioned={false}
                  />
                }
              />

              <FormInput
                name="driver_name"
                label="Nombre del Conductor"
                placeholder="Nombre completo"
                control={form.control}
              />

              <FormInput
                name="license"
                label={
                  <>
                    <span>Licencia de Conducir</span>
                    {conductorDniData?.success &&
                      conductorDniData.data?.licencia?.estado && (
                        <span className="text-xs font-normal text-primary">
                          {conductorDniData.data.licencia.estado}
                        </span>
                      )}
                  </>
                }
                labelClassName="w-full justify-between gap-2"
                placeholder="Ej: Q12345678"
                control={form.control}
              />
            </>
          )}

          {/* Campos para Persona Jurídica */}
          {isPersonaJuridica && (
            <>
              <FormSelectAsync
                placeholder="Seleccionar Proveedor"
                control={form.control}
                label={"Proveedor"}
                name="transport_company_id"
                useQueryHook={useSuppliers}
                mapOptionFn={(item: SuppliersResource) => ({
                  value: item.id.toString(),
                  label: `${item.num_doc || "S/N"} | ${
                    item.full_name || "S/N"
                  }`,
                })}
                perPage={10}
                debounceMs={500}
              />
            </>
          )}

          {/* Placa - Obligatoria para Natural, Opcional para Jurídica */}
          <FormInput
            name="plate"
            label={
              <>
                <span>Placa del Vehículo</span>
                {isPersonaJuridica && (
                  <span className="text-muted-foreground">(Opcional)</span>
                )}
              </>
            }
            labelClassName="gap-1"
            placeholder="Ej: ABC-123"
            control={form.control}
            uppercase={true}
          />
        </GroupFormSection>

        {/* Sección: Detalles de Repuestos */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {isRepuesto
                  ? "Repuestos a Transferir"
                  : "Servicios a Transferir"}
              </h3>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Toggle PRODUCTO/SERVICIO */}
              <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => form.setValue("item_type", "PRODUCTO")}
                  disabled={
                    mode === "update" || !bothEstablishmentsHaveWarehouse
                  }
                  title={
                    !bothEstablishmentsHaveWarehouse
                      ? "Ambos establecimientos deben tener almacén para transferir repuestos"
                      : ""
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                    isRepuesto
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  } ${
                    mode === "update" || !bothEstablishmentsHaveWarehouse
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <Box className="h-4 w-4" />
                  <span className="font-medium text-sm">Repuesto</span>
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("item_type", "SERVICIO")}
                  disabled={mode === "update"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                    isServicio
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  } ${
                    mode === "update"
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium text-sm">Servicio</span>
                </button>
              </div>

              {/* Mensaje de advertencia si no tienen almacén */}
              {!bothEstablishmentsHaveWarehouse && mode === "create" && (
                <div className="text-xs text-amber-600 flex items-center gap-1">
                  <span>
                    Ambos establecimientos deben tener almacén para transferir
                    repuestos
                  </span>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDetail}
                disabled={mode === "update"}
                className="flex items-center sm:flex-row flex-col sm:items-center w-full sm:w-auto mx-auto"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 sm:mr-2 sm:mb-0" />
                  <span className="text-sm text-center">
                    Agregar {isRepuesto ? "Repuesto" : "Servicio"}
                  </span>
                </div>
              </Button>
            </div>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay {isRepuesto ? "repuestos" : "servicios"} agregados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200 gap-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
                      {index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      color="red"
                      onClick={() => handleRemoveDetail(index)}
                      disabled={mode === "update"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isRepuesto ? (
                    /* Campos para PRODUCTO */
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                      {mode === "update" ? (
                        // Modo edición: Mostrar nombre del repuesto (solo lectura)
                        <div className="space-y-1">
                          <FormLabel>Repuesto *</FormLabel>
                          <div className="h-auto min-h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                            <div className="flex flex-col gap-2">
                              <span className="font-medium text-sm">
                                {transferData?.details?.[index]?.product
                                  ?.name || "Repuesto no disponible"}
                              </span>
                              {transferData?.details?.[index]?.product
                                ?.code && (
                                <div className="flex items-center gap-2">
                                  <CopyCell
                                    className="text-xs font-medium"
                                    value={
                                      transferData.details[index].product.code
                                    }
                                    label={`Cód: ${transferData.details[index].product.code}`}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Modo creación: Selector asíncrono
                        <div className="space-y-1">
                          <FormSelectAsync
                            name={`details.${index}.product_id`}
                            label="Repuesto"
                            placeholder="Buscar repuesto..."
                            control={form.control}
                            useQueryHook={useInventory}
                            mapOptionFn={(inventory: InventoryResource) => ({
                              label: () => (
                                <div className="flex items-center justify-between gap-2 w-full">
                                  <span className="font-medium truncate">
                                    {inventory.product_name}
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
                            additionalParams={{
                              warehouse_id:
                                selectedOriginEstablishment?.warehouse_id,
                              available_quantity: 0,
                            }}
                            perPage={10}
                            debounceMs={500}
                            onValueChange={(value, item) => {
                              if (value && item) {
                                setSelectedProducts((prev) => {
                                  const newMap = new Map(prev);
                                  newMap.set(index, item as InventoryResource);
                                  return newMap;
                                });
                              } else {
                                // Si se limpia el valor, eliminar del mapa
                                setSelectedProducts((prev) => {
                                  const newMap = new Map(prev);
                                  newMap.delete(index);
                                  return newMap;
                                });
                              }
                            }}
                            required
                          />
                          {selectedProducts.get(index) && (
                            <div className="flex items-center gap-2 mt-2">
                              <CopyCell
                                className="text-xs font-medium"
                                value={
                                  selectedProducts.get(index)!.product.code
                                }
                                label={`Cód: ${selectedProducts.get(index)!.product.code}`}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="justify-start">
                        <FormInput
                          name={`details.${index}.quantity`}
                          label="Cantidad"
                          type="number"
                          min="1"
                          placeholder="1"
                          control={form.control}
                          disabled={mode === "update"}
                          required
                        />
                      </div>

                      <div className="justify-start">
                        <FormInput
                          name={`details.${index}.notes`}
                          label="Notas"
                          placeholder="Observaciones"
                          control={form.control}
                          disabled={mode === "update"}
                          className="justify-start"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Campos para SERVICIO */
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                      <FormInput
                        name={`details.${index}.notes`}
                        label="Descripción (mín. 6 caracteres)"
                        placeholder="Ej: Sobres de documentos, celulares, etc."
                        control={form.control}
                        disabled={mode === "update"}
                        minLength={6}
                        required
                      />

                      <FormInput
                        name={`details.${index}.quantity`}
                        label="Cantidad"
                        type="number"
                        min="1"
                        placeholder="1"
                        control={form.control}
                        disabled={mode === "update"}
                        required
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Sección: Observaciones */}
        <div className="space-y-4">
          <FormTextArea
            name="notes"
            label="Notas u Observaciones"
            placeholder="Observaciones adicionales sobre la transferencia..."
            control={form.control}
            className="resize-none"
            rows={4}
          />
        </div>

        {/* Botones de Acción */}
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
              router(ABSOLUTE_ROUTE);
            }}
          />

          <Button type="submit" disabled={isSubmitting}>
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
                ? "Registrar Guía"
                : "Actualizar Guía"}
          </Button>
        </div>

        {/* Modales para seleccionar establecimientos */}
        <EstablishmentSelectorModal
          open={isOriginModalOpen}
          onOpenChange={setIsOriginModalOpen}
          businessPartnerId={selectedSupplier?.id || null}
          businessPartnerName={selectedSupplier?.name || ""}
          onSelectEstablishment={(establishment: EstablishmentsResource) => {
            setSelectedOriginEstablishment(establishment);
            // Guardar el establishment_id en transmitter_id (el campo que va a la API)
            form.setValue("transmitter_id", establishment.id.toString(), {
              shouldValidate: true,
            });
          }}
          sede_id={selectedOriginEstablishment?.sede_id?.toString()}
        />

        <EstablishmentSelectorModal
          open={isDestinationModalOpen}
          onOpenChange={setIsDestinationModalOpen}
          businessPartnerId={selectedCustomer?.id || null}
          businessPartnerName={selectedCustomer?.name || ""}
          onSelectEstablishment={(establishment: EstablishmentsResource) => {
            setSelectedDestinationEstablishment(establishment);
            // Guardar el establishment_id en receiver_id (el campo que va a la API)
            form.setValue("receiver_id", establishment.id.toString(), {
              shouldValidate: true,
            });
          }}
          sede_id={selectedDestinationEstablishment?.sede_id?.toString()}
        />
      </form>
    </Form>
  );
};
