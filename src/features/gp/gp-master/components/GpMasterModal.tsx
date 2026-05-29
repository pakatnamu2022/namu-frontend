"use client";

import { GeneralModal } from "@/shared/components/GeneralModal";
import GpMasterForm from "./GpMasterForm";
import {
  useGpMastersById,
  useCreateGpMasters,
  useUpdateGpMasters,
} from "../lib/gpMaster.hook";
import { ApMastersSchema } from "../lib/gpMaster.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUBTITLE,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GP_MASTERS } from "../lib/gpMaster.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface GpMasterModalProps {
  id?: number;
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  allowedTypes: string[];
  typeLabels?: Record<string, string>;
}

export default function GpMasterModal({
  id,
  open,
  onClose,
  mode,
  allowedTypes,
  typeLabels,
}: GpMasterModalProps) {
  const { MODEL, EMPTY } = GP_MASTERS;

  const defaultType =
    allowedTypes.length === 1 ? allowedTypes[0] : (EMPTY?.type ?? "");

  const emptyWithType = { ...EMPTY, type: defaultType };

  const {
    data: master,
    isLoading: loadingMaster,
    refetch,
  } = mode === "create"
    ? { data: emptyWithType, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useGpMastersById(id!);

  const createMutation = useCreateGpMasters();
  const updateMutation = useUpdateGpMasters();

  const handleSubmit = async (data: ApMastersSchema) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(data);
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      } else {
        await updateMutation.mutateAsync({ id: id!, body: data });
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
      }
      await refetch();
      onClose();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          ERROR_MESSAGE(MODEL, mode === "create" ? "create" : "update"),
      );
    }
  };

  const mappedMaster = master
    ? {
        code: master.code ?? "",
        description: master.description ?? "",
        type: master.type ?? defaultType,
        status: Boolean(master.status),
      }
    : undefined;

  const isLoadingAny = loadingMaster || !master;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={MODEL.name}
      subtitle={SUBTITLE(MODEL, mode)}
      size="lg"
      icon="Cog"
    >
      {!isLoadingAny && master ? (
        <GpMasterForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          defaultValues={mappedMaster}
          mode={mode}
          onCancel={onClose}
          allowedTypes={allowedTypes}
          typeLabels={typeLabels}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
