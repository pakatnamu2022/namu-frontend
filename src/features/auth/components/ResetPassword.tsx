"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/shared/components/FormInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { errorToast, successToast } from "@/core/core.function";
import { useState } from "react";
import { LoaderCircle, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { CONSTANTS } from "@/core/core.constants";
import { LOGIN } from "@/constants/login";
import { resetPasswordWithToken } from "../lib/reset-password.actions";

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    password_confirmation: z.string().min(1, "Debes confirmar la contraseña"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

export function ResetPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token || !email) return;

    setIsLoading(true);
    await resetPasswordWithToken({
      token,
      email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    })
      .then((res) => {
        successToast(res.message);
        setSuccess(true);
        setTimeout(() => navigate("/", { replace: true }), 2500);
      })
      .catch((error: any) => {
        const message: string =
          error?.response?.data?.message ?? "Error al restablecer contraseña";
        if (
          message.toLowerCase().includes("expirado") ||
          message.toLowerCase().includes("expir")
        ) {
          setTokenExpired(true);
        } else {
          errorToast(message);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const invalidLink = !token || !email;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 rounded-3xl shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="relative h-16 aspect-[3]">
                  <img
                    src={CONSTANTS.LOGO}
                    alt="Logo"
                    className="absolute inset-0 h-full w-full object-contain dark:hidden"
                  />
                  <img
                    src={CONSTANTS.LOGO_WHITE}
                    alt="Logo"
                    className="absolute inset-0 h-full w-full object-contain hidden dark:block"
                  />
                </div>
                <h1 className="text-xl font-semibold">Nueva contraseña</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Elige una contraseña segura para tu cuenta.
                </p>
              </div>

              {invalidLink && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <p className="text-sm text-destructive">
                    El enlace es inválido o está incompleto.
                  </p>
                  <Link to="/forgot-password">
                    <Button variant="outline">Solicitar nuevo enlace</Button>
                  </Link>
                </div>
              )}

              {!invalidLink && success && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Contraseña restablecida correctamente. Redirigiendo al
                    inicio de sesión...
                  </p>
                </div>
              )}

              {!invalidLink && tokenExpired && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <p className="text-sm text-muted-foreground text-balance">
                    El enlace ha expirado. Los enlaces de restablecimiento son
                    válidos por 60 minutos.
                  </p>
                  <Link to="/forgot-password">
                    <Button variant="outline">Solicitar nuevo enlace</Button>
                  </Link>
                </div>
              )}

              {!invalidLink && !success && !tokenExpired && (
                <Form {...form}>
                  <form
                    className="flex flex-col gap-6"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <div className="flex flex-col py-2 gap-4">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <FormInput
                            name="password"
                            label="Nueva contraseña"
                            control={form.control}
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            required
                            className="h-10"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"}
                          </span>
                        </Button>
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <FormInput
                            name="password_confirmation"
                            label="Confirmar contraseña"
                            control={form.control}
                            type={showConfirmation ? "text" : "password"}
                            placeholder="Repite la contraseña"
                            required
                            className="h-10"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => setShowConfirmation(!showConfirmation)}
                          tabIndex={-1}
                        >
                          {showConfirmation ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showConfirmation
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"}
                          </span>
                        </Button>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        <LoaderCircle
                          className={cn(
                            "mr-2 h-4 w-4",
                            isLoading ? "animate-spin" : "hidden"
                          )}
                        />
                        {isLoading
                          ? "Guardando..."
                          : "Restablecer contraseña"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-background relative hidden md:block">
            <img
              src={LOGIN.FONDO}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance pb-4">
        © {new Date().getFullYear()} Sian. Todos los derechos reservados.
      </div>
    </div>
  );
}
