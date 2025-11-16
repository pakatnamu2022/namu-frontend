import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { CATEGORY_OBJECTIVE } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.constants";
import { HierarchicalCategoryObjectiveSchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.schema";
import { storeHierarchicalCategoryObjective } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.actions";
import { HierarchicalCategoryObjectiveForm } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/components/HierarchicalCategoryObjectiveForm";
import { useAllObjectives } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.hook";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function HierarchicalCategoryObjectiveModal({
  id,
  open,
  onClose,
  title,
}: Props) {
  const { MODEL, QUERY_KEY } = CATEGORY_OBJECTIVE;

  const queryClient = useQueryClient();

  const { data: objectives, isLoading: isLoadingObjectives } =
    useAllObjectives();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: HierarchicalCategoryObjectiveSchema) =>
      storeHierarchicalCategoryObjective(data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create")
      );
    },
  });

  const handleSubmit = (data: HierarchicalCategoryObjectiveSchema) => {
    mutate({
      ...data,
      category_id: id,
    } as any);

    onClose();
  };

  const isLoadingAny = !objectives || isLoadingObjectives;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-(--breakpoint-md)"
    >
      {!isLoadingAny && objectives ? (
        <HierarchicalCategoryObjectiveForm
          defaultValues={{}}
          objectives={objectives}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
