import { Alert } from "react-native";
import { useState, useContext, useCallback } from "react";
import { AuthContext } from "../../../src/context/AuthContext";
import { useUser } from "../../../src/context/userContext";
import { useLogin } from "../../../src/hooks/useLogin";
import {
  obtenerSemanaActivaSqLite,
  GuardarDatosUsuario,
  SeleccionarDatosUsuario,
  initDB,
  validarCambioDeDia
} from "../../../src/services/sqlite";
import { IdatosEmpleadoNoInternet } from "../../../src/interfaces/local/IDatosUsuarioNoInternet";
import {
  avisarSinInternet,
  esSinInternet,
  hayInternet
} from "../../../src/utils/conexion";
import { reiniciarIntentosFallidos } from "../../../src/services/local/patronAcceso";
import { NavegacionLogin, RespuestaLogin } from "../types";
import { logDebug, parseExpiracion } from "../utils";

/**
 * Formulario de usuario/contraseña y flujo de inicio de sesión
 * (sesión local en SQLite o login contra el backend).
 */
export function useInicioSesion(navigation: NavegacionLogin) {
  const { handleLogin, loading } = useLogin();

  const [datosUsuario, setDatosUsuario] = useState({
    username: "",
    password: ""
  });
  const { login, logout } = useContext(AuthContext);
  const { setNombreUsuario, setIduUsuario } = useUser();
  const [passVisible, setPassVisible] = useState(false);

  // Estado propio además de `loading` del hook: cubre también los pasos
  // de SQLite (antes/después de la llamada de red), que no están dentro
  // del `loading` de `useLogin`. Esto evita el doble-submit.
  const [procesando, setProcesando] = useState(false);
  const bloqueado = loading || procesando;

  /**
   * Guarda la sesión resultante de un login exitoso y navega a "Loading".
   * Centraliza lo que antes estaba repetido 3 veces.
   */
  const procesarLoginExitoso = useCallback(
    async (respuesta: RespuestaLogin, passwordUsado: string) => {
      if (!respuesta.token?.token || !respuesta.token?.expiration) {
        throw new Error("Respuesta de login incompleta: falta token o expiración.");
      }

      // GuardarDatosUsuario ahora borra la fila anterior e inserta la nueva
      // dentro de una sola transaccion (ver sqlite.ts), asi que ya no hace
      // falta llamar a EliminarDatosUsuario() por separado aqui.
      await GuardarDatosUsuario({
        estado: respuesta.estado,
        idu_usuario: respuesta.idu_usuario,
        mensaje: respuesta.mensaje,
        nom_usuario: respuesta.nom_usuario,
        semana_actual: respuesta.semana_actual,
        token: respuesta.token.token,
        expiration: respuesta.token.expiration,
        user: respuesta.user,
        contra: passwordUsado
      });

      setNombreUsuario(respuesta.nom_usuario);
      setIduUsuario(respuesta.idu_usuario);
      await login(String(respuesta.token.token));
      await reiniciarIntentosFallidos();

      navigation.navigate("Loading", {
        nomUsuario: respuesta.nom_usuario,
        semanaActiva: respuesta.semana_actual,
        iduUser: respuesta.idu_usuario
      });
    },
    [login, navigation, setNombreUsuario, setIduUsuario]
  );

  /**
   * Hace login contra el backend y, si tiene éxito, guarda y navega.
   * Si falla, muestra una alerta clara. Cualquier excepción se relanza
   * para que el llamador (iniciarSesion) decida el mensaje según el contexto.
   */
  const loginRemotoYGuardar = useCallback(
    async (username: string, password: string) => {
      // Sin internet no se intenta: handleLogin devolveria null y se mostraria
      // "usuario o contraseña incorrectos", que confunde al usuario.
      if (!(await hayInternet())) {
        avisarSinInternet();
        return false;
      }

      const respuesta = await handleLogin({
        nomCorto: username,
        contra: password
      });

      if (respuesta?.success) {
        await procesarLoginExitoso(respuesta, password);
        return true;
      }

      Alert.alert(
        "Error",
        "No se han encontrado datos sobre este usuario, intente con otro usuario o contraseña."
      );
      return false;
    },
    [handleLogin, procesarLoginExitoso]
  );

  /**
   * Flujo de inicio de sesión. Lo usan el botón Ingresar (con lo que se
   * escribió) y el patrón (con el usuario y contraseña guardados).
   */
  const iniciarSesion = async (username: string, password: string) => {
    if (bloqueado) return; // evita doble-submit

    setProcesando(true);
    try {
      const dbLista = await initDB();
      if (!dbLista) {
        Alert.alert(
          "Error",
          "No se pudo inicializar la base de datos local. Intente de nuevo."
        );
        return;
      }

      // Primer ingreso del dia: limpia lo capturado el dia anterior.
      // Si ya se ingreso hoy, conserva los registros.
      await validarCambioDeDia();

      const datos: IdatosEmpleadoNoInternet[] = await SeleccionarDatosUsuario();

      logDebug("auth check -> registros en tablaDatosUsuario:", datos.length, JSON.stringify(datos));

      if (datos.length === 0) {
        logDebug("auth check -> rama: SIN registro guardado, se fuerza login remoto");
        await loginRemotoYGuardar(username, password);
        return;
      }

      const registro = datos[0];
      const expiracionMs = parseExpiracion(registro.expiration);
      const ahoraMs = Date.now();
      const expirado = expiracionMs === null || ahoraMs > expiracionMs;

      logDebug(
        "auth check ->",
        "ahora:", ahoraMs,
        "expiracion:", expiracionMs,
        "expirado:", expirado,
        "expiration raw:", registro.expiration,
        "typeof:", typeof registro.expiration
      );

      if (expirado) {
        if (expiracionMs === null) {
          logDebug(
            "Aviso: no se pudo interpretar la fecha de expiración guardada; se fuerza nuevo login."
          );
        }
        logDebug("auth check -> rama: EXPIRADO, se fuerza login remoto");
        await logout();
        await loginRemotoYGuardar(username, password);
        return;
      }

      logDebug(
        "auth check -> comparando usuario ->",
        "registro.user:", `[${registro.user}]`, "len:", registro.user?.length,
        "username tipiado:", `[${username}]`, "len:", username.length
      );

      if (registro.user !== username) {
        logDebug("auth check -> rama: USUARIO NO COINCIDE, se fuerza login remoto");
        await logout();
        await loginRemotoYGuardar(username, password);
        return;
      }

      // Antes se entraba con la sesión local sin revisar la contraseña (bastaba
      // el usuario). Si no coincide con la guardada se valida contra el
      // servidor, por si el usuario la cambió; sin internet se rechaza ahí.
      if (password !== registro.contra) {
        logDebug("auth check -> rama: CONTRASEÑA DISTINTA A LA GUARDADA, se valida en el servidor");
        await loginRemotoYGuardar(username, password);
        return;
      }

      logDebug("auth check -> rama: SESION VALIDA, se entra directo a Inicio");

      // Sesión local vigente y del mismo usuario: entrar sin llamar al backend.
      logDebug("Fecha Expiracion:", new Date(expiracionMs).toLocaleString());
      logDebug("Fecha Actual:", new Date(ahoraMs).toLocaleString());

      // Se consulta igual (puede ser útil para otras pantallas), pero no bloquea el flujo.
      await obtenerSemanaActivaSqLite();

      await reiniciarIntentosFallidos();
      setNombreUsuario(registro.nom_usuario);
      setIduUsuario(registro.idu_usuario);
      navigation.navigate("Inicio");
    } catch (err) {
      logDebug("Error en el flujo de login:", err);
      // El aviso de "sin conexión" ya se mostró.
      if (esSinInternet(err)) return;
      Alert.alert(
        "Error",
        "Ocurrió un problema al iniciar sesión. Verifique su conexión e intente de nuevo."
      );
    } finally {
      setProcesando(false);
    }
  };

  const onSubmit = () => {
    const username = datosUsuario.username.trim();
    const password = datosUsuario.password;

    if (username === "" || password.trim() === "") {
      Alert.alert("Error", "Por favor, ingrese usuario y contraseña");
      return;
    }
    iniciarSesion(username, password);
  };

  const cambiarUsuario = (text: string) =>
    setDatosUsuario((prev) => ({ ...prev, username: text }));

  const cambiarPassword = (text: string) =>
    setDatosUsuario((prev) => ({ ...prev, password: text }));

  const alternarPassVisible = () => setPassVisible(!passVisible);

  return {
    datosUsuario,
    passVisible,
    bloqueado,
    iniciarSesion,
    onSubmit,
    cambiarUsuario,
    cambiarPassword,
    alternarPassVisible
  };
}
