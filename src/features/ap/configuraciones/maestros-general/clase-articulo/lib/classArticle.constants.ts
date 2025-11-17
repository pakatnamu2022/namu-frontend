import { type ModelComplete } from "@/core/core.interface";
import { ClassArticleResource } from "./classArticle.interface";

const ROUTE = "clase-articulo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const CLASS_ARTICLE: ModelComplete<ClassArticleResource> = {
  MODEL: {
    name: "Clase de Artículo",
    plural: "Clases de Artículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/classArticle",
  QUERY_KEY: "classArticle",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    dyn_code: "",
    description: "",
    account: "",
    type_operation_id: "",
    status: true,
  },
};
