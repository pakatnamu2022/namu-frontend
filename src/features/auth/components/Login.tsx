"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../lib/auth.store";
import { errorToast, successToast } from "@/core/core.function";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "@/constants/login";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { CONSTANTS } from "@/core/core.constants";

const formSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export function Login({ className, ...props }: React.ComponentProps<"div">) {
  const links = CONSTANTS.EMPRESAS;

  const [isLogging, setIsLogging] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { login } = useAuthStore();
  const push = useNavigate();

  const onLogin = async () => {
    setIsLogging(true);
    await onSubmit(form.getValues()).catch(() => {
      setIsLogging(false);
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await login(values)
      .then(() => {
        successToast("Inicio de sesión exitoso");
        push("/companies");
      })
      .catch((error: any) => {
        errorToast(error?.response?.data?.message ?? "Error al iniciar sesión");
        throw error;
      });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 rounded-3xl shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              className="p-6 md:p-10"
              onSubmit={form.handleSubmit(() => {})}
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-background relative h-16 aspect-[3]">
                    <img
                      src={CONSTANTS.LOGO}
                      alt="Image"
                      className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale"
                    />
                  </div>
                  <p className="text-muted-foreground text-balance">
                    Inicia sesión para comenzar.
                  </p>
                </div>
                <div className="flex flex-col py-6 gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Usuario</FormLabel>
                        <FormControl>
                          <Input
                            id="username"
                            type="text"
                            placeholder="Usuario"
                            required
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Contraseña"
                            required
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    disabled={isLogging}
                    onClick={onLogin}
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
                        className="size-14 aspect-square relative rounded-full"
                      >
                        <img
                          className="h-4 w-4 p-2"
                          src={link.src}
                          alt={link.label}
                          loading="lazy"
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
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground hover:[a]:*:text-primary text-center text-xs text-balance [a]:*:underline [a]:*:underline-offset-4 pb-4">
        © {new Date().getFullYear()} Namú. Todos los derechos reservados.
      </div>
    </div>
  );
}
