"use client";

import { useNavigate } from 'react-router-dom';
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
import NotFound from '@/app/not-found';


export default function AddEquipmentPage() {
  const router = useNavigate();
  
  const { data: equipmentTypes, isLoading: loadingEquipmentTypes } =
    useAllEquipmentTypes();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: sedes, isLoading: loadingSedes } = useAllSedes();

  const { mutate, isPending } = useMutation({
    mutationFn: storeEquipment,
    onSuccess: () => {
      successToast("Equipo creado exitosamente");
      router("./");
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

  if (loadingEquipmentTypes || loadingSedes) {
    return (
      <div className="p-4 text-muted">Cargando tipos de equipo y sedes...</div>
    );
  }
  if (!checkRouteExists("equipos")) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <EquipmentForm
        defaultValues={{
          marca: "",
          modelo: "",
          tipo_equipo_id: "",
          serie: "",
          detalle: "",
          ram: "",
          almacenamiento: "",
          procesador: "",
          stock_actual: 0,
          estado_uso: "NUEVO",
          sede_id: "",
          pertenece_sede: false,
          fecha_adquisicion: undefined,
          fecha_garantia: undefined,
          tipo_adquisicion: "",
          factura: "",
          contrato: "",
          proveedor: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        equipmentTypes={equipmentTypes ?? []}
        sedes={sedes ?? []}
      />
    </FormWrapper>
  );
}
