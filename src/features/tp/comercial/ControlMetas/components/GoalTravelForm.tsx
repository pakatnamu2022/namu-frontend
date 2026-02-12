"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GoalTravelSchema,
  goalTravelSchemaCreate,
  goalTravelSchemaUpdate,
} from "../lib/GoalTravelControl.schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";

interface GoalTravelFormProps {
  defaultValues?: Partial<GoalTravelSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const GoalTravelForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: GoalTravelFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? goalTravelSchemaCreate : goalTravelSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Meta <span className="text-destructuve">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ingrese una meta"
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue =
                        value === "" ? undefined : parseFloat(value);
                      field.onChange(isNaN(numValue!) ? value : numValue);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Periodo <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 w-full justify-end pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Descartar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
