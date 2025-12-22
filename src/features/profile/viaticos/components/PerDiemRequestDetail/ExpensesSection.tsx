import { Receipt } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import ExpensesTable from "../ExpensesTable";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";

interface ExpensesSectionProps {
  request: PerDiemRequestResource;
}

export default function ExpensesSection({ request }: ExpensesSectionProps) {
  return (
    <GroupFormSection
      title="Gastos Registrados"
      icon={Receipt}
      cols={{ sm: 1 }}
    >
      <div className="md:col-span-1">
        <ExpensesTable expenses={request.expenses || []} />
      </div>
    </GroupFormSection>
  );
}
