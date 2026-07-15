import api from "../api";
import { IconsultaAvancesNomina } from "./IconsultaAvancesNomina";
import { Alert } from "react-native";
import { IrespuestaAvancesNomina } from "./IrespuestaAvancesNomina";


export async function  ObtenerEmpleadosNomina(data:IconsultaAvancesNomina) : Promise<IrespuestaAvancesNomina>{
console.log('la data',data)
    try{
        const resp = await api.post<IrespuestaAvancesNomina>(`/Empleado/ObtenerAvancesXJefeDeNave`,data );
        if (resp.status === 200)
           
            {
                    
                return resp.data;
            }
        else if (resp.status === 500) {
            Alert.alert('Error 500', 'al intentar obtener lista de jefes de nave de la base de datos')
            return { success: false, estado: 500, mensaje: 'Error 500', avances: [] };
            
        }
         else if (resp.status === 401) {
            Alert.alert('Error 401', 'No autorizado, token expirado!')
            return { success: false, estado: 401, mensaje: 'Error 500', avances: [] };
            
        }
        else {
            return{ success: false, estado: resp.status, mensaje: 'Error desconocido', avances: []};
        }
    }catch(error:any){
        
        throw new Error(`${error}`);
    }
}
