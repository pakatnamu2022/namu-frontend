"use client";

import { useState, useEffect, useMemo } from "react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useUserSedes, useStoreUserSedes } from "../lib/user.hook";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader, Building2, MapPin, Search } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface UserSedesSheetProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

export const UserSedesSheet = ({
  open,
  onClose,
  userId,
  userName,
}: UserSedesSheetProps) => {
  const [selectedSedes, setSelectedSedes] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener todas las sedes disponibles
  const { data: allSedes, isLoading: isLoadingSedes } = useAllSedes();

  // Obtener las sedes del usuario
  const { data: userSedes, isLoading: isLoadingUserSedes } =
    useUserSedes(userId);

  // Mutation para guardar
  const { mutate: storeUserSedes, isPending: isSaving } = useStoreUserSedes();

  // Cargar las sedes que ya tiene el usuario
  useEffect(() => {
    if (userSedes) {
      const sedeIds = userSedes.map((userSede) => Number(userSede.sede_id));
      setSelectedSedes(sedeIds);
    }
  }, [userSedes]);

  // Filtrar sedes según el término de búsqueda
  const filteredSedes = useMemo(() => {
    if (!allSedes) return [];
    if (!searchTerm.trim()) return allSedes;

    const term = searchTerm.toLowerCase();
    return allSedes.filter(
      (sede) =>
        sede.description?.toLowerCase().includes(term) ||
        sede.suc_abrev?.toLowerCase().includes(term) ||
        sede.distrito?.toLowerCase().includes(term) ||
        sede.direccion?.toLowerCase().includes(term)
    );
  }, [allSedes, searchTerm]);

  const handleToggleSede = (sedeId: number) => {
    setSelectedSedes((prev) => {
      if (prev.includes(sedeId)) {
        return prev.filter((id) => id !== sedeId);
      } else {
        return [...prev, sedeId];
      }
    });
  };

  const handleSelectAll = () => {
    if (filteredSedes.length === 0) return;

    const allFilteredIds = filteredSedes.map((sede) => sede.id);
    const allSelected = allFilteredIds.every((id) =>
      selectedSedes.includes(id)
    );

    if (allSelected) {
      // Deseleccionar todas las sedes filtradas
      setSelectedSedes((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id))
      );
    } else {
      // Seleccionar todas las sedes filtradas
      setSelectedSedes((prev) => {
        const newIds = allFilteredIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  const isAllSelected = useMemo(() => {
    if (filteredSedes.length === 0) return false;
    return filteredSedes.every((sede) => selectedSedes.includes(sede.id));
  }, [filteredSedes, selectedSedes]);

  const handleSave = () => {
    storeUserSedes(
      {
        user_id: userId,
        sede_ids: selectedSedes,
      },
      {
        onSuccess: () => {
          successToast("Sedes asignadas correctamente");
          onClose();
        },
        onError: () => {
          errorToast("Error al asignar sedes");
        },
      }
    );
  };

  const isLoading = isLoadingSedes || isLoadingUserSedes;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Gestionar Sedes - ${userName}`}
      className="sm:max-w-2xl"
    >
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Selecciona las sedes a las que tendrá acceso el usuario
          </p>

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sedes por nombre, abreviatura, distrito o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Estadísticas y seleccionar todo */}
          <div className="flex items-center justify-between gap-2">
            <Badge color="secondary">
              {selectedSedes.length}{" "}
              {selectedSedes.length === 1
                ? "sede seleccionada"
                : "sedes seleccionadas"}
            </Badge>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isLoading || filteredSedes.length === 0}
              >
                {isAllSelected ? "Deseleccionar todo" : "Seleccionar todo"}
              </Button>
              <Checkbox
                checked={isAllSelected}
                onClick={handleSelectAll}
                disabled={isLoading || filteredSedes.length === 0}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3 pb-4">
                {filteredSedes?.map((sede) => (
                  <div
                    key={sede.id}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleToggleSede(sede.id)}
                  >
                    <Checkbox
                      checked={selectedSedes.includes(sede.id)}
                      onCheckedChange={() => handleToggleSede(sede.id)}
                      className="rounded-[4px] m-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium leading-none">
                          {sede.description}
                        </p>
                        {sede.distrito && (
                          <Badge color="tertiary" className="text-xs gap-1">
                            <MapPin className="h-3 w-3" />
                            {sede.distrito}
                          </Badge>
                        )}
                      </div>
                      {sede.direccion && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {sede.direccion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {filteredSedes.length === 0 && searchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron sedes con el término "{searchTerm}"
                  </div>
                )}

                {(!allSedes || allSedes.length === 0) && !searchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay sedes disponibles
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </>
        )}
      </div>
    </GeneralSheet>
  );
};
