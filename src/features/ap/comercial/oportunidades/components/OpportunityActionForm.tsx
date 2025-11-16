"use client";

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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { FormSelect } from "@/src/shared/components/FormSelect";
import {
  OpportunityActionSchema,
  opportunityActionSchemaCreate,
  opportunityActionSchemaUpdate,
} from "../lib/opportunities.schema";
import {
  useActionTypes,
  useActionContactTypes,
} from "../lib/opportunities.hook";
import { Switch } from "@/components/ui/switch";
import { OpportunityActionResource } from "../lib/opportunityAction.interface";

interface OpportunityActionFormProps {
  defaultValues: Partial<OpportunityActionSchema> | OpportunityActionResource;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  opportunityId?: number;
}

export const OpportunityActionForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  opportunityId,
}: OpportunityActionFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? opportunityActionSchemaCreate
        : opportunityActionSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      opportunity_id: opportunityId || defaultValues.opportunity_id,
      result: defaultValues.result ?? false,
    },
    mode: "onChange",
  });

  const { data: actionTypes, isLoading: isLoadingActionTypes } =
    useActionTypes();
  const { data: contactTypes, isLoading: isLoadingContactTypes } =
    useActionContactTypes();

  const isLoading = isLoadingActionTypes || isLoadingContactTypes;

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormSelect
            name="action_type_id"
            label="Tipo de Acción"
            placeholder="Selecciona tipo"
            options={
              actionTypes?.data?.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              })) || []
            }
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            name="action_contact_type_id"
            label="Tipo de Contacto"
            placeholder="Selecciona contacto"
            options={
              contactTypes?.data?.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              })) || []
            }
            control={form.control}
            strictFilter={true}
          />

          <FormField
            control={form.control}
            name="result"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex flex-col gap-1">
                  <div className="h-6 flex items-center">Resultado</div>
                  <div className="flex flex-row items-center justify-between rounded-md border h-10 px-3 bg-background hover:bg-accent transition-colors hover:cursor-pointer">
                    <p className="text-sm font-medium text-muted-foreground">
                      Marcar si la acción fue exitosa.
                    </p>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                </FormLabel>
              </FormItem>
            )}
          />

          <div className="col-span-1 sm:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe lo conversado o acordado en esta acción..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4 w-full justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando..." : "Guardar Acción"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
