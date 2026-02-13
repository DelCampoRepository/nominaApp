import { IconsultaLotesxUsuario } from "../interfaces/IConsultaLotesxUsuario";
import { IrespuestaLotesxUsuario } from "../interfaces/IrespuestaLotesxUsuario";
import api from "../api";
import { Alert } from "react-native";
export async function  obtenerListaLotesxUSuario(data:IconsultaLotesxUsuario): Promise<IrespuestaLotesxUsuario[]> {
    

try{
        const resp = await api.post<IrespuestaLotesxUsuario[]>('/Empleado/ObtenerLotesxUsuario',data)

       
        if(resp.status ===200)
            return resp.data;
        else if(resp.status === 500)
        {
              Alert.alert('Error 500','al intentar obtener lista de lotes por emeplado de la base de datos')
            return[]
            }

        else if(resp.status === 401)
        {   
            console.log(resp.status)
              Alert.alert('Error 401','token invalido')
            return[]
        }
        else
            return[]
}catch(error: any){

    return[]
}


}