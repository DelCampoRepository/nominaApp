import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import { useEffect, useRef, useState } from "react";
import { RootStackParamList } from "../../../types/types";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { IMainActividades } from "../../../src/interfaces/local/IMainActividades";
import { ISecundaryActividades } from "../../../src/interfaces/local/ISecundaryActividades";
import { obtenerListaLotesxUsuarioSqLite } from "../../../src/services/local/guardarListaDeLotesEnDbLocal";
import {
  obtenerActividadesxLoteLocales,
  obtenerActividadesxLoteSecundariasLocales,
  actualizar,
  GuardarActEnNaves
} from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { useEmployee } from "../../../src/context/QrContext";
import { OpcionSelector } from "../../../src/components/ModalSelector";
import { claveAvance, estaSeleccionado } from "../utils";

export type AvisoActividades = { tipo: "ok" | "error"; texto: string };
export type CambioSeleccion = { avance: ISecundaryActividades; valor: boolean };

export function useActividadesLote(
  navigation: NativeStackNavigationProp<RootStackParamList, "ActividadesLote">
) {
  const { clearEmployeeCode, clearNombre } = useEmployee();

  const [lotes, setLotes] = useState<IListaLotesxUsuario[]>([]);
  const [lote, setLote] = useState<OpcionSelector | null>(null);
  const [actividades, setActividades] = useState<IMainActividades[]>([]);
  const [actividad, setActividad] = useState<OpcionSelector | null>(null);
  const [avances, setAvances] = useState<ISecundaryActividades[]>([]);
  const [cargandoAvances, setCargandoAvances] = useState(false);
  // Cambios sin guardar del lote actual (pueden ser de varias actividades);
  // la clave es actividad|avance y el valor la fila con el nuevo `selecionado`.
  const [pendientes, setPendientes] = useState<Record<string, ISecundaryActividades>>({});
  const pendientesRef = useRef(pendientes);
  pendientesRef.current = pendientes;
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<AvisoActividades | null>(null);
  const [modal, setModal] = useState<"lote" | "actividad" | null>(null);

  const totalPendientes = Object.keys(pendientes).length;

  useEffect(() => {
    obtenerListaLotesxUsuarioSqLite().then(setLotes);
  }, []);

  // Al salir con cambios sin guardar (flecha o botón atrás de Android) se pide
  // confirmación.
  useEffect(() => {
    const quitar = navigation.addListener("beforeRemove", (e) => {
      if (Object.keys(pendientesRef.current).length === 0) return;
      e.preventDefault();
      Alert.alert(
        "Cambios sin guardar",
        "Si sale ahora se perderán los cambios que no ha guardado.",
        [
          { text: "Seguir editando", style: "cancel" },
          {
            text: "Salir sin guardar",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action)
          }
        ]
      );
    });
    return quitar;
  }, [navigation]);

  // Solo se aplica la respuesta de la consulta más reciente: si se cambia de
  // actividad rápido, una consulta anterior no debe pisar la actual.
  const consultaActual = useRef(0);
  const cargarAvances = async (codLote: string, codActividad: string) => {
    const id = ++consultaActual.current;
    setCargandoAvances(true);
    try {
      const datos = await obtenerActividadesxLoteSecundariasLocales(codLote, codActividad);
      if (id === consultaActual.current) setAvances(datos);
    } finally {
      if (id === consultaActual.current) setCargandoAvances(false);
    }
  };

  const aplicarLote = async (opcion: OpcionSelector) => {
    setLote(opcion);
    // La actividad elegida pertenece al lote anterior: se reinicia (y se
    // descarta cualquier consulta de avances en curso).
    consultaActual.current++;
    setCargandoAvances(false);
    setActividad(null);
    setAvances([]);
    setPendientes({});
    setAviso(null);
    setActividades(await obtenerActividadesxLoteLocales(opcion.codigo));
  };

  const elegirLote = (opcion: OpcionSelector) => {
    setModal(null);
    if (opcion.codigo === lote?.codigo) return;
    if (totalPendientes > 0) {
      Alert.alert(
        "Cambios sin guardar",
        `Hay ${totalPendientes} ${totalPendientes === 1 ? "cambio" : "cambios"} sin guardar en el lote ${lote?.codigo}. ¿Desea descartarlos?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Descartar", style: "destructive", onPress: () => aplicarLote(opcion) }
        ]
      );
      return;
    }
    aplicarLote(opcion);
  };

  const elegirActividad = (opcion: OpcionSelector) => {
    setModal(null);
    if (!lote) return;
    setActividad(opcion);
    setAviso(null);
    cargarAvances(lote.codigo, opcion.codigo);
  };

  const valorActual = (a: ISecundaryActividades) =>
    pendientes[claveAvance(a)] ? estaSeleccionado(pendientes[claveAvance(a)]) : estaSeleccionado(a);

  // Guarda en `pendientes` solo lo que difiere de lo que hay en la base.
  const fijarSeleccion = (cambios: CambioSeleccion[]) => {
    setAviso(null);
    setPendientes((prev) => {
      const siguiente = { ...prev };
      for (const { avance, valor } of cambios) {
        const clave = claveAvance(avance);
        if (valor === estaSeleccionado(avance)) delete siguiente[clave];
        else siguiente[clave] = { ...avance, selecionado: valor ? 1 : 0 };
      }
      return siguiente;
    });
  };

  const seleccionadosActividad = avances.filter(valorActual).length;
  const todosSeleccionados = avances.length > 0 && seleccionadosActividad === avances.length;

  const guardar = async () => {
    if (!lote || guardando) return;
    setGuardando(true);
    setAviso(null);
    try {
      const cambios = Object.values(pendientes);
      if (cambios.length > 0 && !(await actualizar(lote.codigo, cambios))) {
        throw new Error("No se pudieron guardar las actividades seleccionadas.");
      }
      // Se ejecuta aunque no haya cambios: crea las actividades del día en las
      // naves del lote (las tablas del día se limpian al cambiar de día).
      const semana = await ConsultarSemanaActiva();
      if (!(await GuardarActEnNaves(lote.codigo, obtenerFecha(), semana))) {
        throw new Error("No se pudieron asignar las actividades a las naves del lote.");
      }
      // Solo se quitan los cambios que se guardaron (y que no se volvieron a
      // modificar mientras tanto).
      setPendientes((prev) => {
        const siguiente = { ...prev };
        for (const c of cambios) {
          const clave = claveAvance(c);
          if (siguiente[clave]?.selecionado === c.selecionado) delete siguiente[clave];
        }
        return siguiente;
      });
      if (actividad) await cargarAvances(lote.codigo, actividad.codigo);
      setAviso({
        tipo: "ok",
        texto:
          cambios.length > 0
            ? `Se guardaron ${cambios.length} ${cambios.length === 1 ? "cambio" : "cambios"} para el lote ${lote.codigo}`
            : `Se actualizaron las actividades de las naves del lote ${lote.codigo}`
      });
    } catch (e: any) {
      setAviso({
        tipo: "error",
        texto: String(e?.message || "Ocurrió un error al guardar. Intente de nuevo.")
      });
    } finally {
      setGuardando(false);
    }
  };

  // goBack regresa a la pantalla anterior (Inicio, o Actividades en nave si se
  // llegó desde ahí) y dispara la confirmación de cambios sin guardar;
  // navigate("Inicio") abriría otra Inicio encima.
  const regresar = () => navigation.goBack();

  // Igual que el Header anterior: se limpia el empleado escaneado al salir,
  // solo cuando la pantalla realmente se cierra.
  useEffect(
    () => () => {
      clearEmployeeCode();
      clearNombre();
    },
    []
  );

  const opcionesLote: OpcionSelector[] = lotes.map((l) => ({ codigo: l.cod_lote, nombre: l.nom_lote }));
  const opcionesActividad: OpcionSelector[] = actividades.map((a) => ({
    codigo: a.cod_actividad,
    nombre: a.nom_actividad
  }));

  return {
    lote,
    actividades,
    actividad,
    avances,
    cargandoAvances,
    pendientes,
    guardando,
    aviso,
    modal,
    setModal,
    totalPendientes,
    elegirLote,
    elegirActividad,
    valorActual,
    fijarSeleccion,
    seleccionadosActividad,
    todosSeleccionados,
    guardar,
    regresar,
    opcionesLote,
    opcionesActividad
  };
}
