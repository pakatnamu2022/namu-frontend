"use client";

import { useQueryClient } from "@tanstack/react-query";
import { SUPPLY_CONTROL } from "../lib/supplyControl.constants";
import { useSupplyFormData, useSupplyById, useSupplyMutation } from "../lib/supplyControl.hooks";
import { SupplyControlResource, SupplyModalProps } from "../lib/supplyControl.interface";
import { SupplySchema } from "../lib/supplyControl.schema";
import { successToast } from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { SupplyForm } from "./SupplyForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { openPrintWindow } from "../lib/supplyTicket.helpers";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { format, parseISO } from "date-fns";
import { useState, useEffect } from "react";
import { TicketPhotoModal } from "./TicketPhotoModal";


export default function SupplyModal({ id, open, onClose, title, mode, onSuccess }: SupplyModalProps) {
    const { QUERY_KEY } = SUPPLY_CONTROL;
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { data: userComplete, isLoading: isLoadingUser } = useUserComplete(user.id);
    const { data: formData, isLoading: loadingFormData } = useSupplyFormData();
    const shouldFetch = mode === "update" && !!id;
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [lastCreatedSupply, setLastCreatedSupply] = useState<SupplyControlResource | null>(null);

    const {
        data: supply,
        isLoading: loadingSupply,
        refetch
    } = useSupplyById(shouldFetch ? id : undefined);

    const isDriver = userComplete?.position?.toUpperCase() === 'CONDUCTOR DE TRACTO CAMION' ||
        userComplete?.position?.toUpperCase() === 'INSTRUCTOR DE FLOTA';
    const isAssistant = userComplete?.position?.toUpperCase() === 'ASISTENTE DE OPERACIONES';
    const driverId = isDriver ? userComplete?.partner_id : null;


    useEffect(() => {
        if (!open && !ticketModalOpen) {
            setLastCreatedSupply(null);
        }
    }, [open, ticketModalOpen]);



    const mapSupplyToForm = (data: SupplyControlResource): any => {
        const formatDateForInput = (dateString: string | null | undefined): string => {
            if (!dateString) return '';
            try {
                const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
                if (isNaN(date.getTime())) return '';
                return format(date, "yyyy-MM-dd'T'HH:mm");
            } catch {
                return '';
            }
        };

        return {
            vehicle_id: data.vehicle?.id ? String(data.vehicle.id) : undefined,
            driver_id: data.driver?.id ? String(data.driver.id) : undefined,
            supplier_id: data.supplier?.id ? String(data.supplier.id) : undefined,
            mileage: data.mileage,
            gallons: data.gallons,
            is_base: data.is_base,
            recorded_at: formatDateForInput(data.recorded_at),
        };
    };



    const { mutate, isPending } = useSupplyMutation(mode, id, {
        onSuccess: async (response) => {
            if (mode === "update") {
                await refetch();
            }

            if (onSuccess) {
                onSuccess();
            }

            if (mode === "create" && response?.data) {
                const record = response.data;
                if (record.is_base) {
                    setLastCreatedSupply(record);
                    setTicketModalOpen(true);

                    setTimeout(() => {
                        onClose();
                    }, 300);

                    setTimeout(() => {
                        if (record) {
                            console.log('[SupplyModal] Imprimiendo ticket inmediatamente');
                            openPrintWindow(record);
                        }
                    }, 800);

                    return;
                }
            }

            onClose();
        },
        onError: (error: any) => {
            console.error('[SupplyModal] Error en mutación:', error);
        }
    });


    const handleSubmit = (data: SupplySchema) => {
        if (typeof data.is_base === 'string') {
            data.is_base = data.is_base === 'true' || data.is_base === '1';
        }

        if (isDriver && driverId) {
            data.driver_id = driverId;
        }
        mutate(data);
    };

    const isLoadingAny = loadingSupply || loadingFormData || !formData || isLoadingUser;

    const handleTicketModalClose = () => {
        setTicketModalOpen(false);
        setLastCreatedSupply(null);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    };

    const handleRePrint = () => {
        if (lastCreatedSupply) {
            openPrintWindow(lastCreatedSupply);
        }
    };

    return (
        <>
            <GeneralModal open={open} onClose={onClose} title={title}>
                {isLoadingAny ? (
                    <FormSkeleton />
                ) : (
                    <SupplyForm
                        onCancel={onClose}
                        onSubmit={handleSubmit}
                        isSubmitting={isPending}
                        mode={mode}
                        vehicles={formData?.vehicles || []}
                        drivers={formData?.drivers || []}
                        suppliers={formData?.suppliers || []}
                        isDriver={isDriver}
                        isAssistant={isAssistant}
                        driverId={driverId}
                        defaultValues={supply ? (mapSupplyToForm(supply) as any) : {}}
                    />
                )}
            </GeneralModal>

            <TicketPhotoModal
                open={ticketModalOpen}
                onClose={handleTicketModalClose}
                supplyId={lastCreatedSupply?.id || 0}
                onSuccess={() => {
                    successToast("Ticket firmado subido correctamente");
                    handleTicketModalClose();
                }}
                onRePrint={handleRePrint}
            />
        </>
    );
}