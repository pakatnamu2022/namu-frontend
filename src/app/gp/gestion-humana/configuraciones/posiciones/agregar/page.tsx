"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { PositionForm } from "@/features/gp/gestionhumana/personal/posiciones/components/PositionForm";
import { useState } from "react";
import { storePosition } from "@/features/gp/gestionhumana/personal/posiciones/lib/position.actions";
import { POSITION } from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import NotFound from "@/app/not-found";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";

export default function AddPositionPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const router = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { MODEL, ROUTE } = POSITION;

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Agregar campos bósicos
      formData.append("name", data.name);
      if (data.descripcion) formData.append("descripcion", data.descripcion);
      if (data.area_id) formData.append("area_id", data.area_id.toString());
      if (data.hierarchical_category_id)
        formData.append(
          "hierarchical_category_id",
          data.hierarchical_category_id.toString()
        );
      if (data.cargo_id) formData.append("cargo_id", data.cargo_id.toString());
      if (data.ntrabajadores !== undefined)
        formData.append("ntrabajadores", data.ntrabajadores.toString());

      // Agregar banda salarial
      if (data.banda_salarial_min !== undefined)
        formData.append(
          "banda_salarial_min",
          data.banda_salarial_min.toString()
        );
      if (data.banda_salarial_media !== undefined)
        formData.append(
          "banda_salarial_media",
          data.banda_salarial_media.toString()
        );
      if (data.banda_salarial_max !== undefined)
        formData.append(
          "banda_salarial_max",
          data.banda_salarial_max.toString()
        );

      // Agregar otros campos
      if (data.tipo_onboarding_id !== undefined)
        formData.append(
          "tipo_onboarding_id",
          data.tipo_onboarding_id.toString()
        );
      if (data.plazo_proceso_seleccion !== undefined)
        formData.append(
          "plazo_proceso_seleccion",
          data.plazo_proceso_seleccion.toString()
        );
      if (data.presupuesto !== undefined)
        formData.append("presupuesto", data.presupuesto.toString());

      // Agregar archivo MOF obligatorio
      if (data.mof_adjunto) {
        formData.append("mof_adjunto", data.mof_adjunto);
      }

      // Agregar archivos adicionales
      if (data.files && Array.isArray(data.files)) {
        data.files.forEach((file: File) => {
          formData.append("files[]", file);
        });
      }

      await storePosition(formData);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(`/gp/gestion-humana/configuraciones/${ROUTE}`);
    } catch (error: any) {
      console.error("Error al crear posición:", error);
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "create")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;

  return (
    <div className="container mx-auto py-6">
      <PositionForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
