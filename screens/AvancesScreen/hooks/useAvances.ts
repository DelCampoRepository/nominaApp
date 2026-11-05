import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { IRespuestaObtenerNavesxUsuario } from "../../../src/interfaces/IRespuestaObtenerNavesxUsuario";
import { IActividadesAvancesSeleccionables } from "../../../src/interfaces/local/iActividadesAvancesSeleccionables";
import { obtenerListaLotesxUsuarioSqLite } from "../../../src/services/local/guardarListaDeLotesEnDbLocal";
import { obtenerListaNavesSqlite } from "../../../src/services/local/guardarListaDeNavesEnDbLocal";
import { ContarAvancesHoyPorActividad, SeleccionarActividadesNave } from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { useEmployee } from "../../../src/context/QrContext";
import { OpcionSelector } from "../../../src/components/ModalSelector";

type Navegacion = NativeStackNavigationProp<RootStackParamList, "Avances">;

export function useAvances(navigation: Navegacion) {
  const { clearEmployeeCode, clearNombre } = useEmployee();

  const [lotes, setLotes] = useState<IListaLotesxUsuario[]>([]);
  const [lote, setLote] = useState<OpcionSelector | null>(null);
  const [naves, setNaves] = useState<IRespuestaObtenerNavesxUsuario[]>([]);
  const [nave, setNave] = useState<OpcionSelector | null>(null);
  const [actividades, setActividades] = useState<IActividadesAvancesSeleccionables[]>([]);
  // Empleados con avance hoy por actividad ("cod_actividad|cod_avance").
  const [conteos, setConteos] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"lote" | "nave" | null>(null);

  useEffect(() => {
    obtenerListaLotesxUsuarioSqLite().then(setLotes);
    // Igual que el Header anterior: se limpia el empleado escaneado al salir.
    return () => {
      clearEmployeeCode();
      clearNombre();
    };
  }, []);

  // Solo se aplica la consulta más reciente (al cambiar de nave rápido, una
  // respuesta anterior no debe pisar la actual).
  const consultaActual = useRef(0);
  const cargarActividades = async (codLote: string, codNave: string, mostrarCarga = true) => {
    const id = ++consultaActual.current;
    if (mostrarCarga) setCargando(true);
    setError(null);
    try {
      const semana = String(await ConsultarSemanaActiva());
      const [lista, cuenta] = await Promise.all([
        SeleccionarActividadesNave(codLote, codNave, semana),
        ContarAvancesHoyPorActividad(codLote, codNave, semana)
      ]);
      if (id !== consultaActual.current) return;
      setActividades(lista);
      setConteos(cuenta);
    } catch {
      if (id !== consultaActual.current) return;
      setActividades([]);
      setConteos({});
      setError("No se pudieron consultar las actividades de la nave.");
    } finally {
      if (id === consultaActual.current) setCargando(false);
    }
  };

  // Al regresar de capturar avances se actualizan los conteos (sin mostrar el
  // indicador de carga para que la lista no parpadee).
  const loteRef = useRef(lote);
  loteRef.current = lote;
  const naveRef = useRef(nave);
  naveRef.current = nave;
  const primerEnfoque = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primerEnfoque.current) {
        primerEnfoque.current = false;
        return;
      }
      const l = loteRef.current;
      const n = naveRef.current;
      if (l && n) cargarActividades(l.codigo, n.codigo, false);
    }, [])
  );

  const consultaNaves = useRef(0);
  const elegirLote = async (opcion: OpcionSelector) => {
    setModal(null);
    if (opcion.codigo === lote?.codigo) return;
    setLote(opcion);
    setNave(null);
    setActividades([]);
    setConteos({});
    setError(null);
    consultaActual.current++;
    setCargando(false);
    const id = ++consultaNaves.current;
    const lista = (await obtenerListaNavesSqlite(opcion.codigo)) as IRespuestaObtenerNavesxUsuario[];
    if (id === consultaNaves.current) setNaves(lista ?? []);
  };

  const elegirNave = (opcion: OpcionSelector) => {
    setModal(null);
    if (!lote) return;
    setNave(opcion);
    cargarActividades(lote.codigo, opcion.codigo);
  };

  const abrirActividad = (a: IActividadesAvancesSeleccionables) => {
    if (!lote || !nave) return;
    navigation.navigate("AvancesxActividad", {
      lote: lote.codigo,
      desLote: lote.nombre,
      codNave: nave.codigo,
      desNave: nave.nombre,
      rendApli: a.Rendimiento_Aplic,
      redTop: a.Rendimiento_Tope,
      nomAct: a.nom_actividad,
      coAct: a.cod_actividad,
      codAv: a.cod_avance,
      rednApl: Number(a.Rendimiento_Aplic),
      unidad: a.Nom_Corto
    });
  };

  const opcionesLote: OpcionSelector[] = lotes.map((l) => ({ codigo: l.cod_lote, nombre: l.nom_lote }));
  const opcionesNave: OpcionSelector[] = naves.map((n) => ({
    codigo: n.cod_nave,
    nombre: n.Descripcion_nave
  }));

  return {
    lote,
    nave,
    naves,
    actividades,
    conteos,
    cargando,
    error,
    modal,
    setModal,
    opcionesLote,
    opcionesNave,
    elegirLote,
    elegirNave,
    abrirActividad,
    reintentar: () => lote && nave && cargarActividades(lote.codigo, nave.codigo)
  };
}
