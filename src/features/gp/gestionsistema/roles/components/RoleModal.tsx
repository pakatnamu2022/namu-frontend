import { GeneralModal } from "@/shared/components/GeneralModal";
import { RoleForm } from "./RoleForm";
import { RoleResource } from "../lib/role.interface";
import { RoleSchema } from "../lib/role.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoleById } from "../lib/role.hook";
import { storeRole, updateRole } from "../lib/role.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ROLE } from "../lib/role.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function RoleModal({ id, open, onClose, title, mode }: Props) {
  const { EMPTY, MODEL, QUERY_KEY } = ROLE;
  const queryClient = useQueryClient();
  const {
    data: role,
    isLoading: loadingRole,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useRoleById(id!);

  function mapRoleToForm(data: RoleResource): Partial<RoleSchema> {
    return {
      nombre: data.nombre,
      descripcion: data.descripcion,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RoleSchema) =>
      mode === "create" ? storeRole(data) : updateRole(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: RoleSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingRole || !role;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && role ? (
        <RoleForm
          defaultValues={mapRoleToForm(role)}
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
