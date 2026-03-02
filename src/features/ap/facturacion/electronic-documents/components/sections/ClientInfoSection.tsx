import { UseFormReturn } from "react-hook-form";
import { User, InfoIcon } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook";

interface ClientInfoSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  isEdit: boolean;
  isFromQuotation?: boolean;
}

export function ClientInfoSection({
  form,
  isEdit,
  isFromQuotation = false,
}: ClientInfoSectionProps) {
  const selectedClientId = form.watch("client_id");

  // Buscar el cliente seleccionado
  const { data: selectedCustomer } = useCustomersById(
    Number(selectedClientId),
    !!selectedClientId,
  );

  return (
    <GroupFormSection
      title="Información del Cliente"
      icon={User}
      color="primary"
      cols={{ sm: 1, md: 2 }}
    >
      <div className="md:col-span-2">
        <FormSelectAsync
          control={form.control}
          name="client_id"
          useQueryHook={useCustomers}
          mapOptionFn={(customer) => ({
            value: customer.id.toString(),
            label: `${customer.full_name} - ${customer.num_doc}`,
          })}
          label="Cliente *"
          description={
            isFromQuotation
              ? "Cliente asignado desde la cotización"
              : "Seleccione el cliente"
          }
          placeholder="Seleccionar cliente"
          useFindByIdHook={useCustomersById}
          disabled={isEdit || isFromQuotation}
        />
      </div>

      {selectedCustomer && (
        <div className="md:col-span-2">
          <Alert className="border-blue-200 bg-blue-50">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm space-y-1">
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="font-semibold">Nombre:</span>{" "}
                  {selectedCustomer.full_name}
                </div>
                <div>
                  <span className="font-semibold">Documento:</span>{" "}
                  {selectedCustomer.num_doc}
                </div>
                <div>
                  <span className="font-semibold">Dirección:</span>{" "}
                  {selectedCustomer.direction || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Teléfono:</span>{" "}
                  {selectedCustomer.phone || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedCustomer.email || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">IGV:</span>{" "}
                  {selectedCustomer.tax_class_type_igv}%
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </GroupFormSection>
  );
}
