import { authApi } from "../api"
import { IUsuario } from "../interfaces/IUsuario";
import { ILoginResponse } from "../interfaces/ILoginResponse";
import * as Crypto from 'expo-crypto';
import { Alert } from "react-native";
import { esSinInternet } from "../utils/conexion";

// creamos la funcion login  que recibira un objeto de tipo Isuario con los datos name y pass para mandar la peticion 
//y recibir una respuesa del tipo ILoginResponse que adendro obtendremos el token, le damos como parametro el enpoint a cosultar y 
export async function login(data: IUsuario): Promise<ILoginResponse> {
try{
        
      const hashedPassword = await HashPass(data.contra);
      
     const usuarioHash  = {
        nomCorto: data.nomCorto,
        contra:  hashedPassword
     }
        console.log('hasshas', usuarioHash)
      const resp = await authApi.post<ILoginResponse>('/Empleado/ValidaUsuario',usuarioHash);
    
      if (resp.status === 200) {
      
      return resp.data;
    } else if (resp.status === 401) {
         console.log(resp.data);
      return resp.data; // Igual retornas el JSON del backend
    } else {
      throw new Error(`Error inesperado (${resp.status})`);
    }

}catch (error: any) {
   console.log(error)
  // Sin internet o sin respuesta del servidor: el interceptor de authApi ya
  // aviso al usuario. Nunca pasar un objeto como mensaje a Alert.alert: en
  // Android eso lanza un error nativo y cierra la app.
  if (esSinInternet(error)) throw error;
  if (!error?.response && error?.request) {
    throw new Error("No se pudo conectar con el servidor");
  }
  const mensaje = String(error?.message || "Error inesperado en login");
  Alert.alert('Error en login', mensaje);
  throw new Error(mensaje);
  }
}


export const HashPass = async (  password: string) =>{
        
        const digest =  await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)         
        return digest;
  }

