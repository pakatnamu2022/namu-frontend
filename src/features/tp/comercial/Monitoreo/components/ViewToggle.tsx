// src/features/tp/comercial/Monitoreo/components/ViewToggle.tsx

import { LayoutList, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewToggleProps } from "../lib/monitoreo.interface";


export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex gap-2 rounded-lg border border-border bg-muted/30 p-1">
            <Button
                size="sm"
                variant={view === "list" ? "default" : "ghost"}
                onClick={() => onViewChange("list")}
                className="gap-1 px-2 sm:gap-2 sm:px-3"
            >
                <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Lista</span>
            </Button>
            <Button
                size="sm"
                variant={view === "map" ? "default" : "ghost"}
                onClick={() => onViewChange("map")}
                className="gap-1 px-2 sm:gap-2 sm:px-3"
            >
                <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Mapa</span>
            </Button>
        </div>
    );
}