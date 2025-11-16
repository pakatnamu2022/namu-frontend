import { UseFormReturn } from "react-hook-form";
import { DollarSign } from "lucide-react";
import { GroupFormSection } from "@/src/shared/components/GroupFormSection";
import { FormSelect } from "@/src/shared/components/FormSelect";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/src/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface CurrencySectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  currencyTypes: SunatConceptsResource[];
  porcentaje_de_igv: number;
}

export function CurrencySection({
  form,
  currencyTypes,
  porcentaje_de_igv,
}: CurrencySectionProps) {
  return (
    <GroupFormSection
      title="Moneda y Datos Financieros"
      icon={DollarSign}
      iconColor="text-primary"
      bgColor="bg-primary/5"
      cols={{ sm: 1, md: 2 }}
    >
      <FormSelect
        control={form.control}
        name="sunat_concept_currency_id"
        options={currencyTypes.map((type) => {
          return {
            value: type.id.toString(),
            label: type.description,
          };
        })}
        label="Moneda *"
        description="Seleccione la moneda del documento"
        placeholder="Seleccionar moneda"
      />

      <div>
        <Alert className="border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <div className="font-semibold">IGV: {porcentaje_de_igv}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              El porcentaje de IGV se calcula automáticamente según la
              clasificación tributaria del cliente seleccionado
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </GroupFormSection>
  );
}
