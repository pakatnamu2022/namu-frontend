import { Button } from "@/components/ui/button";
import { WORKER_ORDER } from "../lib/workOrder.constants";

interface WorkOrderActionsProps {
  onCreate: () => void;
  canCreate: boolean;
}

export default function WorkOrderActions({
  onCreate,
  canCreate,
}: WorkOrderActionsProps) {
  const { MODEL } = WORKER_ORDER;

  return (
    <>
      {canCreate && (
        <Button onClick={onCreate}>Agregar {MODEL.name}</Button>
      )}
    </>
  );
}
