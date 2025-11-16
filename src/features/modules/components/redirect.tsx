import { Package } from "lucide-react";

const RedirectToCompanies = () => (
  <div className="text-center py-12 col-span-3">
    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
      <Package className="w-12 h-12 text-white" />
    </div>
    <p className="text-gray-500 text-lg">
      No hay módulos disponibles para esta empresa.
    </p>
  </div>
);

export default RedirectToCompanies;
