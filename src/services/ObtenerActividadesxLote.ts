import api from "../api";
import { IconsultaActividadesxLote } from "../interfaces/IconsultaActividadesxLote";
import { IRespuestaActividadesxLote} from "../interfaces/IRespuestaActividadesxLote";
import { Alert } from "react-native";
import { esSinInternet } from "../utils/conexion";
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
        // Sin internet o sin respuesta del servidor: el interceptor de api ya
        // aviso. Se devuelve [] en lugar de lanzar porque LoadingScreen y
        // TrasferirScreen no atrapan errores de este servicio.
        if (!esSinInternet(error) && error?.response) {
             Alert.alert('Error', String(error?.message || 'Error al obtener la lista de actividades'));
        }
        console.log("Error en obtenerListaDeActividadesPorUsuario:", error?.message);
        return [];
    }
    
}