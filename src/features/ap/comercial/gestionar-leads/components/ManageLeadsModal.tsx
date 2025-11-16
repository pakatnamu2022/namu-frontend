import { GeneralModal } from "@/shared/components/GeneralModal";
import { ManageLeadsForm } from "./ManageLeadsForm";
import { ImportedLeadResource } from "../lib/manageLeads.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  onImportSuccess: (data: ImportedLeadResource[]) => void;
}

export default function ManageLeadsModal({
  open,
  onClose,
  title,
  onImportSuccess,
}: Props) {
  const handleImportSuccess = (data: ImportedLeadResource[]) => {
    onImportSuccess(data);
    onClose(); // Cierra el modal automáticamente
  };

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      <ManageLeadsForm onImportSuccess={handleImportSuccess} />
    </GeneralModal>
  );
}






