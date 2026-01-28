"use client";

import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FreightActionsProps {
    onCreate: () => void;
}
export default function FreightActions({ onCreate}: FreightActionsProps){
    

    return (
        <ActionsWrapper>
            <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={onCreate}>
                <Plus className="size-4 mr-2"/> Agregar Flete

            </Button>

        </ActionsWrapper>
    )
}