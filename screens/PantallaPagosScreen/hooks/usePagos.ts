import { useEffect, useRef, useState } from "react";
import { IJefeNave } from "../../../src/interfaces/local/IJefeNave";
import { IAvanceUI } from "../../../src/interfaces/IAvancesNomina";
import { obtenerJefesNave } from "../../../src/services/ObtenerJefesNave";
import { ObtenerEmpleadosNomina } from "../../../src/services/ObtenerAvanceEmpleados";
import { existeAvanceEnSQLite, insertarAvanceSQLite } from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { avisarSinInternet, esSinInternet, hayInternet } from "../../../src/utils/conexion";
import { useUser } from "../../../src/context/userContext";
import { useEmployee } from "../../../src/context/QrContext";
import { OpcionSelector } from "../../../src/components/ModalSelector";
import { agruparPorNave, claveAvance, estaMarcado, fechaConsulta } from "../utils";

type Aviso = { tipo: "ok" | "error"; texto: string } | null;

export function usePagos() {
  const { iduUsuario } = useUser();
  const { clearEmployeeCode, clearNombre } = useEmployee();

  const [jefes, setJefes] = useState<IJefeNave[]>([]);
  const [cargandoJefes, setCargandoJefes] = useState(true);
  const [errorJefes, setErrorJefes] = useState<string | null>(null);
  const [jefe, setJefe] = useState<OpcionSelector | null>(null);
  // null = aún no se consulta; [] = el servidor no tiene registros.
  const [avances, setAvances] = useState<IAvanceUI[] | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [filtroNave, setFiltroNave] = useState<string | null>(null);
  const [modalJefes, setModalJefes] = useState(false);

  const cargarJefes = async () => {
    setCargandoJefes(true);
    setErrorJefes(null);
    try {
      if (!(await hayInternet())) {
        avisarSinInternet();
        setErrorJefes("Sin conexión a internet. Conéctate para consultar los jefes de nave.");
        return;
      }
      const resp = await obtenerJefesNave({ idu_usuario: String(iduUsuario) });
      const lista = resp?.jefesDeNave ?? [];
      setJefes(lista);
      if (lista.length === 0) {
        setErrorJefes(
          resp?.success === false
            ? "No se pudo obtener la lista de jefes de nave. Intenta de nuevo."
            : "No hay jefes de nave para este usuario."
        );
      }
    } finally {
      setCargandoJefes(false);
    }
  };

  useEffect(() => {
    cargarJefes();
    // Igual que el Header anterior: se limpia el empleado escaneado al salir.
    return () => {
      clearEmployeeCode();
      clearNombre();
    };
  }, []);

  // Solo se aplica la consulta más reciente (si se cambia de jefe rápido).
  const consultaActual = useRef(0);
  const consultar = async (codJefe: string) => {
    const id = ++consultaActual.current;
    setAviso(null);
    setFiltroNave(null);
    // Se avisa aquí para no mostrar además el error genérico del catch.
    if (!(await hayInternet())) {
      avisarSinInternet();
      if (id === consultaActual.current) {
        setAviso({ tipo: "error", texto: "Sin conexión a internet. Conéctate e intenta de nuevo." });
      }
      return;
    }
    setConsultando(true);
    try {
      const semana = String(await ConsultarSemanaActiva());
      const resp = await ObtenerEmpleadosNomina({ cod_jefe_nave: codJefe, fecha: fechaConsulta() });
      // Un error del servidor (500, 401…) también llega con la lista vacía: no
      // debe confundirse con "no hay registros hoy".
      if (resp?.success === false) throw new Error(resp.mensaje);
      const lista = resp?.avances ?? [];
      // Se marca cuáles ya están guardados en el teléfono (mismo avance).
      const conEstado: IAvanceUI[] = [];
      for (const a of lista) {
        const existe = await existeAvanceEnSQLite(a, semana);
        conEstado.push({ ...(a as IAvanceUI), existeEnSqlite: !!existe });
      }
      if (id !== consultaActual.current) return;
      setAvances(conEstado);
    } catch (e) {
      if (id !== consultaActual.current) return;
      setAvances(null);
      if (!esSinInternet(e)) {
        setAviso({ tipo: "error", texto: "Ocurrió un error al obtener los avances. Intenta de nuevo." });
      }
    } finally {
      if (id === consultaActual.current) setConsultando(false);
    }
  };

  const elegirJefe = (opcion: OpcionSelector) => {
    setModalJefes(false);
    setJefe(opcion);
    setAvances(null);
    consultar(opcion.codigo);
  };

  // Lo que se ve según el filtro de nave.
  const visibles = (avances ?? []).filter((a) => !filtroNave || a.Cod_nave === filtroNave);
  const nuevosVisibles = visibles.filter((a) => !a.existeEnSqlite);
  const todosMarcados = nuevosVisibles.length > 0 && nuevosVisibles.every(estaMarcado);

  const fijarMarca = (claves: Set<string>, valor: boolean) =>
    setAvances((prev) =>
      prev
        ? prev.map((a) => (claves.has(claveAvance(a)) && !a.existeEnSqlite ? { ...a, Seleccionado: valor ? 1 : 0 } : a))
        : prev
    );

  const alternar = (a: IAvanceUI) => {
    if (a.existeEnSqlite || guardando) return;
    setAviso(null);
    fijarMarca(new Set([claveAvance(a)]), !estaMarcado(a));
  };

  const alternarTodos = () => {
    if (guardando) return;
    setAviso(null);
    fijarMarca(new Set(nuevosVisibles.map(claveAvance)), !todosMarcados);
  };

  // Solo los marcados que aún no están en el teléfono (antes se guardaba la
  // lista completa y se reiniciaba la sincronización de los ya guardados).
  const porGuardar = (avances ?? []).filter((a) => estaMarcado(a) && !a.existeEnSqlite);

  const guardar = async () => {
    if (guardando || porGuardar.length === 0) return;
    setGuardando(true);
    setAviso(null);
    try {
      const semana = String(await ConsultarSemanaActiva());
      const lista = porGuardar;
      if (!(await insertarAvanceSQLite(lista, semana))) throw new Error();
      const guardados = new Set(lista.map(claveAvance));
      setAvances((prev) =>
        prev ? prev.map((a) => (guardados.has(claveAvance(a)) ? { ...a, existeEnSqlite: true } : a)) : prev
      );
      setAviso({
        tipo: "ok",
        texto: `Se ${lista.length === 1 ? "guardó 1 avance" : `guardaron ${lista.length} avances`} en el teléfono.`
      });
    } catch {
      setAviso({ tipo: "error", texto: "No se pudieron guardar los avances. Intenta de nuevo." });
    } finally {
      setGuardando(false);
    }
  };

  const todos = avances ?? [];
  const resumen = {
    registros: todos.length,
    nuevos: todos.filter((a) => !a.existeEnSqlite).length,
    enTelefono: todos.filter((a) => a.existeEnSqlite).length,
    empleados: new Set(todos.map((a) => a.Cod_empleado)).size
  };
  const naves = agruparPorNave(todos).map((g) => ({ codigo: g.codigo, nombre: g.nombre, cantidad: g.avances.length }));

  return {
    jefes: jefes.map((j) => ({ codigo: j.Cod_jefe_nave, nombre: j.NombreJefeNave })),
    cargandoJefes,
    errorJefes,
    reintentarJefes: cargarJefes,
    jefe,
    elegirJefe,
    modalJefes,
    setModalJefes,
    avances,
    consultando,
    reconsultar: () => jefe && consultar(jefe.codigo),
    grupos: agruparPorNave(visibles),
    naves,
    filtroNave,
    setFiltroNave,
    resumen,
    todosMarcados,
    hayNuevosVisibles: nuevosVisibles.length > 0,
    alternar,
    alternarTodos,
    porGuardar: porGuardar.length,
    guardando,
    guardar,
    aviso
  };
}
