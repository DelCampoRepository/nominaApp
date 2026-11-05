import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/types";

export type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export type NavegacionLogin = Props["navigation"];

export type RespuestaLogin = {
  success: boolean;
  estado?: any;
  idu_usuario?: any;
  mensaje?: any;
  nom_usuario?: any;
  semana_actual?: any;
  user?: any;
  token?: { token: any; expiration: any };
};

// Datos guardados en el teléfono con los que se entra al usar el patrón.
export type SesionConPatron = { user: string; nombre: string; contra: string };

export type EstadoTrazo = "normal" | "error" | "ok";
