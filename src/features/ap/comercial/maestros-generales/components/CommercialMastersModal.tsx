import { GeneralModal } from "@/shared/components/GeneralModal";
import CommercialMastersForm from "./CommercialMastersForm";
import {
  useCommercialMastersById,
  useCreateCommercialMasters,
  useUpdateCommercialMasters,
} from "../lib/commercialMasters.hook";
import { CommercialMastersSchema } from "../lib/commercialMasters.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUBTITLE,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { COMMERCIAL_MASTERS } from "../lib/commercialMasters.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface CommercialMastersModalProps {
  id?: number;
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
}

export default function CommercialMastersModal({
  id,
  open,
  onClose,
  mode,
}: CommercialMastersModalProps) {
  const { MODEL, EMPTY } = COMMERCIAL_MASTERS;
  const {
    data: master,
    isLoading: loadingMaster,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useCommercialMastersById(id!);

  const createMutation = useCreateCommercialMasters();
  const updateMutation = useUpdateCommercialMasters();

  const handleSubmit = async (data: CommercialMastersSchema) => {
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
        <CommercialMastersForm
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
