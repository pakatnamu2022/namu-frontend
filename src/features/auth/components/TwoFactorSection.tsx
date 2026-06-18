"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { QRCodeSVG } from "qrcode.react";
import { useAuthStore } from "../lib/auth.store";
import { setup2FA, enable2FA, disable2FA } from "../lib/two-factor.actions";
import { errorToast, successToast } from "@/core/core.function";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  ShieldOff,
  LoaderCircle,
  CheckCircle2,
  Smartphone,
  ChevronRight,
} from "lucide-react";

type SetupState = "idle" | "qr" | "verify" | "done";

function EnableModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<SetupState>("idle");
  const [secret, setSecret] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = async () => {
    setIsLoading(true);
    await setup2FA()
      .then((res) => {
        setSecret(res.secret);
        setQrUrl(res.qr_url);
        setStep("qr");
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ?? "Error al configurar 2FA",
        );
        onClose();
      })
      .finally(() => setIsLoading(false));
  };

  const handleEnable = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    await enable2FA({ secret, code })
      .then((res) => {
        successToast(res.message);
        setStep("done");
        onSuccess();
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ?? "Código inválido",
        );
        setCode("");
      })
      .finally(() => setIsLoading(false));
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setStep("idle");
      setCode("");
      setSecret("");
      setQrUrl("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Activar autenticación en dos pasos
          </DialogTitle>
          <DialogDescription>
            Usa Microsoft Authenticator, Google Authenticator o Authy para
            escanear el código QR.
          </DialogDescription>
        </DialogHeader>

        {step === "idle" && (
          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm text-muted-foreground">
              Al activar 2FA, necesitarás ingresar un código de tu aplicación
              Authenticator cada vez que inicies sesión.
            </p>
            <Button onClick={handleOpen} disabled={isLoading} className="w-full">
              <LoaderCircle
                className={cn("mr-2 h-4 w-4", isLoading ? "animate-spin" : "hidden")}
              />
              Comenzar configuración
            </Button>
          </div>
        )}

        {step === "qr" && (
          <div className="flex flex-col gap-4 py-2 items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <QRCodeSVG value={qrUrl} size={180} />
              </div>
              <p className="text-sm text-muted-foreground text-center text-balance">
                Escanea este código con tu Authenticator, luego ingresa el
                código de 6 dígitos generado.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => setStep("verify")}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Ya lo escaneé, ingresar código
            </Button>
          </div>
        )}

        {step === "verify" && (
          <div className="flex flex-col gap-4 py-2 items-center">
            <p className="text-sm text-muted-foreground text-center">
              Ingresa el código de 6 dígitos de tu Authenticator.
            </p>
            <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("qr")}
                disabled={isLoading}
              >
                Volver
              </Button>
              <Button
                className="flex-1"
                onClick={handleEnable}
                disabled={isLoading || code.length !== 6}
              >
                <LoaderCircle
                  className={cn("mr-2 h-4 w-4", isLoading ? "animate-spin" : "hidden")}
                />
                {isLoading ? "Activando..." : "Activar 2FA"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-4 py-2 items-center text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              La autenticación en dos pasos está activa. Tu cuenta ahora está
              protegida.
            </p>
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DisableModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDisable = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    await disable2FA({ code })
      .then((res) => {
        successToast(res.message);
        onSuccess();
        onClose();
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ?? "Código inválido",
        );
        setCode("");
      })
      .finally(() => setIsLoading(false));
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setCode("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-destructive" />
            Desactivar autenticación en dos pasos
          </DialogTitle>
          <DialogDescription>
            Ingresa el código actual de tu Authenticator para confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 items-center">
          <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
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
            variant="destructive"
            className="w-full"
            onClick={handleDisable}
            disabled={isLoading || code.length !== 6}
          >
            <LoaderCircle
              className={cn("mr-2 h-4 w-4", isLoading ? "animate-spin" : "hidden")}
            />
            {isLoading ? "Desactivando..." : "Desactivar 2FA"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TwoFactorSection() {
  const { user, setUserTwoFactor } = useAuthStore();
  const isEnabled = user?.two_factor_enabled ?? false;

  const [showEnable, setShowEnable] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  return (
    <>
      <button
        onClick={() => (isEnabled ? setShowDisable(true) : setShowEnable(true))}
        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/60 transition-colors text-left"
      >
        <div
          className={cn(
            "rounded-xl p-2 shrink-0",
            isEnabled
              ? "bg-green-500/10 dark:bg-green-500/15"
              : "bg-muted",
          )}
        >
          {isEnabled ? (
            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Autenticación en dos pasos</p>
          <p className="text-xs text-muted-foreground">
            {isEnabled
              ? "Activa — se solicita código al iniciar sesión"
              : "Añade una capa extra de seguridad"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-xs font-medium",
              isEnabled ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
            )}
          >
            {isEnabled ? "Activada" : "Desactivada"}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </button>

      <EnableModal
        open={showEnable}
        onClose={() => setShowEnable(false)}
        onSuccess={() => setUserTwoFactor(true)}
      />
      <DisableModal
        open={showDisable}
        onClose={() => setShowDisable(false)}
        onSuccess={() => setUserTwoFactor(false)}
      />
    </>
  );
}
