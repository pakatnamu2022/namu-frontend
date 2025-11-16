import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateQuery() {
  const queryClient = useQueryClient();

  return async (queryKey: string | any[]) => {
    return await queryClient.invalidateQueries({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    });
  };
}
