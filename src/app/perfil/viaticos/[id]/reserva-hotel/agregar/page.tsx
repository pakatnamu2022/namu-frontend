"use client";

import { useParams, useNavigate } from "react-router-dom";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { HotelReservationForm } from "@/features/profile/viaticos/components/HotelReservationForm";
import { HotelReservationSchema } from "@/features/profile/viaticos/lib/hotelReservation.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createHotelReservation,
  getActiveHotelAgreements,
} from "@/features/profile/viaticos/lib/hotelReservation.actions";
import { toast } from "sonner";
import { useFindPerDiemRequestById } from "@/features/profile/viaticos/lib/perDiemRequest.hook";
import { Loader } from "lucide-react";

export default function AddHotelReservationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const requestId = Number(id);

  // Obtener datos de la solicitud de viáticos
  const { data: perDiemRequest, isLoading: isLoadingRequest } =
    useFindPerDiemRequestById(requestId);

  // Obtener convenios de hotel activos
  const { data: hotelAgreements = [], isLoading: isLoadingAgreements } =
    useQuery({
      queryKey: ["activeHotelAgreements"],
      queryFn: getActiveHotelAgreements,
    });

  // Mutación para crear reserva
  const { mutate, isPending } = useMutation({
    mutationFn: (data: HotelReservationSchema) =>
      createHotelReservation(requestId, {
        hotel_agreement_id: data.hotel_agreement_id || null,
        hotel_name: data.hotel_name,
        address: data.address,
        phone: data.phone,
        checkin_date: data.checkin_date,
        checkout_date: data.checkout_date,
        total_cost: data.total_cost,
        receipt_file: data.receipt_file || undefined,
        notes: data.notes || "",
      }),
    onSuccess: () => {
      toast.success("Reserva de hotel creada exitosamente");
      navigate(`/perfil/viaticos/${id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Error al crear la reserva de hotel";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (data: HotelReservationSchema) => {
    mutate(data);
  };

  const handleCancel = () => {
    navigate(`/perfil/viaticos/${id}`);
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
