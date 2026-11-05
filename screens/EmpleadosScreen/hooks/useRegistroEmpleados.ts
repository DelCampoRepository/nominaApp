import { Alert, TextInput } from "react-native";
import { useEffect, useRef, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { IRespuestaObtenerNavesxUsuario } from "../../../src/interfaces/IRespuestaObtenerNavesxUsuario";
import { IEmpleadoCapturado } from "../../../src/interfaces/local/IEmpleadoCapturado";
import { obtenerListaLotesxUsuarioSqLite } from "../../../src/services/local/guardarListaDeLotesEnDbLocal";
import { obtenerListaNavesSqlite } from "../../../src/services/local/guardarListaDeNavesEnDbLocal";
import { ConsultarEmpleados } from "../../../src/services/local/guardarListaDeEmpleadosEnDbLocal";
import {
  BuscarEmpleadoPorCodigo,
  GuardarEmpleadosCapturados,
  SeleccionarTodosEmpleadosCapturados
} from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { useUser } from "../../../src/context/userContext";
import { useEmployee } from "../../../src/context/QrContext";
import { OpcionSelector } from "../../../src/components/ModalSelector";
import { Busqueda, LARGO_CODIGO, capitalizar, claveEmpleado } from "../utils";

export type ModalEmpleados = "lote" | "nave" | "empleado" | null;
export type Aviso = { tipo: "ok" | "error"; texto: string } | null;

export default function useRegistroEmpleados(
  navigation: NativeStackNavigationProp<RootStackParamList, "Empleados">
) {
  // Los empleados capturados se quedan en el contexto hasta asentarlos, así no
  // se pierden al cambiar de nave o al ir al escáner.
  const { listaEmpleadosCapturados: porAsentar, setEmpleadosCap } = useUser();
  const { employeeCode, nombreEmpleadoState, clearEmployeeCode, clearNombre } = useEmployee();

  const [lotes, setLotes] = useState<IListaLotesxUsuario[]>([]);
  const [lote, setLote] = useState<OpcionSelector | null>(null);
  const [naves, setNaves] = useState<IRespuestaObtenerNavesxUsuario[]>([]);
  const [nave, setNave] = useState<OpcionSelector | null>(null);
  const [catalogo, setCatalogo] = useState<OpcionSelector[]>([]);
  // Empleados ya asentados hoy en la nave elegida.
  const [asentados, setAsentados] = useState<IEmpleadoCapturado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [busqueda, setBusqueda] = useState<Busqueda>({ estado: "vacio" });
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [modal, setModal] = useState<ModalEmpleados>(null);

  const inputRef = useRef<TextInput>(null);
  const porAsentarRef = useRef(porAsentar);
  porAsentarRef.current = porAsentar;

  const listo = !!lote && !!nave;
  const hoy = obtenerFecha();

  useEffect(() => {
    obtenerListaLotesxUsuarioSqLite().then(setLotes);
    ConsultarEmpleados().then((lista: any[]) =>
      setCatalogo(
        (lista ?? []).map((e) => ({ codigo: String(e.cod_empleado), nombre: capitalizar(e.Nom_empleado) }))
      )
    );
    // Un código escaneado en otra pantalla no debe agregarse aquí.
    clearEmployeeCode();
    clearNombre();
    return () => {
      clearEmployeeCode();
      clearNombre();
    };
  }, []);

  // Salir con empleados sin asentar: siguen en memoria mientras la app esté
  // abierta, pero se pierden al cerrarla, así que se avisa.
  useEffect(() => {
    const quitar = navigation.addListener("beforeRemove", (e) => {
      const pendientes = porAsentarRef.current.length;
      if (pendientes === 0) return;
      e.preventDefault();
      Alert.alert(
        "Empleados sin asentar",
        `Hay ${pendientes} ${pendientes === 1 ? "empleado" : "empleados"} sin asentar. Se conservan mientras la app siga abierta, pero se perderán si la cierra.`,
        [
          { text: "Quedarme", style: "cancel" },
          { text: "Salir", style: "destructive", onPress: () => navigation.dispatch(e.data.action) }
        ]
      );
    });
    return quitar;
  }, [navigation]);

  const consultaActual = useRef(0);
  const cargarAsentados = async (codLote: string, codNave: string) => {
    const id = ++consultaActual.current;
    setCargando(true);
    try {
      const todos = await SeleccionarTodosEmpleadosCapturados();
      if (id !== consultaActual.current) return;
      setAsentados(
        todos.filter(
          (e) =>
            String(e.cod_lote) === codLote &&
            String(e.cod_nave) === codNave &&
            e.FechaRegistro === obtenerFecha()
        )
      );
    } finally {
      if (id === consultaActual.current) setCargando(false);
    }
  };

  const elegirLote = async (opcion: OpcionSelector) => {
    setModal(null);
    if (opcion.codigo === lote?.codigo) return;
    setLote(opcion);
    setNave(null);
    setAsentados([]);
    setAviso(null);
    consultaActual.current++;
    setCargando(false);
    setNaves((await obtenerListaNavesSqlite(opcion.codigo)) as IRespuestaObtenerNavesxUsuario[]);
  };

  const elegirNave = (opcion: OpcionSelector) => {
    setModal(null);
    if (!lote) return;
    setNave(opcion);
    setAviso(null);
    cargarAsentados(lote.codigo, opcion.codigo);
  };

  // Busca el nombre en cuanto el código tiene 6 dígitos.
  useEffect(() => {
    if (codigo.length !== LARGO_CODIGO) {
      setBusqueda({ estado: "vacio" });
      return;
    }
    let vigente = true;
    setBusqueda({ estado: "buscando" });
    BuscarEmpleadoPorCodigo(codigo).then((res) => {
      if (!vigente) return;
      setBusqueda(
        res.length > 0
          ? { estado: "encontrado", codigo, nombre: capitalizar(res[0].Nom_empleado) }
          : { estado: "noEncontrado", codigo }
      );
    });
    return () => {
      vigente = false;
    };
  }, [codigo]);

  const agregar = async (codEmpleado: string, nombre: string) => {
    if (!lote || !nave) {
      setAviso({ tipo: "error", texto: "Primero elige el lote y la nave." });
      return false;
    }
    let semana: string;
    try {
      semana = String(await ConsultarSemanaActiva());
    } catch {
      setAviso({ tipo: "error", texto: "No hay semana activa. Sincroniza los datos e intenta de nuevo." });
      return false;
    }
    const nuevo: IEmpleadoCapturado = {
      cod_empleado: codEmpleado,
      Nom_empleado: nombre,
      cod_lote: lote.codigo,
      cod_nave: nave.codigo,
      FechaRegistro: obtenerFecha(),
      semana
    };
    const clave = claveEmpleado(nuevo);
    const yaEsta =
      porAsentarRef.current.some((e) => claveEmpleado(e) === clave) ||
      asentados.some((e) => claveEmpleado(e) === clave);
    if (yaEsta) {
      setAviso({ tipo: "error", texto: `${nombre} (${codEmpleado}) ya está en la nave ${nave.codigo}.` });
      return false;
    }
    setEmpleadosCap((prev) => (prev.some((e) => claveEmpleado(e) === clave) ? prev : [...prev, nuevo]));
    setAviso({ tipo: "ok", texto: `${nombre} agregado. Falta asentarlo.` });
    return true;
  };

  const agregarCodigoEscrito = async () => {
    if (busqueda.estado !== "encontrado" || guardando) return;
    if (await agregar(busqueda.codigo, busqueda.nombre)) {
      setCodigo("");
      inputRef.current?.focus();
    }
  };

  // Escaneo QR: QrScannerScreen deja el código y el nombre en QrContext y
  // regresa; solo se toma si el escaneo se abrió desde aquí.
  const esperandoQr = useRef(false);
  const escanear = () => {
    clearEmployeeCode();
    clearNombre();
    esperandoQr.current = true;
    navigation.navigate("Escaner");
  };
  useEffect(() => {
    if (!esperandoQr.current || !employeeCode || !nombreEmpleadoState) return;
    esperandoQr.current = false;
    agregar(employeeCode, capitalizar(nombreEmpleadoState));
    clearEmployeeCode();
    clearNombre();
  }, [employeeCode, nombreEmpleadoState]);

  const quitar = (empleado: IEmpleadoCapturado) => {
    const clave = claveEmpleado(empleado);
    setEmpleadosCap((prev) => prev.filter((e) => claveEmpleado(e) !== clave));
    setAviso(null);
  };

  const asentar = async () => {
    const lista = porAsentarRef.current;
    if (guardando || lista.length === 0) return;
    setGuardando(true);
    setAviso(null);
    try {
      if (!(await GuardarEmpleadosCapturados(lista))) {
        throw new Error("No se pudieron asentar los empleados. Intente de nuevo.");
      }
      // Solo se quitan los que se guardaron (pudieron agregarse otros mientras).
      const guardados = new Set(lista.map(claveEmpleado));
      setEmpleadosCap((prev) => prev.filter((e) => !guardados.has(claveEmpleado(e))));
      if (lote && nave) await cargarAsentados(lote.codigo, nave.codigo);
      setAviso({
        tipo: "ok",
        texto: `Se ${lista.length === 1 ? "asentó 1 empleado" : `asentaron ${lista.length} empleados`}.`
      });
    } catch (e: any) {
      setAviso({ tipo: "error", texto: String(e?.message || "Ocurrió un error al asentar.") });
    } finally {
      setGuardando(false);
    }
  };

  const opcionesLote: OpcionSelector[] = lotes.map((l) => ({ codigo: l.cod_lote, nombre: l.nom_lote }));
  const opcionesNave: OpcionSelector[] = naves.map((n) => ({
    codigo: n.cod_nave,
    nombre: n.Descripcion_nave
  }));

  const porAsentarNave = listo
    ? porAsentar.filter(
        (e) =>
          String(e.cod_lote) === lote!.codigo && String(e.cod_nave) === nave!.codigo && e.FechaRegistro === hoy
      )
    : [];
  const porAsentarOtras = porAsentar.length - porAsentarNave.length;
  const totalNave = porAsentarNave.length + asentados.length;

  return {
    porAsentar,
    lote,
    nave,
    naves,
    catalogo,
    asentados,
    cargando,
    codigo,
    setCodigo,
    busqueda,
    guardando,
    aviso,
    modal,
    setModal,
    inputRef,
    elegirLote,
    elegirNave,
    agregar,
    agregarCodigoEscrito,
    escanear,
    quitar,
    asentar,
    opcionesLote,
    opcionesNave,
    porAsentarNave,
    porAsentarOtras,
    totalNave
  };
}
