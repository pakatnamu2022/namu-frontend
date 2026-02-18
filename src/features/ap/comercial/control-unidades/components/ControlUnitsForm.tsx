"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Truck, Search, Plus } from "lucide-react";
import {
  ControlUnitsSchema,
  controlUnitsSchemaCreate,
  controlUnitsSchemaUpdate,
} from "../lib/controlUnits.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  DOCUMENT_TYPES,
  ISSUER_TYPES,
  CONTROL_UNITS,
} from "../lib/controlUnits.constants";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { BUSINESS_PARTNERS, EMPRESA_AP } from "@/core/core.constants";
import { useAllCustomers } from "../../clientes/lib/customers.hook";
import { useAllSuppliers } from "../../proveedores/lib/suppliers.hook";
import { EstablishmentSelectorModal } from "./EstablishmentSelectorModal";
import { EstablishmentsResource } from "../../establecimientos/lib/establishments.interface";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import { useLicenseValidation } from "@/shared/hooks/useDocumentValidation";
import { useAllEstablishments } from "../../establecimientos/lib/establishments.hook";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import {
  SUNAT_CONCEPTS_TYPE,
  SUNAT_CONCEPTS_ID,
} from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { TYPE_RECEIPT_SERIES } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import { ImageUploadField } from "@/shared/components/ImageUploadField";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import { useAllVehicles } from "../../vehiculos/lib/vehicles.hook";
import { TYPES_OPERATION_ID } from "@/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.constants";
import { FormInput } from "@/shared/components/FormInput";
import { VEHICLES } from "../../vehiculos/lib/vehicles.constants";
import VehicleModal from "../../vehiculos/components/VehicleModal";
import { useQueryClient } from "@tanstack/react-query";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface ControlUnitsFormProps {
  defaultValues: Partial<ControlUnitsSchema> & {
    transmitter_establishment?: any;
    receiver_establishment?: any;
  };
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  isLoadingData?: boolean;
}

export const ControlUnitsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ControlUnitsFormProps) => {
  const { ABSOLUTE_ROUTE } = CONTROL_UNITS;
  const router = useNavigate();
  const queryClient = useQueryClient();
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? controlUnitsSchemaCreate : controlUnitsSchemaUpdate,
    ) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const AUTOMOTORES_PAKATNAMU_ID = "17";

  // Handler para convertir datos a FormData
  const handleFormSubmit = (data: any) => {
    const formData = new FormData();
    const requiresSunat = data.document_type === "GUIA_REMISION";

    if (mode === "update") {
      formData.append("_method", "PUT");
    }

    // Agregar todos los campos al FormData
    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (key === "file") {
        if (value && value instanceof File) {
          formData.append("file", value);
        }
      } else if (value !== null && value !== undefined && value !== "") {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    formData.append("requires_sunat", requiresSunat ? "1" : "0");
    formData.append("send_dynamics", "0");
    onSubmit(formData);
  };
  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");
  const conductorDni = form.watch("driver_doc");

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

  const {
    data: conductorDniData,
    isLoading: isConductorDniLoading,
    error: conductorDniError,
  } = useLicenseValidation(
    conductorDni,
    !isFirstLoad && !!conductorDni && conductorDni.length === 8,
  );

  // Estados para almacenar el proveedor/cliente seleccionado
  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const watchTransmitterOriginId = form.watch("transmitter_origin_id");
  const watchTransmitterDestinoId = form.watch("receiver_destination_id");
  const watchTransmitterId = form.watch("transmitter_id");
  const watchReceiverId = form.watch("receiver_id");
  const watchIssuerType = form.watch("issuer_type");
  const watchTransferReasonId = form.watch("transfer_reason_id");
  const watchSedeTransmitterId = form.watch("sede_transmitter_id");
  const watchArticleClassId = form.watch("ap_class_article_id");
  const watchDocumentSeriesId = form.watch("document_series_id");

  // Get vehicles filtrados por sede
  // Si es COMPRA: is_received = 0 (vehículos que no han sido recibidos)
  // Si NO es COMPRA: is_received = 1 (vehículos ya recibidos en piso)
  const vehiclesIsReceived =
    watchTransferReasonId === SUNAT_CONCEPTS_ID.TRANSFER_REASON_COMPRA ? 0 : 1;

  const { data: vehiclesVn = [], isLoading: isLoadingVehicles } =
    useAllVehicles({
      warehouse$sede_id: watchSedeTransmitterId
        ? Number(watchSedeTransmitterId)
        : undefined,
      warehouse$is_received: vehiclesIsReceived,
      warehouse$ap_class_article_id: watchArticleClassId,
      model$class_id: watchArticleClassId,
    });

  const { data: series = [], isLoading: isLoadingSeries } = useAuthorizedSeries(
    {
      type_operation_id: TYPES_OPERATION_ID.COMERCIAL,
      type_receipt_id: TYPE_RECEIPT_SERIES.GUIA_REMISION,
    },
  );

  const { data: articleClass = [], isLoading: isLoadingArticleClass } =
    useAllClassArticle({
      type: "VEHICULO",
      type_operation_id: CM_COMERCIAL_ID,
    });

  const { data: mySedes = [], isLoading: isLoadingMySedes } =
    useWarehousesByCompany({
      my: 1,
      is_received: 1,
      ap_class_article_id: watchArticleClassId,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_COMERCIAL_ID,
    });

  // Determinar is_received para sedes según el motivo de traslado
  // Si es COMPRA (id: 19): is_received = 0 (almacenes que no han recibido)
  // Si NO es COMPRA: is_received = 1 (almacenes de recepción internos)
  const sedesIsReceived =
    watchTransferReasonId === SUNAT_CONCEPTS_ID.TRANSFER_REASON_COMPRA ? 0 : 1;

  const { data: sedes = [], isLoading: isLoadingSedes } =
    useWarehousesByCompany({
      my: 0,
      is_received: sedesIsReceived,
      ap_class_article_id: watchArticleClassId,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_COMERCIAL_ID,
    });

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

  // Traer todos los conceptos SUNAT con un solo llamado
  const { data: sunatConcepts = [], isLoading: isLoadingSunatConcepts } =
    useAllSunatConcepts({
      type: [
        SUNAT_CONCEPTS_TYPE.TRANSFER_REASON,
        SUNAT_CONCEPTS_TYPE.TYPE_TRANSPORTATION,
      ],
    });

  // Distribuir los conceptos según el tipo
  const reasonTransfer = sunatConcepts.filter(
    (concept) =>
      concept.id.toString() === SUNAT_CONCEPTS_ID.TRANSFER_REASON_OTROS,
  );

  const typeTransportation = sunatConcepts.filter(
    (concept) => concept.type === SUNAT_CONCEPTS_TYPE.TYPE_TRANSPORTATION,
  );

  // Cargar establecimientos cuando estemos en modo update
  const { data: originEstablishments = [] } = useAllEstablishments({
    business_partner_id: selectedSupplier?.id,
  });

  const { data: destinationEstablishments = [] } = useAllEstablishments({
    business_partner_id: selectedCustomer?.id,
  });

  // Inicializar establecimientos desde defaultValues al montar (solo en modo update)
  useEffect(() => {
    if (mode === "update" && defaultValues) {
      // Inicializar establecimientos origen
      if (
        defaultValues.transmitter_establishment &&
        !selectedOriginEstablishment
      ) {
        setSelectedOriginEstablishment({
          id: defaultValues.transmitter_establishment.id,
          code: defaultValues.transmitter_establishment.code,
          description: defaultValues.transmitter_establishment.description,
          full_address: defaultValues.transmitter_establishment.full_address,
        } as EstablishmentsResource);
      }

      // Inicializar establecimientos destino
      if (
        defaultValues.receiver_establishment &&
        !selectedDestinationEstablishment
      ) {
        setSelectedDestinationEstablishment({
          id: defaultValues.receiver_establishment.id,
          code: defaultValues.receiver_establishment.code,
          description: defaultValues.receiver_establishment.description,
          full_address: defaultValues.receiver_establishment.full_address,
        } as EstablishmentsResource);
      }
    }
  }, []); // Solo ejecutar al montar

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
      // NO limpiar selectedOriginEstablishment aquí - se limpiará en su propio useEffect
      const currentTransmitterId = form.getValues("transmitter_id");
      if (currentTransmitterId !== "") {
        form.setValue("transmitter_id", "", {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
  }, [watchTransmitterOriginId, suppliers.length]);

  // Actualizar el cliente seleccionado cuando cambie el campo
  useEffect(() => {
    if (watchTransmitterDestinoId && customers.length > 0) {
      const customer = customers.find(
        (c) => c.id.toString() === watchTransmitterDestinoId,
      );
      if (customer && selectedCustomer?.id !== customer.id) {
        setSelectedCustomer({
          id: customer.id,
          name: customer.full_name,
        });
      }
    } else if (!watchTransmitterDestinoId && selectedCustomer !== null) {
      setSelectedCustomer(null);
      // NO limpiar selectedDestinationEstablishment aquí - se limpiará en su propio useEffect
      const currentReceiverId = form.getValues("receiver_id");
      if (currentReceiverId !== "") {
        form.setValue("receiver_id", "", {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
  }, [watchTransmitterDestinoId, customers.length]);

  // Cargar establecimientos origen cuando watchTransmitterId cambia
  useEffect(() => {
    if (!watchTransmitterId) {
      if (selectedOriginEstablishment !== null) {
        setSelectedOriginEstablishment(null);
      }
      return;
    }

    // Buscar en la lista de establecimientos disponibles
    if (originEstablishments.length > 0) {
      const establishment = originEstablishments.find(
        (e) => e.id.toString() === watchTransmitterId,
      );
      if (
        establishment &&
        selectedOriginEstablishment?.id !== establishment.id
      ) {
        setSelectedOriginEstablishment(establishment);
      }
    }
  }, [watchTransmitterId, originEstablishments.length]);

  // Cargar establecimientos destino cuando watchReceiverId cambia
  useEffect(() => {
    if (!watchReceiverId) {
      if (selectedDestinationEstablishment !== null) {
        setSelectedDestinationEstablishment(null);
      }
      return;
    }

    // Buscar en la lista de establecimientos disponibles
    if (destinationEstablishments.length > 0) {
      const establishment = destinationEstablishments.find(
        (e) => e.id.toString() === watchReceiverId,
      );
      if (
        establishment &&
        selectedDestinationEstablishment?.id !== establishment.id
      ) {
        setSelectedDestinationEstablishment(establishment);
      }
    }
  }, [watchReceiverId, destinationEstablishments.length]);

  // UseEffect específico para Conductor:
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
  }, [conductorDniData, isFirstLoad]);

  // UseEffect para setear sedes cuando se selecciona una serie (Automotores)
  useEffect(() => {
    // En modo update en la primera carga, no sobrescribir valores
    if (mode === "update" && isFirstLoad) {
      return;
    }

    if (watchIssuerType === "SYSTEM") {
      const currentTransmitterOriginId = form.getValues(
        "transmitter_origin_id",
      );
      const currentReceiverDestinationId = form.getValues(
        "receiver_destination_id",
      );

      if (currentTransmitterOriginId !== AUTOMOTORES_PAKATNAMU_ID) {
        form.setValue("transmitter_origin_id", AUTOMOTORES_PAKATNAMU_ID, {
          shouldValidate: true,
        });
      }
      if (currentReceiverDestinationId !== AUTOMOTORES_PAKATNAMU_ID) {
        form.setValue("receiver_destination_id", AUTOMOTORES_PAKATNAMU_ID, {
          shouldValidate: true,
        });
      }

      if (watchDocumentSeriesId) {
        const selectedSeries = series.find(
          (s) => s.id.toString() === watchDocumentSeriesId,
        );
        if (selectedSeries && selectedSeries.sede_id) {
          const sedeId = selectedSeries.sede_id.toString();
          const currentSedeTransmitter = form.getValues("sede_transmitter_id");
          const currentSedeReceiver = form.getValues("sede_receiver_id");

          if (currentSedeTransmitter !== sedeId) {
            form.setValue("sede_transmitter_id", sedeId, {
              shouldValidate: true,
            });
          }
          if (currentSedeReceiver !== sedeId) {
            form.setValue("sede_receiver_id", sedeId, {
              shouldValidate: true,
            });
          }
        }
      }
    }
  }, [watchDocumentSeriesId, watchIssuerType, series.length]);

  // UseEffect para manejar el motivo de traslado entre sedes
  useEffect(() => {
    if (
      watchTransferReasonId === SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE
    ) {
      const currentIssuerType = form.getValues("issuer_type");
      const currentTransmitterOriginId = form.getValues(
        "transmitter_origin_id",
      );
      const currentReceiverDestinationId = form.getValues(
        "receiver_destination_id",
      );

      if (currentIssuerType !== "SYSTEM") {
        form.setValue("issuer_type", "SYSTEM", {
          shouldValidate: true,
        });
      }
      if (currentTransmitterOriginId !== AUTOMOTORES_PAKATNAMU_ID) {
        form.setValue("transmitter_origin_id", AUTOMOTORES_PAKATNAMU_ID, {
          shouldValidate: true,
        });
      }
      if (currentReceiverDestinationId !== AUTOMOTORES_PAKATNAMU_ID) {
        form.setValue("receiver_destination_id", AUTOMOTORES_PAKATNAMU_ID, {
          shouldValidate: true,
        });
      }
    }
  }, [watchTransferReasonId]);

  // Limpiar sedes cuando cambia la clase de artículo (solo si es un cambio manual, no al cargar)
  useEffect(() => {
    // En modo update, no limpiar las sedes al montar el componente
    // Solo limpiarlas cuando el usuario cambie la clase de artículo manualmente
    if (mode === "update" && isFirstLoad) {
      return;
    }

    if (watchArticleClassId) {
      const currentSedeTransmitter = form.getValues("sede_transmitter_id");
      const currentSedeReceiver = form.getValues("sede_receiver_id");

      // Resetear sedes si hay alguna seleccionada
      if (currentSedeTransmitter) {
        form.setValue("sede_transmitter_id", "", {
          shouldValidate: false,
        });
      }
      if (currentSedeReceiver) {
        form.setValue("sede_receiver_id", "", {
          shouldValidate: false,
        });
      }
    }
  }, [watchArticleClassId]);

  // Limpiar el vehículo seleccionado cuando cambia la sede o el motivo de traslado
  useEffect(() => {
    const currentVehicleId = form.getValues("ap_vehicle_id");

    if (currentVehicleId && vehiclesVn.length > 0) {
      const vehicleExists = vehiclesVn.some(
        (v) => v.id.toString() === currentVehicleId,
      );

      if (!vehicleExists) {
        form.setValue("ap_vehicle_id", "", {
          shouldValidate: false,
        });
      }
    } else if (
      currentVehicleId &&
      !isLoadingVehicles &&
      vehiclesVn.length === 0
    ) {
      // Si ya no hay vehículos disponibles, limpiar la selección
      form.setValue("ap_vehicle_id", "", {
        shouldValidate: false,
      });
    }
  }, [
    watchSedeTransmitterId,
    watchTransferReasonId,
    vehiclesVn,
    isLoadingVehicles,
  ]);

  const selectedVIN = vehiclesVn.find(
    (v) => v.id.toString() === form.getValues("ap_vehicle_id"),
  );

  useEffect(() => {
    if (selectedVIN?.model.net_weight !== undefined) {
      form.setValue("total_weight", String(selectedVIN.model.net_weight));
    }
  }, [selectedVIN]);

  // Manejar sede destino cuando cambia el motivo de traslado
  useEffect(() => {
    if (watchTransferReasonId) {
      const currentSedeReceiver = form.getValues("sede_receiver_id");

      // Si es COMPRA u OTROS, setear sede destino igual a sede origen
      if (
        (watchTransferReasonId === SUNAT_CONCEPTS_ID.TRANSFER_REASON_COMPRA ||
          watchTransferReasonId === SUNAT_CONCEPTS_ID.TRANSFER_REASON_OTROS) &&
        watchSedeTransmitterId &&
        currentSedeReceiver !== watchSedeTransmitterId
      ) {
        form.setValue("sede_receiver_id", watchSedeTransmitterId, {
          shouldValidate: false,
        });
      }
    }
  }, [watchTransferReasonId, watchSedeTransmitterId]);

  if (
    isLoadingCustomers ||
    isLoadingSuppliers ||
    isLoadingSunatConcepts ||
    isLoadingSeries ||
    isLoadingArticleClass
  ) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
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
            control={form.control}
            name="document_type"
            label="Tipo de Documento"
            placeholder="Seleccione tipo"
            options={DOCUMENT_TYPES}
          />

          <FormSelect
            name="transfer_reason_id"
            label="Motivo de Traslado"
            placeholder="Selecciona motivo"
            options={reasonTransfer.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            control={form.control}
            name="issuer_type"
            label="Tipo de Emisor"
            placeholder="Seleccione emisor"
            options={ISSUER_TYPES}
            disabled={
              watchTransferReasonId ===
              SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE
            }
          />

          <FormSelect
            name="ap_class_article_id"
            label="Clase de Artículo"
            placeholder="Selecciona una Clase"
            options={articleClass.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          {/* Serie - Condicional según Tipo de Emisor */}
          {watchIssuerType === "PROVEEDOR" ? (
            <FormInput
              control={form.control}
              name="series"
              label="Serie"
              placeholder="Ej: T001"
              maxLength={4}
              uppercase
            />
          ) : (
            <FormSelect
              name="document_series_id"
              label="Serie"
              placeholder="Selecciona serie"
              options={series.map((item) => ({
                label: item.series + " " + item.sede,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={watchIssuerType !== "SYSTEM"}
            />
          )}

          {/* Correlativo - Condicional según Tipo de Emisor */}
          {watchIssuerType === "PROVEEDOR" && (
            <FormInput
              control={form.control}
              name="correlative"
              label="Correlativo"
              placeholder="Ej: 00001234"
              uppercase
            />
          )}

          {vehiclesIsReceived ? (
            <FormSelect
              key={`sede-transmitter-${watchArticleClassId}`}
              name="sede_transmitter_id"
              label="Sede Origen"
              placeholder="Selecciona sede"
              options={mySedes.map((item) => ({
                label: item.sede,
                description: item.description,
                value: item.sede_id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={!watchArticleClassId || isLoadingMySedes}
            />
          ) : null}

          {/* Sede Destino - Mostrar siempre pero con diferentes comportamientos */}
          {(watchTransferReasonId === SUNAT_CONCEPTS_ID.TRANSFER_REASON_OTROS ||
            watchTransferReasonId ===
              SUNAT_CONCEPTS_ID.TRANSFER_REASON_COMPRA) && (
            <div className="space-y-1">
              <FormSelect
                key={`sede-receiver-same-${watchTransferReasonId}`}
                name="sede_receiver_id"
                label="Sede Destino"
                placeholder="Selecciona sede"
                options={mySedes.map((item) => ({
                  label: item.sede,
                  description: item.description,
                  value: item.sede_id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
                disabled={true}
              />
              <p className="text-xs text-muted-foreground italic">
                La sede de destino es la misma que la sede de origen
              </p>
            </div>
          )}

          {watchTransferReasonId !== SUNAT_CONCEPTS_ID.TRANSFER_REASON_OTROS &&
            watchTransferReasonId !==
              SUNAT_CONCEPTS_ID.TRANSFER_REASON_COMPRA && (
              <FormSelect
                key={`sede-receiver-${watchTransferReasonId}-${sedesIsReceived}`}
                name="sede_receiver_id"
                label="Sede Destino"
                placeholder="Selecciona sede"
                options={sedes.map((item) => ({
                  label: item.sede,
                  description: item.description,
                  value: item.sede_id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
                disabled={!watchArticleClassId || isLoadingSedes}
              />
            )}

          <div className="flex gap-2">
            <div className="flex-1">
              <FormSelect
                key={`vehicle-${watchSedeTransmitterId}-${watchTransferReasonId}-${vehiclesIsReceived}`}
                name="ap_vehicle_id"
                label="Vehículo"
                placeholder="Selecciona vehículo"
                options={vehiclesVn.map((item) => ({
                  label: item.vin ?? "",
                  value: item.id.toString(),
                  description:
                    item.sede_name_warehouse + " - " + item.warehouse_name ||
                    "",
                }))}
                control={form.control}
                strictFilter={true}
                withValue={false}
                disabled={!watchSedeTransmitterId || isLoadingVehicles}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="aspect-square"
                onClick={() => setIsVehicleModalOpen(true)}
                tooltip="Agregar nuevo vehículo comercial"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

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

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Translado"
            disabledRange={{ before: new Date() }}
          />

          <FormInput
            control={form.control}
            name="total_packages"
            label="Núm. Bultos"
            placeholder="1"
            type="number"
          />

          <FormInput
            control={form.control}
            name="total_weight"
            label="Peso Total"
            placeholder="100"
            type="number"
          />

          <div className="space-y-4 col-span-full">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas u Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones adicionales sobre el traslado..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </GroupFormSection>

        {/* Sección: Información del Conductor y Vehículo */}
        <GroupFormSection
          icon={Truck}
          title="Conductor y Vehículo"
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{
            sm: 1,
            md: 2,
            lg: 3,
          }}
        >
          {/* Ubicación Origen */}
          <div className="space-y-2 col-span-full">
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
              disabled={
                watchTransferReasonId ===
                SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE
              }
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
          <div className="space-y-2 col-span-full">
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

          <div className="md:col-span-2">
            <FormSelect
              name="transport_company_id"
              label="Empresa Transporte"
              placeholder="Selecciona empresa"
              options={suppliers.map((item) => ({
                label: item.full_name,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
            />
          </div>

          <FormInput
            control={form.control}
            name="driver_doc"
            label={
              <div className="flex items-center gap-2 relative">
                DNI del Conductor
                <DocumentValidationStatus
                  shouldValidate={true}
                  documentNumber={conductorDni || ""}
                  expectedDigits={8}
                  isValidating={isConductorDniLoading}
                  leftPosition="right-0"
                />
              </div>
            }
            placeholder="Ej: ABC-123"
            maxLength={8}
            addonEnd={
              <ValidationIndicator
                show={!!conductorDni}
                isValidating={isConductorDniLoading}
                isValid={conductorDniData?.success && !!conductorDniData.data}
                hasError={
                  !!conductorDniError ||
                  (conductorDniData && !conductorDniData.success)
                }
              />
            }
          />

          <FormInput
            control={form.control}
            name="driver_name"
            label="Nombre del Conductor"
            placeholder="Nombre completo"
            uppercase
          />

          <FormInput
            control={form.control}
            name="license"
            label={
              <div className="flex items-center gap-2 relative">
                Licencia de Conducir
                {conductorDniData?.success &&
                  conductorDniData.data?.licencia?.estado && (
                    <span className="text-xs font-normal text-primary absolute right-0">
                      {conductorDniData.data.licencia.estado}
                    </span>
                  )}
              </div>
            }
            uppercase
            placeholder="Ej: Q12345678"
          />

          <FormInput
            control={form.control}
            name="plate"
            label="Placa del Vehículo (cigueña)"
            placeholder="Ej: ABC-123"
            uppercase
          />
        </GroupFormSection>

        {/* Sección: Imagen de la Guía */}
        <div className="space-y-4">
          <ImageUploadField
            form={form}
            name="file"
            label="Foto de la Guía de Remisión"
            maxSizeInMB={5}
            required={false}
          />
        </div>
        {/* 
        <pre>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
        </pre> */}

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
                ? "Crear Guía de Remisión"
                : "Actualizar Guía de Remisión"}
          </Button>
        </div>

        {/* Modales para selección de establecimientos */}
        <EstablishmentSelectorModal
          open={isOriginModalOpen}
          onOpenChange={setIsOriginModalOpen}
          businessPartnerId={selectedSupplier?.id || null}
          businessPartnerName={selectedSupplier?.name || ""}
          onSelectEstablishment={(establishment) => {
            setSelectedOriginEstablishment(establishment);
            // Guardar el establishment_id en transmitter_id (el campo que va a la API)
            form.setValue("transmitter_id", establishment.id.toString(), {
              shouldValidate: true,
            });
          }}
          sede_id={watchSedeTransmitterId}
        />

        <EstablishmentSelectorModal
          open={isDestinationModalOpen}
          onOpenChange={setIsDestinationModalOpen}
          businessPartnerId={selectedCustomer?.id || null}
          businessPartnerName={selectedCustomer?.name || ""}
          onSelectEstablishment={(establishment) => {
            setSelectedDestinationEstablishment(establishment);
            // Guardar el establishment_id en receiver_id (el campo que va a la API)
            form.setValue("receiver_id", establishment.id.toString(), {
              shouldValidate: true,
            });
          }}
          sede_id={form.watch("sede_receiver_id")}
        />

        <VehicleModal
          open={isVehicleModalOpen}
          onClose={() => {
            setIsVehicleModalOpen(false);
            queryClient.invalidateQueries({
              queryKey: [VEHICLES.QUERY_KEY],
            });
          }}
          title="Agregar Vehículo Comercial"
          typeOperationId={CM_COMERCIAL_ID}
        />
      </form>
    </Form>
  );
};
