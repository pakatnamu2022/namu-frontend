import {
  AlertCircle,
  CheckCircle,
  Info,
  Target,
  TrendingUp,
} from "lucide-react";

interface Props {
  metaSellIn: number;
  metaSellOut: number;
  currentTotal: number;
  sedeName: string;
  brandName: string;
  shop: string;
}

export default function MetaIndicators(props: Props) {
  const { metaSellIn, metaSellOut, currentTotal, sedeName, brandName, shop } =
    props;
  const progressPercentage =
    metaSellOut > 0 ? (currentTotal / metaSellOut) * 100 : 0;
  const isComplete = currentTotal >= metaSellOut;
  const isNearComplete = progressPercentage >= 80 && !isComplete;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Meta Sell In - Solo referencia */}
      <div className="flex-1 bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Meta Sell In</h3>
              <p className="text-sm text-blue-600">
                {sedeName && brandName
                  ? `${sedeName} - ${brandName}`
                  : "Referencia"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">
              {metaSellIn.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">unidades</div>
          </div>
        </div>
        <p className="text-sm text-blue-900 mt-2">TIENDA: {shop}</p>
      </div>

      {/* Meta Sell Out - Objetivo principal */}
      <div
        className={`flex-1 bg-linear-to-r rounded-lg p-4 border ${
          isComplete
            ? "from-green-50 to-emerald-50 border-green-200"
            : isNearComplete
            ? "from-orange-50 to-yellow-50 border-orange-200"
            : "from-gray-50 to-slate-50 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isComplete
                  ? "bg-green-100"
                  : isNearComplete
                  ? "bg-orange-100"
                  : "bg-gray-100"
              }`}
            >
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : isNearComplete ? (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              ) : (
                <Target className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3
                className={`font-medium ${
                  isComplete
                    ? "text-green-900"
                    : isNearComplete
                    ? "text-orange-900"
                    : "text-gray-900"
                }`}
              >
                Meta Sell Out
              </h3>
              <p
                className={`text-sm ${
                  isComplete
                    ? "text-green-600"
                    : isNearComplete
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              >
                Objetivo principal a cumplir
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                isComplete
                  ? "text-green-700"
                  : isNearComplete
                  ? "text-orange-700"
                  : "text-gray-700"
              }`}
            >
              {metaSellOut.toLocaleString()}
            </div>
            <div
              className={`text-sm ${
                isComplete
                  ? "text-green-600"
                  : isNearComplete
                  ? "text-orange-600"
                  : "text-gray-600"
              }`}
            >
              unidades
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        {metaSellOut > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-medium ${
                  isComplete
                    ? "text-green-700"
                    : isNearComplete
                    ? "text-orange-700"
                    : "text-gray-700"
                }`}
              >
                Progreso actual
              </span>
              <span
                className={`text-sm font-bold ${
                  isComplete
                    ? "text-green-700"
                    : isNearComplete
                    ? "text-orange-700"
                    : "text-gray-700"
                }`}
              >
                {currentTotal.toLocaleString()} / {metaSellOut.toLocaleString()}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ease-in-out ${
                  isComplete
                    ? "bg-linear-to-r from-green-500 to-emerald-500"
                    : isNearComplete
                    ? "bg-linear-to-r from-orange-500 to-yellow-500"
                    : "bg-linear-to-r from-blue-500 to-blue-600"
                }`}
                style={{
                  width: `${Math.min(progressPercentage, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`text-xs ${
                  isComplete
                    ? "text-green-600"
                    : isNearComplete
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              >
                {progressPercentage.toFixed(1)}% completado
              </span>
              {isComplete && (
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  ¡Meta alcanzada!
                </span>
              )}
              {isNearComplete && !isComplete && (
                <span className="text-xs text-orange-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Cerca de la meta
                </span>
              )}
              {progressPercentage > 100 && (
                <span className="text-xs text-green-600 font-semibold">
                  +{(progressPercentage - 100).toFixed(1)}% sobre la meta
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 text-center">
            <AlertCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-800 font-medium">
              Debe asignar las metas para visualizar el progreso
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
