"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import {
  findPeriodById,
  updatePeriod,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.actions";
import { PeriodSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.schema";
import { PeriodResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.interface";
import { PeriodForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/components/PeriodForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { format, parse } from "date-fns";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from '@/app/not-found';


export default function UpdatePeriodPage() {
    const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: period, isLoading: loadingPeriod } = useQuery({
    queryKey: ["period", id],
    queryFn: () => findPeriodById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PeriodSchema) => updatePeriod(id as string, data),
    onSuccess: async () => {
      successToast("Periodo actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["period", id],
      });
      router("../");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message || "No se pudo actualizar la métrica"
      );
    },
  });

  const handleSubmit = (data: PeriodSchema) => {
    mutate({
      ...data,
      start_date: data.start_date
        ? format(data.start_date, "yyyy-MM-dd")
        : undefined,
      end_date: data.end_date ? format(data.end_date, "yyyy-MM-dd") : undefined,
    } as any);
  };

  function mapPeriodToForm(data: PeriodResource): Partial<PeriodSchema> {
    return {
      name: data.name,
      start_date: parse(data.start_date, "yyyy-MM-dd", new Date()),
      end_date: parse(data.end_date, "yyyy-MM-dd", new Date()),
    };
  }

  const isLoadingAny = loadingPeriod || !period;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists("periodos")) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <PeriodForm
        defaultValues={mapPeriodToForm(period)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
