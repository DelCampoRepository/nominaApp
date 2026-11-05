import { StyleSheet, View, Image, ImageBackground, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  MD2Colors
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { AuthContext } from "../src/context/AuthContext";
import { useUser } from "../src/context/userContext";
import { useState, useContext, useCallback } from "react";
import { useLogin } from "../src/hooks/useLogin";
import {
  obtenerSemanaActivaSqLite,
  GuardarDatosUsuario,
  SeleccionarDatosUsuario,
  initDB,
  validarCambioDeDia
} from "../src/services/sqlite";
import { IdatosEmpleadoNoInternet } from "../src/interfaces/local/IDatosUsuarioNoInternet";
import {
  avisarSinInternet,
  esSinInternet,
  hayInternet
} from "../src/utils/conexion";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

type RespuestaLogin = {
  success: boolean;
  estado?: any;
  idu_usuario?: any;
  mensaje?: any;
  nom_usuario?: any;
  semana_actual?: any;
  user?: any;
  token?: { token: any; expiration: any };
};

/**
 * Logging centralizado. En producción `console.log` no se ve en ningún lado,
 * así que si ya tienes Sentry/Bugsnag/otro, conecta aquí.
 * Por ahora solo evita que el código quede regado con console.log sueltos.
 */
const logDebug = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

/**
 * Convierte el valor de expiración (string ISO, epoch numérico como string, etc.)
 * a un timestamp numérico. Devuelve null si no se puede interpretar,
 * para que el llamador decida tratarlo como "expirado" en vez de comparar
 * contra NaN (que siempre da `false` y fue la causa del bug original).
 */
function parseExpiracion(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;

  // Si ya viene como epoch numérico (ms), aceptarlo directamente.
  if (typeof valor === "number" && !isNaN(valor)) return valor;

  if (typeof valor === "string") {
    // Epoch como string, ej "1755000000000"
    if (/^\d+$/.test(valor.trim())) {
      const asNumber = Number(valor);
      if (!isNaN(asNumber)) return asNumber;
    }

    // El backend (.NET) manda la fecha con 7 digitos de fraccion de
    // segundo -ticks de 100ns, ej "2026-09-04T19:06:27.3004347-07:00"-.
    // El parser de fechas de JS solo admite 3 digitos (milisegundos); con
    // mas digitos, Date(...) devuelve Invalid Date en motores como Hermes,
    // y por eso esta funcion terminaba devolviendo null SIEMPRE, sin
    // importar la hora real (expirado quedaba fijo en true). Se recorta la
    // fraccion a 3 digitos antes de parsear.
    const normalizado = valor.replace(/(\.\d{3})\d+/, "$1");
    const parsed = new Date(normalizado).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  return null;
}

export default function LoginScreen({ navigation }: Props) {
  const { handleLogin, loading, error } = useLogin();

  const [datosUsuario, setDatosUsuario] = useState({
    username: "fortega",
    password: "220278"
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
   * para que el llamador (onSubmit) decida el mensaje según el contexto.
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

  const onSubmit = async () => {
    const username = datosUsuario.username.trim();
    const password = datosUsuario.password;

    if (username === "" || password.trim() === "") {
      Alert.alert("Error", "Por favor, ingrese usuario y contraseña");
      return;
    }

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

      logDebug("auth check -> rama: SESION VALIDA, se entra directo a Inicio");

      // Sesión local vigente y del mismo usuario: entrar sin llamar al backend.
      logDebug("Fecha Expiracion:", new Date(expiracionMs).toLocaleString());
      logDebug("Fecha Actual:", new Date(ahoraMs).toLocaleString());

      // Se consulta igual (puede ser útil para otras pantallas), pero no bloquea el flujo.
      await obtenerSemanaActivaSqLite();

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

  return (
    <ImageBackground
      source={require("../assets/chat2.png")}
      style={styles.background}
    >
      {bloqueado ? (
        <View
          style={{
            width: "80%",
            height: "60%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e5e9f4d0",
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84
          }}
        >
          <ActivityIndicator animating={true} color={MD2Colors.green800} />
        </View>
      ) : (
        <View
          style={{
            width: "80%",
            height: "60%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e5e9f4d0",
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84
          }}
        >
          <View
            style={{
              width: "100%",
              height: "40%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Image
              style={{ width: 100, height: 100 }}
              source={require("../assets/delcamp.png")}
              resizeMode="center"
            />
          </View>
          <View
            style={{
              width: "100%",
              height: "60%",
              padding: 20
            }}
          >
            <TextInput
              label="Usuario"
              value={datosUsuario.username}
              mode="outlined"
              outlineColor="#008445"
              activeOutlineColor="#008445"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              right={<TextInput.Icon icon={require("../assets/account.png")} />}
              style={{ marginBottom: 15, backgroundColor: "#e5e9f497" }}
              onChangeText={(text: string) =>
                setDatosUsuario((prev) => ({ ...prev, username: text }))
              }
            />
            <TextInput
              label="Contraseña"
              value={datosUsuario.password}
              mode="outlined"
              secureTextEntry={!passVisible}
              outlineColor="#008445"
              activeOutlineColor="#008445"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              right={
                <TextInput.Icon
                  icon={require("../assets/eye.png")}
                  onPress={() => setPassVisible(!passVisible)}
                />
              }
              style={{ marginBottom: 15, backgroundColor: "#e5e9f497" }}
              onChangeText={(text: string) =>
                setDatosUsuario((prev) => ({ ...prev, password: text }))
              }
            />
            <Button
              mode="contained"
              buttonColor="#008445"
              onPress={onSubmit}
              disabled={bloqueado}
              loading={bloqueado}
            >
              Ingresar
            </Button>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    marginTop: 23,
    backgroundColor: "#e5e9f4ff"
  },

  centerContainer: {
    width: "70%",
    height: "80%",
    display: "flex"
  },

  logoContainer: {
    width: "100%",
    height: "30%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: 120,
    height: 100,
    resizeMode: "contain"
  },

  formularioContainer: {
    width: "100%",
    height: "50%",
    display: "flex",

    justifyContent: "center"
  },

  usuarioContainer: {
    marginTop: 10,
    width: "100%"
  },
  boton: {
    marginTop: 20,
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#008445"
  },
  background: {
    flex: 1,
    resizeMode: "cover", // "cover" se ajusta al tamaño
    justifyContent: "center",
    alignItems: "center"
  },
  content: {
    backgroundColor: "rgba(0,0,0,0.4)", // para contraste
    padding: 20,
    borderRadius: 10
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold"
  }
});
