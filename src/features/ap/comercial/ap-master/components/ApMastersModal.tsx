import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  useApMastersById,
  useCreateApMasters,
  useUpdateApMasters,
} from "../lib/apMasters.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  SUBTITLE,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AP_MASTERS } from "../lib/apMaster.constants";
import ApMastersForm from "./ApMastersForm";
import { ApMastersSchema } from "../lib/apMasters.schema";

interface ApMastersModalProps {
  id?: number;
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
}

export default function ApMastersModal({
  id,
  open,
  onClose,
  mode,
}: ApMastersModalProps) {
  const { MODEL, EMPTY } = AP_MASTERS;
  const {
    data: master,
    isLoading: loadingMaster,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useApMastersById(id!);

  const createMutation = useCreateApMasters();
  const updateMutation = useUpdateApMasters();

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
          ERROR_MESSAGE(MODEL, mode === "create" ? "create" : "update")
      );
    }
  };

  const mappedMaster = master
    ? {
        ...master,
        status: Boolean(master.status),
      }
    : null;

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
        <ApMastersForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          defaultValues={mappedMaster || undefined}
          mode={mode}
          onCancel={onClose}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
