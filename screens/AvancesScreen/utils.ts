import { IActividadesAvancesSeleccionables } from "../../src/interfaces/local/iActividadesAvancesSeleccionables";

export const ICONO_LOTE = require("../../assets/land-plots.png");
export const ICONO_NAVE = require("../../assets/hoop-house.png");
export const ICONO_ACTIVIDAD = require("../../assets/sprout.png");

// Clave con la que ContarAvancesHoyPorActividad devuelve los conteos.
export const claveActividad = (a: Pick<IActividadesAvancesSeleccionables, "cod_actividad" | "cod_avance">) =>
  `${a.cod_actividad}|${a.cod_avance}`;

export const capitalizar = (texto: string) => {
  const t = (texto ?? "").trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};
