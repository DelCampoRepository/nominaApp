import { Alert } from "react-native";
import api from "../api";
import { IEmpleadosParaAsentar } from "../interfaces/IEmpleadosParaAsentar";
import { IRespuestaValidacionAvance } from "../interfaces/IRespuestaValidacionAvance";

export async function GuardarAvancesEnDb(data:IEmpleadosParaAsentar[]): Promise<IRespuestaValidacionAvance[]> {

    
          try{

           
            const resp = await api.post<IRespuestaValidacionAvance[]>('Empleado/GuardaActividadesAvances', data)
          
            
            if(resp.status  === 200)
                return resp.data;
             else if (resp.status === 500)
                            {
                             Alert.alert('Error 500','al intentar obtener lista de actividades de la base de datos')
                              return []
                            }
                            else
                            {
                                 Alert.alert('Error 500','al intentar obtener lista de actividades de la base de datos')
                               return []
                            }
     }
    catch(error:any){

 if (error.response) {
             // El backend respondió con error (401, 400, 500, etc.)
            
             Alert.alert("❌ Error en login:", error.response.data);
             throw new Error(
               error.response.data.message || "Credenciales incorrectas"
             );
           } else if (error.request) {
             // No hubo respuesta del servidor
            
              Alert.alert("❌ Sin respuesta del servidor:", error.request);
             throw new Error("No se pudo conectar con el servidor");
           } else {
             // Error inesperado en la configuración o en Axios
           
             Alert.alert("❌ Error inesperado:", error.message);
             throw new Error("Error inesperado en login");
           }
    }
      
} 

    
