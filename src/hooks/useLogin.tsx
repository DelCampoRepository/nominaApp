import { useState } from "react";
import { login } from "../services/login";
import { IUsuario } from "../interfaces/IUsuario";

//hook para getsionar el login y obtener el token
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(data: IUsuario) {
    try {
      //hacemos true este estado para mostar que estamos  haciendo la peticion
      setLoading(true);
      //hacemos este estado null para mostra que de inicio no hay erroreres
      setError(null);
      //const para guardar el resultado de la respuesta qe nos retorna el servicio login
      const resp = await login(data);

      //como necestimos un objeto con llave token y su valor y la api solo retorna el valor, creamos uno

      //retornamos lo obtenido
      return resp;
    } catch (err: any) {
      //en caso de un error mostramos este mensaje
      setError("Usuario o contraseña incorrectos" + err.mensaje);
      //y retornamos null como resultado a la peticion
      return null;
    } finally {
      //por ultimo  cambiamos el estado de setLoading a false para avisar que ya no se esta haciedo ninguna peticion
      setLoading(false);
    }
  }
  return { handleLogin, loading, error };
}
