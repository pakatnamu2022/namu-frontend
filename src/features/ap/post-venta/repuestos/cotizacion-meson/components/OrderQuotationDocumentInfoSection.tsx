import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FileText, AlertCircle, CheckCircle } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { useMemo } from "react";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

interface OrderQuotationDocumentInfoSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  isEdit: boolean;
  documentTypes: SunatConceptsResource[];
  authorizedSeries: AssignSalesSeriesResource[];
  isAdvancePayment: boolean;
  currencyTypes: SunatConceptsResource[];
  isFromQuotation?: boolean;
  defaultCustomer?: CustomersResource;
  hasSufficientStock?: boolean;
  pendingBalance?: number;
  lockedClientId?: number | null;
  lockedClientName?: string;
  lockedClientDoc?: string;
}

export function OrderQuotationDocumentInfoSection({
  form,
  isEdit,
  documentTypes,
  authorizedSeries,
  isAdvancePayment,
  currencyTypes,
  isFromQuotation = false,
  defaultCustomer,
  hasSufficientStock = true,
  pendingBalance = 0,
  lockedClientId = null,
  lockedClientName = "",
  lockedClientDoc = "",
}: OrderQuotationDocumentInfoSectionProps) {
  // Estado para almacenar el cliente seleccionado
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomersResource | undefined
  >(defaultCustomer);

  // Crear defaultOption desde lockedClient o defaultCustomer
  const defaultOption = useMemo(() => {
    // Prioridad 1: Cliente bloqueado desde anticipos
    if (lockedClientId && lockedClientName) {
      const option = {
        value: lockedClientId.toString(),
        label: `${lockedClientName} - ${lockedClientDoc || "S/N"}`,
      };
      return option;
    }
    // Prioridad 2: Cliente por defecto de la cotización
    if (defaultCustomer) {
      const option = {
        value: defaultCustomer.id.toString(),
        label: `${defaultCustomer.full_name} - ${
          defaultCustomer.num_doc || "S/N"
        }`,
      };
      return option;
    }
    return undefined;
  }, [defaultCustomer, lockedClientId, lockedClientName, lockedClientDoc]);

  // Filtrar series según is_advance_payment
  const filteredSeries = useMemo(() => {
    if (isAdvancePayment) {
      // Si es anticipo, mostrar solo series con is_advance: true
      return authorizedSeries.filter((series) => series.is_advance === true);
    } else {
      // Si no es anticipo, mostrar solo series con is_advance: false
      return authorizedSeries.filter((series) => series.is_advance === false);
    }
  }, [authorizedSeries, isAdvancePayment]);

  // Observar cambios en el cliente
  const clientId = form.watch("client_id");

  // Setear el cliente por defecto cuando se monta el componente
  useEffect(() => {
    // Si hay un cliente bloqueado desde los anticipos, tiene prioridad ABSOLUTA
    if (lockedClientId) {
      const lockedIdString = lockedClientId.toString();
      // Solo actualizar si es diferente al actual
      if (clientId !== lockedIdString) {
        form.setValue("client_id", lockedIdString, {
          shouldValidate: false,
        });
      }
    } else if (defaultCustomer && !clientId) {
      form.setValue("client_id", defaultCustomer.id.toString(), {
        shouldValidate: false,
      });
    }
  }, [defaultCustomer, clientId, form, lockedClientId]);

  // Forzar el switch a true (anticipo) cuando no hay stock suficiente
  useEffect(() => {
    if (!hasSufficientStock) {
      form.setValue("is_advance_payment", true, {
        shouldValidate: false,
      });
    }
  }, [hasSufficientStock, form]);

  // Determinar si el switch debe estar habilitado
  // Se habilita cuando: hay stock suficiente O el saldo pendiente es 0 (ya pagó todo)
  const isToggleEnabled = hasSufficientStock || pendingBalance === 0;

  // Filtrar tipos de documento según el document_type_id del cliente
  const filteredDocumentTypes = documentTypes.filter((type) => {
    if (!selectedCustomer) return true; // Si no hay cliente seleccionado, mostrar todos

    const documentTypeId = selectedCustomer.document_type_id;

    // Si el cliente tiene RUC (810), solo mostrar Factura (id: 29)
    if (Number(documentTypeId) === 810) {
      return type.id === SUNAT_TYPE_INVOICES_ID.FACTURA;
    }

    // Si el cliente tiene Cédula (809), solo mostrar el tipo con id 30
    if (Number(documentTypeId) === 809) {
      return type.id === SUNAT_TYPE_INVOICES_ID.BOLETA;
    }

    // Para otros tipos de documento, mostrar todos
    return true;
  });

  // Validar y limpiar tipo de documento cuando cambia el cliente
  useEffect(() => {
    if (!selectedCustomer) return;

    const currentDocumentTypeId = form.getValues(
      "sunat_concept_document_type_id",
    );

    // Si hay un tipo de documento seleccionado, verificar si sigue siendo válido
    if (currentDocumentTypeId) {
      const isValid = filteredDocumentTypes.some(
        (type) => type.id.toString() === currentDocumentTypeId,
      );

      // Si el tipo de documento actual no es válido, limpiarlo
      if (!isValid) {
        form.setValue("sunat_concept_document_type_id", "");
        form.setValue("serie", ""); // También limpiar la serie ya que depende del tipo
      }
    }
  }, [selectedCustomer, filteredDocumentTypes, form]);

  // Validar y limpiar serie cuando cambia isAdvancePayment
  useEffect(() => {
    const currentSerieId = form.getValues("serie");

    // Si hay una serie seleccionada, verificar si sigue siendo válida
    if (currentSerieId) {
      const isValid = filteredSeries.some(
        (series) => series.id.toString() === currentSerieId,
      );

      // Si la serie actual no es válida, limpiarla
      if (!isValid) {
        form.setValue("serie", "");
      }
    }
  }, [isAdvancePayment, filteredSeries, form]);

  return (
    <>
      {/* Alerta de Stock */}
      {isFromQuotation && (
        <div className="mb-6 rounded-md border p-4 bg-blue-50/50 border-blue-200">
          <div className="flex gap-3">
            {hasSufficientStock ? (
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-gray-700 leading-relaxed">
              {hasSufficientStock
                ? "Los repuestos de esta cotización cuentan con stock suficiente. Puede realizar una venta completa o un anticipo."
                : "Existen repuestos en esta cotización que no cuentan con stock suficiente. Solo se permite generar un anticipo."}
            </p>
          </div>
        </div>
      )}

      <GroupFormSection
        title="Información del Documento"
        icon={FileText}
        iconColor="text-primary"
        bgColor="bg-primary/5"
        cols={{ sm: 1, md: 3 }}
      >
        <div className="md:col-span-3">
          <FormSelectAsync
            name="client_id"
            label="Cliente *"
            placeholder="Seleccionar cliente"
            control={form.control}
            useQueryHook={useCustomers}
            mapOptionFn={(customer) => ({
              value: customer.id.toString(),
              label: `${customer.full_name} - ${customer.num_doc || "S/N"}`,
            })}
            description={
              lockedClientId
                ? "Cliente bloqueado: Ya existen pagos aplicados para este cliente"
                : isFromQuotation
                  ? "Cliente asignado desde la cotización (puede modificarlo si lo desea)"
                  : "Seleccione el cliente"
            }
            perPage={10}
            debounceMs={500}
            disabled={isEdit || !!lockedClientId}
            defaultOption={defaultOption}
            onValueChange={(_, customer) => {
              // Actualizar el estado con el cliente seleccionado
              if (customer) {
                setSelectedCustomer(customer as CustomersResource);
              } else {
                setSelectedCustomer(undefined);
              }
            }}
          />
        </div>

        <FormSelect
          control={form.control}
          name="sunat_concept_document_type_id"
          options={filteredDocumentTypes.map((type) => ({
            value: type.id.toString(),
            label: type.description,
          }))}
          label="Tipo de Comprobante"
          description="Seleccione el tipo de comprobante electrónico"
          placeholder="Seleccionar tipo de comprobante"
          required
        />

        {/* Switch de Anticipo */}
        <FormSwitch
          control={form.control}
          name="is_advance_payment"
          label="Tipo de Operación"
          disabled={!isToggleEnabled}
          text={isAdvancePayment ? "Anticipo" : "Venta Interna"}
          description={
            !hasSufficientStock && pendingBalance > 0
              ? "Sin stock suficiente: Solo se permite anticipo"
              : pendingBalance === 0
                ? "Pago completo realizado: Puede generar documento de venta final"
                : isAdvancePayment
                  ? "Tipo de operación: Venta Interna - Anticipos (código 04)"
                  : "Tipo de operación: Venta Interna (código 01)"
          }
        />

        <FormSelect
          control={form.control}
          name="sunat_concept_currency_id"
          options={currencyTypes.map((type) => ({
            value: type.id.toString(),
            label: type.description,
          }))}
          label="Moneda"
          description="Seleccione la moneda del documento"
          placeholder="Seleccionar moneda"
          required
          disabled={isFromQuotation}
        />

        <DatePickerFormField
          control={form.control}
          name="fecha_de_emision"
          label="Fecha de Emisión *"
          placeholder="Seleccione fecha"
          description="Seleccione la fecha de emisión del documento"
          disabledRange={{
            before: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1,
            ),
            after: new Date(),
          }}
        />

        <FormSelect
          control={form.control}
          name="serie"
          options={filteredSeries.map((series) => ({
            value: series.id.toString(),
            label: `${series.series} - ${series.sede || ""}`,
          }))}
          label="Serie"
          description={
            isAdvancePayment
              ? "Series autorizadas para anticipos"
              : "Series autorizadas para su usuario"
          }
          placeholder="Seleccionar serie"
          required
        />

        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Auto-generado"
                  disabled
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {isEdit
                  ? "El correlativo no se puede modificar"
                  : "Se genera automáticamente"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </GroupFormSection>
    </>
  );
}
