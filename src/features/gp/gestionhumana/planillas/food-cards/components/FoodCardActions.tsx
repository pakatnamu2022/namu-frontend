"use client";

import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FOOD_CARD } from "../lib/food-card.constant";

const { MODEL, ROUTE_ADD } = FOOD_CARD;

export default function FoodCardActions() {
  const push = useNavigate();

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => push(ROUTE_ADD)}
      >
        <CreditCard className="size-4 mr-2" /> {MODEL.name}
      </Button>
    </div>
  );
}
