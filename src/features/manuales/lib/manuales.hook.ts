import { useQuery } from "@tanstack/react-query";
import { MANUALS } from "./manuales.constants";
import { ManualResource } from "./manuales.interface";
import { getManuals } from "./manuales.actions";

export const useManuals = (vista_id: number) => {
  return useQuery<ManualResource[]>({
    queryKey: [MANUALS.QUERY_KEY, vista_id],
    queryFn: () => getManuals({ vista_id }),
    refetchOnWindowFocus: false,
    enabled: !!vista_id,
  });
};
