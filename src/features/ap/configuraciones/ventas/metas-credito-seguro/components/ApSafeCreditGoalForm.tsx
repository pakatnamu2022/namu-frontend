import {
  ApSafeCreditGoalSchema,
  apSafeCreditGoalSchemaCreate,
  apSafeCreditGoalSchemaUpdate,
} from "../lib/apSafeCreditGoal.schema";
import { useForm } from "react-hook-form";
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
import { EMPRESA_AP } from "@/core/core.constants";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface ApSafeCreditGoalFormProps {
  defaultValues: Partial<ApSafeCreditGoalSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

const typesOptions = [
  {
    label: "Crédito",
    value: "CREDITO",
  },
  {
    label: "Seguro",
    value: "SEGURO",
  },
];

export const ApSafeCreditGoalForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: ApSafeCreditGoalFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? apSafeCreditGoalSchemaCreate
        : apSafeCreditGoalSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: sedes = [], isLoading: isLoadingSedes } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  if (isLoadingSedes) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            name="type"
            label="Tipo"
            placeholder="Selecciona un tipo"
            options={typesOptions}
            control={form.control}
          />
          <FormField
            control={form.control}
            name="goal_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona una sede"
            options={sedes.map((sede) => ({
              label: sede.abreviatura,
              value: sede.id.toString(),
            }))}
            control={form.control}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Meta"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
