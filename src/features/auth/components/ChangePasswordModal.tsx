"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/core/core.function";
import { Eye, EyeOff, Info } from "lucide-react";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../lib/change-password.schema";
import { changePassword } from "../lib/change-password.actions";
import { useAuthStore } from "../lib/auth.store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  isForced?: boolean;
  defaultCurrentPassword?: string;
}

export function ChangePasswordModal({
  open,
  onClose,
  isForced = false,
  defaultCurrentPassword,
}: ChangePasswordModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { authenticate } = useAuthStore();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: defaultCurrentPassword || "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: async () => {
      successToast("Contraseña cambiada exitosamente");
      form.reset();

      // Refresh user data to update verified_at
      await authenticate();

      if (!isForced) {
        onClose();
      }
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message || "Error al cambiar la contraseña",
      );
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    mutate(data);
  };

  return (
    <GeneralModal
      open={open}
      onClose={isForced ? () => {} : onClose}
      title={isForced ? "Cambio de contraseña requerido" : "Cambiar contraseña"}
      subtitle={
        isForced
          ? "Debes cambiar tu contraseña para continuar usando el sistema"
          : "Actualiza tu contraseña de acceso"
      }
      icon="Lock"
      maxWidth="max-w-[500px]"
      modal={isForced}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="current_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña actual</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña actual"
                      disabled={isPending}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Ingresa tu nueva contraseña"
                      disabled={isPending}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="new_password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nueva contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma tu nueva contraseña"
                      disabled={isPending}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Alert>
            <AlertTitle>
              <Info className="inline h-4 w-4 mr-1 mb-1 shrink-0" />
              Importante
            </AlertTitle>
            <AlertDescription>
              Esta nueva contraseña será también su nueva contraseña del sistema
              <strong> Milla GP</strong>.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2 pt-4">
            {!isForced && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Cambiando..." : "Cambiar contraseña"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
