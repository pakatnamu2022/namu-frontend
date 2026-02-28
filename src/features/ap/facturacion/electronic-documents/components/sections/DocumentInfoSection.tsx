import { useEffect, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FileText } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { FormInput } from "@/shared/components/FormInput";

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
  onCustomerChange?: (customer: CustomersResource | undefined) => void;
}

export function DocumentInfoSection({
  form,
  isEdit,
  documentTypes,
  authorizedSeries,
  isAdvancePayment,
  currencyTypes,
  isFromQuotation = false,
  defaultCustomerId,
  hasVehicle = true,
  onCustomerChange,
}: DocumentInfoSectionProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomersResource | undefined
  >(undefined);

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
  }, [loadedCustomer, form]);

  const defaultOption = useMemo(() => {
    if (loadedCustomer) {
      return {
        value: loadedCustomer.id.toString(),
        label: `${loadedCustomer.full_name} - ${
          loadedCustomer.num_doc || "S/N"
        }`,
      };
    }
    return undefined;
  }, [loadedCustomer]);

  // Filtrar tipos de documento según el document_type_id del cliente
  const filteredDocumentTypes = documentTypes.filter((type) => {
    if (!selectedCustomer) return true; // Si no hay cliente seleccionado, mostrar todos

    const documentTypeId = selectedCustomer.document_type_id;

    // Si el cliente tiene RUC (810), solo mostrar Factura (id: 29)
    if (Number(documentTypeId) === 810) {
      return type.id === 29;
    }

    // Si el cliente tiene Cédula (809), solo mostrar el tipo con id 30
    if (Number(documentTypeId) === 809) {
      return type.id === 30;
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
          perPage={10}
          debounceMs={500}
          disabled={isEdit}
          defaultOption={defaultOption}
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
        disabled={!isFromQuotation || !hasVehicle}
        text={isAdvancePayment ? "Anticipo" : "Venta Interna"}
        description={
          !hasVehicle && isFromQuotation
            ? "Cotización sin vehículo: Solo se permite anticipo"
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
        type="number"
        placeholder="Auto-generado"
        disabled
        description={
          isEdit
            ? "El correlativo no se puede modificar"
            : "Se genera automáticamente"
        }
      />
    </GroupFormSection>
  );
}
