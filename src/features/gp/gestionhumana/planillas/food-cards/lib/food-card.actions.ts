import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import { FoodCardRequest, FoodCardResponse } from "./food-card.interface";
import { FOOD_CARD } from "./food-card.constant";

const { ENDPOINT } = FOOD_CARD;

export async function getFoodCards(
  params?: Record<string, any>,
): Promise<FoodCardResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<FoodCardResponse>(ENDPOINT, config);
  return data;
}

export async function storeOrUpdateFoodCard(
  payload: FoodCardRequest,
): Promise<void> {
  await api.post(ENDPOINT, payload);
}
