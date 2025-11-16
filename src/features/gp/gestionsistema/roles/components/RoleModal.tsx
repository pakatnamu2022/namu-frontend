import { GeneralModal } from "@/shared/components/GeneralModal";
import { RoleForm } from "./RoleForm";
import { RoleResource } from "../lib/role.interface";
import { RoleSchema } from "../lib/role.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoleById } from "../lib/role.hook";
import { storeRole, updateRole } from "../lib/role.actions";
import { errorToast, successToast } from "@/core/core.function";
import {
  CREATE_ERROR,
  CREATE_SUCCESS,
  EMPTY_ROLE,
  UPDATE_ERROR,
  UPDATE_SUCCESS,
} from "../lib/role.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function RoleModal({ id, open, onClose, title, mode }: Props) {
  const queryClient = useQueryClient();
  const {
    data: role,
    isLoading: loadingRole,
    refetch,
  } = mode === "create"
    ? { data: EMPTY_ROLE, isLoading: false, refetch: () => {} }
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
      successToast(mode === "create" ? CREATE_SUCCESS : UPDATE_SUCCESS);
      await queryClient.invalidateQueries({ queryKey: ["role"] });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message,
        mode === "create" ? CREATE_ERROR : UPDATE_ERROR
      );
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
