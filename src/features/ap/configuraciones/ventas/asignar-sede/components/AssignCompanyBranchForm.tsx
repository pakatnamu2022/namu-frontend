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
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Link } from "react-router-dom";
import { Loader, CheckIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
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
} from "@/shared/components/Tags";
import { useAllWorkers } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { AsesorResource } from "../lib/assignCompanyBranch.interface";
import { EMPRESA_AP, MONTHS } from "@/core/core.constants";
import { currentMonth, currentYear } from "@/core/core.function";
import {
  AssignCompanyBranchSchema,
  assignCompanyBranchSchemaCreate,
  assignCompanyBranchSchemaUpdate,
} from "../lib/assignCompanyBranch.schema";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { ASSIGN_COMPANY_BRANCH } from "../lib/assignCompanyBranch.constants";

interface AssignCompanyBranchFormProps {
  defaultValues: Partial<AssignCompanyBranchSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const AssignCompanyBranchForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: AssignCompanyBranchFormProps) => {
  const currentMonthIndex = currentMonth() - 1;
  const currentMonthName = MONTHS[currentMonthIndex].label;
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? assignCompanyBranchSchemaCreate
        : assignCompanyBranchSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = ASSIGN_COMPANY_BRANCH;

  const { data: sedes = [], isLoading: isLoadingSedes } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  const selectedSedeId = form.watch("sede_id");

  const selectedSede = sedes.find(
    (sede) => sede.id.toString() === selectedSedeId
  );
  const departamento = selectedSede?.departamento || "";

  const { data: asesores = [], isLoading: isLoadingAsesores } = useAllWorkers({
    cargo_id: POSITION_TYPE.CONSULTANT,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
    sede$departamento: departamento,
  });

  if (isLoadingSedes || isLoadingAsesores) {
    return <FormSkeleton />;
  }

  const handleSubmit = (data: any) => {
    const payload = {
      year: currentYear(),
      month: currentMonth(),
      sede_id: Number(data.sede_id),
      assigned_workers: data.assigned_workers.map(
        (assigned_worker: AsesorResource) => assigned_worker.id
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
            name="sede_id"
            label="Sede"
            placeholder="Selecciona un sede"
            options={sedes.map((sede) => ({
              label: sede.abreviatura,
              value: sede.id.toString(),
            }))}
            control={form.control}
          />

          {/* Campo de selección multiple */}
          <FormField
            control={form.control}
            name="assigned_workers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asesores</FormLabel>
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
                          {asesores.map((asesor) => (
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
            {isSubmitting ? "Guardando" : "Guardar Asignación"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
