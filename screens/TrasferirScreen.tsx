import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Animated
} from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { RootStackParamList } from "../types/types";
import { obtenerListaLotesxUSuario } from "../src/services/ObtenerLotesxUsuario";
import { obtenerListaNavesxUsuario } from "../src/services/ObtenerNavesxUsuario";
import { guardarListaNave } from "../src/services/local/guardarListaDeNavesEnDbLocal";
import { useTransferenciaCat } from "../src/hooks/useTransferenciaCat";
import { GuardarAvancesEnDb } from "../src/services/GuardarAvancesAAsenar";
import {
  guardarListaLotesXUsuarioSqLite,
  guardarListaActividadesxLote,
  SeleccionarAvancesEmpleadosASyncronizar,
  obtenerSemanaActivaSqLite,
  ActualizarAvancesSincro,
  SeleccionarDatosUsuario,
  guardarListajefesNave
} from "../src/services/sqlite";
import { IRespuestaTransferenciaCat } from "../src/interfaces/IRespuestaTransferenciaCat1";
import { IEmpleadosParaAsentar } from "../src/interfaces/IEmpleadosParaAsentar";
import { IAvanceEmpleado } from "../src/interfaces/local/IAvanceEmpleado";
import {
  InsertarEmpleadosASQLite,
  eliminarDatos
} from "../src/services/local/guardarListaDeEmpleadosEnDbLocal";
import { obtenerListaDeActividadesPorUsuario } from "../src/services/ObtenerActividadesxLote";
import { obtenerJefesNave } from "../src/services/ObtenerJefesNave";
import { useUser } from "../src/context/userContext";
import { useEmployee } from "../src/context/QrContext";
import { avisarSinInternet, hayInternet } from "../src/utils/conexion";
import { obtenerFecha } from "../src/utils/GenerarFecha";
import {
  ErrorPaso,
  aErrorPaso,
  errorListaVacia,
  exigirInternet
} from "../src/utils/sincronizacion";
import ModalErrorSincronizacion from "../src/components/ModalErrorSincronizacion";

type Props = NativeStackScreenProps<RootStackParamList, "Transferir">;

const COLORES = {
  fondo: "#e5e9f4",
  tarjeta: "#ffffff",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeSuave: "#e3f6e9",
  gris: "#c3c3c3",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280",
  error: "#d32f2f",
  errorSuave: "#fdecea"
};

type ClaveOpcion = "avances" | "lotes" | "naves" | "empleados" | "actividades" | "jefes";
type EstadoOpcion = "inactivo" | "proceso" | "ok" | "sinDatos" | "error";

type DefinicionOpcion = {
  clave: ClaveOpcion;
  titulo: string;
  descripcion: string;
  icono: ImageSourcePropType;
};

type InfoOpcion = {
  seleccionada: boolean;
  estado: EstadoOpcion;
  mensaje?: string;
  error?: { mensaje: string; detalle?: string };
};

// Resultado de una opción que terminó bien. `sinDatos`: no había nada que
// enviar (no es un error).
type Resultado = { mensaje: string; sinDatos?: boolean };

const ENVIAR: DefinicionOpcion[] = [
  {
    clave: "avances",
    titulo: "Avances",
    descripcion: "Envía al servidor los avances capturados hoy",
    icono: require("../assets/chart-line-variant.png")
  }
];

const DESCARGAR: DefinicionOpcion[] = [
  { clave: "lotes", titulo: "Lotes", descripcion: "Lotes asignados al usuario", icono: require("../assets/land-fields.png") },
  { clave: "naves", titulo: "Naves", descripcion: "Naves de cada lote", icono: require("../assets/hoop-house.png") },
  { clave: "empleados", titulo: "Empleados", descripcion: "Catálogo de empleados", icono: require("../assets/account.png") },
  { clave: "actividades", titulo: "Actividades", descripcion: "Actividades y rendimientos por lote", icono: require("../assets/sprout.png") },
  { clave: "jefes", titulo: "Jefes de nave", descripcion: "Jefes de nave del apuntador", icono: require("../assets/account-cowboy-hat.png") }
];

// Orden de ejecución: primero se envían los avances (lo que se debe mandar
// todos los días) y después se descargan los catálogos.
const OPCIONES = [...ENVIAR, ...DESCARGAR];

const estadoInicial = (): Record<ClaveOpcion, InfoOpcion> =>
  OPCIONES.reduce(
    (acc, o) => ({
      ...acc,
      [o.clave]: { seleccionada: o.clave === "avances", estado: "inactivo" }
    }),
    {} as Record<ClaveOpcion, InfoOpcion>
  );

async function semanaActivaLocal(): Promise<string> {
  const semana: any[] = await obtenerSemanaActivaSqLite();
  if (!semana?.length) {
    throw new ErrorPaso(
      "No hay semana activa en el dispositivo.",
      "Cierre sesión y vuelva a entrar con internet para descargarla."
    );
  }
  return semana[0].semanaActiva;
}

export default function TransferirScreen({ navigation }: Props) {
  const { iduUsuario } = useUser();
  const { clearEmployeeCode, clearNombre } = useEmployee();
  const { handleTransferenciaCat } = useTransferenciaCat();

  const [opciones, setOpciones] = useState<Record<ClaveOpcion, InfoOpcion>>(estadoInicial);
  const opcionesRef = useRef(opciones);
  const [sincronizando, setSincronizando] = useState(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [detalle, setDetalle] = useState<ClaveOpcion | null>(null);
  const [semana, setSemana] = useState("");
  const [avancesHoy, setAvancesHoy] = useState<number | null>(null);
  const ejecutando = useRef(false);

  const opacidad = useRef(new Animated.Value(0)).current;
  const desplazamiento = useRef(new Animated.Value(40)).current;

  const fecha = dayjs().locale("es").format("dddd D [de] MMMM");
  const fechaHoy = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  const actualizarOpcion = (clave: ClaveOpcion, cambios: Partial<InfoOpcion>) => {
    opcionesRef.current = {
      ...opcionesRef.current,
      [clave]: { ...opcionesRef.current[clave], ...cambios }
    };
    setOpciones(opcionesRef.current);
  };

  // Avances registrados hoy: misma consulta que se usa al enviarlos.
  const cargarResumen = useCallback(async () => {
    try {
      const semanaActiva = await semanaActivaLocal();
      const avances = await SeleccionarAvancesEmpleadosASyncronizar(semanaActiva, obtenerFecha());
      setSemana(String(semanaActiva));
      setAvancesHoy(avances.filter((a) => Number(a.avance) !== 0).length);
    } catch {
      setAvancesHoy(null);
    }
  }, []);

  useEffect(() => {
    cargarResumen();
    Animated.parallel([
      Animated.timing(opacidad, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(desplazamiento, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start();
  }, []);

  // Cada acción devuelve el resumen que se muestra al terminar bien, o lanza
  // ErrorPaso con el motivo.
  const acciones: Record<ClaveOpcion, () => Promise<Resultado>> = {
    avances: async () => {
      await exigirInternet();
      const semanaActiva = await semanaActivaLocal();
      const fechaHoy = obtenerFecha();
      const lista = await SeleccionarAvancesEmpleadosASyncronizar(semanaActiva, fechaHoy);
      if (lista.length === 0) {
        return { mensaje: "No hay avances registrados hoy", sinDatos: true };
      }

      // Se agrupan los avances por lote y nave, como los espera el servidor.
      const lotesMap = new Map<string, IEmpleadosParaAsentar>();
      for (const empleado of lista) {
        const { cod_lote, cod_nave } = empleado;
        const key = `${cod_lote}_${cod_nave}`;
        if (!lotesMap.has(key)) lotesMap.set(key, { cod_lote, cod_nave, wDatos: [] });
        lotesMap.get(key)!.wDatos.push({
          cod_act: empleado.cod_actividad,
          cod_avn: empleado.cod_avance,
          cod_emp: empleado.cod_empleado,
          avances: empleado.avance,
          avancesA: empleado.avanceA,
          bandera: "",
          rendAplicado: empleado.Rendimiento_Aplic,
          estadoSincro: empleado.estadoSincro,
          MensajeSincro: empleado.MensajeSincro
        });
      }

      // GuardarAvancesEnDb devuelve [] si no se pudo sincronizar.
      const res: any = await GuardarAvancesEnDb(Array.from(lotesMap.values()));
      if (!Array.isArray(res) || res.length === 0) {
        throw (await hayInternet())
          ? new ErrorPaso(
              "El servidor no confirmó la recepción de los avances.",
              "Los registros siguen guardados en el dispositivo. Intente de nuevo; si el problema continúa, avise a sistemas."
            )
          : new ErrorPaso(
              "Se perdió la conexión al enviar los avances.",
              "Los registros siguen guardados en el dispositivo. Verifique su señal y presione Reintentar."
            );
      }

      for (const item of res) {
        const { cod_lote, cod_nave, wDatos } = item ?? {};
        if (!Array.isArray(wDatos)) continue;
        for (const empleado of wDatos) {
          // El servidor puede devolver el campo en camelCase o PascalCase;
          // nunca se manda undefined a SQLite.
          await ActualizarAvancesSincro({
            estadoSincro: empleado.estadoSincro ?? 0,
            MensajeSincro: empleado.mensajeSincro ?? empleado.MensajeSincro ?? "",
            cod_actividad: empleado.cod_act,
            cod_avance: empleado.cod_avn,
            cod_lote,
            cod_nave,
            cod_empleado: empleado.cod_emp,
            semanaActiva,
            fecha: fechaHoy
          } as IAvanceEmpleado);
        }
      }
      return {
        mensaje: `${lista.length} ${lista.length === 1 ? "registro enviado" : "registros enviados"}`
      };
    },

    lotes: async () => {
      await exigirInternet();
      const lotes = await obtenerListaLotesxUSuario({ idu_usuario: Number(iduUsuario) });
      if (lotes.length === 0) throw await errorListaVacia("lotes");
      if (!(await guardarListaLotesXUsuarioSqLite(lotes))) {
        throw new ErrorPaso("No se pudieron guardar los lotes en el dispositivo.");
      }
      return { mensaje: `${lotes.length} lotes actualizados` };
    },

    naves: async () => {
      await exigirInternet();
      const naves = await obtenerListaNavesxUsuario({ idu_usuario: Number(iduUsuario) });
      if (naves.length === 0) throw await errorListaVacia("naves");
      if (!(await guardarListaNave(naves))) {
        throw new ErrorPaso("No se pudieron guardar las naves en el dispositivo.");
      }
      return { mensaje: `${naves.length} naves actualizadas` };
    },

    empleados: async () => {
      await exigirInternet();
      const datosUser = await SeleccionarDatosUsuario();
      const idu = datosUser[0]?.idu_usuario ?? iduUsuario;
      const empleados = await handleTransferenciaCat({ wtipo: "1", idu_usuario: idu });
      if (!empleados || empleados.length === 0) throw await errorListaVacia("empleados");

      // Solo se reemplaza la lista local cuando llegó una nueva.
      await eliminarDatos();
      if (!(await InsertarEmpleadosASQLite(empleados as IRespuestaTransferenciaCat[]))) {
        throw new ErrorPaso("No se pudieron guardar los empleados en el dispositivo.");
      }
      return { mensaje: `${empleados.length} empleados actualizados` };
    },

    actividades: async () => {
      await exigirInternet();
      const actividades = await obtenerListaDeActividadesPorUsuario({
        idu_usuario: Number(iduUsuario)
      });
      if (actividades.length === 0) throw await errorListaVacia("actividades");
      if (!(await guardarListaActividadesxLote(actividades))) {
        throw new ErrorPaso("No se pudieron guardar las actividades en el dispositivo.");
      }
      return { mensaje: `${actividades.length} actividades actualizadas` };
    },

    jefes: async () => {
      await exigirInternet();
      const respuesta = await obtenerJefesNave({ idu_usuario: String(iduUsuario) });
      const jefes = respuesta?.jefesDeNave ?? [];
      if (jefes.length === 0) throw await errorListaVacia("jefes de nave");
      if (!(await guardarListajefesNave(jefes))) {
        throw new ErrorPaso("No se pudieron guardar los jefes de nave en el dispositivo.");
      }
      return { mensaje: `${jefes.length} jefes de nave actualizados` };
    }
  };

  // Ejecuta en orden las opciones seleccionadas. `soloClave` repite una sola
  // (botón Reintentar del modal de error).
  async function sincronizar(soloClave?: ClaveOpcion) {
    if (ejecutando.current) return;
    // Se bloquea antes del primer await para que un doble toque no inicie dos
    // sincronizaciones.
    ejecutando.current = true;

    // Todas las opciones llaman a la API: sin internet se avisa una vez y no
    // se intenta ninguna.
    if (!(await hayInternet())) {
      avisarSinInternet();
      ejecutando.current = false;
      return;
    }

    const aEjecutar = OPCIONES.filter((o) =>
      soloClave ? o.clave === soloClave : opcionesRef.current[o.clave].seleccionada
    );
    if (aEjecutar.length === 0) {
      ejecutando.current = false;
      return;
    }

    setSincronizando(true);
    setMostrarResumen(false);
    // Una sincronización completa limpia el resultado de todas las opciones;
    // un reintento solo el de la opción que se repite.
    (soloClave ? aEjecutar : OPCIONES).forEach((o) =>
      actualizarOpcion(o.clave, { estado: "inactivo", mensaje: undefined, error: undefined })
    );

    for (const opcion of aEjecutar) {
      actualizarOpcion(opcion.clave, { estado: "proceso", mensaje: "Sincronizando…" });
      try {
        const resultado = await acciones[opcion.clave]();
        actualizarOpcion(opcion.clave, {
          estado: resultado.sinDatos ? "sinDatos" : "ok",
          mensaje: resultado.mensaje
        });
      } catch (e: any) {
        const error = aErrorPaso(e);
        actualizarOpcion(opcion.clave, {
          estado: "error",
          mensaje: error.message,
          error: { mensaje: error.message, detalle: error.detalle }
        });
      }
    }

    ejecutando.current = false;
    setSincronizando(false);
    setMostrarResumen(true);
    cargarResumen();
  }

  const alternar = (clave: ClaveOpcion) => {
    if (sincronizando) return;
    actualizarOpcion(clave, { seleccionada: !opcionesRef.current[clave].seleccionada });
  };

  const todasDescargas = DESCARGAR.every((o) => opciones[o.clave].seleccionada);
  const alternarDescargas = () => {
    if (sincronizando) return;
    DESCARGAR.forEach((o) => actualizarOpcion(o.clave, { seleccionada: !todasDescargas }));
  };

  const regresar = () => {
    clearEmployeeCode();
    clearNombre();
    navigation.goBack();
  };

  const seleccionadas = OPCIONES.filter((o) => opciones[o.clave].seleccionada).length;

  // El resumen se calcula del estado actual de cada tarjeta (no de la última
  // ejecución), para que un reintento individual no oculte otros errores.
  const estados = OPCIONES.map((o) => opciones[o.clave].estado);
  const resumen = mostrarResumen
    ? {
        ok: estados.filter((e) => e === "ok" || e === "sinDatos").length,
        error: estados.filter((e) => e === "error").length
      }
    : null;
  const opcionDetalle = detalle ? OPCIONES.find((o) => o.clave === detalle) : undefined;
  const infoDetalle = detalle ? opciones[detalle] : undefined;

  const textoAvances =
    avancesHoy === null
      ? "No se pudo consultar los avances de hoy"
      : avancesHoy === 0
        ? "No hay avances registrados hoy"
        : `${avancesHoy} ${avancesHoy === 1 ? "avance registrado" : "avances registrados"} hoy`;

  const renderOpcion = (o: DefinicionOpcion) => (
    <TarjetaOpcion
      key={o.clave}
      definicion={o}
      info={opciones[o.clave]}
      deshabilitada={sincronizando}
      onPress={() => alternar(o.clave)}
      onVerDetalle={() => setDetalle(o.clave)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <LinearGradient
        colors={[COLORES.verde, COLORES.verdeOscuro]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.encabezado}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.filaEncabezado}>
            <Pressable
              onPress={regresar}
              hitSlop={8}
              style={({ pressed }) => [styles.botonRegresar, pressed && { opacity: 0.7 }]}
            >
              <Image source={require("../assets/arrow-left.png")} style={styles.iconoRegresar} />
            </Pressable>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.titulo}>Sincronizar</Text>
              <Text style={styles.subtitulo} numberOfLines={1}>
                {fechaHoy}
                {semana ? ` · Semana ${semana}` : ""}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: opacidad, transform: [{ translateY: desplazamiento }] }}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <View style={styles.tarjetaResumen}>
            <View style={styles.circuloResumen}>
              <Image source={require("../assets/chart-line-variant.png")} style={styles.iconoResumen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.numeroResumen}>{avancesHoy ?? "–"}</Text>
              <Text style={styles.textoResumen}>{textoAvances}</Text>
            </View>
          </View>

          {resumen && (
            <View
              style={[
                styles.aviso,
                resumen.error > 0 ? styles.avisoError : styles.avisoOk
              ]}
            >
              <Image
                source={
                  resumen.error > 0
                    ? require("../assets/close.png")
                    : require("../assets/check-bold.png")
                }
                style={[styles.iconoAviso, { tintColor: resumen.error > 0 ? COLORES.error : COLORES.verdeOscuro }]}
              />
              <Text style={[styles.textoAviso, { color: resumen.error > 0 ? COLORES.error : COLORES.verdeOscuro }]}>
                {resumen.error > 0
                  ? `${resumen.error} ${resumen.error === 1 ? "opción terminó" : "opciones terminaron"} con error${resumen.ok > 0 ? ` · ${resumen.ok} correctas` : ""}`
                  : "Sincronización completada correctamente"}
              </Text>
            </View>
          )}

          <Text style={styles.tituloSeccion}>Enviar al servidor</Text>
          {ENVIAR.map(renderOpcion)}

          <View style={styles.filaSeccion}>
            <Text style={[styles.tituloSeccion, { marginTop: 0, marginBottom: 0 }]}>
              Descargar del servidor
            </Text>
            <Pressable onPress={alternarDescargas} disabled={sincronizando} hitSlop={8}>
              <Text style={[styles.enlace, sincronizando && { opacity: 0.4 }]}>
                {todasDescargas ? "Quitar todo" : "Seleccionar todo"}
              </Text>
            </Pressable>
          </View>
          {DESCARGAR.map(renderOpcion)}
        </ScrollView>
      </Animated.View>

      <View style={styles.pie}>
        <Button
          mode="contained"
          buttonColor={COLORES.verdeOscuro}
          style={styles.botonPrincipal}
          contentStyle={{ height: 50 }}
          labelStyle={{ fontSize: 16, fontWeight: "700" }}
          icon={sincronizando ? undefined : require("../assets/sync.png")}
          loading={sincronizando}
          disabled={sincronizando || seleccionadas === 0}
          onPress={() => sincronizar()}
        >
          {sincronizando
            ? "Sincronizando…"
            : seleccionadas === 0
              ? "Seleccione una opción"
              : `Sincronizar (${seleccionadas})`}
        </Button>
      </View>

      <ModalErrorSincronizacion
        visible={!!infoDetalle?.error}
        titulo={opcionDetalle?.titulo ?? ""}
        mensaje={infoDetalle?.error?.mensaje}
        detalle={infoDetalle?.error?.detalle}
        onCerrar={() => setDetalle(null)}
        onReintentar={() => {
          const clave = detalle;
          setDetalle(null);
          if (clave) sincronizar(clave);
        }}
        reintentarDeshabilitado={sincronizando}
      />
    </SafeAreaView>
  );
}

type TarjetaOpcionProps = {
  definicion: DefinicionOpcion;
  info: InfoOpcion;
  deshabilitada: boolean;
  onPress: () => void;
  onVerDetalle: () => void;
};

function TarjetaOpcion({ definicion, info, deshabilitada, onPress, onVerDetalle }: TarjetaOpcionProps) {
  const { seleccionada, estado, mensaje } = info;
  const colorMensaje =
    estado === "error" ? COLORES.error : estado === "ok" ? COLORES.verdeOscuro : COLORES.textoSuave;

  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitada}
      style={({ pressed }) => [
        styles.tarjeta,
        seleccionada && styles.tarjetaSeleccionada,
        estado === "error" && styles.tarjetaError,
        pressed && { opacity: 0.85 }
      ]}
    >
      <View style={[styles.circuloIcono, { backgroundColor: seleccionada ? COLORES.verdeSuave : COLORES.grisSuave }]}>
        <Image
          source={definicion.icono}
          style={[styles.iconoOpcion, { tintColor: seleccionada ? COLORES.verdeOscuro : COLORES.textoSuave }]}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.tituloOpcion}>{definicion.titulo}</Text>
        <Text style={styles.descripcionOpcion} numberOfLines={2}>
          {definicion.descripcion}
        </Text>
        {estado !== "inactivo" && !!mensaje && (
          <View style={styles.filaEstado}>
            {estado === "ok" && (
              <Image source={require("../assets/check-bold.png")} style={[styles.iconoEstado, { tintColor: COLORES.verdeOscuro }]} />
            )}
            {estado === "error" && (
              <Image source={require("../assets/close.png")} style={[styles.iconoEstado, { tintColor: COLORES.error }]} />
            )}
            <Text style={[styles.mensajeEstado, { color: colorMensaje }]} numberOfLines={2}>
              {mensaje}
            </Text>
          </View>
        )}
        {estado === "error" && (
          <Pressable onPress={onVerDetalle} hitSlop={8} style={{ alignSelf: "flex-start" }}>
            <Text style={styles.verDetalle}>Ver detalle ›</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.control}>
        {estado === "proceso" ? (
          <ActivityIndicator size={20} color={COLORES.verde} />
        ) : (
          <View style={[styles.casilla, seleccionada && styles.casillaMarcada]}>
            {seleccionada && (
              <Image source={require("../assets/check-bold.png")} style={styles.iconoCasilla} />
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const sombra = {
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo
  },
  encabezado: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  filaEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12
  },
  botonRegresar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  iconoRegresar: {
    width: 22,
    height: 22,
    tintColor: "#ffffff",
    resizeMode: "contain"
  },
  titulo: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700"
  },
  subtitulo: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2
  },
  contenido: {
    padding: 16,
    paddingBottom: 24
  },
  tarjetaResumen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    padding: 16,
    ...sombra
  },
  circuloResumen: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORES.verdeOscuro,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  iconoResumen: {
    width: 28,
    height: 28,
    tintColor: "#ffffff",
    resizeMode: "contain"
  },
  numeroResumen: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORES.verdeOscuro
  },
  textoResumen: {
    fontSize: 13,
    color: COLORES.textoSuave
  },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1
  },
  avisoOk: {
    backgroundColor: COLORES.verdeSuave,
    borderColor: COLORES.verde
  },
  avisoError: {
    backgroundColor: COLORES.errorSuave,
    borderColor: COLORES.error
  },
  iconoAviso: {
    width: 18,
    height: 18,
    marginRight: 10,
    resizeMode: "contain"
  },
  textoAviso: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600"
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 24,
    marginBottom: 10
  },
  filaSeccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10
  },
  enlace: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.verdeOscuro
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    ...sombra
  },
  tarjetaSeleccionada: {
    borderColor: COLORES.verde
  },
  tarjetaError: {
    borderColor: COLORES.error,
    backgroundColor: "#fffafa"
  },
  circuloIcono: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  iconoOpcion: {
    width: 24,
    height: 24,
    resizeMode: "contain"
  },
  tituloOpcion: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.texto
  },
  descripcionOpcion: {
    fontSize: 12,
    color: COLORES.textoSuave,
    marginTop: 2
  },
  filaEstado: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6
  },
  iconoEstado: {
    width: 14,
    height: 14,
    marginRight: 6,
    resizeMode: "contain"
  },
  mensajeEstado: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600"
  },
  verDetalle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.error,
    marginTop: 4
  },
  control: {
    width: 32,
    alignItems: "center",
    marginLeft: 8
  },
  casilla: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORES.gris,
    alignItems: "center",
    justifyContent: "center"
  },
  casillaMarcada: {
    backgroundColor: COLORES.verdeOscuro,
    borderColor: COLORES.verdeOscuro
  },
  iconoCasilla: {
    width: 14,
    height: 14,
    tintColor: "#ffffff",
    resizeMode: "contain"
  },
  pie: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: COLORES.fondo
  },
  botonPrincipal: {
    borderRadius: 14
  }
});
