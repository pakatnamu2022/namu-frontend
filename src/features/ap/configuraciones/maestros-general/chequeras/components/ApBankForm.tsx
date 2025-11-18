import { useForm } from "react-hook-form";
import {
  ApBankSchema,
  apBankSchemaCreate,
  apBankSchemaUpdate,
} from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllBank } from "@/features/ap/configuraciones/maestros-general/bancos/lib/bank.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { Link } from "react-router-dom";
import { EMPRESA_AP } from "@/core/core.constants";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { BANK_AP } from "../lib/apBank.constants";

interface ApBankFormProps {
  defaultValues: Partial<ApBankSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const ApBankForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ApBankFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? apBankSchemaCreate : apBankSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = BANK_AP;
  const { data: banks = [], isLoading: isLoadingBanks } = useAllBank();
  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes();
  const { data: sedes = [], isLoading: isLoadingSedes } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  if (isLoadingBanks || isLoadingCurrencyTypes || isLoadingSedes) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cod.</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: CIX_BCP_PEN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Num. Cuenta</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 191-12345678-0-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cci"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CCI</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 002-191-012345678012-32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="bank_id"
            label="Banco"
            placeholder="Selecciona un Banco"
            options={banks.map((bank) => ({
              label: bank.description,
              value: bank.id.toString(),
            }))}
            control={form.control}
          />
          <FormSelect
            name="currency_id"
            label="Moneda"
            placeholder="Selecciona una Moneda"
            options={currencyTypes.map((currencyType) => ({
              label: currencyType.name,
              value: currencyType.id.toString(),
            }))}
            control={form.control}
          />
          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona una Sede"
            options={sedes.map((sede) => ({
              label: sede.abreviatura,
              value: sede.id.toString(),
            }))}
            control={form.control}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE!}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Chequera"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
