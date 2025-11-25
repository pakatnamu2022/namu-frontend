"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Truck, Package, Plus, Trash2 } from "lucide-react";
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
import { useAllSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import { useLicenseValidation } from "@/shared/hooks/useDocumentValidation";
import { useAllProduct } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { Card } from "@/components/ui/card";
import { EMPRESA_AP, CM_POSTVENTA_ID } from "@/core/core.constants";

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
      details: defaultValues.details || [],
    },
    mode: "onChange",
  });

  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");
  const conductorDni = form.watch("driver_doc");

  const {
    data: conductorDniData,
    isLoading: isConductorDniLoading,
    error: conductorDniError,
  } = useLicenseValidation(
    conductorDni,
    !isFirstLoad && !!conductorDni && conductorDni.length === 8
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const watchWarehouseOriginId = form.watch("warehouse_origin_id");
  const watchWarehouseDestinationId = form.watch("warehouse_destination_id");
  const watchTransportCompanyId = form.watch("transport_company_id");

  // Obtener almacenes
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useWarehousesByCompany({
      is_received: 1,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_POSTVENTA_ID,
    });

  // Obtener productos
  const { data: products = [], isLoading: isLoadingProducts } = useAllProduct();

  // Obtener proveedores/empresas de transporte
  const { data: suppliers = [], isLoading: isLoadingSuppliers } =
    useAllSuppliers({
      status_ap: 1,
    });

  // Obtener motivos de entrada/salida
  // const { data: reasonsInOut = [], isLoading: isLoadingReasonsInOut } =
  //   useAllReasonInOut();

  // Traer todos los conceptos SUNAT
  const { data: sunatConcepts = [], isLoading: isLoadingSunatConcepts } =
    useAllSunatConcepts({
      type: [
        SUNAT_CONCEPTS_TYPE.TRANSFER_REASON,
        SUNAT_CONCEPTS_TYPE.TYPE_TRANSPORTATION,
      ],
    });

  // Distribuir los conceptos según el tipo
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
  }, [conductorDniData, isFirstLoad]);

  // Autocompletar dirección y ubigeo de origen cuando se selecciona almacén origen
  useEffect(() => {
    if (watchWarehouseOriginId) {
      const warehouse = warehouses.find(
        (w) => w.id.toString() === watchWarehouseOriginId
      );
      if (warehouse) {
        // form.setValue("origin_address", warehouse.full_address || "");
        // form.setValue("origin_ubigeo", warehouse.ubigeo || "");
      }
    }
  }, [watchWarehouseOriginId, warehouses]);

  // Autocompletar dirección y ubigeo de destino cuando se selecciona almacén destino
  useEffect(() => {
    if (watchWarehouseDestinationId) {
      const warehouse = warehouses.find(
        (w) => w.id.toString() === watchWarehouseDestinationId
      );
      if (warehouse) {
        // form.setValue("destination_address", warehouse.full_address || "");
        // form.setValue("destination_ubigeo", warehouse.ubigeo || "");
      }
    }
  }, [watchWarehouseDestinationId, warehouses]);

  // Autocompletar RUC y nombre de empresa de transporte
  useEffect(() => {
    if (watchTransportCompanyId) {
      const supplier = suppliers.find(
        (s) => s.id.toString() === watchTransportCompanyId
      );
      if (supplier) {
        // form.setValue("ruc_transport", supplier.ruc || "");
        // form.setValue("company_name_transport", supplier.full_name || "");
      }
    }
  }, [watchTransportCompanyId, suppliers]);

  const handleAddDetail = () => {
    append({
      product_id: "",
      quantity: "1",
      unit_cost: "0",
      notes: "",
    });
  };

  if (
    isLoadingWarehouses ||
    isLoadingSuppliers ||
    isLoadingSunatConcepts ||
    isLoadingProducts
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
          />

          <DatePickerFormField
            control={form.control}
            name="movement_date"
            label="Fecha de Movimiento"
            disabledRange={{ before: new Date() }}
          />

          {/* <FormSelect
            name="reason_in_out_id"
            label="Motivo de Entrada/Salida"
            placeholder="Selecciona motivo"
            options={reasonsInOut.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          /> */}

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
        </GroupFormSection>

        {/* Sección: Información del Conductor y Transporte */}
        <GroupFormSection
          icon={Truck}
          title="Conductor y Transporte"
          iconColor="text-blue-600 dark:text-blue-100"
          bgColor="bg-blue-50 dark:bg-blue-950"
          cols={{
            sm: 1,
            md: 2,
            lg: 3,
          }}
        >
          <FormSelect
            name="transport_company_id"
            label="Empresa de Transporte"
            placeholder="Selecciona empresa"
            options={suppliers.map((item) => ({
              label: item.full_name,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <FormField
            control={form.control}
            name="ruc_transport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC de Transporte</FormLabel>
                <FormControl>
                  <Input placeholder="20123456789" maxLength={11} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_name_transport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa del Vehículo</FormLabel>
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

          <FormField
            control={form.control}
            name="origin_ubigeo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubigeo de Origen</FormLabel>
                <FormControl>
                  <Input placeholder="150101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="origin_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Origen</FormLabel>
                <FormControl>
                  <Input placeholder="Dirección completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination_ubigeo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubigeo de Destino</FormLabel>
                <FormControl>
                  <Input placeholder="130101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Destino</FormLabel>
                <FormControl>
                  <Input placeholder="Dirección completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Sección: Detalles de Productos */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Productos a Transferir</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDetail}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay productos agregados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">
                      Producto {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`details.${index}.unit_cost`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Costo Unitario *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
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
                            <Input placeholder="Observaciones" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
