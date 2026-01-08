import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePersonSegmentById } from "../lib/personSegment.hook";
import { PersonSegmentResource } from "../lib/personSegment.interface";
import { PersonSegmentSchema } from "../lib/personSegment.schema";
import {
  storePersonSegment,
  updatePersonSegment,
} from "../lib/personSegment.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { PersonSegmentForm } from "./PersonSegmentForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { PERSON_SEGMENT } from "../lib/personSegment.constants";
import { AP_MASTER_TYPE } from "../../../../comercial/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function PersonSegmentModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = PERSON_SEGMENT;
  const {
    data: personSegment,
    isLoading: loadingPersonSegment,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : usePersonSegmentById(id!);

  function mapPersonSegmentToForm(
    data: PersonSegmentResource
  ): Partial<PersonSegmentSchema> {
    return {
      description: data.description,
      type: AP_MASTER_TYPE.PERSON_SEGMENT,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PersonSegmentSchema) =>
      mode === "create"
        ? storePersonSegment(data)
        : updatePersonSegment(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: PersonSegmentSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingPersonSegment || !personSegment;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && personSegment ? (
        <PersonSegmentForm
          defaultValues={mapPersonSegmentToForm(personSegment)}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
