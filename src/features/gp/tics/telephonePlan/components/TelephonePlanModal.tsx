"use client";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { TelephonePlanForm } from "./TelephonePlanForm";
import { useState, useEffect } from "react";
import { errorToast, successToast } from "@/core/core.function";
import {
  storeTelephonePlan,
  updateTelephonePlan,
  findTelephonePlanById,
} from "../lib/telephonePlan.actions";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface TelephonePlanModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planId?: string | null;
}

export default function TelephonePlanModal({
  open,
  onClose,
  onSuccess,
  planId,
}: TelephonePlanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState<any>({});

  const isEditMode = !!planId;

  useEffect(() => {
    if (planId && open) {
      setIsLoading(true);
      findTelephonePlanById(planId)
        .then((data) => {
          setDefaultValues({
            name: data.name,
            price: parseFloat(data.price),
            description: data.description,
          });
        })
        .catch(() => {
          errorToast("Error al cargar el plan telefónico.");
          onClose();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!planId) {
      setDefaultValues({});
    }
  }, [planId, open, onClose]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && planId) {
        await updateTelephonePlan(planId, data);
        successToast("Plan telefónico actualizado correctamente.");
      } else {
        await storeTelephonePlan(data);
        successToast("Plan telefónico creado correctamente.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      errorToast(
        `Error al ${isEditMode ? "actualizar" : "crear"} el plan telefónico.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={
        isEditMode ? "Actualizar Plan Telefónico" : "Agregar Plan Telefónico"
      }
      subtitle={
        isEditMode
          ? "Editar información del plan telefónico"
          : "Crear un nuevo plan telefónico"
      }
      icon="PhoneCall"
      size="lg"
    >
      {isLoading ? (
        <FormSkeleton />
      ) : (
        <TelephonePlanForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={isEditMode ? "update" : "create"}
          onCancel={onClose}
        />
      )}
    </GeneralModal>
  );
}
