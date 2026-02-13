import api from "../api";
import { IRespuestaJefesNave } from "../interfaces/IRespuestaJefeNave";
import { IconsultaJefeNave } from "../interfaces/IconsultaJefeNave";
import { Alert } from "react-native";
export async function obtenerJefesNave(data : IconsultaJefeNave): Promise<IRespuestaJefesNave> {

    try{

        const resp = await api.post<IRespuestaJefesNave>(`/Empleado/ObtenerJefesDeNavexUsuario`,data );
        if (resp.status === 200)

            {
              
                return resp.data;
            }
        else if (resp.status === 500) {
            Alert.alert('Error 500', 'al intentar obtener lista de jefes de nave de la base de datos')
            return { success: false, estado: 500, mensaje: 'Error 500', jefesDeNave: [] };
            
        }
        else {
            return{ success: false, estado: resp.status, mensaje: 'Error desconocido', jefesDeNave: []};
        }
    }catch(error: any){
        return { success: false, estado: 500, mensaje: 'Error en la solicitud', jefesDeNave: []};
    }
}