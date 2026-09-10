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
import { useEffect, useState } from "react";
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import { CONSTANTS } from "@/core/core.constants";
import { useLoginBackground, type BgFrame } from "@/shared/hooks/useLoginBackground";

const formSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export function Login({ className, ...props }: React.ComponentProps<"div">) {
  const links = CONSTANTS.EMPRESAS;

  const [isLogging, setIsLogging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { frame, busy, refresh } = useLoginBackground();
  const [layers, setLayers] = useState<BgFrame[]>([]);

  useEffect(() => {
    if (!frame) return;
    setLayers((prev) =>
      prev.length && prev[prev.length - 1].id === frame.id ? prev : [...prev, frame].slice(-2),
    );
  }, [frame]);

  const activeColor = layers[layers.length - 1]?.color ?? frame?.color ?? "#1E2430";
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
        if (error?.requires_2fa) {
          push("/2fa-verify", { state: { pending_token: error.pending_token } });
          return;
        }
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
                        {showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"}
                      </span>
                    </Button>
                  </div>
                  <Button type="submit" disabled={isLogging} className="w-full">
                    <LoaderCircle
                      className={cn(
                        "mr-2 h-4 w-4",
                        isLogging ? "animate-spin" : "hidden",
                      )}
                    />
                    {isLogging ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                  <div className="text-center">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
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
          <div
            className="group relative hidden md:block cursor-pointer select-none overflow-hidden"
            style={{ backgroundColor: activeColor }}
            onClick={() => !busy && refresh()}
            role="button"
            tabIndex={0}
            title="Clic para cambiar la imagen"
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !busy) {
                e.preventDefault();
                refresh();
              }
            }}
          >
            {/* Se pinta la más nueva primero (debajo, sólida) y la anterior
                encima desvaneciéndose: crossfade sutil sin parpadeo. */}
            {[...layers].reverse().map((layer, i) => {
              const fadingOut = i !== 0 && layers.length > 1;
              return (
                <img
                  key={layer.id}
                  src={layer.src}
                  alt=""
                  onTransitionEnd={() => {
                    if (fadingOut) setLayers((cur) => cur.slice(-1));
                  }}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-900 ease-out",
                    fadingOut ? "opacity-0" : "opacity-100",
                  )}
                />
              );
            })}

            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300",
                busy && "opacity-100",
              )}
            />

            {(() => {
              const credit = layers[layers.length - 1]?.credit;
              if (!credit) return null;
              return (
                <div className="absolute bottom-2 right-3 text-[10px] text-white/80 drop-shadow">
                  Foto de{" "}
                  <a
                    href={credit.authorUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline underline-offset-2 hover:text-white"
                  >
                    {credit.authorName}
                  </a>{" "}
                  en{" "}
                  <a
                    href={credit.unsplashUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Unsplash
                  </a>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground hover:[a]:*:text-primary text-center text-xs text-balance [a]:*:underline [a]:*:underline-offset-4 pb-4">
        © {new Date().getFullYear()} Sian. Todos los derechos reservados.
      </div>
    </div>
  );
}
