import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from './login';
import { SeleccionarDatosUsuario, EliminarDatosUsuario, GuardarDatosUsuario } from './sqlite';
import { IdatosEmpleadoNoInternet } from '../interfaces/local/IDatosUsuarioNoInternet';

export async function reautenticarSilenciosamente(): Promise<string | null> {
  try {
    const datos = await SeleccionarDatosUsuario();
    if (!datos.length || !datos[0].contra) {
      return null;
    }

    const { user, contra } = datos[0];
    const resp = await login({ nomCorto: user, contra });

    if (!resp?.success) {

      return null;
    }

    const nuevoToken = String(resp.token.token);

    await AsyncStorage.removeItem('token');
    await AsyncStorage.setItem('token', nuevoToken);

    // misma tabla: se borra el registro anterior y se guarda el nuevo
    await EliminarDatosUsuario();

    await GuardarDatosUsuario({
      estado: resp.estado,
      idu_usuario: resp.idu_usuario,
      mensaje: resp.mensaje,
      nom_usuario: resp.nom_usuario,
      semana_actual: resp.semana_actual,
      token: nuevoToken,
      expiration: resp.token.expiration,
      user: resp.user,
      contra,
    } as IdatosEmpleadoNoInternet);

    return nuevoToken;
  } catch (error) {
    return null;
  }
}
