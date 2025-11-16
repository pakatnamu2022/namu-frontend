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
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import Link from "next/link";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/src/shared/components/FormSelect";
import { CheckIcon } from "lucide-react";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/src/shared/components/Tags";
import { Info } from "lucide-react";
import { currentYear, currentMonth } from "@/src/core/core.function";
import { EMPRESA_AP, MONTHS } from "@/src/core/core.constants";
import {
  CommercialManagerBrandGroupSchema,
  commercialManagerBrandGroupSchemaCreate,
  commercialManagerBrandGroupSchemaUpdate,
} from "../lib/commercialManagerBrandGroup.schema";
import { AsesorResource } from "../lib/commercialManagerBrandGroup.interface";
import { useAllBrandGroup } from "../../../vehiculos/grupos-marcas/lib/brandGroup.hook";
import { useAllWorkers } from "@/src/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/src/features/gp/gestionhumana/personal/posiciones/lib/position.constant";

interface CommercialManagerBrandGroupFormProps {
  defaultValues: Partial<CommercialManagerBrandGroupSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const CommercialManagerBrandGroupForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: CommercialManagerBrandGroupFormProps) => {
  const currentMonthIndex = currentMonth() - 1;
  const currentMonthName = MONTHS[currentMonthIndex].label;
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? commercialManagerBrandGroupSchemaCreate
        : commercialManagerBrandGroupSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: brandGroups = [], isLoading: isLoadingBrandGroups } =
    useAllBrandGroup();

  const {
    data: commercialManagers = [],
    isLoading: isLoadingCommercialManagers,
  } = useAllWorkers({
    cargo_id: [
      ...POSITION_TYPE.GENERAL_MANAGER,
      ...POSITION_TYPE.SALES_MANAGER,
    ],
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  if (isLoadingBrandGroups || isLoadingCommercialManagers) {
    return <FormSkeleton />;
  }

  const handleSubmit = (data: any) => {
    const payload = {
      year: currentYear(),
      month: currentMonth(),
      brand_group_id: Number(data.brand_group_id),
      commercial_managers: data.commercial_managers.map(
        (commercial_manager: AsesorResource) => commercial_manager.id
      ),
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 flex items-center gap-2">
        <Info className="h-5 w-5" />
        <span className="font-semibold">
          La acción se realizará para el periodo {currentYear()} y mes{" "}
          {currentMonthName}.
        </span>
      </div>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormSelect
            name="brand_group_id"
            label="Grupo de Marca"
            placeholder="Selecciona un Grupo"
            options={brandGroups.map((brandGroup) => ({
              label: brandGroup.description,
              value: brandGroup.id.toString(),
            }))}
            control={form.control}
          />

          {/* Campo de selección multiple */}
          <FormField
            control={form.control}
            name="commercial_managers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gerente Comercial</FormLabel>
                <FormControl>
                  <Tags
                    className="max-w-full"
                    value={field.value ?? []}
                    setValue={field.onChange}
                  >
                    <TagsTrigger placeholder="Selecciona los asesores">
                      {(field.value ?? []).map((asesor: AsesorResource) => (
                        <TagsValue
                          key={asesor.id}
                          onRemove={() =>
                            field.onChange(
                              (field.value ?? []).filter(
                                (a: { id: number }) => a.id !== asesor.id
                              )
                            )
                          }
                        >
                          {asesor.name}
                        </TagsValue>
                      ))}
                    </TagsTrigger>
                    <TagsContent>
                      <TagsInput placeholder="Buscar asesor..." />
                      <TagsList>
                        <TagsEmpty>No se encontro Asesor.</TagsEmpty>
                        <TagsGroup>
                          {commercialManagers.map((asesor) => (
                            <TagsItem
                              key={asesor.id}
                              onSelect={() => {
                                if (
                                  !(field.value ?? []).some(
                                    (a: { id: number }) => a.id === asesor.id
                                  )
                                ) {
                                  field.onChange([
                                    ...(field.value ?? []),
                                    asesor,
                                  ]);
                                }
                              }}
                              value={asesor.name}
                            >
                              {asesor.name}
                              {(field.value ?? []).some(
                                (a: { id: number }) => a.id === asesor.id
                              ) && (
                                <CheckIcon
                                  className="text-muted-foreground"
                                  size={14}
                                />
                              )}
                            </TagsItem>
                          ))}
                        </TagsGroup>
                      </TagsList>
                    </TagsContent>
                  </Tags>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link href={mode === "create" ? "./" : "../"}>
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
            {isSubmitting ? "Guardando" : "Guardar Asignación"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
