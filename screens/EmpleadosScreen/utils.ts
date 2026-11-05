import { IEmpleadoCapturado } from "../../src/interfaces/local/IEmpleadoCapturado";

export const ICONO_LOTE = require("../../assets/land-plots.png");
export const ICONO_NAVE = require("../../assets/hoop-house.png");
export const ICONO_EMPLEADO = require("../../assets/account.png");
export const ICONO_BUSCAR = require("../../assets/account-search.png");
export const ICONO_QR = require("../../assets/qrcode-scan.png");
export const ICONO_QUITAR = require("../../assets/close.png");
export const ICONO_ASENTADO = require("../../assets/check-bold.png");

export const LARGO_CODIGO = 6;

export const capitalizar = (texto: string) =>
  (texto ?? "")
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase());

// Un empleado se asigna una sola vez por lote + nave + día.
export const claveEmpleado = (e: IEmpleadoCapturado) =>
  `${e.cod_empleado}|${e.cod_lote}|${e.cod_nave}|${e.FechaRegistro}`;

export type Busqueda =
  | { estado: "vacio" }
  | { estado: "buscando" }
  | { estado: "encontrado"; codigo: string; nombre: string }
  | { estado: "noEncontrado"; codigo: string };

export const sombra = {
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 }
};
