import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { cn } from "@/lib/utils";

interface Props {
  isFetching?: boolean;
  onRefresh: () => void;
}

export default function PurchaseOrderWarehouseActions({
  onRefresh,
  isFetching,
}: Props) {
  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={() => onRefresh()}>
        <RefreshCcw
          className={cn("size-4 mr-2", { "animate-spin": isFetching })}
        />
        Actualizar
      </Button>
    </ActionsWrapper>
  );
}
