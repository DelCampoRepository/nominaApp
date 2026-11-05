import { IdatosActividadesNaves } from "../../src/interfaces/local/IdatosActNave";

export const ICONO_LOTE = require("../../assets/land-plots.png");
export const ICONO_NAVE = require("../../assets/hoop-house.png");
export const ICONO_ACTIVIDAD = require("../../assets/sprout.png");

// Las filas de actividadesEnNaves se identifican por nave + actividad + avance
// + nombre (son las columnas que usa actualizarActEnNave).
export const claveFila = (a: IdatosActividadesNaves) =>
  `${a.cod_nave}|${a.cod_actividad}|${a.cod_avance}|${a.nom_actividad}`;
export const estaSeleccionada = (a: IdatosActividadesNaves) => Number(a.seleccionado) === 1;
