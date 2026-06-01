import { Button } from "@/components/ui/button";
import { FilterStatus, FleetToolbarProps } from "../lib/monitoreo.interface";
import { STATUS_OPTIONS } from "../lib/monitoreo.constants";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { RefreshCw } from "lucide-react";

//Agregar el boton para modificar la configuracion del tiempo de actualizacion de las ubicaciones

export function FleetToolbar({
    search,
    setSearch,
    status,
    setStatus,
    onRefresh,
    isRefreshing,
    lastRefresh,
}: FleetToolbarProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Búsqueda y filtros */}
            <div className="flex flex-1 items-center gap-3">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar Conductor..."
                />
                <SearchableSelect
                    onChange={(value) => setStatus(value as FilterStatus)}
                    value={status}
                    options={STATUS_OPTIONS}
                    placeholder="Estados"
                />
            </div>
            {/* Actualización */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                    Actualizado: {lastRefresh.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`mr-1.5 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    Actualizar
                </Button>
            </div>
        </div>
    );
}