import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api";
import { VehicleSaleAuditResponse } from "./vehicle-sale-audit.interface";

export const VEHICLE_SALE_AUDIT_ENDPOINT =
  "/ap/commercial/reports/vehicle-sale-status-audit";

export const getVehicleSaleAudit =
  async (): Promise<VehicleSaleAuditResponse> => {
    const response = await api.get<VehicleSaleAuditResponse>(
      VEHICLE_SALE_AUDIT_ENDPOINT,
    );
    return response.data;
  };

export const useVehicleSaleAudit = () =>
  useQuery<VehicleSaleAuditResponse>({
    queryKey: ["vehicle-sale-audit"],
    queryFn: getVehicleSaleAudit,
    refetchOnWindowFocus: false,
  });
