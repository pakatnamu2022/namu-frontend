import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FileText, AlertCircle, CheckCircle, Info } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/series/lib/assignSalesSeries.interface";
import { getTodayOnlyDisabledRange } from "@/core/core.function";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { useMemo } from "react";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { FormInput } from "@/shared/components/FormInput";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OrderQuotationDocumentInfoSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  isEdit: boolean;
  documentTypes: SunatConceptsResource[];
  authorizedSeries: AssignSalesSeriesResource[];
  isAdvancePayment: boolean;
  currencyTypes: SunatConceptsResource[];
  isFromQuotation?: boolean;
  defaultCustomer?: CustomersResource;
  canGenerateFinalReceipt?: {
    can_final_receipt: boolean;
    can_advance: boolean;
    is_toggle_enabled: boolean;
    message: string | null;
  };
  lockedClientId?: number | null;
  lockedClientName?: string;
  lockedClientDoc?: string;
  // Modo de facturación del comprobante (Normal / Gratuita), controlado a nivel de documento.
  billingMode?: "normal" | "gratuita";
  onBillingModeChange?: (mode: "normal" | "gratuita") => void;
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
  canGenerateFinalReceipt,
  lockedClientId = null,
  lockedClientName = "",
  lockedClientDoc = "",
  billingMode = "normal",
  onBillingModeChange,
}: OrderQuotationDocumentInfoSectionProps) {
  // Estado para almacenar el cliente seleccionado
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomersResource | undefined
  >(undefined);

  // Observar cambios en el cliente
  const clientId = form.watch("client_id");

  // En modo edición, el cliente real viene del client_id del form (documento existente),
  // no del defaultCustomer (que es el cliente de la cotización y puede ser distinto)
  const { data: customerFromApi } = useCustomersById(
    isEdit && clientId ? Number(clientId) : 0,
  );

  // Resolver el cliente efectivo: en edición usar el de la API, sino el estado local o defaultCustomer
  const effectiveCustomer = isEdit
    ? customerFromApi
    : (selectedCustomer ?? defaultCustomer);

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
    } else if (defaultCustomer) {
      form.setValue("client_id", defaultCustomer.id.toString(), {
        shouldValidate: false,
      });
    }
  }, [defaultCustomer?.id, lockedClientId, form]);

  // Fuente de verdad: la regla de Tipo de Operación la evalúa el backend.
  // Mientras no llegue el dato (carga inicial), el switch queda bloqueado.
  const canFinalReceipt = canGenerateFinalReceipt?.can_final_receipt ?? true;
  const canAdvance = canGenerateFinalReceipt?.can_advance ?? true;
  const isToggleEnabled = canGenerateFinalReceipt?.is_toggle_enabled ?? false;
  // Sin stock suficiente es el único caso donde el backend niega el comprobante final.
  const hasSufficientStock = canFinalReceipt;

  // Forzar el switch a true (anticipo) cuando no se puede emitir comprobante final
  // Forzar el switch a false (venta interna) cuando no se puede emitir anticipo
  useEffect(() => {
    if (!canFinalReceipt) {
      form.setValue("is_advance_payment", true, {
        shouldValidate: false,
      });
    } else if (!canAdvance) {
      form.setValue("is_advance_payment", false, {
        shouldValidate: false,
      });
    }
  }, [canFinalReceipt, canAdvance, form]);

  // Filtrar tipos de documento según el document_type_id del cliente
  const filteredDocumentTypes = documentTypes.filter((type) => {
    // Prioridad 1: si hay cliente bloqueado, determinar por longitud del doc
    if (lockedClientId && lockedClientDoc) {
      const isRuc = lockedClientDoc.trim().length === 11;
      if (isRuc) return type.id === SUNAT_TYPE_INVOICES_ID.FACTURA;
      return type.id === SUNAT_TYPE_INVOICES_ID.BOLETA;
    }

    if (!effectiveCustomer) return true; // Si no hay cliente seleccionado, mostrar todos

    const documentTypeId = effectiveCustomer.document_type_id;

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
    if (!effectiveCustomer) return;

    // Si la lista de tipos aún no cargó, no limpiar nada
    if (filteredDocumentTypes.length === 0) return;

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
  }, [isEdit, effectiveCustomer, filteredDocumentTypes, form]);

  // Validar y limpiar serie cuando cambia isAdvancePayment
  useEffect(() => {
    if (isEdit) return;
    const currentSerieId = form.getValues("serie");

    // Si hay una serie seleccionada, verificar si sigue siendo válida
    if (currentSerieId) {
      const isValid = authorizedSeries.some(
        (series) => series.id.toString() === currentSerieId,
      );

      // Si la serie actual no es válida, limpiarla
      if (!isValid) {
        form.setValue("serie", "");
      }
    }
  }, [isEdit, isAdvancePayment, authorizedSeries, form]);

  return (
    <>
      {/* Alerta de Stock */}
      {isFromQuotation && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            hasSufficientStock
              ? "border-emerald-200 bg-emerald-50/70"
              : "border-rose-200 bg-rose-50/70"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-full p-1.5 ${
                hasSufficientStock
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {hasSufficientStock ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
            </div>

            <div className="space-y-1">
              <p
                className={`text-sm font-semibold ${
                  hasSufficientStock ? "text-emerald-800" : "text-rose-800"
                }`}
              >
                {hasSufficientStock ? "Stock disponible" : "Stock insuficiente"}
              </p>
              <p
                className={`text-sm leading-relaxed ${
                  hasSufficientStock ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {hasSufficientStock
                  ? "Los repuestos de esta cotización cuentan con stock suficiente. Puede realizar una venta completa o un anticipo."
                  : (canGenerateFinalReceipt?.message ??
                    "Existen repuestos en esta cotización que no cuentan con stock suficiente. Solo se permite generar un anticipo.")}
              </p>
            </div>
          </div>
        </div>
      )}

      <GroupFormSection
        title="Información del Documento"
        icon={FileText}
        color="primary"
        cols={{ sm: 1, md: 3 }}
      >
        <div className="md:col-span-3">
          <FormSelectAsync
            name="client_id"
            label="Cliente *"
            placeholder="Seleccionar cliente"
            control={form.control}
            useQueryHook={useCustomers}
            useFindByIdHook={useCustomersById}
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
            disabled={true}
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
            canGenerateFinalReceipt?.message
              ? canGenerateFinalReceipt.message
              : isAdvancePayment
                ? "Tipo de operación: Venta Interna - Anticipos (código 04)"
                : "Tipo de operación: Venta Interna (código 01)"
          }
        />

        {/* Switch de Modo de Facturación (Normal / Gratuita) */}
        <div className="flex flex-col gap-1">
          <Label className="h-fit flex mb-1">Tipo de Facturación</Label>
          <Label
            className={cn(
              "flex flex-row items-center justify-between rounded-md border shadow-xs bg-background h-8 p-3 gap-3",
              isAdvancePayment
                ? "opacity-60"
                : "hover:bg-muted hover:cursor-pointer",
            )}
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">
                {billingMode === "gratuita" ? "Gratuita" : "Normal"}
              </p>
            </div>
            <Switch
              checked={billingMode === "gratuita"}
              onCheckedChange={(checked) =>
                onBillingModeChange?.(checked ? "gratuita" : "normal")
              }
              disabled={isAdvancePayment}
              className="shrink-0"
            />
          </Label>
          <p className="text-xs font-normal text-muted-foreground flex items-start gap-1">
            {isAdvancePayment ? (
              <>
                <Info className="size-3 mt-0.5 shrink-0" />
                No aplica para anticipos.
              </>
            ) : billingMode === "gratuita" ? (
              "Los items se registrarán sin IGV y sin cobro (transferencia gratuita)"
            ) : (
              "Los items se registrarán gravados con IGV (comportamiento estándar)"
            )}
          </p>
        </div>

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
          disabledRange={getTodayOnlyDisabledRange()}
        />

        <FormSelect
          control={form.control}
          name="serie"
          options={authorizedSeries.map((series) => ({
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

        <FormInput
          control={form.control}
          name="numero"
          label="Número"
          placeholder="Auto-generado"
          description={
            isEdit
              ? "El correlativo no se puede modificar"
              : "Se genera automáticamente"
          }
          readOnly
        />
      </GroupFormSection>
    </>
  );
}
