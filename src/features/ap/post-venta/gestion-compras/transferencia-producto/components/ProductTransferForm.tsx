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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader,
  Truck,
  Package,
  Plus,
  Trash2,
  Box,
  FileText,
} from "lucide-react";
import {
  ProductTransferSchema,
  productTransferSchemaCreate,
  productTransferSchemaUpdate,
} from "../lib/productTransfer.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { PRODUCT_TRANSFER } from "../lib/productTransfer.constants";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import { useLicenseValidation } from "@/shared/hooks/useDocumentValidation";
import { useAllProduct } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { Card } from "@/components/ui/card";
import {
  EMPRESA_AP,
  CM_POSTVENTA_ID,
  BUSINESS_PARTNERS,
} from "@/core/core.constants";
import {
  TYPE_OPERATION,
  TYPE_RECEIPT_SERIES,
} from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { useAllTypeClient } from "@/features/ap/configuraciones/maestros-general/tipos-persona/lib/typeClient.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface";

interface ProductTransferFormProps {
  defaultValues: Partial<ProductTransferSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const ProductTransferForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ProductTransferFormProps) => {
  const { ABSOLUTE_ROUTE } = PRODUCT_TRANSFER;
  const router = useNavigate();
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? productTransferSchemaCreate
        : productTransferSchemaUpdate
    ) as any,
    defaultValues: {
      ...defaultValues,
      item_type: defaultValues.item_type || "PRODUCTO",
      issuer_type: defaultValues.issuer_type || "NOSOTROS",
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

  // Determinar si es persona natural o jurídica
  const isPersonaNatural =
    typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID;
  const isPersonaJuridica =
    typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID;

  // Determinar si es producto o servicio
  const isProducto = transferType === "PRODUCTO";
  const isServicio = transferType === "SERVICIO";

  const {
    data: conductorDniData,
    isLoading: isConductorDniLoading,
    error: conductorDniError,
  } = useLicenseValidation(
    conductorDni,
    !isFirstLoad &&
      isPersonaNatural &&
      !!conductorDni &&
      conductorDni.length === 8
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const watchWarehouseOriginId = form.watch("warehouse_origin_id");

  // Obtener almacenes
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useWarehousesByCompany({
      my: 1,
      is_received: 1,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_POSTVENTA_ID,
      only_physical: 1,
    });

  // Obtener productos
  const { data: products = [], isLoading: isLoadingProducts } = useAllProduct({
    warehouse_id: form.watch("warehouse_origin_id") || undefined,
  });

  const { data: typesPerson = [], isLoading: isLoadingTypesPerson } =
    useAllTypeClient();

  const { data: series = [], isLoading: isLoadingSeries } = useAuthorizedSeries(
    {
      type_operation_id: TYPE_OPERATION.COMERCIAL,
      type_receipt_id: TYPE_RECEIPT_SERIES.GUIA_REMISION,
    }
  );

  // Filtrar series según la sede del almacén origen seleccionado
  const filteredSeries = series.filter((serie) => {
    if (!watchWarehouseOriginId) return true;
    const warehouse = warehouses.find(
      (w) => w.id.toString() === watchWarehouseOriginId
    );
    return warehouse ? serie.sede_id === warehouse.sede_id : true;
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
    (concept) => concept.type === SUNAT_CONCEPTS_TYPE.TRANSFER_REASON
  );

  const typeTransportation = sunatConcepts.filter(
    (concept) => concept.type === SUNAT_CONCEPTS_TYPE.TYPE_TRANSPORTATION
  );

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

  // Limpiar serie cuando cambia el almacén origen
  useEffect(() => {
    const currentSeriesId = form.getValues("document_series_id");
    if (currentSeriesId && watchWarehouseOriginId) {
      const isValidSeries = filteredSeries.some(
        (serie) => serie.id.toString() === currentSeriesId
      );
      if (!isValidSeries && mode === "create") {
        form.setValue("document_series_id", "");
      }
    }
  }, [watchWarehouseOriginId, filteredSeries, form, mode]);

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
    isLoadingWarehouses ||
    isLoadingSunatConcepts ||
    isLoadingSeries ||
    isLoadingTypesPerson
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
            name="warehouse_origin_id"
            label="Almacén de Origen"
            placeholder="Selecciona almacén"
            options={warehouses.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
            disabled={mode === "update"}
          />

          <FormSelect
            name="warehouse_destination_id"
            label="Almacén de Destino"
            placeholder="Selecciona almacén"
            options={warehouses.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
            disabled={mode === "update"}
          />

          <DatePickerFormField
            control={form.control}
            name="movement_date"
            label="Fecha de Movimiento"
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
            disabled={!watchWarehouseOriginId}
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
            disabled={true}
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

          <FormField
            control={form.control}
            name="total_packages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Núm. Bultos</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Total (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
                    BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID
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

              <FormField
                control={form.control}
                name="driver_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Conductor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                  disabled={mode === "update"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    isProducto
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  } ${
                    mode === "update"
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
                      <FormSelect
                        name={`details.${index}.product_id`}
                        label="Producto *"
                        placeholder="Selecciona"
                        options={products.map((product) => ({
                          label: `${product.name} (${product.code})`,
                          value: product.id.toString(),
                        }))}
                        control={form.control}
                        strictFilter={true}
                        disabled={isLoadingProducts || mode === "update"}
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
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas u Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales sobre la transferencia..."
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
      </form>
    </Form>
  );
};
