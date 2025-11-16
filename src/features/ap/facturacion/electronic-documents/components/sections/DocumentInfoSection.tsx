import { UseFormReturn } from "react-hook-form";
import { FileText } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
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
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { useAllCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";

interface DocumentInfoSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  isEdit: boolean;
  documentTypes: SunatConceptsResource[];
  authorizedSeries: AssignSalesSeriesResource[];
  isAdvancePayment: boolean;
  currencyTypes: SunatConceptsResource[];
  isFromQuotation?: boolean;
  hasVehicle?: boolean;
}

export function DocumentInfoSection({
  form,
  isEdit,
  documentTypes,
  authorizedSeries,
  isAdvancePayment,
  currencyTypes,
  isFromQuotation = false,
  hasVehicle = true,
}: DocumentInfoSectionProps) {
  const { data: customers = [], isLoading } = useAllCustomers();
  return (
    <GroupFormSection
      title="Información del Documento"
      icon={FileText}
      iconColor="text-primary"
      bgColor="bg-primary/5"
      cols={{ sm: 1, md: 3 }}
    >
      <FormSelect
        control={form.control}
        name="sunat_concept_document_type_id"
        options={documentTypes.map((type) => ({
          value: type.id.toString(),
          label: type.description,
        }))}
        label="Tipo de Comprobante *"
        description="Seleccione el tipo de comprobante electrónico"
        placeholder="Seleccionar tipo de comprobante"
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

      {/* Switch de Anticipo */}
      <FormSwitch
        control={form.control}
        name="is_advance_payment"
        label="¿Es un anticipo?"
        disabled={!isFromQuotation || !hasVehicle}
        text={
          isAdvancePayment ? "Si, es un pago parcial" : "No, es el pago total"
        }
        description={
          !hasVehicle && isFromQuotation
            ? "Cotización sin vehículo: Solo se permite anticipo"
            : isAdvancePayment
            ? "Tipo de operación: Venta Interna - Anticipos (código 04)"
            : "Tipo de operación: Venta Interna (código 01)"
        }
      />
      <div className="md:col-span-3">
        <FormSelect
          control={form.control}
          name="client_id"
          options={customers.map((customer) => ({
            value: customer.id.toString(),
            label: `${customer.full_name} - ${customer.num_doc}`,
          }))}
          label="Cliente *"
          description={
            isFromQuotation
              ? "Cliente asignado desde la cotización"
              : "Seleccione el cliente"
          }
          placeholder={
            isLoading ? "Cargando clientes..." : "Seleccionar cliente"
          }
          disabled={isEdit || isFromQuotation}
        />
      </div>
    </GroupFormSection>
  );
}
