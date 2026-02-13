import { useState } from "react";
import { ObtenerTransferenciaCat } from "../services/ObtenerTransferenciaCat";
import { IconsultaTransferenciaCat } from "../interfaces/IconsultaTransferenciaCat1";



export function useTransferenciaCat(){

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleTransferenciaCat(data: IconsultaTransferenciaCat) {
        try{

            setLoading(true);
            setError(null);
 //console.log("📌 Datos enviados a ObtenerTransferenciaCat:", data);
            const resp = await ObtenerTransferenciaCat(data);
          //  console.log("📌 Respuesta de ObtenerTransferenciaCat:", resp);
            return resp;
            
        }catch(error:any){
//en caso de un error mostramos este mensaje 
                setError('Usuario o contraseña incorrectos'+ error.mensaje) ;
                //y retornamos null como resultado a la peticion
                return  ;

        }finally{
            //por ultimo  cambiamos el estado de setLoading a false para avisar que ya no se esta haciedo ninguna peticion
            setLoading(false);
        }
    }
    return {handleTransferenciaCat, loading,error}
}