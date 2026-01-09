import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader } from "lucide-react";
import {
  ReasonDiscardingSparePartSchema,
  reasonDiscardingSparePartSchemaCreate,
  reasonDiscardingSparePartSchemaUpdate,
} from "../lib/reasonDiscardingSparePart.schema";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";
import { FormInput } from "@/shared/components/FormInput";

interface ReasonDiscardingSparePartFormProps {
  defaultValues: Partial<ReasonDiscardingSparePartSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const ReasonDiscardingSparePartForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: ReasonDiscardingSparePartFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? reasonDiscardingSparePartSchemaCreate
        : reasonDiscardingSparePartSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      type: AP_MASTER_TYPE.DISCARDING_SPAREPART,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Ej: Encontro mejor precio"
            required
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
            {isSubmitting ? "Guardando" : "Guardar Motivo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
