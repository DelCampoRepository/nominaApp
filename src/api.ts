import axios from  'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reautenticarSilenciosamente } from './services/tokenGuard';
import {
    avisarSinRespuestaServidor,
    esSinInternet,
    verificarInternet,
} from './utils/conexion';

//http://delcampo.com.mx/WsEmpleadosPideonTest/api/
//"http://delcampo.com.mx/WsEmpleadosPideon/api/"
const BASE_URL = "http://delcampo.com.mx/WsEmpleadosPideon/api/";

// Instancia SIN interceptores: la usan login.ts y tokenGuard.ts para que
// reautenticar nunca dispare de nuevo el interceptor de abajo.
export const authApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    validateStatus: (status) => true,
});

// Si no hay internet no se envia la peticion: se avisa al usuario y se
// rechaza con SinInternetError.
authApi.interceptors.request.use(async (config) => {
  await verificarInternet();
  return config;
});

// Sin respuesta del servidor (se cayo la señal a mitad de la peticion o el
// servidor no contesta). Con validateStatus: () => true, los codigos HTTP
// (401, 500...) no llegan aqui, solo los errores de red.
function manejarErrorDeRed(error: any) {
  if (!esSinInternet(error) && !error?.response) {
    avisarSinRespuestaServidor();
  }
  return Promise.reject(error);
}

authApi.interceptors.response.use((response) => response, manejarErrorDeRed);

const api = axios.create({
    baseURL: BASE_URL,

    headers:{
        "Content-Type": "application/json",
    },
    validateStatus: (status) => true,
});


// Antes de cada peticion: se adjunta el token guardado tal cual, sin
// revalidarlo contra el backend. Revalidar antes de CADA peticion (como se
// hacia antes) disparaba una reautenticacion completa cada vez que esa
// revalidacion fallaba, y eso podia sobreescribir en segundo plano la sesion
// que un login recien exitoso acababa de guardar -causando que la siguiente
// vez que el usuario abria Login la sesion pareciera invalida y se repitiera
// todo el ciclo de Loading sin necesidad-.
api.interceptors.request.use(
  async (config) => {
    await verificarInternet();

    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Solo cuando el backend responde 401 (token realmente invalido/expirado) se
// reautentica una vez y se reintenta esa misma peticion con el token nuevo.
// Como `api` usa validateStatus: () => true, un 401 llega aqui como
// respuesta normal (no como error), por eso se revisa en el interceptor de
// respuesta exitosa en vez del de error.
api.interceptors.response.use(
  async (response) => {
    const config: any = response.config;

    if (response.status === 401 && config && !config._reintentoAuth) {
      config._reintentoAuth = true;

      const nuevoToken = await reautenticarSilenciosamente();

      if (nuevoToken) {
        config.headers.Authorization = `Bearer ${nuevoToken}`;
        return api.request(config);
      }
    }

    return response;
  },
  manejarErrorDeRed
);

export default api;
