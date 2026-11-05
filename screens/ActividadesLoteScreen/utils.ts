import { ISecundaryActividades } from "../../src/interfaces/local/ISecundaryActividades";

export const ICONO_LOTE = require("../../assets/land-plots.png");
export const ICONO_ACTIVIDAD = require("../../assets/sprout.png");

export const claveAvance = (a: ISecundaryActividades) => `${a.cod_actividad}|${a.cod_avance}`;
export const estaSeleccionado = (a: ISecundaryActividades) => Number(a.selecionado) === 1;
