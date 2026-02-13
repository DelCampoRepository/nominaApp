import api from "../api";
import { IRespuestaValidacionAvance } from "../interfaces/IRespuestaValidacionAvance";
import { IConsultarAvance } from "../interfaces/IConsultarAvance";

export async function ConsultarAvance(data: IConsultarAvance) : Promise<IRespuestaValidacionAvance []>{


    try{
            const  resp=  await api.post<IRespuestaValidacionAvance[]>('/Empleado/WSValidaActividadConPresupuesto',data)
          

            return resp.data;
    }catch (error: any){
          if (error.response) {
                     // El backend respondió con error (401, 400, 500, etc.)
                    
                     console.error("❌ Error en login:", error.response.data);
                     throw new Error(
                       error.response.data.message || "Credenciales incorrectas"
                     );
                   } else if (error.request) {
                     // No hubo respuesta del servidor
                   
                     console.error("❌ Sin respuesta del servidor:", error.request);
                     throw new Error("No se pudo conectar con el servidor");
                   } else {
                     // Error inesperado en la configuración o en Axios
                    
                     console.error("❌ Error inesperado:", error.message);
                     throw new Error("Error inesperado en login");
                   }
    }
    
}