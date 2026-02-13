import api from '../api'
import { IconsultaTransferenciaCat } from '../interfaces/IconsultaTransferenciaCat1'
import { IRespuestaTransferenciaCat } from '../interfaces/IRespuestaTransferenciaCat1'



export async function ObtenerTransferenciaCat(data: IconsultaTransferenciaCat): Promise<IRespuestaTransferenciaCat[]> {
    
    try{
          
        const resp = await api.post<IRespuestaTransferenciaCat[]>('/Empleado/ObtenerEmpleadosPorLoteDeUsuario',data);
          
        return resp.data;

    }catch(error : any){
        console.log("Error en ObtenerTransferenciaCat: ", error);
    return [ {
        cod_empleado:"N/A",
            Nom_empleado:"N/A",
     }]
    }
}