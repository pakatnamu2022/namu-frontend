import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VEHICULO } from "../libs/vehiculo.constants";
import { useFormData, useVehiculoById } from "../libs/vehiculo.hook";
import { VehiculoResource } from "../libs/vehiculo.interface";
import { VehiculoSchema, VehiculoSchemaUpdate } from "../libs/vehiculo.schema";
import {
    storeVehiculo,
    updateVehiculo,
} from "../libs/vehiculo.actions";
import {
    ERROR_MESSAGE,
    errorToast,
    SUCCESS_MESSAGE,
    successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { VehiculoForm } from "./VehiculoForm";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface Props {
    id?: number;
    open: boolean;
    onClose: () => void;
    title: string;
    mode: "create" | "update";
}

export default function VehiculoModal({
    id,
    open,
    onClose,
    title,
    mode,
}: Props) {
    const { EMPTY, MODEL, QUERY_KEY } = VEHICULO;
    const queryClient = useQueryClient();

    const { data: formData, isLoading: loadingFormData } = useFormData();

    const {
        data: vehiculo,
        isLoading: loadingVehiculo,
        refetch,
    } = mode === "create"
            ? { data: EMPTY, isLoading: false, refetch: () => { } }
            : useVehiculoById(id!);

    const mapVehiculoToFormCreate = (
        data: VehiculoResource
    ): Partial<VehiculoSchema> => ({
        tipo_vehiculo_id: data.tipo_vehiculo_id,
        placa: data.placa,
        modelo: data.modelo ?? undefined,
        marca: data.marca ?? undefined,
        serie_chasis: data.serie_chasis ?? undefined,
        motor: data.motor ?? undefined,
        num_mtc: data.num_mtc ?? undefined,
        tarjeta_circulacion: data.tarjeta_circulacion ?? undefined,
        kilometraje: data.kilometraje ?? undefined,
        tercero: data.tercero,
        capacidad: data.capacidad ?? undefined,
        capacidad_bruta: data.capacidad_bruta ?? undefined,
        reserva: data.reserva ?? undefined,
        capacidad_util: data.capacidad_util ?? undefined,
        vehiculo_status: data.vehiculo_status,
        status_geotab_km: data.status_geotab_km,
        status_matpel: data.status_matpel,
        status_ubicacion: data.status_ubicacion,
        sede_id: data.sede_id,
    });

    const mapVehiculoToFormUpdate = (
        data: VehiculoResource
    ): Partial<VehiculoSchemaUpdate> => ({
        ...mapVehiculoToFormCreate(data),
        ult_manteniento_realizado: data.ult_manteniento_realizado ?? undefined,
        km_mantenimiento: data.km_mantenimiento ?? undefined,
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: VehiculoSchema | VehiculoSchemaUpdate) =>
            mode === "create"
                ? storeVehiculo(data)
                : updateVehiculo(id!, data),
        onSuccess: async () => {
            successToast(SUCCESS_MESSAGE(MODEL, mode));
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            if (mode === "update") {
                await refetch();
            }
            onClose();
        },
        onError: (error: any) => {
            errorToast(
                error.response?.data?.message ?? ERROR_MESSAGE(MODEL, mode)
            );
        },
    });

    const handleSubmit = (data: VehiculoSchema | VehiculoSchemaUpdate) => {
        mutate(data);
    };

    const isLoadingAny = loadingVehiculo || loadingFormData || !formData;

    const defaultValues = vehiculo
        ? mode === "create"
            ? mapVehiculoToFormCreate(vehiculo)
            : mapVehiculoToFormUpdate(vehiculo)
        : {};

    return (
        <GeneralModal
            open={open}
            onClose={onClose}
            title={title}
            subtitle={mode === "create" ? "Registra un nuevo vehículo en el sistema" : "Actualiza los datos del vehículo"}
            icon="Truck"
            size="3xl"
        >
            {isLoadingAny ? (
                <FormSkeleton />
            ) : (
                <VehiculoForm
                    onCancel={onClose}
                    onSubmit={handleSubmit}
                    isSubmitting={isPending}
                    mode={mode}
                    formData={formData}
                    defaultValues={defaultValues}
                />
            )}
        </GeneralModal>
    );
}