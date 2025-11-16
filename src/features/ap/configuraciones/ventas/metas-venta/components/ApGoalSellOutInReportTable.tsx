import React from "react";
import { ReportRow } from "../lib/apGoalSellOutIn.interface";

interface ReportTableProps {
  title: string;
  brands: string[];
  rows: ReportRow[];
  totals: ReportRow;
  isLoading?: boolean;
  type: "IN" | "OUT";
}

export const ApGoalSellOutInReportTable: React.FC<ReportTableProps> = ({
  title,
  brands,
  rows,
  totals,
  isLoading,
  type,
}) => {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className={`p-2 text-white ${
          type == "IN" ? "bg-primary" : "bg-secondary"
        }`}
      >
        <h3 className="font-semibold text-center">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-blue-900 border-r">
                Tiendas
              </th>
              {brands.map((brand) => (
                <th
                  key={brand}
                  className="px-3 py-2 text-center font-semibold text-blue-900 border-r min-w-20"
                >
                  {brand}
                </th>
              ))}
              <th className="px-4 py-2 text-center font-semibold text-blue-900 bg-blue-100">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium border-r bg-gray-50">
                  {row.shop}
                </td>
                {brands.map((brand) => (
                  <td key={brand} className="px-3 py-2 text-center border-r">
                    {row[brand] || 0}
                  </td>
                ))}
                <td className="px-4 py-2 text-center font-semibold bg-blue-50">
                  {row.total}
                </td>
              </tr>
            ))}

            {/* Fila de totales */}
            <tr className="bg-blue-100 font-bold border-t-2">
              <td className="px-4 py-2 border-r">{totals.shop}</td>
              {brands.map((brand) => (
                <td key={brand} className="px-3 py-2 text-center border-r">
                  {totals[brand] || 0}
                </td>
              ))}
              <td className="px-4 py-2 text-center bg-blue-200">
                {totals.total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
