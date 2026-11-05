import { Alert } from "react-native";
import api from "../api";
import { IEmpleadosParaAsentar } from "../interfaces/IEmpleadosParaAsentar";
import { IRespuestaValidacionAvance } from "../interfaces/IRespuestaValidacionAvance";
import { esSinInternet } from "../utils/conexion";

// Devuelve la respuesta del servidor, o [] si no se pudo sincronizar.
export async function GuardarAvancesEnDb(data:IEmpleadosParaAsentar[]): Promise<IRespuestaValidacionAvance[]> {

          try{

            const resp = await api.post<IRespuestaValidacionAvance[]>('Empleado/GuardaActividadesAvances', data)

            if(resp.status  === 200)
                return resp.data;

            Alert.alert(`Error ${resp.status}`,'al intentar guardar los avances en la base de datos')
            return []
     }
    catch(error:any){
      // Sin internet o sin respuesta del servidor: el interceptor de api ya
      // aviso al usuario. Antes aqui se hacia Alert.alert(titulo, error.request):
      // en Android el mensaje debe ser texto y con un objeto la app se cerraba.
      if (!esSinInternet(error) && error?.response) {
        Alert.alert("Error", String(error?.message || "Error inesperado al sincronizar avances"));
      }
      console.log("Error en GuardarAvancesEnDb:", error?.message);
      return [];
    }

}
