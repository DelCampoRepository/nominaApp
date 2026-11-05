import {
  StyleSheet,
  View,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  useWindowDimensions
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
import {
  INTENTOS_MAXIMOS_PATRON,
  MINIMO_PUNTOS,
  obtenerPatron,
  verificarPatron,
  obtenerIntentosFallidos,
  registrarIntentoFallido,
  reiniciarIntentosFallidos
} from "../src/services/local/patronAcceso";
import PatronDesbloqueo from "../src/components/PatronDesbloqueo";

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

const COLORES = {
  fondo: "#e5e9f4",
  tarjeta: "#ffffff",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeSuave: "#e3f6e9",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280",
  error: "#d32f2f"
};

// Datos guardados en el teléfono con los que se entra al usar el patrón.
type SesionConPatron = { user: string; nombre: string; contra: string };

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
  const { handleLogin, loading } = useLogin();
  const { width } = useWindowDimensions();

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

  // Patrón de acceso
  const [sesionPatron, setSesionPatron] = useState<SesionConPatron | null>(null);
  // Empieza bloqueado hasta leer el conteo de intentos fallidos.
  const [patronBloqueado, setPatronBloqueado] = useState(true);
  const [modalPatron, setModalPatron] = useState(false);
  const [estadoTrazo, setEstadoTrazo] = useState<"normal" | "error" | "ok">("normal");
  const [mensajePatron, setMensajePatron] = useState("");
  const [verificandoPatron, setVerificandoPatron] = useState(false);

  // Se revisa al mostrar la pantalla si hay un patrón para el usuario guardado
  // en el teléfono (y su contraseña, que es con la que se inicia sesión).
  const revisarPatron = useCallback(async () => {
    try {
      if (!(await initDB())) return;
      const datos = await SeleccionarDatosUsuario();
      const registro = datos[0];
      if (!registro?.user || !registro?.contra || !(await obtenerPatron(registro.user))) {
        setSesionPatron(null);
        return;
      }
      // Se lee el bloqueo antes de mostrar el botón para que no quede activo
      // ni un momento si el patrón está bloqueado.
      const bloqueadoAhora = (await obtenerIntentosFallidos()) >= INTENTOS_MAXIMOS_PATRON;
      setPatronBloqueado(bloqueadoAhora);
      setSesionPatron({ user: registro.user, nombre: registro.nom_usuario, contra: registro.contra });
    } catch {
      setSesionPatron(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      revisarPatron();
    }, [revisarPatron])
  );

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

  const abrirPatron = () => {
    setEstadoTrazo("normal");
    setMensajePatron("Dibuja tu patrón para entrar");
    setModalPatron(true);
  };

  const alTerminarPatron = async (secuencia: number[]) => {
    if (!sesionPatron || verificandoPatron) return;
    // Un toque o trazo corto no es un intento real: no se cuenta como fallido.
    if (secuencia.length < MINIMO_PUNTOS) {
      setEstadoTrazo("error");
      setMensajePatron(`Une al menos ${MINIMO_PUNTOS} puntos.`);
      setTimeout(() => setEstadoTrazo("normal"), 700);
      return;
    }
    setVerificandoPatron(true);
    try {
      // Se vuelve a leer el conteo guardado: el estado en pantalla podría no
      // estar al día.
      if ((await obtenerIntentosFallidos()) >= INTENTOS_MAXIMOS_PATRON) {
        setPatronBloqueado(true);
        setModalPatron(false);
        return;
      }
      if (await verificarPatron(sesionPatron.user, secuencia)) {
        setEstadoTrazo("ok");
        setModalPatron(false);
        await iniciarSesion(sesionPatron.user, sesionPatron.contra);
        return;
      }
      setEstadoTrazo("error");
      const intentos = await registrarIntentoFallido();
      const restantes = INTENTOS_MAXIMOS_PATRON - intentos;
      if (restantes <= 0) {
        setPatronBloqueado(true);
        setModalPatron(false);
        Alert.alert(
          "Patrón bloqueado",
          "Demasiados intentos con un patrón incorrecto. Entra con tu usuario y contraseña para volver a usar el patrón."
        );
        return;
      }
      setMensajePatron(
        `Patrón incorrecto. Te ${restantes === 1 ? "queda 1 intento" : `quedan ${restantes} intentos`}.`
      );
    } finally {
      setVerificandoPatron(false);
      setTimeout(() => setEstadoTrazo("normal"), 700);
    }
  };

  const tamanoPatron = Math.min(width - 96, 280);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORES.verde, COLORES.verdeOscuro]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fondoSuperior}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.marca}>
              <View style={styles.circuloLogo}>
                <Image
                  style={styles.logo}
                  source={require("../assets/delcamp.png")}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.bienvenida}>Bienvenido</Text>
              <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>
            </View>

            <View style={styles.tarjeta}>
              <TextInput
                label="Usuario"
                value={datosUsuario.username}
                mode="outlined"
                outlineColor="#d1d5db"
                activeOutlineColor={COLORES.verdeOscuro}
                outlineStyle={{ borderRadius: 12 }}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                disabled={bloqueado}
                left={<TextInput.Icon icon={require("../assets/account.png")} color={COLORES.textoSuave} />}
                style={styles.campo}
                onChangeText={(text: string) =>
                  setDatosUsuario((prev) => ({ ...prev, username: text }))
                }
              />
              <TextInput
                label="Contraseña"
                value={datosUsuario.password}
                mode="outlined"
                secureTextEntry={!passVisible}
                outlineColor="#d1d5db"
                activeOutlineColor={COLORES.verdeOscuro}
                outlineStyle={{ borderRadius: 12 }}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                disabled={bloqueado}
                right={
                  <TextInput.Icon
                    icon={require("../assets/eye.png")}
                    color={passVisible ? COLORES.verdeOscuro : COLORES.textoSuave}
                    onPress={() => setPassVisible(!passVisible)}
                  />
                }
                style={styles.campo}
                onSubmitEditing={onSubmit}
                returnKeyType="go"
                onChangeText={(text: string) =>
                  setDatosUsuario((prev) => ({ ...prev, password: text }))
                }
              />
              <Button
                mode="contained"
                buttonColor={COLORES.verdeOscuro}
                style={styles.botonPrincipal}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: 16, fontWeight: "700" }}
                onPress={onSubmit}
                disabled={bloqueado}
                loading={bloqueado}
              >
                {bloqueado ? "Ingresando…" : "Ingresar"}
              </Button>

              {!!sesionPatron && (
                <>
                  <View style={styles.separador}>
                    <View style={styles.linea} />
                    <Text style={styles.textoSeparador}>o</Text>
                    <View style={styles.linea} />
                  </View>
                  <Button
                    mode="outlined"
                    textColor={COLORES.verdeOscuro}
                    style={[styles.botonPatron, patronBloqueado && { opacity: 0.5 }]}
                    contentStyle={{ height: 48 }}
                    icon={require("../assets/pattern.png")}
                    disabled={bloqueado || patronBloqueado}
                    onPress={abrirPatron}
                  >
                    Entrar con patrón
                  </Button>
                  <Text style={styles.notaPatron}>
                    {patronBloqueado
                      ? "Patrón bloqueado por intentos fallidos. Entra con tu contraseña."
                      : `Como ${sesionPatron.nombre || sesionPatron.user}`}
                  </Text>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={modalPatron}
        transparent
        animationType="slide"
        onRequestClose={() => setModalPatron(false)}
      >
        <Pressable style={styles.fondoModal} onPress={() => !verificandoPatron && setModalPatron(false)} />
        <View style={styles.hoja}>
          <View style={styles.asa} />
          <Text style={styles.tituloModal}>Entrar con patrón</Text>
          <Text style={styles.usuarioModal}>
            {sesionPatron?.nombre || sesionPatron?.user}
          </Text>
          <Text
            style={[styles.mensajeModal, estadoTrazo === "error" && { color: COLORES.error }]}
          >
            {mensajePatron}
          </Text>
          <View style={styles.marcoPatron}>
            <PatronDesbloqueo
              tamano={tamanoPatron}
              estado={estadoTrazo}
              deshabilitado={verificandoPatron}
              onTerminar={alTerminarPatron}
            />
          </View>
          <Button
            mode="text"
            textColor={COLORES.textoSuave}
            disabled={verificandoPatron}
            onPress={() => setModalPatron(false)}
          >
            Usar usuario y contraseña
          </Button>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo
  },
  fondoSuperior: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  marca: {
    alignItems: "center",
    marginBottom: 24
  },
  circuloLogo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  logo: {
    width: 76,
    height: 76
  },
  bienvenida: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800"
  },
  subtitulo: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4
  },
  tarjeta: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }
  },
  campo: {
    marginBottom: 14,
    backgroundColor: "#ffffff"
  },
  botonPrincipal: {
    borderRadius: 14,
    marginTop: 4
  },
  separador: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16
  },
  linea: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb"
  },
  textoSeparador: {
    marginHorizontal: 12,
    color: COLORES.textoSuave,
    fontSize: 13
  },
  botonPatron: {
    borderRadius: 14,
    borderColor: COLORES.verdeOscuro
  },
  notaPatron: {
    fontSize: 12,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 8
  },
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)"
  },
  hoja: {
    backgroundColor: COLORES.tarjeta,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: "center"
  },
  asa: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginBottom: 14
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORES.texto
  },
  usuarioModal: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORES.verdeOscuro,
    marginTop: 2
  },
  mensajeModal: {
    fontSize: 14,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12
  },
  marcoPatron: {
    backgroundColor: COLORES.grisSuave,
    borderRadius: 24,
    padding: 12,
    marginBottom: 8
  }
});
