import { UseFormReturn } from "react-hook-form";
import { FileCheck } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { PurchaseRequestQuoteResource } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";

interface QuotationSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  quotations: PurchaseRequestQuoteResource[];
}

export function QuotationSection({ form, quotations }: QuotationSectionProps) {
  return (
    <GroupFormSection
      title="Datos de Cotización"
      icon={FileCheck}
      iconColor="text-secondary"
      bgColor="bg-secondary/5"
      cols={{ sm: 1, md: 1 }}
    >
      <FormSelect
        control={form.control}
        name="purchase_request_quote_id"
        options={quotations.map((quote) => ({
          value: quote.id.toString(),
          label: `COT-${quote.id} - ${quote.holder} - ${quote.doc_type_currency_symbol} ${quote.sale_price}`,
        }))}
        label="Cotización *"
        description="Seleccione la cotización para auto-completar los datos del vehículo y cliente"
        placeholder="Seleccionar cotización"
      />
    </GroupFormSection>
  );
}
