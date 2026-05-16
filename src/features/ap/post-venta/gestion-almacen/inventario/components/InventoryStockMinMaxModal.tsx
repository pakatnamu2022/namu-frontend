import { GeneralModal } from "@/shared/components/GeneralModal";
import { InventoryStockMinMaxForm } from "./InventoryStockMinMaxForm";
import { InventoryResource } from "../lib/inventory.interface";
import { useUpdateInventoryStockMinMax } from "../lib/inventory.hook";

interface Props {
  row: InventoryResource;
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function InventoryStockMinMaxModal({
  row,
  open,
  onClose,
  title,
}: Props) {
  const defaultValues = {
    product_id: row.product_id.toString(),
    warehouse_id: row.warehouse_id.toString(),
    minimum_stock: row.minimum_stock.toString(),
    maximum_stock: row.maximum_stock.toString(),
  };

  const { mutate, isPending } = useUpdateInventoryStockMinMax();

  const handleSubmit = (data: any) => {
    mutate({ id: row.id, data });
    onClose();
  };

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      <InventoryStockMinMaxForm
        defaultValues={defaultValues}
        onCancel={onClose}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </GeneralModal>
  );
}
