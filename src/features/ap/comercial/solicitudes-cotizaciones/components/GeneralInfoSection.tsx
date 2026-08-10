import { Control } from "react-hook-form";
import { Building2 } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FormInput } from "@/shared/components/FormInput";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCustomers,
} from "../../clientes/lib/customers.hook";
import { CustomersResource } from "../../clientes/lib/customers.interface";
import { CurrencyTypesResource } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.interface";

interface GeneralInfoSectionProps {
  control: Control<any>;
  copyClientToHolder: boolean;
  setCopyClientToHolder: (checked: boolean) => void;
  holderDefaultOption?: { value: string; label: string };
  setSelectedHolder: (customer: CustomersResource | undefined) => void;
  currencyTypes: CurrencyTypesResource[];
}

export const GeneralInfoSection = ({
  control,
  copyClientToHolder,
  setCopyClientToHolder,
  holderDefaultOption,
  setSelectedHolder,
  currencyTypes,
}: GeneralInfoSectionProps) => {
  return (
    <GroupFormSection
      title="Información General"
      icon={Building2}
      color="blue"
      cols={{ sm: 1, md: 1 }}
    >
      <div className="relative">
        <FormSelectAsync
          name="holder_id"
          label="Titular"
          placeholder="Selecciona un titular"
          control={control}
          disabled={copyClientToHolder}
          useQueryHook={useCustomers}
          mapOptionFn={(customer: CustomersResource) => ({
            value: customer.id.toString(),
            label: customer.full_name,
          })}
          perPage={10}
          debounceMs={500}
          defaultOption={holderDefaultOption}
          onValueChange={(_, customer) => {
            setSelectedHolder(customer as CustomersResource | undefined);
          }}
        />
        <div className="flex items-center space-x-2 absolute top-0 right-0">
          <Checkbox
            id="copyClient"
            checked={copyClientToHolder}
            onCheckedChange={(checked) =>
              setCopyClientToHolder(checked as boolean)
            }
          />
          <label
            htmlFor="copyClient"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mismo que la Oportunidad
          </label>
        </div>
      </div>

      <FormSelect
        name="doc_type_currency_id"
        label="Moneda de Facturación"
        placeholder="Selecciona la moneda"
        options={currencyTypes.map((item) => ({
          label: `${item.name} (${item.symbol})`,
          value: item.id.toString(),
        }))}
        control={control}
        strictFilter={true}
      />

      <DatePickerFormField
        control={control}
        name="quote_deadline"
        label="Fecha Límite de Cotización"
        captionLayout="dropdown"
        disabledRange={
          { before: new Date() } // Solo permitir fechas futuras
        }
      />

      <FormInput
        control={control}
        name="down_payment"
        label="Monto a Cuenta"
        type="text"
        placeholder="Ingrese monto a cuenta del cliente"
      />
    </GroupFormSection>
  );
};
