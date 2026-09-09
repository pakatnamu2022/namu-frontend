"use client";

import { SUPPLIER } from "../lib/supplyControl.constants";
import { useSupplierById, useSupplierMutation } from "../lib/supplyControl.hooks";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { SupplierForm } from "./SupplierForm";

interface Props {
    id?: number;
    open: boolean;
    onClose: () => void;
    title: string;
    mode: "create" | "update";
    onSuccess?: () => void;
}

export default function SupplierModal({ id, open, onClose, title, mode, onSuccess }: Props) {
    const { EMPTY } = SUPPLIER;

    const {
        data: supplier,
        isLoading: loadingSupplier,
        refetch,
    } = mode === "create"
            ? { data: EMPTY, isLoading: false, refetch: () => { } }
            : useSupplierById(id);

    const { mutate, isPending } = useSupplierMutation(mode, id, {
        onSuccess: async () => {
            if (mode === "update") {
                await refetch();
            }
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            console.error("Error en [SupplierModal]:", error);
        }
    });

    const isLoadingAny = loadingSupplier;

    return (
        <GeneralModal open={open} onClose={onClose} title={title}>
            {isLoadingAny ? (
                <FormSkeleton />
            ) : (
                <SupplierForm
                    onCancel={onClose}
                    onSubmit={mutate}
                    isSubmitting={isPending}
                    mode={mode}
                    defaultValues={supplier || {}}
                />
            )}
        </GeneralModal>
    );
}