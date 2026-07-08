import { DriverTableProps } from "../lib/monitoreo.interface";
import { DriverRow } from "./DriverRow";
import { AlertCircle } from "lucide-react";


export function DriverTable({ drivers, isLoading, onViewOnMap, onRefresh, onShowHistory }: DriverTableProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-accent" />
                <p className="mt-4 text-sm"> Cargando conductores...</p>
            </div>
        );
    }

    if (drivers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">No hay conductores disponibles.</p>
            </div>
        )
    }


    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Conductor
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Estado
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Última Actualización
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Coordenadas
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Acción
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.map((driver) => (
                        <DriverRow
                            key={driver.id}
                            driver={driver}
                            onViewOnMap={onViewOnMap}
                            onRefresh={onRefresh}
                            onShowHistory={onShowHistory} />
                    ))}
                </tbody>
            </table>
        </div>
    );


}