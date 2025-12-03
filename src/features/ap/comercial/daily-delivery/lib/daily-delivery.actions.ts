import { api } from "@/core/api";
import { DailyDeliveryResponse } from "./daily-delivery.interface";

export const getDailyDeliveryReport = async (
  dateFrom?: string,
  dateTo?: string
): Promise<DailyDeliveryResponse> => {
  const today = new Date().toISOString().split("T")[0];
  const queryDateFrom = dateFrom || today;
  const queryDateTo = dateTo || today;

  const response = await api.get<DailyDeliveryResponse>(
    `/ap/commercial/reports/daily-delivery`,
    {
      params: {
        fecha_inicio: queryDateFrom,
        fecha_fin: queryDateTo
      },
    }
  );

  return response.data;
};

export const exportDailyDeliveryToExcel = async (
  dateFrom: string,
  dateTo: string
) => {
  const queryDateFrom = dateFrom;
  const queryDateTo = dateTo;

  const response = await api.get(
    `/ap/commercial/reports/daily-delivery/export`,
    {
      params: { fecha_inicio: queryDateFrom, fecha_fin: queryDateTo },
      responseType: "blob",
    }
  );

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;

  // Generate filename with date
  const filename = `entregas-diarias-${queryDateFrom}-to-${queryDateTo}.xlsx`;
  link.setAttribute("download", filename);

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
