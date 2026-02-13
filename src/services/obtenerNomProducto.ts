import api from "../api";
import { INomProducto } from "../interfaces/INomProducto";
import { IconsultaValidaLTdeUser } from "../interfaces/IconsultaValidaLTdeUser";


export async function  ObtenerNomProduco(data:IconsultaValidaLTdeUser): Promise<INomProducto> {
 
  console.log('Datos enviados al servicio ObtenerNomProducto: ', data)
    try{
    
        const resp = await api.post<any>(`/Empleado/ConsyValidaLTdeUser`,data);
        console.log('Respuesta del servicio ObtenerNomProducto: ', resp.data[0].RESP)
        return resp.data[0].RESP;
    }  
    catch(error: any)
    {
        if (error.response) {
      // El backend respondió con error (401, 400, 500, etc.)
      console.error("❌ Error en login:", error);
      throw new Error(
        error.response.data.message || "Prod de lote no encontrado"
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


