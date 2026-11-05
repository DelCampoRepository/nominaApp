import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { IRespuestaObtenerNavesxUsuario } from "../../../src/interfaces/IRespuestaObtenerNavesxUsuario";
import { IdatosActividadesNaves } from "../../../src/interfaces/local/IdatosActNave";
import { obtenerListaLotesxUsuarioSqLite } from "../../../src/services/local/guardarListaDeLotesEnDbLocal";
import { obtenerListaNavesSqlite } from "../../../src/services/local/guardarListaDeNavesEnDbLocal";
import { SeleccionarActEnNaves, actualizarActEnNave } from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { useEmployee } from "../../../src/context/QrContext";
import { OpcionSelector } from "../../../src/components/ModalSelector";
import { claveFila, estaSeleccionada } from "../utils";

type Navegacion = NativeStackScreenProps<RootStackParamList, "ActividadesNave">["navigation"];

export default function useActividadesNave(navigation: Navegacion) {
  const { clearEmployeeCode, clearNombre } = useEmployee();

  const [lotes, setLotes] = useState<IListaLotesxUsuario[]>([]);
  const [lote, setLote] = useState<OpcionSelector | null>(null);
  const [naves, setNaves] = useState<IRespuestaObtenerNavesxUsuario[]>([]);
  const [nave, setNave] = useState<OpcionSelector | null>(null);
  const [actividades, setActividades] = useState<IdatosActividadesNaves[]>([]);
  const [cargando, setCargando] = useState(false);
  // Cambios sin guardar del lote actual (pueden ser de varias naves).
  const [pendientes, setPendientes] = useState<Record<string, IdatosActividadesNaves>>({});
  const pendientesRef = useRef(pendientes);
  pendientesRef.current = pendientes;
  const [guardando, setGuardando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [modal, setModal] = useState<"lote" | "nave" | null>(null);

  const totalPendientes = Object.keys(pendientes).length;
  // Bloquea selección y guardado mientras se guarda o se revisan los datos.
  const ocupado = guardando || refrescando;

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

  // Igual que el Header anterior: se limpia el empleado escaneado al salir,
  // solo cuando la pantalla realmente se cierra.
  useEffect(
    () => () => {
      clearEmployeeCode();
      clearNombre();
    },
    []
  );

  // Solo se aplica la respuesta de la consulta más reciente: si se cambia de
  // nave rápido, una consulta anterior no debe pisar la actual.
  const consultaActual = useRef(0);
  const cargarActividades = async (codLote: string, codNave: string) => {
    const id = ++consultaActual.current;
    setCargando(true);
    try {
      const semana = await ConsultarSemanaActiva();
      const datos = await SeleccionarActEnNaves(codLote, codNave, obtenerFecha(), semana, true);
      if (id !== consultaActual.current) return;
      setActividades(
        datos.filter((a) => a.cod_lote === codLote && a.cod_nave === codNave)
      );
    } catch {
      if (id === consultaActual.current) {
        setActividades([]);
        setAviso({ tipo: "error", texto: "No se pudieron consultar las actividades de la nave." });
      }
    } finally {
      if (id === consultaActual.current) setCargando(false);
    }
  };

  // Al volver a esta pantalla (p. ej. desde "Ir a Actividades en lote", donde
  // GuardarActEnNaves crea o borra filas) se recargan las actividades de la nave
  // y se descartan los cambios pendientes de filas que ya no existen.
  const loteRef = useRef(lote);
  loteRef.current = lote;
  const naveRef = useRef(nave);
  naveRef.current = nave;
  const guardandoRef = useRef(guardando);
  guardandoRef.current = guardando;
  const primerEnfoque = useRef(true);

  const refrescarAlEnfocar = async () => {
    const l = loteRef.current;
    if (!l || guardandoRef.current) return;
    // Mientras se revisa, se bloquean filas y guardado para no trabajar con
    // datos que pueden ya no existir.
    setRefrescando(true);
    try {
      const navesRevisadas = [
        ...new Set(Object.values(pendientesRef.current).map((p) => p.cod_nave))
      ];
      if (navesRevisadas.length > 0) {
        const semana = await ConsultarSemanaActiva();
        const fecha = obtenerFecha();
        const existentes = new Set<string>();
        for (const codNave of navesRevisadas) {
          const filas = await SeleccionarActEnNaves(l.codigo, codNave, fecha, semana, true);
          filas.forEach((f) => existentes.add(claveFila(f)));
        }
        // Solo se descartan pendientes de las naves que se revisaron.
        setPendientes((prev) =>
          Object.fromEntries(
            Object.entries(prev).filter(
              ([clave, p]) => !navesRevisadas.includes(p.cod_nave) || existentes.has(clave)
            )
          )
        );
      }
    } catch {
      // Si falla la consulta se conservan los pendientes.
    } finally {
      setRefrescando(false);
    }
    const n = naveRef.current;
    if (n) cargarActividades(l.codigo, n.codigo);
  };

  useFocusEffect(
    useCallback(() => {
      if (primerEnfoque.current) {
        primerEnfoque.current = false;
        return;
      }
      refrescarAlEnfocar();
    }, [])
  );

  const aplicarLote = async (opcion: OpcionSelector) => {
    setLote(opcion);
    // La nave elegida pertenece al lote anterior: se reinicia (y se descarta
    // cualquier consulta de actividades en curso).
    consultaActual.current++;
    setCargando(false);
    setNave(null);
    setActividades([]);
    setPendientes({});
    setAviso(null);
    setNaves((await obtenerListaNavesSqlite(opcion.codigo)) as IRespuestaObtenerNavesxUsuario[]);
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

  const elegirNave = (opcion: OpcionSelector) => {
    setModal(null);
    if (!lote) return;
    setNave(opcion);
    setAviso(null);
    cargarActividades(lote.codigo, opcion.codigo);
  };

  const valorActual = (a: IdatosActividadesNaves) =>
    pendientes[claveFila(a)] ? estaSeleccionada(pendientes[claveFila(a)]) : estaSeleccionada(a);

  // Guarda en `pendientes` solo lo que difiere de lo que hay en la base.
  const fijarSeleccion = (cambios: { fila: IdatosActividadesNaves; valor: boolean }[]) => {
    setAviso(null);
    setPendientes((prev) => {
      const siguiente = { ...prev };
      for (const { fila, valor } of cambios) {
        const clave = claveFila(fila);
        if (valor === estaSeleccionada(fila)) delete siguiente[clave];
        else siguiente[clave] = { ...fila, seleccionado: valor ? 1 : 0 };
      }
      return siguiente;
    });
  };

  const seleccionadas = actividades.filter(valorActual).length;
  const todasSeleccionadas = actividades.length > 0 && seleccionadas === actividades.length;

  const guardar = async () => {
    if (!lote || ocupado || totalPendientes === 0) return;
    setGuardando(true);
    setAviso(null);
    try {
      const cambios = Object.values(pendientes);
      if (!(await actualizarActEnNave(cambios))) {
        throw new Error("No se pudieron guardar las actividades de la nave.");
      }
      // Solo se quitan los cambios que se guardaron (y que no se volvieron a
      // modificar mientras tanto).
      setPendientes((prev) => {
        const siguiente = { ...prev };
        for (const c of cambios) {
          const clave = claveFila(c);
          if (siguiente[clave]?.seleccionado === c.seleccionado) delete siguiente[clave];
        }
        return siguiente;
      });
      if (nave) await cargarActividades(lote.codigo, nave.codigo);
      const navesAfectadas = new Set(cambios.map((c) => c.cod_nave)).size;
      setAviso({
        tipo: "ok",
        texto: `Se guardaron ${cambios.length} ${cambios.length === 1 ? "cambio" : "cambios"}${
          navesAfectadas > 1 ? ` en ${navesAfectadas} naves` : ""
        }`
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

  // goBack regresa a la pantalla anterior (Inicio) y dispara la confirmación de
  // cambios sin guardar; navigate("Inicio") abriría otra Inicio encima.
  const regresar = () => navigation.goBack();

  const opcionesLote: OpcionSelector[] = lotes.map((l) => ({ codigo: l.cod_lote, nombre: l.nom_lote }));
  const opcionesNave: OpcionSelector[] = naves.map((n) => ({
    codigo: n.cod_nave,
    nombre: n.Descripcion_nave
  }));

  // Pendientes de otras naves del mismo lote (se guardan junto con esta).
  const pendientesOtrasNaves = Object.values(pendientes).filter(
    (p) => p.cod_nave !== nave?.codigo
  ).length;

  return {
    lote,
    naves,
    nave,
    actividades,
    cargando,
    pendientes,
    guardando,
    aviso,
    modal,
    setModal,
    totalPendientes,
    ocupado,
    elegirLote,
    elegirNave,
    valorActual,
    fijarSeleccion,
    seleccionadas,
    todasSeleccionadas,
    guardar,
    regresar,
    opcionesLote,
    opcionesNave,
    pendientesOtrasNaves
  };
}
