"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/shared/components/FormInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { errorToast } from "@/core/core.function";
import { useState } from "react";
import { LoaderCircle, Mail, ArrowLeft } from "lucide-react";
import { CONSTANTS } from "@/core/core.constants";
import { LOGIN } from "@/constants/login";
import { forgotPassword } from "../lib/reset-password.actions";

const formSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
});

export function ForgotPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    await forgotPassword(values)
      .then((res) => {
        setSuccessMessage(res.message);
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ?? "Error al enviar el enlace"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
                <h1 className="text-xl font-semibold">
                  Restablecer contraseña
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Ingresa tu usuario y te enviaremos un enlace a tu correo
                  corporativo.
                </p>
              </div>

              {successMessage ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                    <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground text-balance">
                    {successMessage}
                  </p>
                  <p className="text-xs text-center text-muted-foreground">
                    Revisa tu bandeja de entrada y haz clic en el enlace. Expira
                    en 60 minutos.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      setSuccessMessage(null);
                      form.reset();
                    }}
                  >
                    Enviar de nuevo
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    className="flex flex-col gap-6"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <div className="flex flex-col py-2 gap-4">
                      <FormInput
                        name="username"
                        label="Usuario"
                        control={form.control}
                        type="text"
                        placeholder="Usuario"
                        required
                        className="h-10"
                      />
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
                        {isLoading ? "Enviando..." : "Enviar enlace"}
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
