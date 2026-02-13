import { IConsultaObtenerNavesxUsuario } from "../interfaces/IConsultaObtenerNavesxUsuario";
import { IRespuestaObtenerNavesxUsuario } from "../interfaces/IRespuestaObtenerNavesxUsuario";
import api from "../api";
import { Alert } from "react-native";

export async function obtenerListaNavesxUsuario(datos: IConsultaObtenerNavesxUsuario) :  Promise<IRespuestaObtenerNavesxUsuario[]>{

        try{

            const resp = await api.post<IRespuestaObtenerNavesxUsuario[]>('/Empleado/ObtenerNavesxUsuario',datos)
            if(resp.status ===200)
                return resp.data;
            else if(resp.status === 500)
            {
                  Alert.alert('Error 500','al intentar obtener lista de naves por emeplado de la base de datos')
                return[]
                }
            else
                return[]
        }catch(error:any){
             Alert.alert('Error capturado',error.message)
            return[]
        }


}



