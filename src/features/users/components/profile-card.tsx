"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Settings,
  Calendar,
  Award,
  Clock,
  File,
  Users,
  ClipboardList,
  TicketsPlane,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth/lib/auth.store";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";
import { useEvaluationsByPersonToEvaluate } from "../../gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.hook";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface ProfileCardProps {
  variant?: "sidebar" | "header";
}

export function ProfileCard({ variant = "sidebar" }: ProfileCardProps) {
  const router = useNavigate();

  const { user } = useAuthStore();

  const { data } = useEvaluationsByPersonToEvaluate(
    user?.partner_id,
    !!user?.partner_id && user.subordinates > 0
  );

  const UserMenuOptions: {
    label: string;
    route: string;
    icon: React.ComponentType<any>;
    stats?: number | (() => ReactNode);
    allow: boolean;
  }[] = [
    {
      label: "Mi perfil",
      route: "",
      icon: User,
      stats: undefined,
      allow: true,
    },
    {
      label: "Mi desempeño",
      route: "mi-desempeno",
      icon: ClipboardList,
      stats: () => (
        <Badge className="bg-primary text-white animate-pulse">Nuevo</Badge>
      ),
      allow: true,
    },
    {
      label: "Evaluación de Guerreros",
      route: "equipo",
      icon: Users,
      stats: () => {
        const pendingEvaluations = data
          ? data
              .map((ep) => ep.statistics.overall_completion_rate === 0)
              .filter(Boolean).length
          : 0;

        if (pendingEvaluations === 0) return null;
        return (
          <>
            {pendingEvaluations && pendingEvaluations > 0 && (
              <Badge className="animate-pulse" variant={"secondary"}>
                {pendingEvaluations}
              </Badge>
            )}
          </>
        );
      },
      allow: true,
    },
    {
      label: "OnBoarding",
      route: "onboarding",
      icon: Settings,
      stats: undefined,
      allow: true,
    },
    {
      label: "Documentos",
      route: "documentos",
      icon: File,
      stats: 4,
      allow: true,
    },
    {
      label: "Capacitaciones",
      route: "capacitaciones",
      icon: Award,
      stats: 1,
      allow: true,
    },
    {
      label: "Vacaciones",
      route: "vacaciones",
      icon: Calendar,
      stats: undefined,
      allow: true,
    },
    {
      label: "Políticas empresariales",
      route: "",
      icon: Clock,
      stats: undefined,
      allow: true,
    },
    {
      label: "Viaticos",
      route: "viaticos",
      icon: TicketsPlane,
      stats: undefined,
      allow: true,
    },
  ];

  const handleProfileClick = (value: string) => {
    router(`/perfil/${value}`);
  };

  if (variant === "header") {
    return (
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-primary">{user?.name}</p>
          <p className="text-xs text-gray-500">Administrador General</p>
        </div>
        <button
          onClick={() => handleProfileClick("usuario")}
          className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/90 transition-colors"
        >
          <User className="w-5 h-5 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-none shadow-none h-full">
      <div className="p-4 gap-3 flex flex-col h-full">
        {/* Imagen de perfil más grande */}

        {!user.name ? (
          <div className="max-w-40 max-h-40 w-40 h-40 rounded-full aspect-square mx-auto border-4 border-primary/20 mb-4">
            <Skeleton className="w-full h-full bg-primary rounded-full aspect-square" />
          </div>
        ) : (
          <div className="text-center">
            <Avatar className="max-w-40 max-h-40 w-full h-full aspect-square mx-auto border-4 border-primary/20 mb-4">
              <AvatarImage
                className="object-cover object-top"
                src={user?.foto_adjunto}
                alt={user?.name || "Usuario"}
              />
              <AvatarFallback className="text-xl bg-primary text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <p className="text-primary dark:text-primary-foreground font-semibold text-sm">
              {user?.name}
            </p>
            <Badge variant={"secondary"} className="px-4">
              {user.position}
            </Badge>
            <Badge variant={"default"} className="px-4">
              {user.empresa} - {user.sede}
            </Badge>
          </div>
        )}

        <div className="grid">
          {UserMenuOptions.filter((option) => option.allow).map((option) => (
            <SidebarMenuButton
              key={option.label}
              className="flex items-center justify-between text-sm w-full"
              onClick={() => handleProfileClick(option.route)}
            >
              <div className="flex items-center gap-2">
                <option.icon className="w-4 h-4 text-primary dark:text-primary-foreground" />
                <span>{option.label}</span>
              </div>
              {option.stats !== undefined &&
              typeof option.stats !== "function" ? (
                <Badge className="bg-primary text-white">{option.stats}</Badge>
              ) : option.stats && typeof option.stats === "function" ? (
                option.stats()
              ) : null}
            </SidebarMenuButton>
          ))}
        </div>

        {/* Información adicional */}
        <div className="space-y-2 text-xs text-gray-500 mb-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between">
            <span>ID Empleado:</span>
            <span className="font-medium">
              EMP-{user.id?.toString().padStart(8, "0")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ingreso:</span>
            <span className="font-medium">
              {user.fecha_ingreso
                ? format(
                    parse(user.fecha_ingreso, "yyyy-MM-dd", new Date()),
                    "PPP",
                    { locale: es }
                  )
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
