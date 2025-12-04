"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface WorkOrderContextType {
  selectedGroupNumber: number | null;
  setSelectedGroupNumber: (groupNumber: number | null) => void;
}

const WorkOrderContext = createContext<WorkOrderContextType | undefined>(
  undefined
);

export function WorkOrderProvider({ children }: { children: ReactNode }) {
  const [selectedGroupNumber, setSelectedGroupNumber] = useState<number | null>(
    null
  );

  return (
    <WorkOrderContext.Provider
      value={{ selectedGroupNumber, setSelectedGroupNumber }}
    >
      {children}
    </WorkOrderContext.Provider>
  );
}

export function useWorkOrderContext() {
  const context = useContext(WorkOrderContext);
  if (context === undefined) {
    throw new Error(
      "useWorkOrderContext must be used within a WorkOrderProvider"
    );
  }
  return context;
}
