import { UseFormReturn } from "react-hook-form";
import { Settings } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";

interface AdditionalConfigSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  checkbooks: ApBankResource[];
  isModuleCommercial?: boolean;
}

export function AdditionalConfigSection({
  form,
  checkbooks,
  isModuleCommercial = true,
}: AdditionalConfigSectionProps) {
  return (
    <GroupFormSection
      title="Configuración Adicional"
      icon={Settings}
      iconColor="text-primary"
      bgColor="bg-primary/5"
      cols={{ sm: 1, md: 3 }}
    >
      <FormSelect
        control={form.control}
        label="Condiciones de Pago *"
        name="condiciones_de_pago"
        options={[
          {
            label: "CONTADO",
            value: "CONTADO",
          },
          {
            label: "CREDITO",
            value: "CREDITO",
          },
        ]}
        placeholder="Seleccione una opción"
        description="Condiciones de pago del documento."
      />

      <FormSelect
        control={form.control}
        label="Medio de Pago *"
        name="medio_de_pago"
        options={[
          {
            label: "EFECTIVO",
            value: "EFECTIVO",
          },
          {
            label: "TARJETA DE DÉBITO",
            value: "TARJETA DE DEBITO",
          },
          {
            label: "TARJETA DE CRÉDITO",
            value: "TARJETA DE CREDITO",
          },
          {
            label: "CHEQUE",
            value: "CHEQUE",
          },
          {
            label: "TRANSFERENCIA BANCARIA",
            value: "TRANSFERENCIA BANCARIA",
          },
          {
            label: "DEPÓSITO BANCARIO",
            value: "DEPOSITO BANCARIO",
          },
          {
            label: "GIRO",
            value: "GIRO",
          },
          {
            label: "OTRO",
            value: "OTRO",
          },
        ]}
        placeholder="Seleccione una opción"
        description="Medio de pago utilizado en el documento."
      />

      <FormSelect
        control={form.control}
        label="Entidad"
        name="bank_id"
        options={checkbooks.map((checkbook) => ({
          label: checkbook.code,
          value: String(checkbook.id),
          description: checkbook.account_number,
        }))}
        placeholder="Seleccione una opción"
        description="Chequera asociada al medio de pago."
      />

      <FormField
        control={form.control}
        name="operation_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex">Número de Operación</FormLabel>
            <FormControl>
              <Input
                placeholder="Número de Operación"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription className="text-xs font-normal">
              Número de operación asociada al pago.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {isModuleCommercial && (
        <FormSelect
          control={form.control}
          label="Tipo de Financiamiento"
          name="financing_type"
          options={[
            {
              label: "CREDITO POR CONVENIO",
              value: "CONVENIO",
            },
            {
              label: "CREDITO VEHICULAR",
              value: "VEHICULAR",
            },
            {
              label: "CONTADO",
              value: "CONTADO",
            },
          ]}
          placeholder="Seleccione una opción"
          description="Tipo de financiamiento del documento."
        />
      )}

      <FormField
        control={form.control}
        name="observaciones"
        render={({ field }) => (
          <FormItem className="md:col-span-3">
            <FormLabel>Observaciones</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Observaciones adicionales..."
                className="resize-none"
                rows={3}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription className="text-xs font-normal">
              Información adicional que se mostrará en el documento.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </GroupFormSection>
  );
}
