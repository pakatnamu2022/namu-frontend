import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FileText, Info } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/series/lib/assignSalesSeries.interface";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { FormInput } from "@/shared/components/FormInput";
import { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useAllAccountingAccountPlan } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.hook";
import { ACP_TYPE_SALE } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.constants";

interface DocumentInfoSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  isEdit: boolean;
  documentTypes: SunatConceptsResource[];
  authorizedSeries: AssignSalesSeriesResource[];
  isAdvancePayment: boolean;
  defaultCustomerId?: number | null;
  currencyTypes: SunatConceptsResource[];
  isFromQuotation?: boolean;
  hasVehicle?: boolean;
  pendingBalance?: number;
  onCustomerChange?: (customer: CustomersResource | undefined) => void;
  // Modo de IGV del comprobante (Normal / Inafecto a IGV), controlado por Caja.
  igvMode?: "normal" | "inafecta";
  onIgvModeChange?: (mode: "normal" | "inafecta") => void;
  // Se bloquea el cambio de modo una vez que ya hay items agregados.
  igvModeLocked?: boolean;
  isCommercial?: boolean;
}

export function DocumentInfoOtherSalesSection({
  form,
  isEdit,
  documentTypes,
  authorizedSeries,
  isAdvancePayment,
  currencyTypes,
  isFromQuotation = false,
  defaultCustomerId,
  hasVehicle = true,
  pendingBalance = 0,
  onCustomerChange,
  igvMode = "normal",
  onIgvModeChange,
  igvModeLocked = false,
  isCommercial = true,
}: DocumentInfoSectionProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomersResource | undefined
  >(undefined);

  // Plan contable de detracción seleccionado, solo para determinar el % a aplicar.
  // No se persiste en el formulario: únicamente alimenta `detraccion_porcentaje`.
  const [detractionPlanId, setDetractionPlanId] = useState<string>("");

  // Cargar el cliente desde el ID cuando viene de una cotización
  const { data: loadedCustomer } = useCustomersById(defaultCustomerId || 0);

  // Sincronizar con el cliente cargado cuando cambie (ej. al seleccionar cotización)
  useEffect(() => {
    if (loadedCustomer && loadedCustomer.id !== selectedCustomer?.id) {
      setSelectedCustomer(loadedCustomer);
      onCustomerChange?.(loadedCustomer);
      // Actualizar el valor en el form
      form.setValue("client_id", loadedCustomer.id.toString());
    }
  }, [loadedCustomer, form, selectedCustomer?.id, onCustomerChange]);

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

  // La detracción no aplica a Boleta: forzar y bloquear el switch
  const selectedDocumentTypeId = form.watch("sunat_concept_document_type_id");
  const isBoleta =
    Number(selectedDocumentTypeId) === SUNAT_TYPE_INVOICES_ID.BOLETA;
  const isDetraction = form.watch("detraccion") || false;

  useEffect(() => {
    if (isBoleta && form.getValues("detraccion")) {
      form.setValue("detraccion", false);
    }
  }, [isBoleta, form]);

  // Planes contables habilitados para detracción: definen el % a aplicar sobre el total.
  const { data: detractionAccountPlans = [] } = useAllAccountingAccountPlan({
    is_detraction: 1,
    type: ACP_TYPE_SALE,
    ...(isCommercial ? { enable_commercial: 1 } : { enable_after_sales: 1 }),
  });

  // Si se desactiva la detracción, limpiar la selección y el % guardado en el form
  useEffect(() => {
    if (!isDetraction) {
      setDetractionPlanId("");
      if (form.getValues("detraccion_porcentaje") !== undefined) {
        form.setValue("detraccion_porcentaje", undefined);
      }
    }
  }, [isDetraction, form]);

  return (
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
          mapOptionFn={(customer) => ({
            value: customer.id.toString(),
            label: `${customer.full_name} - ${customer.num_doc || "S/N"}`,
          })}
          description={
            isFromQuotation
              ? "Cliente asignado desde la cotización (puede modificarlo si lo desea)"
              : "Seleccione el cliente"
          }
          useFindByIdHook={useCustomersById}
          disabled={isEdit || isFromQuotation}
          onValueChange={(_, customer) => {
            // Actualizar el estado con el cliente seleccionado
            const customerResource = customer as CustomersResource | undefined;
            setSelectedCustomer(customerResource);
            onCustomerChange?.(customerResource);
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
        label="Tipo de Comprobante *"
        description="Seleccione el tipo de comprobante electrónico"
        placeholder="Seleccionar tipo de comprobante"
      />

      {/* Switch de Anticipo */}
      <FormSwitch
        control={form.control}
        name="is_advance_payment"
        label="Tipo de Operación"
        disabled={!isFromQuotation || !hasVehicle || pendingBalance <= 0}
        text={isAdvancePayment ? "Anticipo" : "Venta Interna"}
        description={
          !hasVehicle && isFromQuotation
            ? "Cotización sin vehículo: Solo se permite anticipo"
            : isFromQuotation && pendingBalance <= 0
              ? "Saldo pendiente S/ 0: No se puede registrar anticipo"
              : isAdvancePayment
                ? "Tipo de operación: Venta Interna - Anticipos (código 04)"
                : "Tipo de operación: Venta Interna (código 01)"
        }
      />

      <FormSwitch
        control={form.control}
        name="detraccion"
        label="Detracción"
        text="Aplicar Detracción"
        disabled={isBoleta}
        description={
          isBoleta
            ? "La detracción no aplica para Boleta"
            : "Seleccione el plan de detracción para definir el % a aplicar"
        }
      />

      {isDetraction && !isBoleta && (
        <div className="flex flex-col gap-2">
          <SearchableSelect
            label="Plan de Detracción *"
            value={detractionPlanId}
            onChange={(value) => {
              setDetractionPlanId(value);
              const plan = detractionAccountPlans.find(
                (p) => p.id.toString() === value,
              );
              form.setValue(
                "detraccion_porcentaje",
                plan?.detraction_percentage ?? undefined,
                { shouldValidate: true },
              );
            }}
            options={detractionAccountPlans.map((plan) => ({
              value: plan.id.toString(),
              label: `${plan.account} - ${plan.description} (${plan.detraction_percentage}%)`,
            }))}
            className="w-full!"
            buttonSize="default"
          />
          {form.formState.errors.detraccion_porcentaje && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.detraccion_porcentaje.message}
            </p>
          )}
        </div>
      )}

      {/* Switch de Modo de IGV (Normal / Inafecto a IGV) */}
      <div className="flex flex-col gap-1">
        <Label className="h-fit flex mb-1">Tipo de Operación (IGV)</Label>
        <Label
          className={cn(
            "flex flex-row items-center justify-between rounded-md border shadow-xs bg-background h-8 p-3 gap-3",
            igvModeLocked
              ? "opacity-60"
              : "hover:bg-muted hover:cursor-pointer",
          )}
        >
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">
              {igvMode === "inafecta" ? "Inafecto a IGV" : "Normal"}
            </p>
          </div>
          <Switch
            checked={igvMode === "inafecta"}
            onCheckedChange={(checked) =>
              onIgvModeChange?.(checked ? "inafecta" : "normal")
            }
            disabled={igvModeLocked}
            className="shrink-0"
          />
        </Label>
        <p className="text-xs font-normal text-muted-foreground flex items-start gap-1">
          {igvModeLocked ? (
            <>
              <Info className="size-3 mt-0.5 shrink-0" />
              Para cambiar el modo, elimine primero los items agregados.
            </>
          ) : igvMode === "inafecta" ? (
            "Los items se registrarán sin IGV (comprobante inafecto)"
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
        label="Moneda *"
        description={
          isFromQuotation
            ? "Moneda asignada desde la cotización"
            : "Seleccione la moneda del documento"
        }
        placeholder="Seleccionar moneda"
        disabled={isFromQuotation}
      />

      <DatePickerFormField
        control={form.control}
        name="fecha_de_emision"
        label="Fecha de Emisión *"
        placeholder="Seleccione fecha"
        description="Seleccione la fecha de emisión del documento"
        disabledRange={{
          before: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          after: new Date(),
        }}
      />

      <FormSelect
        control={form.control}
        name="serie"
        options={authorizedSeries.map((series) => ({
          value: series.id.toString(),
          label: `${series.series} - ${series.sede || ""}`,
        }))}
        label="Serie *"
        description="Series autorizadas para su usuario"
        placeholder="Seleccionar serie"
      />

      <FormInput
        control={form.control}
        name="numero"
        label="Número"
        placeholder="Auto-generado"
        readOnly
        optional
        description={
          isEdit
            ? "El correlativo no se puede modificar"
            : "Se genera automáticamente"
        }
      />
    </GroupFormSection>
  );
}
