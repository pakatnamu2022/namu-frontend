"use client";

import { UseAndNoUseEquipmentsChart } from "./UseAndNoUseEquipmentsChart";
import { EquipmentsBySedeChart } from "./SedeEquipmentChart";

export default function TicsPage() {
  return (
    <div className="w-full max-w-(--breakpoint-2xl) mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <UseAndNoUseEquipmentsChart />
        <EquipmentsBySedeChart />
        {/* <UseAndNoUseEquipmentsChart /> */}
      </div>
    </div>
  );
}
