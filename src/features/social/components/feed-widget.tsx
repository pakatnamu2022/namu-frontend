"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Cake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useBirthday } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";

export function FeedWidget() {
  const router = useNavigate();

  const { data, isLoading } = useBirthday();

  const handleViewFeed = () => {
    router("/feed");
  };

  return (
    <Card className="border-none shadow-none p-2 h-fit">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary dark:text-primary-foreground flex items-center gap-2 text-lg">
            <Cake className="w-5 h-5" />
            Próximos Cumpleaños
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-2!">
        {isLoading || !data ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-1 bg-transparent rounded-lg"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    className="object-cover"
                    src="/placeholder.svg"
                    alt="Cargando..."
                  />
                </Avatar>
                <div className="flex-1 min-w-56">
                  <div className="flex gap-1 flex-col items-start justify-center mb-1 truncate">
                    <Skeleton className="font-medium text-sm text-primary truncate w-full h-4" />
                    <Skeleton className="text-xs truncate w-2/3 h-2" />
                    <Skeleton className="text-xs truncate w-1/3 h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {data.data.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3 p-1 bg-transparent rounded-lg"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    className="object-cover"
                    src={person.photo || "/placeholder.svg"}
                    alt={person.nombre_completo}
                  />
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {person.nombre_completo
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col items-start justify-center gap-0 mb-1 truncate">
                    <p className="font-medium text-sm text-primary dark:text-primary-foreground truncate w-full">
                      {person.nombre_completo}
                    </p>
                    <p className="text-xs text-muted-foreground truncate w-full">
                      {person.position}
                    </p>
                    <p className="text-xs text-muted-foreground truncate w-full">
                      {person.fecha_nacimiento}
                    </p>
                  </div>
                  {/* <p className="text-xs text-gray-600">
                  <span className="text-gray-500">{person.}</span>{" "}
                  {person.content}
                </p>
                <p className="text-xs text-gray-400 mt-1">{person.timestamp}</p> */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estadísticas rápidas */}

        {/* Botón para ver feed completo */}
        <Button
          onClick={handleViewFeed}
          variant="default"
          className="flex w-full"
        >
          Ver Feed
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
