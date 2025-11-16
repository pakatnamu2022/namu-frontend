"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EquipmentForm } from "@/features/gp/tics/equipment/components/EquipmentForm";
import { EquipmentSchema } from "@/features/gp/tics/equipment/lib/equipment.schema";
import {
  findEquipmentById,
  updateEquipment,
} from "@/features/gp/tics/equipment/lib/equipment.actions";
import { useAllEquipmentTypes } from "@/features/gp/tics/equipmentType/lib/equipmentType.hook";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { errorToast, successToast } from "@/core/core.function";
import { EquipmentResource } from "@/features/gp/tics/equipment/lib/equipment.interface";
import { format, parse } from "date-fns";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from "@/app/not-found";


export default function EditEquipmentPage() {
    const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: equipment, isLoading: loadingEquipment } = useQuery({
    queryKey: ["equipment", id],
    queryFn: () => findEquipmentById(id as string),
    refetchOnWindowFocus: false,
  });

  const { data: equipmentTypes, isLoading: loadingEquipmentTypes } =
    useAllEquipmentTypes();
  const { data: sedes, isLoading: loadingSedes } = useAllSedes();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EquipmentSchema) => updateEquipment(id as string, data),
    onSuccess: async () => {
      successToast("Equipo actualizado correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["equipment", id],
      });
      router("../");
    },
    onError: () => {
      errorToast("No se pudo actualizar el equipo");
    },
  });

  const handleSubmit = (data: EquipmentSchema) => {
    mutate({
      ...data,
      tipo_equipo_id: Number(data.tipo_equipo_id),
      sede_id: Number(data.sede_id),
      fecha_adquisicion: data.fecha_adquisicion
        ? format(data.fecha_adquisicion, "yyyy-MM-dd")
        : undefined,
      fecha_garantia: data.fecha_garantia
        ? format(data.fecha_garantia, "yyyy-MM-dd")
        : undefined,
    } as any);
  };

  function mapEquipmentToForm(
    data: EquipmentResource
  ): Partial<EquipmentSchema> {
    return {
      marca: data.marca ?? "",
      modelo: data.modelo ?? "",
      tipo_equipo_id: data.tipo_equipo_id.toString(),
      serie: data.serie ?? "",
      detalle: data.detalle ?? "",
      ram: data.ram ?? "",
      almacenamiento: data.almacenamiento ?? "",
      procesador: data.procesador ?? "",
      stock_actual: data.stock_actual ?? 0,
      estado_uso: data.estado_uso as "NUEVO" | "USADO",
      sede_id: data.sede_id.toString(),
      pertenece_sede: Boolean(data.pertenece_sede),
      fecha_adquisicion: data.fecha_adquisicion
        ? parse(data.fecha_adquisicion, "yyyy-MM-dd", new Date())
        : undefined,
      fecha_garantia: data.fecha_garantia
        ? parse(data.fecha_garantia, "yyyy-MM-dd", new Date())
        : undefined,
      tipo_adquisicion: data.tipo_adquisicion ?? "",
      factura: data.factura ?? "",
      contrato: data.contrato ?? "",
      proveedor: data.proveedor ?? "",
    };
  }

  const isLoadingAny =
    loadingEquipment ||
    !equipment ||
    loadingEquipmentTypes ||
    !equipmentTypes ||
    loadingSedes ||
    !sedes;

  if (isLoadingAny) {
    return <div className="p-4 text-muted">Cargando equipo...</div>;
  }
  if (!checkRouteExists("equipos")) notFound();
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
       
      />
      <EquipmentForm
        defaultValues={mapEquipmentToForm(equipment)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        equipmentTypes={equipmentTypes ?? []}
        sedes={sedes ?? []}
      />
    </FormWrapper>
  );
}
