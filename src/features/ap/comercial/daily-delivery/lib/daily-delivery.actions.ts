import { api } from "@/core/api";
import { DailyDeliveryResponse } from "./daily-delivery.interface";

export const getDailyDeliveryReport = async (
  date?: string
): Promise<DailyDeliveryResponse> => {
  const today = new Date().toISOString().split("T")[0];
  const queryDate = date || today;

  const response = await api.get<DailyDeliveryResponse>(
    `/ap/commercial/reports/daily-delivery`,
    {
      params: { date: queryDate },
    }
  );

  return response.data;
};

export const exportDailyDeliveryToExcel = async (date?: string) => {
  const today = new Date().toISOString().split("T")[0];
  const queryDate = date || today;

  const response = await api.get(`/ap/commercial/reports/daily-delivery/export`, {
    params: { date: queryDate },
    responseType: "blob",
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;

  // Generate filename with date
  const filename = `entregas-diarias-${queryDate}.xlsx`;
  link.setAttribute("download", filename);

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
