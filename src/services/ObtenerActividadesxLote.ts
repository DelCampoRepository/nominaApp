import api from "../api";
import { IconsultaActividadesxLote } from "../interfaces/IconsultaActividadesxLote";
import { IRespuestaActividadesxLote} from "../interfaces/IRespuestaActividadesxLote";
import { Alert } from "react-native";
export async function  obtenerListaDeActividadesPorUsuario(data:IconsultaActividadesxLote): Promise<IRespuestaActividadesxLote[]> {

    try{
               
                const  resp= await api.post<IRespuestaActividadesxLote[]>('/Empleado/ObtenerActividadesxUsuario', data)
                if (resp.status === 200)
                return resp.data;
                else if (resp.status === 500)
                {
                  Alert.alert('Error 500','al intentar obtener lista de actividades de la base de datos')
                  return []
                }
                else
                {
                   return []
                }
                 
            }
    catch (error: any){
        if (error.response) {
             // El backend respondió con error (401, 400, 500, etc.)
            
             console.error("❌ Error en login:", error.response.data);
             throw new Error(
               error.response.data.message || "Credenciales incorrectas"
             );
           } else if (error.request) {
             // No hubo respuesta del servidor
             Alert.alert('',error);
             console.error("❌ Sin respuesta del servidor:", error.request);
             throw new Error("No se pudo conectar con el servidor");
           } else {
             // Error inesperado en la configuración o en Axios
             Alert.alert('',error);
             console.error("❌ Error inesperado:", error.message);
             throw new Error("Error inesperado en login");
           }
    }
    
}