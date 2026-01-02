"use client";

import { useParams, useNavigate } from "react-router-dom";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { HotelReservationForm } from "@/features/profile/viaticos/components/HotelReservationForm";
import { HotelReservationSchema } from "@/features/profile/viaticos/lib/hotelReservation.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHotelReservation } from "@/features/profile/viaticos/lib/hotelReservation.actions";
import { useFindPerDiemRequestById } from "@/features/profile/viaticos/lib/perDiemRequest.hook";
import { Loader } from "lucide-react";
import { useGetAllHotelAgreement } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.hook";
import { errorToast, successToast } from "@/core/core.function";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";

export default function AddHotelReservationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const requestId = Number(id);

  // Obtener datos de la solicitud de viáticos
  const { data: perDiemRequest, isLoading: isLoadingRequest } =
    useFindPerDiemRequestById(requestId);

  const { data: hotelAgreements = [], isLoading: isLoadingAgreements } =
    useGetAllHotelAgreement({
      params: {
        city: perDiemRequest?.district?.name,
      },
    });

  // Mutación para crear reserva
  const { mutate, isPending } = useMutation({
    mutationFn: (data: HotelReservationSchema) => {
      // Validar que el archivo existe antes de enviar
      if (!data.receipt_file) {
        throw new Error("El comprobante es obligatorio");
      }

      return createHotelReservation(requestId, {
        hotel_agreement_id: data.hotel_agreement_id || null,
        hotel_name: data.hotel_name,
        address: data.address,
        phone: data.phone,
        checkin_date: data.checkin_date,
        checkout_date: data.checkout_date,
        total_cost: data.total_cost,
        receipt_file: data.receipt_file,
        notes: data.notes || "",
        document_number: data.document_number,
      });
    },
    onSuccess: async () => {
      // Invalidar queries para refrescar los datos
      await queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId],
      });
      successToast("Reserva de hotel creada exitosamente");
      navigate("/gp/gestion-humana/viaticos/solicitud-viaticos");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al crear la reserva de hotel";
      errorToast(errorMessage);
    },
  });

  const handleSubmit = (data: HotelReservationSchema) => {
    mutate(data);
  };

  const handleCancel = () => {
    navigate("/gp/gestion-humana/viaticos/solicitud-viaticos");
  };

  if (isLoadingRequest || isLoadingAgreements) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Agregar Reserva de Hotel"
        mode="create"
        icon="Hotel"
      />
      <HotelReservationForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={handleCancel}
        hotelAgreements={hotelAgreements}
        perDiemStartDate={perDiemRequest?.start_date}
        perDiemEndDate={perDiemRequest?.end_date}
      />
    </FormWrapper>
  );
}
