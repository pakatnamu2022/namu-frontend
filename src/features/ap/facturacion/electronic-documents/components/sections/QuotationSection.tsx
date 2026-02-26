import { UseFormReturn } from "react-hook-form";
import { FileCheck } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { PurchaseRequestQuoteResource } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import {
  usePurchaseRequestQuote,
  usePurchaseRequestQuoteById,
} from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.hook";

interface QuotationSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
}

export function QuotationSection({ form }: QuotationSectionProps) {
  return (
    <GroupFormSection
      title="Datos de Cotización"
      icon={FileCheck}
      iconColor="text-secondary"
      bgColor="bg-secondary/5"
      cols={{ sm: 1, md: 1 }}
    >
      <FormSelectAsync
        control={form.control}
        name="purchase_request_quote_id"
        useQueryHook={usePurchaseRequestQuote}
        mapOptionFn={(quote: PurchaseRequestQuoteResource) => ({
          value: quote.id.toString(),
          label: `COT-${quote.id} - ${quote.holder} - ${quote.doc_type_currency_symbol} ${quote.sale_price}`,
        })}
        label="Cotización *"
        description="Seleccione la cotización para auto-completar los datos del vehículo y cliente"
        placeholder="Seleccionar cotización"
        additionalParams={{
          is_approved: 1, // Solo cotizaciones aprobadas
          is_paid: 0, // Solo cotizaciones no pagadas
        }}
        useFindByIdHook={usePurchaseRequestQuoteById}
      />
    </GroupFormSection>
  );
}
