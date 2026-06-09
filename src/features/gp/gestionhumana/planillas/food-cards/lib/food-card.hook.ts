import { useQuery } from "@tanstack/react-query";
import { FoodCardResponse } from "./food-card.interface";
import { getFoodCards } from "./food-card.actions";
import { FOOD_CARD } from "./food-card.constant";

const { QUERY_KEY } = FOOD_CARD;

export const useFoodCards = (params?: Record<string, any>) => {
  return useQuery<FoodCardResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getFoodCards(params),
    refetchOnWindowFocus: false,
  });
};
