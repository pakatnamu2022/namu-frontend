import { type ModelComplete } from "@/core/core.interface";
import { ProductResource } from "./product.interface";

const ROUTE = "productos";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-productos/productos";

export const PRODUCT: ModelComplete<ProductResource> = {
  MODEL: {
    name: "Producto",
    plural: "Productos",
    gender: false,
  },
  ICON: "Package",
  ENDPOINT: "/ap/postVenta/products",
  QUERY_KEY: "products",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    dyn_code: "",
    nubefac_code: "",
    name: "",
    description: "",
    product_category_id: 0,
    brand_id: 0,
    unit_measurement_id: 0,
    warehouse_id: 0,
    ap_class_article_id: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    current_stock: 0,
    cost_price: 0,
    sale_price: 0,
    tax_rate: 0,
    is_taxable: false,
    sunat_code: "",
    warranty_months: 0,
    notes: "",
    status: "ACTIVE",
  },
};
