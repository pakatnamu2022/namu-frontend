"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Moon, Sun, Monitor, Loader2, CheckCircle, XCircle, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useTheme } from "@/components/theme-provider";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { useState } from "react";
import { useDeviceStatus, useRegisterDevice, useValidateSerial } from "@/features/tp/comercial/Monitoreo/lib/monitoreo.hooks";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeviceStatusBell } from "@/features/tp/comercial/Monitoreo/components/DeviceStatusBell";

export default function ProfileHeader() {
  const { user } = useAuthStore();
  const push = useNavigate();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [serial, setSerial] = useState("");
  const [serialError, setSerialError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validatedEquipment, setValidatedEquipment] = useState<{ name: string; serial: string } | null>(null);


  const { data: deviceStatus, refetch: refetchStatus, isLoading: isLoadingStatus } = useDeviceStatus();
  const { mutate: registerDevice, isPending: isRegistering } = useRegisterDevice();
  const { mutateAsync: validateSerial } = useValidateSerial();

  const isDeviceActive = deviceStatus?.is_active ?? false;
  const deviceSerial = deviceStatus?.serial ?? null;
  const deviceName = deviceStatus?.equipment_name ?? null;

  const handleValidateSerial = async () => {
    if (!serial.trim()) {
      setSerialError("Ingrese el número de IMEI del dispositivo");
      return;
    }

    setIsValidating(true);
    setSerialError("");
    setValidatedEquipment(null);

    try {
      const result = await validateSerial({ serial });
      if (result.valid && result.data) {
        setValidatedEquipment({
          name: result.data.equipment_name,
          serial: result.data.serial,
        });
        setSerialError("");
      } else {
        setSerialError(result.message || "Dispositivo no válido");
        setValidatedEquipment(null);
      }
    } catch (error: any) {
      setSerialError(error?.message || "Error al validar dispositivo");
      setValidatedEquipment(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRegister = () => {
    if (!validatedEquipment) {
      setSerialError("Primero valide el dispositivo");
      return;
    }

    registerDevice({ serial }, {
      onSuccess: () => {
        setOpen(false);
        setSerial("");
        setSerialError("");
        setValidatedEquipment(null);
        refetchStatus();
      },
    });
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    // Force full page reload to clear all state
    window.location.href = "/";
  };

  const handleProfileClick = () => {
    push("/perfil");
  };

  const ProfileHeaderButton = () => {
    return (
      <div className="flex items-center justify-end gap-4 p-1 rounded-md hover:bg-muted transition-colors cursor-pointer px-2">
        <div className="text-right hidden lg:block">
          <p className="text-xs sm:text-sm font-semibold text-primary dark:text-primary-foreground line-clamp-1">
            {user.name}
          </p>
          <p className="text-[10px] text-gray-500 line-clamp-1">
            {user.position}
          </p>
        </div>
        <Avatar>
          <AvatarImage
            className="object-cover object-top"
            src={user?.foto_adjunto}
          />
          <AvatarFallback>
            {user?.name
              ? user.name.charAt(0).toUpperCase() +
              user.name.charAt(1).toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  };

  const isConductor = user?.position?.toUpperCase() === "CONDUCTOR DE TRACTO CAMION"

  return (
    <div className="flex items-center gap-1">
      <NotificationBell />
      {isConductor && <DeviceStatusBell />}
      {isConductor && (
        <div className="hidden lg:flex items-center gap-1 mr-1">
          {isLoadingStatus ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
              <span className="text-xs text-gray-500">Cargando...</span>
            </div>
          ) : isDeviceActive ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-700 dark:text-green-400">
                {deviceName ? ` ${deviceName}` : "Dispositivo Activo"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
              <XCircle className="h-3 w-3 text-red-600" />
              <span className="text-xs text-red-700 dark:text-red-400">Sin dispositivo</span>
            </div>
          )}
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <ProfileHeaderButton />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        >
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick} className="gap-2">
            <User className="w-4 h-4" />
            <p>Ver Perfil</p>
          </DropdownMenuItem>

          {isConductor && (
            <>
              <DropdownMenuSeparator />
              {!isDeviceActive && (
                <Dialog open={open} onOpenChange={(newOpen) => {
                  if (!newOpen) {
                    setSerial("");
                    setSerialError("");
                    setValidatedEquipment(null);
                  }
                  setOpen(newOpen);
                }}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2">
                      <Smartphone className="w-4 h-4" />
                      <p>Activar dispositivo</p>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        Activar dispositivo
                      </DialogTitle>
                      <DialogDescription>
                        Ingrese el número de IMEI del dispositivo móvil que le fue asignado.
                        {isDeviceActive && deviceSerial && (
                          <p className="mt-2 text-sm">
                            Dispositivo actual: <span className="font-mono">{deviceSerial}</span>
                            {deviceName && <span className="text-muted-foreground"> ({deviceName})</span>}
                          </p>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="serial">Número de IMEI del dispositivo</Label>
                        <div className="flex gap-2">
                          <Input
                            id="serial"
                            placeholder="Ej: ABC123XYZ789"
                            value={serial}
                            onChange={(e) => {
                              setSerial(e.target.value.toUpperCase());
                              setSerialError("");
                              setValidatedEquipment(null);
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleValidateSerial}
                            disabled={isValidating || !serial.trim()}
                          >
                            {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar"}
                          </Button>
                        </div>
                        {serialError && (
                          <p className="text-sm text-red-500">{serialError}</p>
                        )}
                        {validatedEquipment && (
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-700 dark:text-green-400">
                              Dispositivo válido: <strong>{validatedEquipment.name}</strong>
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500">
                              IMEI: {validatedEquipment.serial}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleRegister}
                        disabled={isRegistering || !validatedEquipment}
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          "Activar"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
              }

            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Tema</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
            <Sun className="w-4 h-4" />
            <p>Claro</p>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
            <Moon className="w-4 h-4" />
            <p>Oscuro</p>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="gap-2"
          >
            <Monitor className="w-4 h-4" />
            <p>Sistema</p>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            <p>Cerrar Sesión</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
