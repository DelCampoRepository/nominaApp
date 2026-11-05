import api from '../api'
import { IconsultaTransferenciaCat } from '../interfaces/IconsultaTransferenciaCat1'
import { IRespuestaTransferenciaCat } from '../interfaces/IRespuestaTransferenciaCat1'



export async function ObtenerTransferenciaCat(data: IconsultaTransferenciaCat): Promise<IRespuestaTransferenciaCat[]> {
    
    try{
          
        const resp = await api.post<IRespuestaTransferenciaCat[]>('/Empleado/ObtenerEmpleadosPorLoteDeUsuario',data);
          
        return resp.data;

    }catch(error : any){
        console.log("Error en ObtenerTransferenciaCat: ", error);
        // Antes devolvia un empleado falso "N/A": sin internet, Loading y
        // Transferir borraban la lista local de empleados e insertaban ese
        // registro. Con [] los llamadores conservan la lista actual.
        return [];
    }
}