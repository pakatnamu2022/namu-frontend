import { useEffect, useState, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { FileText, AlertCircle, CheckCircle } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { FormInput } from "@/shared/components/FormInput";

interface InvoiceDocumentInfoSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  isEdit?: boolean;
  documentTypes: SunatConceptsResource[];
  currencyTypes: SunatConceptsResource[];
  authorizedSeries: AssignSalesSeriesResource[];
  defaultCustomer?: CustomersResource;
  isAdvancePayment: boolean;
  isInvalidWithQuote?: boolean;
  isMassiveBilling?: boolean;
}

export function InvoiceDocumentInfoSection({
  form,
  isEdit = false,
  documentTypes,
  currencyTypes,
  authorizedSeries,
  defaultCustomer,
  isAdvancePayment,
  isInvalidWithQuote = false,
  isMassiveBilling = false,
}: InvoiceDocumentInfoSectionProps) {
  // Estado para almacenar el cliente seleccionado
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomersResource | undefined
  >(defaultCustomer);
  // Crear defaultOption desde defaultCustomer si existe
  const defaultOption = useMemo(() => {
    if (defaultCustomer) {
      return {
        value: defaultCustomer.id.toString(),
        label: `${defaultCustomer.full_name} - ${
          defaultCustomer.num_doc || "S/N"
        }`,
      };
    }
    return undefined;
  }, [defaultCustomer]);

  // Observar cambios en el cliente
  const clientId = form.watch("client_id");

  // Setear el cliente por defecto cuando se monta el componente
  useEffect(() => {
    if (defaultCustomer && !clientId) {
      form.setValue("client_id", defaultCustomer.id.toString(), {
        shouldValidate: false,
      });
    }
  }, [defaultCustomer, clientId, form]);

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
      <div
        className={`mb-6 rounded-lg border p-4 ${
          isInvalidWithQuote
            ? "border-rose-200 bg-rose-50/70"
            : "border-emerald-200 bg-emerald-50/70"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 rounded-full p-1.5 ${
              isInvalidWithQuote
                ? "bg-rose-100 text-rose-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isInvalidWithQuote ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0" />
            )}
          </div>

          <div className="space-y-1">
            <p
              className={`text-sm font-semibold ${
                isInvalidWithQuote ? "text-rose-800" : "text-emerald-800"
              }`}
            >
              {isInvalidWithQuote
                ? "Cotización con diferencias"
                : "Ítems validados correctamente"}
            </p>
            <p
              className={`text-sm leading-relaxed ${
                isInvalidWithQuote ? "text-rose-700" : "text-emerald-700"
              }`}
            >
              {isInvalidWithQuote
                ? "La cotización asociada no tiene todos los ítems de mano de obra o repuestos cargados en la orden de trabajo. Por esta razón, solo se permite registrar un anticipo."
                : "Los ítems de mano de obra y repuestos se cargaron correctamente en la orden de trabajo. Puede continuar con una venta directa o registrar un anticipo."}
            </p>
          </div>
        </div>
      </div>

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
            description="Cliente asignado desde la OT (puede modificarlo si lo desea)"
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
          text={isAdvancePayment ? "Anticipo" : "Venta Interna"}
          description={
            isInvalidWithQuote
              ? "Solo se permiten anticipos (cotización con diferencias)"
              : isAdvancePayment
                ? "Tipo de operación: Venta Interna - Anticipos (código 04)"
                : "Tipo de operación: Venta Interna (código 01)"
          }
          disabled={isInvalidWithQuote || isMassiveBilling}
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
          disabled
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
          disabled
        />
      </GroupFormSection>
    </>
  );
}
