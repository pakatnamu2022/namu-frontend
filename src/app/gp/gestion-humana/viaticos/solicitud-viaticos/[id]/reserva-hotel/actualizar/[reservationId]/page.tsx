"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { HotelReservationForm } from "@/features/profile/viaticos/components/HotelReservationForm";
import { HotelReservationSchema } from "@/features/profile/viaticos/lib/hotelReservation.schema";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { useFindPerDiemRequestById } from "@/features/profile/viaticos/lib/perDiemRequest.hook";
import {
  useHotelReservation,
  useUpdateHotelReservation,
  HOTEL_RESERVATION_QUERY_KEY,
} from "@/features/profile/viaticos/lib/hotelReservation.hook";
import { hotelReservationSchemaToFormData } from "@/features/profile/viaticos/lib/hotelReservation.utils";
import { successToast, errorToast } from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { useGetAllHotelAgreement } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.hook";
import { Loader } from "lucide-react";

export default function UpdateHotelReservationPage() {
  const { id, reservationId } = useParams<{
    id: string;
    reservationId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<HotelReservationSchema | null>(
    null,
  );

  // Obtener los datos de la solicitud de viáticos
  const { data: perDiemRequest, isLoading: isLoadingRequest } =
    useFindPerDiemRequestById(Number(id));

  // Obtener la reserva específica por su ID
  const { data: reservation, isLoading: isLoadingReservation } =
    useHotelReservation(Number(reservationId));

  // Obtener convenios de hotel
  const { data: hotelAgreements = [], isLoading: isLoadingAgreements } =
    useGetAllHotelAgreement({
      params: {
        city: perDiemRequest?.district?.name,
      },
    });

  const { mutate, isPending } = useUpdateHotelReservation(
    Number(reservationId),
    Number(id),
  );

  const handleSubmit = (data: HotelReservationSchema) => {
    setPendingData(data);
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = () => {
    if (pendingData) {
      const formData = hotelReservationSchemaToFormData(pendingData);
      mutate(formData, {
        onSuccess: () => {
          // Invalidar queries para refrescar los datos
          queryClient.invalidateQueries({
            queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
          });
          queryClient.invalidateQueries({
            queryKey: [HOTEL_RESERVATION_QUERY_KEY, reservationId],
          });

          successToast(
            "Reserva actualizada",
            "La reserva de hotel ha sido actualizada exitosamente.",
          );
          setShowConfirmModal(false);
          setPendingData(null);
          navigate("/gp/gestion-humana/viaticos/solicitud-viaticos");
        },
        onError: (error: any) => {
          errorToast(
            "Error al actualizar",
            error.response?.data?.message ||
              "No se pudo actualizar la reserva. Inténtalo de nuevo.",
          );
        },
      });
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setPendingData(null);
  };

  const handleCancel = () => {
    navigate("/gp/gestion-humana/viaticos/solicitud-viaticos");
  };

  const isLoading =
    isLoadingRequest || isLoadingReservation || isLoadingAgreements;

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </FormWrapper>
    );
  }

  if (!reservation) {
    return (
      <FormWrapper>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontró la reserva</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <>
      <FormWrapper>
        <TitleFormComponent
          title="Actualizar Reserva de Hotel"
          mode="edit"
          icon="Hotel"
        />
        <HotelReservationForm
          defaultValues={{
            hotel_agreement_id: reservation.hotel_agreement?.id || null,
            hotel_name: reservation.hotel_name,
            address: reservation.address,
            phone: reservation.phone,
            checkin_date: new Date(reservation.checkin_date),
            checkout_date: new Date(reservation.checkout_date),
            total_cost: reservation.total_cost,
            document_number: reservation.expense.receipt_number || "",
            notes: reservation.notes || "",
            ruc: reservation.expense.ruc || "",
          }}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode="update"
          onCancel={handleCancel}
          hotelAgreements={hotelAgreements}
          perDiemStartDate={perDiemRequest?.start_date}
          perDiemEndDate={perDiemRequest?.end_date}
          existingFileUrl={reservation.receipt_path}
        />
      </FormWrapper>

      <GeneralModal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        title="¿Confirmar actualización?"
        subtitle="Estás a punto de actualizar esta reserva de hotel. ¿Deseas continuar?"
        icon="AlertCircle"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Se actualizarán los datos de la reserva con la información que has
            proporcionado.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelConfirm}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmUpdate}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Actualizando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </GeneralModal>
    </>
  );
}
