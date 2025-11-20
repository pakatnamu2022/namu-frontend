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
import { LogOut, User, Moon, Sun, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useTheme } from "@/components/theme-provider";

export default function ProfileHeader() {
  const { user } = useAuthStore();
  const push = useNavigate();
  const { setTheme } = useTheme();

  const handleLogout = () => {
    push("/");
  };

  const handleProfileClick = () => {
    push("/perfil/usuario");
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

  return (
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
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
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
  );
}
