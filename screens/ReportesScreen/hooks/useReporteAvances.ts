import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { IRespuestaObtenerNavesxUsuario } from "../../../src/interfaces/IRespuestaObtenerNavesxUsuario";
import { IAvanceEmpleado } from "../../../src/interfaces/local/IAvanceEmpleado";
import { obtenerListaLotesxUsuarioSqLite } from "../../../src/services/local/guardarListaDeLotesEnDbLocal";
import { obtenerListaNavesSqlite } from "../../../src/services/local/guardarListaDeNavesEnDbLocal";
import { SeleccionarAvancesEmpleadosASyncronizar } from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { useEmployee } from "../../../src/context/QrContext";
import { OpcionSelector } from "../../../src/components/ModalSelector";
import { SeccionActividad, agruparPorActividad, estadoRegistro } from "../utils";

export function useReporteAvances() {
  const { clearEmployeeCode, clearNombre } = useEmployee();

  const [lotes, setLotes] = useState<IListaLotesxUsuario[]>([]);
  const [lote, setLote] = useState<OpcionSelector | null>(null);
  const [naves, setNaves] = useState<IRespuestaObtenerNavesxUsuario[]>([]);
  const [nave, setNave] = useState<OpcionSelector | null>(null);
  const [registros, setRegistros] = useState<IAvanceEmpleado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
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

  // Solo se aplica la consulta más reciente.
  const consultaActual = useRef(0);
  const cargar = async (codLote: string, codNave: string, modo: "carga" | "refresco" | "silencio" = "carga") => {
    const id = ++consultaActual.current;
    if (modo === "carga") setCargando(true);
    if (modo === "refresco") setRefrescando(true);
    setError(null);
    try {
      const semana = String(await ConsultarSemanaActiva());
      const datos = await SeleccionarAvancesEmpleadosASyncronizar(semana, obtenerFecha());
      if (id !== consultaActual.current) return;
      // Solo los registros de la nave con avance capturado.
      setRegistros(
        datos.filter(
          (r) =>
            r.cod_lote === codLote && r.cod_nave === codNave && +r.avance !== 0 && +r.avanceA !== 0
        )
      );
    } catch {
      if (id !== consultaActual.current) return;
      setRegistros([]);
      setError("No se pudieron consultar los avances. Verifica que haya semana activa e intenta de nuevo.");
    } finally {
      if (id === consultaActual.current) {
        setCargando(false);
        setRefrescando(false);
      }
    }
  };

  // Al volver a la pantalla (p. ej. después de capturar o sincronizar) se
  // actualiza el reporte sin mostrar el indicador de carga.
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
      if (l && n) cargar(l.codigo, n.codigo, "silencio");
    }, [])
  );

  const consultaNaves = useRef(0);
  const elegirLote = async (opcion: OpcionSelector) => {
    setModal(null);
    if (opcion.codigo === lote?.codigo) return;
    setLote(opcion);
    setNave(null);
    setRegistros([]);
    setError(null);
    consultaActual.current++;
    setCargando(false);
    setRefrescando(false);
    const id = ++consultaNaves.current;
    const lista = (await obtenerListaNavesSqlite(opcion.codigo)) as IRespuestaObtenerNavesxUsuario[];
    if (id === consultaNaves.current) setNaves(lista ?? []);
  };

  const elegirNave = (opcion: OpcionSelector) => {
    setModal(null);
    if (!lote) return;
    setNave(opcion);
    cargar(lote.codigo, opcion.codigo);
  };

  const refrescar = () => {
    if (lote && nave) cargar(lote.codigo, nave.codigo, "refresco");
  };

  const secciones: SeccionActividad[] = agruparPorActividad(registros);
  const resumen = {
    registros: registros.length,
    empleados: new Set(registros.map((r) => r.cod_empleado)).size,
    sincronizados: registros.filter((r) => estadoRegistro(r) === "sincronizado").length,
    pendientes: registros.filter((r) => estadoRegistro(r) !== "sincronizado").length
  };

  return {
    lote,
    nave,
    naves,
    secciones,
    resumen,
    cargando,
    refrescando,
    error,
    modal,
    setModal,
    opcionesLote: lotes.map((l) => ({ codigo: l.cod_lote, nombre: l.nom_lote })),
    opcionesNave: naves.map((n) => ({ codigo: n.cod_nave, nombre: n.Descripcion_nave })),
    elegirLote,
    elegirNave,
    refrescar,
    reintentar: () => lote && nave && cargar(lote.codigo, nave.codigo)
  };
}
