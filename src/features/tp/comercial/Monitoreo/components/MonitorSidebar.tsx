
import { ScrollArea } from "@/components/ui/scroll-area";
import { DriverListCard } from "./DriverListCard";
import { MonitorSidebarProps } from "../lib/monitoreo.interface";


export function MonitorSidebar({
    drivers,
    selectedId,
    onSelect,
    onCenter,
    onHistory,
}: MonitorSidebarProps) {
    return (
        <aside className="flex h-full w-full flex-col overflow-hidden border-l bg-card lg:w-[360px]">
            <div className="space-y-3 border-b p-4">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">Conductores</h2>
                    <p className="text-xs text-muted-foreground">Monitoreo en tiempo real</p>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-2 p-3">
                    {drivers.length === 0 ? (
                        <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                            No hay conductores que coincidan.
                        </p>
                    ) : (
                        drivers.map((d) => (
                            <DriverListCard
                                key={d.id}
                                driver={d}
                                selected={selectedId === d.id}
                                onSelect={() => onSelect(d.id)}
                                onCenter={() => onCenter(d.id)}
                                onHistory={() => onHistory(d.id)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </aside>
    );
}