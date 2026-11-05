import { ImageSourcePropType } from "react-native";

export const COLORES = {
  fondo: "#e5e9f4",
  tarjeta: "#ffffff",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeBarra: "#03871d",
  verdeSuave: "#e3f6e9",
  gris: "#c3c3c3",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280",
  error: "#d32f2f",
  errorSuave: "#fdecea"
};

export type EstadoPaso = "pendiente" | "proceso" | "ok" | "error";
export type ClavePaso =
  | "local"
  | "actividades"
  | "lotes"
  | "naves"
  | "empleados"
  | "verificar";

export type DefinicionPaso = {
  clave: ClavePaso;
  titulo: string;
  icono: ImageSourcePropType;
  // Si falla, no se puede continuar a Inicio (sin actividades la app no sirve).
  critico?: boolean;
};

export type InfoPaso = {
  estado: EstadoPaso;
  mensaje: string;
  error?: { mensaje: string; detalle?: string };
};

export const PASOS: DefinicionPaso[] = [
  { clave: "local", titulo: "Base de datos local", icono: require("../../assets/database-plus-outline.png") },
  { clave: "actividades", titulo: "Actividades", icono: require("../../assets/sprout.png"), critico: true },
  { clave: "lotes", titulo: "Lotes", icono: require("../../assets/land-fields.png") },
  { clave: "naves", titulo: "Naves", icono: require("../../assets/hoop-house.png") },
  { clave: "empleados", titulo: "Empleados", icono: require("../../assets/account.png") },
  { clave: "verificar", titulo: "Verificación de tablas", icono: require("../../assets/database_search.png") }
];

export const estadoInicial = (): Record<ClavePaso, InfoPaso> =>
  PASOS.reduce(
    (acc, p) => ({ ...acc, [p.clave]: { estado: "pendiente", mensaje: "En espera" } }),
    {} as Record<ClavePaso, InfoPaso>
  );

export type Fase = "sincronizando" | "completo" | "conErrores" | "critico";
