import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { RootStackParamList } from "../../../types/types";
import { SeleccionarAvancesEmpleadosASyncronizar } from "../../../src/services/sqlite";
import { useEmployee } from "../../../src/context/QrContext";
import { avisarSinInternet, hayInternet } from "../../../src/utils/conexion";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { aErrorPaso } from "../../../src/utils/sincronizacion";
import { ClaveOpcion, InfoOpcion } from "../types";
import { DESCARGAR, OPCIONES, estadoInicial, semanaActivaLocal } from "../utils";
import { useAccionesTransferencia } from "./useAccionesTransferencia";

export function useTransferir(navigation: NativeStackNavigationProp<RootStackParamList, "Transferir">) {
  const { clearEmployeeCode, clearNombre } = useEmployee();
  const acciones = useAccionesTransferencia();

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

  const reintentarDetalle = () => {
    const clave = detalle;
    setDetalle(null);
    if (clave) sincronizar(clave);
  };

  return {
    opciones,
    sincronizando,
    detalle,
    setDetalle,
    semana,
    avancesHoy,
    opacidad,
    desplazamiento,
    fechaHoy,
    sincronizar,
    alternar,
    todasDescargas,
    alternarDescargas,
    regresar,
    seleccionadas,
    resumen,
    opcionDetalle,
    infoDetalle,
    textoAvances,
    reintentarDetalle
  };
}
