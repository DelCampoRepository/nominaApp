import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";

export const MENSAJE_SIN_INTERNET =
  "No hay conexión a internet. Verifique su señal e intente de nuevo.";

// Se lanza cuando se intenta llamar a la API sin internet. El aviso ya se
// mostro al lanzarlo, asi que quien lo atrape no debe mostrar otro mensaje.
export class SinInternetError extends Error {
  constructor() {
    super(MENSAJE_SIN_INTERNET);
    this.name = "SinInternetError";
  }
}

export function esSinInternet(error: unknown): boolean {
  return error instanceof SinInternetError;
}

export async function hayInternet(): Promise<boolean> {
  const estado = await NetInfo.fetch();
  // isInternetReachable es null mientras NetInfo aun no lo determina: se
  // considera conectado para no bloquear peticiones de mas.
  return estado.isConnected === true && estado.isInternetReachable !== false;
}

// Antirrebote: varias llamadas seguidas (p. ej. LoadingScreen) muestran un
// solo aviso en lugar de uno por peticion.
let ultimoAviso = 0;

function avisarUnaVez(titulo: string, mensaje: string) {
  const ahora = Date.now();
  if (ahora - ultimoAviso < 3000) return;
  ultimoAviso = ahora;
  Alert.alert(titulo, mensaje);
}

export function avisarSinInternet() {
  avisarUnaVez("Sin conexión", MENSAJE_SIN_INTERNET);
}

export function avisarSinRespuestaServidor() {
  avisarUnaVez(
    "Sin respuesta",
    "No se pudo conectar con el servidor. Verifique su señal e intente de nuevo."
  );
}

// Si no hay internet muestra el aviso y lanza SinInternetError.
export async function verificarInternet(): Promise<void> {
  if (!(await hayInternet())) {
    avisarSinInternet();
    throw new SinInternetError();
  }
}
