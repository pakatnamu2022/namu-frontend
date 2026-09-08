"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupplyFabProps } from "../lib/supplyControl.interface";

export function SupplyFab({ onClick, className, label = "Nuevo Abastecimiento" }: SupplyFabProps) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "fixed bottom-6 right-4 rounded-full shadow-lg px-4 py-6 gap-2",
                "bg-primary hover:bg-primary/90 text-white",
                "z-50",
                className
            )}
            size="default"
        >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{label}</span>
        </Button>
    );
}