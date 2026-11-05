import { obtenerSemanaActivaSqLite } from "../../src/services/sqlite";
import { ErrorPaso } from "../../src/utils/sincronizacion";
import { ClaveOpcion, DefinicionOpcion, InfoOpcion } from "./types";

export const COLORES = {
  fondo: "#e5e9f4",
  tarjeta: "#ffffff",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeSuave: "#e3f6e9",
  gris: "#c3c3c3",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280",
  error: "#d32f2f",
  errorSuave: "#fdecea"
};

export const sombra = {
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 }
};

export const ENVIAR: DefinicionOpcion[] = [
  {
    clave: "avances",
    titulo: "Avances",
    descripcion: "Envía al servidor los avances capturados hoy",
    icono: require("../../assets/chart-line-variant.png")
  }
];

export const DESCARGAR: DefinicionOpcion[] = [
  { clave: "lotes", titulo: "Lotes", descripcion: "Lotes asignados al usuario", icono: require("../../assets/land-fields.png") },
  { clave: "naves", titulo: "Naves", descripcion: "Naves de cada lote", icono: require("../../assets/hoop-house.png") },
  { clave: "empleados", titulo: "Empleados", descripcion: "Catálogo de empleados", icono: require("../../assets/account.png") },
  { clave: "actividades", titulo: "Actividades", descripcion: "Actividades y rendimientos por lote", icono: require("../../assets/sprout.png") },
  { clave: "jefes", titulo: "Jefes de nave", descripcion: "Jefes de nave del apuntador", icono: require("../../assets/account-cowboy-hat.png") }
];

// Orden de ejecución: primero se envían los avances (lo que se debe mandar
// todos los días) y después se descargan los catálogos.
export const OPCIONES = [...ENVIAR, ...DESCARGAR];

export const estadoInicial = (): Record<ClaveOpcion, InfoOpcion> =>
  OPCIONES.reduce(
    (acc, o) => ({
      ...acc,
      [o.clave]: { seleccionada: o.clave === "avances", estado: "inactivo" }
    }),
    {} as Record<ClaveOpcion, InfoOpcion>
  );

export async function semanaActivaLocal(): Promise<string> {
  const semana: any[] = await obtenerSemanaActivaSqLite();
  if (!semana?.length) {
    throw new ErrorPaso(
      "No hay semana activa en el dispositivo.",
      "Cierre sesión y vuelva a entrar con internet para descargarla."
    );
  }
  return semana[0].semanaActiva;
}
