import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TIPOVEHICULO } from "../libs/tipoVehiculo.constants";
import { useFormData, useTipoVehiculoById } from "../libs/tipoVehiculo.hook";
import { TipoVehiculoResource } from "../libs/tipoVehiculo.interface";
import { TipoVehiculoSchema } from "../libs/tipoVehiculo.schema";
import {
    ERROR_MESSAGE,
    errorToast,
    SUCCESS_MESSAGE,
    successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { TipoVehiculoForm } from "./TipoVehiculoForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { storeTipoVehiculo, updateTipoVehiculo } from "../libs/tipoVehiculo.actions";

interface Props {
    id?: number;
    open: boolean;
    onClose: () => void;
    title: string;
    mode: "create" | "update";
}

export default function TipoVehiculoModal({
    id,
    open,
    onClose,
    title,
    mode,
}: Props) {
    const { EMPTY, MODEL, QUERY_KEY } = TIPOVEHICULO;
    const queryClient = useQueryClient();

    const { data: formData, isLoading: loadingFormData } = useFormData();

    const {
        data: tipoVehiculo,
        isLoading: loadingTipoVehiculo,
        refetch,
    } = mode === "create"
            ? { data: EMPTY, isLoading: false, refetch: () => { } }
            : useTipoVehiculoById(id!);

    const mapTipoVehiculoToForm = (
        data: TipoVehiculoResource
    ): Partial<TipoVehiculoSchema> => {
        return {
            descripcion: data.descripcion,
        };
    };

    const { mutate, isPending } = useMutation({
        mutationFn: (data: TipoVehiculoSchema) =>
            mode === "create"
                ? storeTipoVehiculo(data)
                : updateTipoVehiculo(id!, data),
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

    const handleSubmit = (data: TipoVehiculoSchema) => {
        mutate(data);
    };

    const isLoadingAny = loadingTipoVehiculo || loadingFormData || !formData;

    return (
        <GeneralModal open={open} onClose={onClose} title={title}>
            {isLoadingAny ? (
                <FormSkeleton />
            ) : (
                <TipoVehiculoForm
                    onCancel={onClose}
                    onSubmit={handleSubmit}
                    isSubmitting={isPending}
                    mode={mode}
                    defaultValues={
                        tipoVehiculo
                            ? mapTipoVehiculoToForm(tipoVehiculo)
                            : {}
                    }
                />
            )}
        </GeneralModal>
    );
}