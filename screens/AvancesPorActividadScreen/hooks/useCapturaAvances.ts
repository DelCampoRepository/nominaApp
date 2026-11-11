import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { IAvanceEmpleado } from "../../../src/interfaces/local/IAvanceEmpleado";
import { ActualizarAvances, SeleccionarEmpleadosCapturados } from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { useEmployee } from "../../../src/context/QrContext";
import { calcularJornales } from "../utils";

type Navegacion = NativeStackNavigationProp<RootStackParamList, "AvancesxActividad">;
type Parametros = RootStackParamList["AvancesxActividad"];

// Edición abierta: un empleado o todos (avance general).
export type Edicion = { tipo: "empleado"; empleado: IAvanceEmpleado } | { tipo: "general" } | null;

export function useCapturaAvances(navigation: Navegacion, p: Parametros) {
  const { clearEmployeeCode, clearNombre } = useEmployee();

  const [empleados, setEmpleados] = useState<IAvanceEmpleado[]>([]);
  // Avance guardado en la base por empleado, para saber qué cambió.
  const [guardados, setGuardados] = useState<Record<string, number>>({});
  const [semana, setSemana] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [edicion, setEdicion] = useState<Edicion>(null);

  const modificado = (e: IAvanceEmpleado) => Number(e.avanceA || 0) !== (guardados[e.cod_empleado] ?? 0);
  const pendientes = empleados.filter(modificado).length;
  const pendientesRef = useRef(pendientes);
  pendientesRef.current = pendientes;

  const cargar = async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const semanaActiva = String(await ConsultarSemanaActiva());
      const fecha = obtenerFecha();
      const lista = await SeleccionarEmpleadosCapturados(p.lote, p.codNave, fecha, semanaActiva, p.coAct, p.codAv);
      const filas: IAvanceEmpleado[] = lista.map((emp: any) => ({
        cod_lote: p.lote,
        cod_nave: p.codNave,
        desc_nave: p.desNave,
        cod_actividad: p.coAct,
        cod_avance: p.codAv,
        des_actividad: p.nomAct,
        cod_empleado: emp.cod_empleado,
        nom_empleado: emp.nom_empleado,
        avance: String(emp.avance),
        avanceA: String(emp.avanceA),
        fecha,
        semanaActiva: emp.semana,
        fechaRegistro: emp.fechaRegistro ?? null
      })) as IAvanceEmpleado[];
      setSemana(semanaActiva);
      setEmpleados(filas);
      setGuardados(Object.fromEntries(filas.map((f) => [f.cod_empleado, Number(f.avanceA || 0)])));
    } catch {
      setErrorCarga("No se pudieron consultar los empleados. Verifica que haya semana activa e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // Igual que el Header anterior: se limpia el empleado escaneado al salir.
    return () => {
      clearEmployeeCode();
      clearNombre();
    };
  }, []);

  // Los avances capturados viven solo en este estado hasta presionar Guardar:
  // al salir (flecha del encabezado o botón atrás de Android) se pide
  // confirmación para no perderlos.
  useEffect(() => {
    const quitar = navigation.addListener("beforeRemove", (e) => {
      if (pendientesRef.current === 0) return;
      e.preventDefault();
      Alert.alert("Avances sin guardar", "Si sale ahora se perderán los avances que no ha guardado.", [
        { text: "Seguir capturando", style: "cancel" },
        { text: "Salir sin guardar", style: "destructive", onPress: () => navigation.dispatch(e.data.action) }
      ]);
    });
    return quitar;
  }, [navigation]);

  const asignar = (valor: number) => {
    if (!edicion) return;
    const texto = String(valor);
    const codigo = edicion.tipo === "empleado" ? edicion.empleado.cod_empleado : null;
    setEmpleados((prev) =>
      prev.map((e) =>
        codigo === null || e.cod_empleado === codigo
          ? { ...e, avance: texto, avanceA: texto, semanaActiva: semana }
          : e
      )
    );
    setEdicion(null);
    setAviso(null);
  };

  const guardar = async () => {
    if (guardando || pendientes === 0) return;
    setGuardando(true);
    setAviso(null);
    const enviados = empleados;
    try {
      if (!(await ActualizarAvances(enviados))) throw new Error();
      // Lo enviado pasa a ser lo guardado; si algo se editó mientras tanto,
      // sigue marcado como pendiente.
      setGuardados((prev) => ({
        ...prev,
        ...Object.fromEntries(enviados.map((e) => [e.cod_empleado, Number(e.avanceA || 0)]))
      }));
      setAviso({ tipo: "ok", texto: "Se guardaron los avances." });
    } catch {
      setAviso({ tipo: "error", texto: "No se pudieron guardar los avances. Intente de nuevo." });
    } finally {
      setGuardando(false);
    }
  };

  const totalAvance = empleados.reduce((s, e) => s + Number(e.avanceA || 0), 0);
  const totalJornales = calcularJornales(totalAvance, p.rendApli);
  const conAvance = empleados.filter((e) => Number(e.avanceA || 0) !== 0).length;

  return {
    empleados,
    cargando,
    errorCarga,
    guardando,
    aviso,
    edicion,
    setEdicion,
    pendientes,
    modificado,
    totalAvance,
    totalJornales,
    conAvance,
    asignar,
    guardar,
    reintentar: cargar
  };
}
