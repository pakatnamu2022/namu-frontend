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
import {
  LogOut,
  User,
  Moon,
  Sun,
  Monitor,
  Loader2,
  CheckCircle,
  XCircle,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useTheme } from "@/components/theme-provider";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { useState } from "react";
import {
  useAutoActivateDevice,
  useDeviceStatus,
} from "@/features/tp/comercial/Monitoreo/lib/monitoreo.hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeviceStatusBell } from "@/features/tp/comercial/Monitoreo/components/DeviceStatusBell";
import { TICS_ROLE } from "@/features/gp/gestionsistema/roles/lib/role.constants";

export default function ProfileHeader() {
  const { user } = useAuthStore();
  const push = useNavigate();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const {
    data: deviceStatus,
    refetch: refetchStatus,
    isLoading: isLoadingStatus,
  } = useDeviceStatus();
  const { mutate: autoActivate, isPending: isActivating } =
    useAutoActivateDevice();

  const isDeviceActive = deviceStatus?.is_active ?? false;
  const deviceSerial = deviceStatus?.serial ?? null;
  const deviceName = deviceStatus?.equipment_name ?? null;

  const handleAutoActivate = () => {
    autoActivate(undefined, {
      onSuccess: (data) => {
        if (data.success) {
          setOpen(false);
          refetchStatus();
        }
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

  const isConductor =
    user?.position?.toUpperCase() === "CONDUCTOR DE TRACTO CAMION" ||
    user.role_id === TICS_ROLE;

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
              <span className="text-xs text-red-700 dark:text-red-400">
                Sin dispositivo
              </span>
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
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <p>Activar dispositivo</p>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Activar dispositivo</DialogTitle>
                      <DialogDescription>
                        El sistema buscará automáticamente el dispositivo que
                        tiene asignado en el sistema TICS.
                        {deviceSerial && (
                          <p className="mt-2 text-sm">
                            Dispositivo actual:{" "}
                            <span className="font-mono">{deviceSerial}</span>
                            {deviceName && (
                              <span className="text-muted-foreground">
                                {" "}
                                ({deviceName})
                              </span>
                            )}
                          </p>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Al hacer clic en "Activar", el sistema verificará si
                        tiene un dispositivo asignado y lo activará
                        automáticamente para el monitoreo de ubicación.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAutoActivate}
                        disabled={isActivating}
                      >
                        {isActivating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Activando...
                          </>
                        ) : (
                          "Activar dispositivo"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
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
