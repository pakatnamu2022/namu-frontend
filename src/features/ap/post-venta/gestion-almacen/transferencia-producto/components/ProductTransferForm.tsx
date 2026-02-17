"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
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
} from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.schema.ts";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField.tsx";
import { GroupFormSection } from "@/shared/components/GroupFormSection.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog.tsx";
import { useNavigate } from "react-router-dom";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.constants.ts";
import {
  useAllSuppliers,
  useSuppliers,
} from "@/features/ap/comercial/proveedores/lib/suppliers.hook.ts";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook.ts";
import { useAllCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook.ts";
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
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";

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
      details: defaultValues.details || [],
    },
    mode: "onChange",
  });

  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");
  const conductorDni = form.watch("driver_doc");
  const typePersonId = form.watch("type_person_id");
  const transferType = form.watch("item_type");
  const prevTransferTypeRef = useRef(transferType);

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

  // Determinar si es persona natural o jurídica
  const isPersonaNatural =
    typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID;
  const isPersonaJuridica =
    typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID;

  // Determinar si es producto o servicio
  const isProducto = transferType === "PRODUCTO";
  const isServicio = transferType === "SERVICIO";

  // Validar si ambos establecimientos tienen almacén para habilitar "Producto"
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

  const watchTransmitterOriginId = form.watch("transmitter_origin_id");
  const watchReceiverDestinationId = form.watch("receiver_destination_id");
  const watchTransferReasonId = form.watch("transfer_reason_id");

  // Obtener clientes y proveedores
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useAllCustomers({
      type_person_id: BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID,
      status_ap: 1,
    });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } =
    useAllSuppliers({
      type_person_id: BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID,
      status_ap: 1,
    });

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

  // Actualizar el proveedor seleccionado cuando cambie el campo
  useEffect(() => {
    if (watchTransmitterOriginId && suppliers.length > 0) {
      const supplier = suppliers.find(
        (s) => s.id.toString() === watchTransmitterOriginId,
      );
      if (supplier && selectedSupplier?.id !== supplier.id) {
        setSelectedSupplier({
          id: supplier.id,
          name: supplier.full_name,
        });
      }
    } else if (!watchTransmitterOriginId && selectedSupplier !== null) {
      setSelectedSupplier(null);
      setSelectedOriginEstablishment(null);
      // Limpiar transmitter_id
      const currentTransmitterId = form.getValues("transmitter_id");
      if (currentTransmitterId !== "") {
        form.setValue("transmitter_id", "", {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
  }, [watchTransmitterOriginId, suppliers, selectedSupplier]);

  // Actualizar el cliente seleccionado cuando cambie el campo
  useEffect(() => {
    if (watchReceiverDestinationId && customers.length > 0) {
      const customer = customers.find(
        (c) => c.id.toString() === watchReceiverDestinationId,
      );
      if (customer && selectedCustomer?.id !== customer.id) {
        setSelectedCustomer({
          id: customer.id,
          name: customer.full_name,
        });
      }
    } else if (!watchReceiverDestinationId && selectedCustomer !== null) {
      setSelectedCustomer(null);
      setSelectedDestinationEstablishment(null);
      // Limpiar receiver_id
      const currentReceiverId = form.getValues("receiver_id");
      if (currentReceiverId !== "") {
        form.setValue("receiver_id", "", {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
  }, [watchReceiverDestinationId, customers, selectedCustomer]);

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
      // Limpiar detalles de productos
      if (fields.length > 0) {
        form.setValue("details", []);
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
    if (isProducto) {
      append({
        product_id: "",
        quantity: "1",
        unit_cost: "0",
        notes: "",
      });
    } else {
      // Para servicios
      append({
        notes: "",
        quantity: "1",
      });
    }
  };

  if (
    isLoadingSunatConcepts ||
    isLoadingSeries ||
    isLoadingTypesPerson ||
    isLoadingCustomers ||
    isLoadingSuppliers
  ) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Sección: Información del Traslado */}
        <GroupFormSection
          icon={Truck}
          title="Información del Traslado"
          iconColor="text-gray-600 dark:text-gray-300"
          bgColor="bg-gray-50 dark:bg-gray-800"
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
            <FormSelect
              name="transmitter_origin_id"
              label={() => (
                <div className="flex items-center gap-2 relative">
                  <FormLabel>Ubicación Origen</FormLabel>
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
              )}
              placeholder="Selecciona proveedor"
              options={suppliers.map((item) => ({
                label: item.full_name,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={true}
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
          </div>

          {/* Ubicación Destino */}
          <div className="space-y-2">
            <FormSelect
              name="receiver_destination_id"
              label={() => (
                <div className="flex items-center gap-2 relative">
                  <FormLabel>Ubicación Destino</FormLabel>
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
              )}
              placeholder="Selecciona cliente"
              options={customers.map((item) => ({
                label: item.full_name,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={
                watchTransferReasonId ===
                SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE
              }
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
          </div>

          <DatePickerFormField
            control={form.control}
            name="movement_date"
            label="Fecha de Emisión"
            disabledRange={{ before: new Date() }}
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
            strictFilter={true}
          />

          <FormInput
            name="total_packages"
            label="Núm. Bultos"
            type="number"
            placeholder="1"
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
          iconColor="text-primary"
          bgColor="bg-blue-50"
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
          />

          {/* Campos para Persona Natural */}
          {isPersonaNatural && (
            <>
              <FormField
                control={form.control}
                name="driver_doc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 relative">
                      DNI del Conductor
                      <DocumentValidationStatus
                        shouldValidate={true}
                        documentNumber={conductorDni || ""}
                        expectedDigits={8}
                        isValidating={isConductorDniLoading}
                        leftPosition="right-0"
                      />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Número de documento"
                          {...field}
                          maxLength={8}
                          type="number"
                        />
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
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormInput
                name="driver_name"
                label="Nombre del Conductor"
                placeholder="Nombre completo"
                control={form.control}
              />

              <FormField
                control={form.control}
                name="license"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 relative">
                      Licencia de Conducir
                      {conductorDniData?.success &&
                        conductorDniData.data?.licencia?.estado && (
                          <span className="text-xs font-normal text-primary absolute right-0">
                            {conductorDniData.data.licencia.estado}
                          </span>
                        )}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Q12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Placa del Vehículo{" "}
                  {isPersonaJuridica && (
                    <span className="text-muted-foreground">(Opcional)</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: ABC-123"
                    className="uppercase"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Sección: Detalles de Productos */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {isProducto
                  ? "Productos a Transferir"
                  : "Servicios a Transferir"}
              </h3>
            </div>

            <div className="flex items-center gap-4">
              {/* Toggle PRODUCTO/SERVICIO */}
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => form.setValue("item_type", "PRODUCTO")}
                  disabled={
                    mode === "update" || !bothEstablishmentsHaveWarehouse
                  }
                  title={
                    !bothEstablishmentsHaveWarehouse
                      ? "Ambos establecimientos deben tener almacén para transferir productos"
                      : ""
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    isProducto
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  } ${
                    mode === "update" || !bothEstablishmentsHaveWarehouse
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <Box className="h-4 w-4" />
                  <span className="font-medium text-sm">Producto</span>
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("item_type", "SERVICIO")}
                  disabled={mode === "update"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
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
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span>
                    Ambos establecimientos deben tener almacén para transferir
                    productos
                  </span>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDetail}
                disabled={mode === "update"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar {isProducto ? "Producto" : "Servicio"}
              </Button>
            </div>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay {isProducto ? "productos" : "servicios"} agregados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">
                      {isProducto ? "Producto" : "Servicio"} {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                      disabled={mode === "update"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isProducto ? (
                    /* Campos para PRODUCTO */
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                      {mode === "update" ? (
                        // Modo edición: Mostrar nombre del producto (solo lectura)
                        <div className="space-y-1">
                          <FormLabel>Producto *</FormLabel>
                          <div className="h-auto min-h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm flex items-center">
                            <span className="font-medium text-sm truncate">
                              {transferData?.details?.[index]?.product?.name ||
                                "Producto no disponible"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Modo creación: Selector asíncrono
                        <FormSelectAsync
                          name={`details.${index}.product_id`}
                          label="Producto *"
                          placeholder="Buscar producto..."
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
                          }}
                          perPage={10}
                          debounceMs={500}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name={`details.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                {...field}
                                disabled={mode === "update"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Observaciones"
                                {...field}
                                disabled={mode === "update"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    /* Campos para SERVICIO */
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`details.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Descripción * (mín. 6 caracteres)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Sobres de documentos, celulares, etc."
                                {...field}
                                disabled={mode === "update"}
                                minLength={6}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                {...field}
                                disabled={mode === "update"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
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
          <FormInputText
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

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
                ? "Crear Transferencia"
                : "Actualizar Transferencia"}
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
