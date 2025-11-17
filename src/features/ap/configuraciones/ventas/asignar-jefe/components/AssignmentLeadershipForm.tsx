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
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
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
} from "@/shared/components/Tags";
import { Info } from "lucide-react";
import {
  AssignmentLeadershipSchema,
  assignmentLeadershipSchemaCreate,
  assignmentLeadershipSchemaUpdate,
} from "../lib/assignmentLeadership.schema";
import { currentYear, currentMonth } from "@/core/core.function";
import { EMPRESA_AP, MONTHS } from "@/core/core.constants";
import { AsesorResource } from "../lib/assignmentLeadership.interface";
import { useAllWorkers } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { ASSIGNMENT_LEADERSHIP } from "../lib/assignmentLeadership.constants";

interface AssignmentLeadershipFormProps {
  defaultValues: Partial<AssignmentLeadershipSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const AssignmentLeadershipForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: AssignmentLeadershipFormProps) => {
  const currentMonthIndex = currentMonth() - 1;
  const currentMonthName = MONTHS[currentMonthIndex].label;
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? assignmentLeadershipSchemaCreate
        : assignmentLeadershipSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = ASSIGNMENT_LEADERSHIP;

  const { data: bosses = [], isLoading: isLoadingAssignmentLeadership } =
    useAllWorkers({
      cargo_id: [...POSITION_TYPE.SALES_MANAGER, ...POSITION_TYPE.SALES_BOSS],
      status_id: STATUS_WORKER.ACTIVE,
      sede$empresa_id: EMPRESA_AP.id,
    });

  const { data: advisors = [], isLoading: isLoadingAsesores } = useAllWorkers({
    cargo_id: POSITION_TYPE.CONSULTANT,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  if (isLoadingAssignmentLeadership || isLoadingAsesores) {
    return <FormSkeleton />;
  }

  const handleSubmit = (data: any) => {
    const payload = {
      year: currentYear(),
      month: currentMonth(),
      boss_id: Number(data.boss_id),
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
            name="boss_id"
            label="Nombre"
            placeholder="Selecciona un Jefe o Gerente de Ventas"
            options={bosses.map((boss) => ({
              label: () => (
                <span className="flex items-center gap-2">
                  {boss.name}
                  <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {boss.position}
                  </span>
                </span>
              ),
              value: boss.id.toString(),
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
                          {advisors.map((asesor) => (
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
          <Link to={ABSOLUTE_ROUTE}>
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
