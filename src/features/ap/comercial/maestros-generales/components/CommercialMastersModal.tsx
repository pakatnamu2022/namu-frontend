import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommercialMastersForm from "./CommercialMastersForm";
import {
  useCommercialMastersById,
  useCreateCommercialMasters,
  useUpdateCommercialMasters,
} from "../lib/commercialMasters.hook";
import { CommercialMastersSchema } from "../lib/commercialMasters.schema";
import { errorToast, successToast } from "@/core/core.function";

interface CommercialMastersModalProps {
  id?: number;
  title: string;
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
}

export default function CommercialMastersModal({
  id,
  title,
  open,
  onClose,
  mode,
}: CommercialMastersModalProps) {
  const { data: master } = useCommercialMastersById(id || 0);
  const createMutation = useCreateCommercialMasters();
  const updateMutation = useUpdateCommercialMasters();

  const handleSubmit = async (data: CommercialMastersSchema) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(data);
        successToast("Maestro comercial creado exitosamente");
      } else {
        await updateMutation.mutateAsync({ id: id!, body: data });
        successToast("Maestro comercial actualizado exitosamente");
      }
      onClose();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          "Error al guardar el maestro comercial"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <CommercialMastersForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          defaultValues={master}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}
