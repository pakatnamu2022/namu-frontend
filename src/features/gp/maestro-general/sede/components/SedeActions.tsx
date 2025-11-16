import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { SEDE } from "../lib/sede.constants";

export default function SedeActions() {
  const router = useRouter();
  const { ROUTE_ADD } = SEDE;

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router.push(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Sede
      </Button>
    </ActionsWrapper>
  );
}
