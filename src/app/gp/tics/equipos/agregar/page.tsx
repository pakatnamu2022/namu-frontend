"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { EquipmentForm } from "@/features/gp/tics/equipment/components/EquipmentForm";
import { EquipmentSchema } from "@/features/gp/tics/equipment/lib/equipment.schema";
import { storeEquipment } from "@/features/gp/tics/equipment/lib/equipment.actions";
import { useAllEquipmentTypes } from "@/features/gp/tics/equipmentType/lib/equipmentType.hook";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { errorToast, successToast } from "@/core/core.function";
import { format } from "date-fns";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { EQUIPMENT } from "@/features/gp/tics/equipment/lib/equipment.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";

export default function AddEquipmentPage() {
  const router = useNavigate();
  const { ABSOLUTE_ROUTE, EMPTY } = EQUIPMENT;
  const { data: equipmentTypes, isLoading: loadingEquipmentTypes } =
    useAllEquipmentTypes();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: sedes, isLoading: loadingSedes } = useAllSedes();

  const { mutate, isPending } = useMutation({
    mutationFn: storeEquipment,
    onSuccess: () => {
      successToast("Equipo creado exitosamente");
      router(ABSOLUTE_ROUTE);
    },
    onError: () => {
      errorToast("Hubo un error al crear el equipo");
    },
  });

  const handleSubmit = (data: EquipmentSchema) => {
    mutate({
      ...data,
      tipo_equipo_id: Number(data.tipo_equipo_id),
      sede_id: Number(data.sede_id),
      fecha_adquisicion: data.fecha_adquisicion
        ? format(new Date(data.fecha_adquisicion), "yyyy-MM-dd")
        : undefined,
      fecha_garantia: data.fecha_garantia
        ? format(new Date(data.fecha_garantia), "yyyy-MM-dd")
        : undefined,
    });
  };

  if (loadingEquipmentTypes || loadingSedes) return <FormSkeleton />;
  if (!checkRouteExists("equipos")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <EquipmentForm
        defaultValues={EMPTY!}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        equipmentTypes={equipmentTypes ?? []}
        sedes={sedes ?? []}
      />
    </FormWrapper>
  );
}
