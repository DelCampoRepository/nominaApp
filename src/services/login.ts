import api from "../api"
import { IUsuario } from "../interfaces/IUsuario";
import { ILoginResponse } from "../interfaces/ILoginResponse";
import * as Crypto from 'expo-crypto';
import { Alert } from "react-native";

// creamos la funcion login  que recibira un objeto de tipo Isuario con los datos name y pass para mandar la peticion 
//y recibir una respuesa del tipo ILoginResponse que adendro obtendremos el token, le damos como parametro el enpoint a cosultar y 
export async function login(data: IUsuario): Promise<ILoginResponse> {
try{
        
      const hashedPassword = await HashPass(data.contra);
      
     const usuarioHash  = {
        nomCorto: data.nomCorto,
        contra:  hashedPassword
     }
        
      const resp = await api.post<ILoginResponse>('/Empleado/ValidaUsuario',usuarioHash); 
    
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
  if (error.response) {
      // El backend respondió con error (401, 400, 500, etc.)
      Alert.alert('no autorizado',error);
      console.error(" Error en login:", error.response.data);
      throw new Error(
        error.response.data.message || "Credenciales incorrectas"
      );
    } else if (error.request) {
      // No hubo respuesta del servidor
      Alert.alert('',error);
      console.error(" Sin respuesta del servidor:", error.request);
      throw new Error("No se pudo conectar con el servidor");
    } else {
      // Error inesperado en la configuración o en Axios
      Alert.alert('',error);
      console.error(" Error inesperado:", error.message);
      throw new Error("Error inesperado en login");
    }
  }
}


export const HashPass = async (  password: string) =>{
        
        const digest =  await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)         
        return digest;
  }

