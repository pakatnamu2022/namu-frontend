import { GeneralModal } from "@/shared/components/GeneralModal";
import GeneralMastersForm from "./GeneralMastersForm";
import {
  useGeneralMastersById,
  useCreateGeneralMasters,
  useUpdateGeneralMasters,
} from "../lib/generalMasters.hook";
import { GeneralMastersSchema } from "../lib/generalMasters.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUBTITLE,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GENERAL_MASTERS } from "../lib/generalMasters.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface GeneralMastersModalProps {
  id?: number;
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
}

export default function GeneralMastersModal({
  id,
  open,
  onClose,
  mode,
}: GeneralMastersModalProps) {
  const { MODEL, EMPTY } = GENERAL_MASTERS;
  const {
    data: master,
    isLoading: loadingMaster,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useGeneralMastersById(id!);

  const createMutation = useCreateGeneralMasters();
  const updateMutation = useUpdateGeneralMasters();

  const handleSubmit = async (data: GeneralMastersSchema) => {
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
          ERROR_MESSAGE(MODEL, mode === "create" ? "create" : "update")
      );
    }
  };

  const mappedMaster = master
    ? {
        code: master.code,
        description: master.description,
        type: master.type,
        value: master.value,
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
        <GeneralMastersForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          defaultValues={mappedMaster}
          mode={mode}
          onCancel={onClose}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
