import { api } from "@/core/api";
import { MarketingConstantsResource } from "./marketingConstants.interface";

export async function getMarketingConstants(): Promise<MarketingConstantsResource> {
  const { data } = await api.get<MarketingConstantsResource>("/ap/marketing/constants");
  return data;
}
