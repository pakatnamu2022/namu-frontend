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
import { useAuthStore } from "../lib/auth.store";
import { errorToast, successToast } from "@/core/core.function";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "@/constants/login";
import { useState } from "react";
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import { CONSTANTS } from "@/core/core.constants";

const formSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export function Login({ className, ...props }: React.ComponentProps<"div">) {
  const links = CONSTANTS.EMPRESAS;

  const [isLogging, setIsLogging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { login } = useAuthStore();
  const push = useNavigate();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLogging(true);
    await login(values)
      .then(() => {
        successToast("Inicio de sesión exitoso");
        push("/companies");
      })
      .catch((error: any) => {
        errorToast(error?.response?.data?.message ?? "Error al iniciar sesión");
      })
      .finally(() => {
        setIsLogging(false);
      });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 rounded-3xl shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              className="p-6 md:p-10"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="relative h-16 aspect-[3]">
                    <img
                      src={CONSTANTS.LOGO}
                      alt="Image"
                      className="absolute inset-0 h-full w-full object-contain dark:hidden"
                    />
                    <img
                      src={CONSTANTS.LOGO_WHITE}
                      alt="Image"
                      className="absolute inset-0 h-full w-full object-contain hidden dark:block"
                    />
                  </div>
                  <p className="text-muted-foreground text-balance">
                    Inicia sesión para comenzar.
                  </p>
                </div>
                <div className="flex flex-col py-6 gap-6">
                  <FormInput
                    name="username"
                    label="Usuario"
                    control={form.control}
                    type="text"
                    placeholder="Usuario"
                    required
                    className="h-10"
                  />
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <FormInput
                        name="password"
                        label="Contraseña"
                        control={form.control}
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
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
                        {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      </span>
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLogging}
                    className="w-full"
                  >
                    <LoaderCircle
                      className={cn(
                        "mr-2 h-4 w-4",
                        isLogging ? "animate-spin" : "hidden"
                      )}
                    />
                    {isLogging ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Otros Enlaces
                  </span>
                </div>
                <div className="grid grid-cols-4 justify-center items-center gap-4">
                  {links.map((link: any) => (
                    <Link key={link.href} to={link.href} target="_blank">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="size-14 aspect-square relative rounded-lg"
                      >
                        <img
                          className="size-32 p-2"
                          src={link.src}
                          alt={link.label}
                        />
                        <span className="sr-only">{link.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </form>
          </Form>
          <div className="bg-background relative hidden md:block">
            <img
              src={LOGIN.FONDO}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground hover:[a]:*:text-primary text-center text-xs text-balance [a]:*:underline [a]:*:underline-offset-4 pb-4">
        © {new Date().getFullYear()} Siam. Todos los derechos reservados.
      </div>
    </div>
  );
}
