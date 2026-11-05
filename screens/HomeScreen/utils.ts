import { ImageSourcePropType } from "react-native";
import { RootStackParamList } from "../../types/types";

// Pantallas a las que se navega sin parámetros.
export type RutaSinParametros = {
  [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined ? K : never;
}[keyof RootStackParamList];

export type Opcion = {
  titulo: string;
  descripcion: string;
  icono: ImageSourcePropType;
  pantalla: RutaSinParametros;
};

export type Seccion = { titulo: string; opciones: Opcion[] };

export const SECCIONES: Seccion[] = [
  {
    titulo: "Captura",
    opciones: [
      {
        titulo: "Actividades en lote",
        descripcion: "Asigna actividades al lote",
        icono: require("../../assets/land-plots.png"),
        pantalla: "ActividadesLote"
      },
      {
        titulo: "Actividades en nave",
        descripcion: "Selecciona actividades por nave",
        icono: require("../../assets/hoop-housew.png"),
        pantalla: "ActividadesNave"
      },
      {
        titulo: "Registrar empleados",
        descripcion: "Captura empleados por nave",
        icono: require("../../assets/account-box-edit-outlinew.png"),
        pantalla: "Empleados"
      },
      {
        titulo: "Avances",
        descripcion: "Registra avances por actividad",
        icono: require("../../assets/chart-line-variantw.png"),
        pantalla: "Avances"
      }
    ]
  },
  {
    titulo: "Consultas",
    opciones: [
      {
        titulo: "Reporte de avances",
        descripcion: "Resumen del día por nave",
        icono: require("../../assets/file-chart-outlinew.png"),
        pantalla: "ReporteAvances"
      },
      {
        titulo: "Avances jefe de nave",
        descripcion: "Obtén avances del servidor",
        icono: require("../../assets/account-cowboy-hat.png"),
        pantalla: "Pagos"
      }
    ]
  },
  {
    titulo: "Cuenta",
    opciones: [
      {
        titulo: "Patrón de acceso",
        descripcion: "Entra sin escribir tu contraseña",
        icono: require("../../assets/pattern.png"),
        pantalla: "ConfigurarPatron"
      }
    ]
  }
];

export const COLORES = {
  fondo: "#e5e9f4",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeSuave: "#e3f6e9",
  texto: "#1f2933",
  textoSuave: "#6b7280"
};

export const MARGEN = 16;
export const SEPARACION = 12;
