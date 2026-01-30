"use client";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useRoles } from "@/features/gp/gestionsistema/roles/lib/role.hook";
import { RoleResource } from "@/features/gp/gestionsistema/roles/lib/role.interface";
import { UserResource } from "../lib/user.interface";
import { assignUserRole } from "../lib/user.actions";
import { errorToast, successToast } from "@/core/core.function";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserResource;
  onSuccess: () => void;
}

export function AssignRoleModal({ open, onClose, user, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      role_id: "",
    },
  });

  const handleSubmit = async (values: { role_id: string }) => {
    if (!values.role_id) return;
    setIsSubmitting(true);
    try {
      await assignUserRole(user.id, Number(values.role_id));
      successToast("Rol asignado correctamente.");
      onSuccess();
      onClose();
    } catch {
      errorToast("Error al asignar el rol.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={user.name}
      subtitle="Asignar rol al usuario"
      icon="UserCog"
    >
      <div className="space-y-4">
        {user.role && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rol actual:</span>
            <Badge>{user.role}</Badge>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormSelectAsync
              name="role_id"
              label="Nuevo rol"
              placeholder="Buscar rol..."
              control={form.control}
              required
              useQueryHook={useRoles}
              mapOptionFn={(item: RoleResource) => ({
                value: String(item.id),
                label: item.nombre,
                description: item.descripcion,
              })}
              withValue={false}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Asignar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </GeneralModal>
  );
}
