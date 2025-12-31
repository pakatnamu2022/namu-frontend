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
  const { data: master } = useCommercialMastersById(id || 0);
  const createMutation = useCreateCommercialMasters();
  const updateMutation = useUpdateCommercialMasters();
  const { MODEL } = COMMERCIAL_MASTERS;

  const handleSubmit = async (data: CommercialMastersSchema) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(data);
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      } else {
        await updateMutation.mutateAsync({ id: id!, body: data });
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
      }
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

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={MODEL.name}
      subtitle={SUBTITLE(MODEL, mode)}
      size="lg"
      icon="Cog"
    >
      <CommercialMastersForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        defaultValues={mappedMaster || undefined}
        mode={mode}
      />
    </GeneralModal>
  );
}
