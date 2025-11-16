import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { HierarchicalCategoryCompetenceSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.schema";
import { storeHierarchicalCategoryCompetence } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.actions";
import { HierarchicalCategoryCompetenceForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/components/HierarchicalCategoryCompetenceForm";
import { useAllCompetences } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.hook";
import { CATEGORY_COMPETENCE } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function HierarchicalCategoryCompetenceModal({
  id,
  open,
  onClose,
  title,
}: Props) {
  const { MODEL, QUERY_KEY } = CATEGORY_COMPETENCE;

  const queryClient = useQueryClient();

  const { data: competences, isLoading: isLoadingCompetences } =
    useAllCompetences();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: HierarchicalCategoryCompetenceSchema) =>
      storeHierarchicalCategoryCompetence(data),
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

  const handleSubmit = (data: HierarchicalCategoryCompetenceSchema) => {
    mutate({
      ...data,
      category_id: id,
    } as any);

    onClose();
  };

  const isLoadingAny = !competences || isLoadingCompetences;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-(--breakpoint-md)"
    >
      {!isLoadingAny && competences ? (
        <HierarchicalCategoryCompetenceForm
          defaultValues={{}}
          competences={competences}
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
