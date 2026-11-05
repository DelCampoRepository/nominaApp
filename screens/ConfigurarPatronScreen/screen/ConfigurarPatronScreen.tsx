import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Alert, useWindowDimensions } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { SeleccionarDatosUsuario } from "../../../src/services/sqlite";
import {
  MINIMO_PUNTOS,
  PatronGuardado,
  obtenerPatron,
  guardarPatron,
  verificarPatron,
  eliminarPatron,
  INTENTOS_MAXIMOS_PATRON,
  obtenerIntentosFallidos,
  registrarIntentoFallido,
  reiniciarIntentosFallidos
} from "../../../src/services/local/patronAcceso";
import PatronDesbloqueo from "../../../src/components/PatronDesbloqueo";
import {
  COLORES,
  EncabezadoVerde,
  TarjetaSelectores,
  AvisoResultado
} from "../../../src/components/PantallaSeleccion";

type Props = NativeStackScreenProps<RootStackParamList, "ConfigurarPatron">;

// resumen: estado del patrón y acciones. actual: dibujar el patrón vigente
// antes de cambiarlo o eliminarlo. nuevo/confirmar: dibujarlo dos veces.
type Modo = "resumen" | "actual" | "nuevo" | "confirmar";
type EstadoTrazo = "normal" | "error" | "ok";


export default function ConfigurarPatronScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const tamanoPatron = Math.min(width - 64, 300);

  const [usuario, setUsuario] = useState<{ user: string; nombre: string } | null>(null);
  const [patron, setPatron] = useState<PatronGuardado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState<Modo>("resumen");
  const [accion, setAccion] = useState<"cambiar" | "eliminar">("cambiar");
  const [estadoTrazo, setEstadoTrazo] = useState<EstadoTrazo>("normal");
  const [mensaje, setMensaje] = useState("");
  const [mensajeError, setMensajeError] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const primerTrazo = useRef<number[]>([]);
  // Patrón bloqueado por intentos fallidos (se desbloquea al entrar con la
  // contraseña).
  const [bloqueado, setBloqueado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const datos = await SeleccionarDatosUsuario();
        if (datos.length > 0) {
          setUsuario({ user: datos[0].user, nombre: datos[0].nom_usuario });
          setPatron(await obtenerPatron(datos[0].user));
        }
        setBloqueado((await obtenerIntentosFallidos()) >= INTENTOS_MAXIMOS_PATRON);
      } finally {
        setCargando(false);
      }
    })();
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  // Muestra el color del trazo (ok/error) un momento y vuelve a normal.
  const marcarTrazo = (estado: EstadoTrazo) => {
    setEstadoTrazo(estado);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setEstadoTrazo("normal"), 700);
  };

  const indicar = (texto: string, esError = false) => {
    setMensaje(texto);
    setMensajeError(esError);
  };

  const iniciar = (nuevoModo: Modo, nuevaAccion?: "cambiar" | "eliminar") => {
    setAviso(null);
    primerTrazo.current = [];
    if (nuevaAccion) setAccion(nuevaAccion);
    setModo(nuevoModo);
    indicar(
      nuevoModo === "actual"
        ? "Dibuja tu patrón actual"
        : `Dibuja tu nuevo patrón uniendo al menos ${MINIMO_PUNTOS} puntos`
    );
  };

  const cancelar = () => {
    setModo("resumen");
    setEstadoTrazo("normal");
  };

  const terminarResumen = (tipo: "ok" | "error", texto: string) => {
    setModo("resumen");
    setAviso({ tipo, texto });
  };

  const alTerminarTrazo = async (secuencia: number[]) => {
    if (!usuario || ocupado) return;

    if (modo === "actual") {
      // Un toque o trazo corto no es un intento real: no se cuenta como fallido.
      if (secuencia.length < MINIMO_PUNTOS) {
        marcarTrazo("error");
        indicar(`Une al menos ${MINIMO_PUNTOS} puntos.`, true);
        return;
      }
      setOcupado(true);
      const correcto = await verificarPatron(usuario.user, secuencia);
      if (!correcto) {
        // Mismo contador guardado que el login: no se reinicia al volver a
        // tocar Cambiar/Eliminar ni al cerrar la app.
        const fallidos = await registrarIntentoFallido();
        setOcupado(false);
        marcarTrazo("error");
        const restantes = INTENTOS_MAXIMOS_PATRON - fallidos;
        if (restantes <= 0) {
          setBloqueado(true);
          terminarResumen(
            "error",
            "Demasiados intentos con un patrón incorrecto. El patrón queda bloqueado hasta que entres con tu usuario y contraseña."
          );
          return;
        }
        indicar(`Patrón incorrecto. Te ${restantes === 1 ? "queda 1 intento" : `quedan ${restantes} intentos`}.`, true);
        return;
      }
      await reiniciarIntentosFallidos();
      setOcupado(false);
      marcarTrazo("ok");
      if (accion === "cambiar") {
        iniciar("nuevo");
        return;
      }
      Alert.alert(
        "Eliminar patrón",
        "Ya no podrás entrar con el patrón; tendrás que usar tu usuario y contraseña.",
        [
          { text: "Cancelar", style: "cancel", onPress: cancelar },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              await eliminarPatron();
              setPatron(null);
              terminarResumen("ok", "Se eliminó el patrón de acceso.");
            }
          }
        ]
      );
      return;
    }

    if (modo === "nuevo") {
      if (secuencia.length < MINIMO_PUNTOS) {
        marcarTrazo("error");
        indicar(`Une al menos ${MINIMO_PUNTOS} puntos. Inténtalo de nuevo.`, true);
        return;
      }
      primerTrazo.current = secuencia;
      marcarTrazo("ok");
      setModo("confirmar");
      indicar("Dibuja el mismo patrón otra vez para confirmarlo");
      return;
    }

    if (modo === "confirmar") {
      if (secuencia.join("-") !== primerTrazo.current.join("-")) {
        marcarTrazo("error");
        primerTrazo.current = [];
        setModo("nuevo");
        indicar("Los patrones no coinciden. Dibuja tu nuevo patrón otra vez.", true);
        return;
      }
      setOcupado(true);
      try {
        await guardarPatron(usuario.user, secuencia);
        await reiniciarIntentosFallidos();
        setBloqueado(false);
        setPatron(await obtenerPatron(usuario.user));
        marcarTrazo("ok");
        terminarResumen("ok", "Patrón guardado. Ya puedes usarlo para entrar.");
      } catch (e: any) {
        terminarResumen("error", String(e?.message || "No se pudo guardar el patrón."));
      } finally {
        setOcupado(false);
      }
    }
  };

  const titulos: Record<Modo, string> = {
    resumen: "",
    actual: accion === "cambiar" ? "Cambiar patrón" : "Eliminar patrón",
    nuevo: patron ? "Nuevo patrón" : "Crear patrón",
    confirmar: "Confirmar patrón"
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Patrón de acceso"
        subtitulo="Entra sin escribir tu contraseña"
        onRegresar={() => navigation.goBack()}
      />

      <TarjetaSelectores>
        <View style={styles.estado}>
          <View style={[styles.circuloEstado, { backgroundColor: patron ? COLORES.verdeSuave : COLORES.grisSuave }]}>
            <Image
              source={require("../../../assets/pattern.png")}
              style={[styles.iconoEstado, { tintColor: patron ? COLORES.verdeOscuro : COLORES.textoSuave }]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloEstado}>
              {cargando ? "Consultando…" : patron ? "Patrón activo" : "Sin patrón"}
            </Text>
            <Text style={styles.textoEstado} numberOfLines={2}>
              {usuario ? `Usuario ${usuario.user}${usuario.nombre ? ` · ${usuario.nombre}` : ""}` : "Sin sesión guardada"}
            </Text>
          </View>
        </View>
      </TarjetaSelectores>

      <ScrollView contentContainerStyle={styles.contenido} scrollEnabled={modo === "resumen"}>
        {aviso && <AvisoResultado tipo={aviso.tipo} texto={aviso.texto} />}

        {modo === "resumen" ? (
          <>
            <View style={styles.tarjetaInfo}>
              <Text style={styles.textoInfo}>
                Con un patrón puedes entrar a la aplicación sin escribir tu usuario y
                contraseña. Solo funciona en este teléfono y para el usuario con el que
                iniciaste sesión.
              </Text>
              <Text style={[styles.textoInfo, { marginTop: 8 }]}>
                Si inicias sesión con otro usuario, el patrón deja de funcionar y tendrás
                que crear uno nuevo. Por seguridad, después de {INTENTOS_MAXIMOS_PATRON} intentos
                fallidos tendrás que entrar con tu contraseña.
              </Text>
            </View>

            {!cargando && !usuario && (
              <Text style={styles.textoAviso}>
                Inicia sesión con tu usuario y contraseña para poder crear un patrón.
              </Text>
            )}

            {!cargando && !!usuario && (
              <View style={{ gap: 10 }}>
                {patron ? (
                  <>
                    {bloqueado && (
                      <Text style={styles.textoAviso}>
                        El patrón está bloqueado por intentos fallidos. Entra con tu usuario y
                        contraseña para volver a cambiarlo o eliminarlo.
                      </Text>
                    )}
                    <Button
                      mode="contained"
                      buttonColor={COLORES.verdeOscuro}
                      style={styles.boton}
                      contentStyle={{ height: 48 }}
                      disabled={bloqueado}
                      onPress={() => iniciar("actual", "cambiar")}
                    >
                      Cambiar patrón
                    </Button>
                    <Button
                      mode="outlined"
                      textColor={COLORES.error}
                      style={[styles.boton, { borderColor: COLORES.error }, bloqueado && { opacity: 0.5 }]}
                      contentStyle={{ height: 48 }}
                      disabled={bloqueado}
                      onPress={() => iniciar("actual", "eliminar")}
                    >
                      Eliminar patrón
                    </Button>
                  </>
                ) : (
                  <Button
                    mode="contained"
                    buttonColor={COLORES.verdeOscuro}
                    style={styles.boton}
                    contentStyle={{ height: 48 }}
                    onPress={() => iniciar("nuevo")}
                  >
                    Crear patrón
                  </Button>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.zonaPatron}>
            <Text style={styles.tituloPaso}>{titulos[modo]}</Text>
            <Text style={[styles.instruccion, mensajeError && { color: COLORES.error }]}>{mensaje}</Text>
            <View style={styles.marcoPatron}>
              <PatronDesbloqueo
                tamano={tamanoPatron}
                estado={estadoTrazo}
                deshabilitado={ocupado}
                onTerminar={alTerminarTrazo}
              />
            </View>
            <Button mode="text" textColor={COLORES.textoSuave} onPress={cancelar} disabled={ocupado}>
              Cancelar
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo
  },
  estado: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  circuloEstado: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  iconoEstado: {
    width: 26,
    height: 26,
    resizeMode: "contain"
  },
  tituloEstado: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORES.texto
  },
  textoEstado: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2
  },
  contenido: {
    padding: 16,
    paddingBottom: 32
  },
  tarjetaInfo: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  textoInfo: {
    fontSize: 13,
    color: COLORES.textoSuave,
    lineHeight: 19
  },
  textoAviso: {
    fontSize: 14,
    color: COLORES.texto,
    textAlign: "center",
    marginTop: 8
  },
  boton: {
    borderRadius: 14
  },
  zonaPatron: {
    alignItems: "center"
  },
  tituloPaso: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORES.texto,
    marginTop: 4
  },
  instruccion: {
    fontSize: 14,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 12
  },
  marcoPatron: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12
  }
});
