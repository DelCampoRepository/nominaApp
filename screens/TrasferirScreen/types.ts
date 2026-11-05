import { ImageSourcePropType } from "react-native";

export type ClaveOpcion = "avances" | "lotes" | "naves" | "empleados" | "actividades" | "jefes";
export type EstadoOpcion = "inactivo" | "proceso" | "ok" | "sinDatos" | "error";

export type DefinicionOpcion = {
  clave: ClaveOpcion;
  titulo: string;
  descripcion: string;
  icono: ImageSourcePropType;
};

export type InfoOpcion = {
  seleccionada: boolean;
  estado: EstadoOpcion;
  mensaje?: string;
  error?: { mensaje: string; detalle?: string };
};

// Resultado de una opción que terminó bien. `sinDatos`: no había nada que
// enviar (no es un error).
export type Resultado = { mensaje: string; sinDatos?: boolean };
