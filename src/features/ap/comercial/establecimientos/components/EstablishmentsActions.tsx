"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { reprocessEstablishments } from "../lib/establishments.actions";
import { errorToast, successToast } from "@/core/core.function";
import { CustomersResource } from "../../clientes/lib/customers.interface";

interface Props {
  baseRoute: string;
  permissions: {
    canCreate: boolean;
  };
  customer?: CustomersResource;
  onReprocessed?: () => void;
}

export default function EstablishmentsActions({
  baseRoute,
  permissions,
  customer,
  onReprocessed,
}: Props) {
  const router = useNavigate();
  const [isReprocessing, setIsReprocessing] = useState(false);

  const handleReprocess = async () => {
    if (!customer) return;
    setIsReprocessing(true);
    try {
      await reprocessEstablishments(customer.id);
      successToast("Establecimientos reprocesados correctamente.");
      onReprocessed?.();
    } catch {
      errorToast("Error al reprocesar los establecimientos.");
    } finally {
      setIsReprocessing(false);
    }
  };

  const showReprocessButton = Number(customer?.document_type_id) === 810;

  if (!permissions.canCreate && !showReprocessButton) {
    return null;
  }

  return (
    <ActionsWrapper>
      {showReprocessButton && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleReprocess}
          disabled={isReprocessing}
        >
          <RefreshCw className="size-4 mr-2" />
          {isReprocessing ? "Reprocesando..." : "Reprocesar Establecimientos"}
        </Button>
      )}
      {permissions.canCreate && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router(`${baseRoute}/agregar`)}
        >
          <Plus className="size-4 mr-2" /> Agregar Establecimiento
        </Button>
      )}
    </ActionsWrapper>
  );
}
