"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../lib/auth.store";
import { errorToast } from "@/core/core.function";
import { useState } from "react";
import { LoaderCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { CONSTANTS } from "@/core/core.constants";
import { LOGIN } from "@/constants/login";

export function TwoFactorVerify({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyWith2FA } = useAuthStore();

  const pendingToken: string | undefined = location.state?.pending_token;

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!pendingToken) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0 rounded-3xl shadow-xl">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-10 flex flex-col gap-6 items-center justify-center text-center">
              <p className="text-sm text-destructive">
                Sesión no válida. Inicia sesión nuevamente.
              </p>
              <Link to="/">
                <Button variant="outline">Ir al inicio de sesión</Button>
              </Link>
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
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setIsLoading(true);
    await verifyWith2FA({ pending_token: pendingToken, code })
      .then(() => {
        navigate("/companies", { replace: true });
      })
      .catch((error: any) => {
        const message: string =
          error?.response?.data?.message ?? "Error al verificar el código";
        if (
          message.toLowerCase().includes("expirada") ||
          message.toLowerCase().includes("expir")
        ) {
          navigate("/", { replace: true, state: { sessionExpired: true } });
          return;
        }
        errorToast(message);
        setCode("");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 rounded-3xl shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-10" onSubmit={handleSubmit}>
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
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-primary/10 rounded-full p-3 mb-1">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-xl font-semibold">
                    Verificación en dos pasos
                  </h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Ingresa el código de 6 dígitos de tu Authenticator.
                  </p>
                </div>
              </div>

              <div className="flex flex-col py-4 gap-6 items-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                <Button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full"
                >
                  <LoaderCircle
                    className={cn(
                      "mr-2 h-4 w-4",
                      isLoading ? "animate-spin" : "hidden",
                    )}
                  />
                  {isLoading ? "Verificando..." : "Verificar"}
                </Button>
              </div>

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
          </form>

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
