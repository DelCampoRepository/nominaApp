import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Image,
  TextInput,
  ImageSourcePropType
} from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import React, { useEffect, useRef, useState } from "react";
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
import ModalSelector, { OpcionSelector } from "../../../src/components/ModalSelector";
import {
  COLORES,
  EncabezadoVerde,
  TarjetaSelectores,
  SelectorPaso,
  AvisoResultado,
  EstadoVacio
} from "../../../src/components/PantallaSeleccion";

type Props = NativeStackScreenProps<RootStackParamList, "Empleados">;

const ICONO_LOTE = require("../../../assets/land-plots.png");
const ICONO_NAVE = require("../../../assets/hoop-house.png");
const ICONO_EMPLEADO = require("../../../assets/account.png");
const ICONO_BUSCAR = require("../../../assets/account-search.png");
const ICONO_QR = require("../../../assets/qrcode-scan.png");
const ICONO_QUITAR = require("../../../assets/close.png");
const ICONO_ASENTADO = require("../../../assets/check-bold.png");

const LARGO_CODIGO = 6;

const capitalizar = (texto: string) =>
  (texto ?? "")
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase());

// Un empleado se asigna una sola vez por lote + nave + día.
const claveEmpleado = (e: IEmpleadoCapturado) =>
  `${e.cod_empleado}|${e.cod_lote}|${e.cod_nave}|${e.FechaRegistro}`;

type Busqueda =
  | { estado: "vacio" }
  | { estado: "buscando" }
  | { estado: "encontrado"; codigo: string; nombre: string }
  | { estado: "noEncontrado"; codigo: string };

export default function EmpleadosScreen({ navigation }: Props) {
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
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [modal, setModal] = useState<"lote" | "nave" | "empleado" | null>(null);

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

  const renderAgregar = () => (
    <View style={styles.tarjeta}>
      <Text style={styles.tituloTarjeta}>Agregar empleado</Text>
      <View style={styles.filaAgregar}>
        <TextInput
          ref={inputRef}
          value={codigo}
          onChangeText={(t) => setCodigo(t.replace(/\D/g, ""))}
          onSubmitEditing={agregarCodigoEscrito}
          placeholder="Código (6 dígitos)"
          placeholderTextColor={COLORES.textoSuave}
          keyboardType="number-pad"
          maxLength={LARGO_CODIGO}
          style={styles.inputCodigo}
          returnKeyType="done"
        />
        <BotonIcono icono={ICONO_BUSCAR} onPress={() => setModal("empleado")} />
        <BotonIcono icono={ICONO_QR} onPress={escanear} />
      </View>

      {busqueda.estado === "buscando" && (
        <ActivityIndicator style={{ marginTop: 12 }} color={COLORES.verde} />
      )}
      {busqueda.estado === "noEncontrado" && (
        <Text style={styles.textoNoEncontrado}>
          No se encontró el empleado {busqueda.codigo}. Verifica el código o sincroniza Empleados.
        </Text>
      )}
      {busqueda.estado === "encontrado" && (
        <View style={styles.resultado}>
          <View style={styles.circuloEmpleado}>
            <Image source={ICONO_EMPLEADO} style={styles.iconoEmpleado} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.codigoEmpleado}>{busqueda.codigo}</Text>
            <Text style={styles.nombreEmpleado} numberOfLines={2}>
              {busqueda.nombre}
            </Text>
          </View>
          <Button
            mode="contained"
            buttonColor={COLORES.verdeOscuro}
            style={{ borderRadius: 12 }}
            onPress={agregarCodigoEscrito}
            disabled={guardando}
          >
            Agregar
          </Button>
        </View>
      )}
    </View>
  );

  const renderContenido = () => {
    if (!lote) {
      return (
        <EstadoVacio
          icono={ICONO_LOTE}
          titulo="Selecciona un lote"
          texto="Elige el lote y la nave donde trabajarán los empleados hoy."
        />
      );
    }
    if (naves.length === 0) {
      return (
        <EstadoVacio
          icono={ICONO_NAVE}
          titulo="Este lote no tiene naves"
          texto="Sincroniza Naves desde la pantalla Sincronizar e intenta de nuevo."
        />
      );
    }
    if (!nave) {
      return (
        <EstadoVacio
          icono={ICONO_NAVE}
          titulo="Selecciona una nave"
          texto="Elige una nave para agregar a sus empleados."
        />
      );
    }
    return (
      <>
        {renderAgregar()}
        <View style={styles.filaSeccion}>
          <Text style={styles.tituloSeccion}>Empleados en la nave · {totalNave}</Text>
          {porAsentarNave.length > 0 && (
            <Text style={styles.notaSeccion}>{porAsentarNave.length} sin asentar</Text>
          )}
        </View>
        {cargando ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={COLORES.verde} />
        ) : totalNave === 0 ? (
          <EstadoVacio
            icono={ICONO_EMPLEADO}
            titulo="Sin empleados todavía"
            texto="Escribe el código, búscalo por nombre o escanea su credencial."
          />
        ) : (
          <>
            {porAsentarNave.map((e) => (
              <FilaEmpleado
                key={claveEmpleado(e)}
                empleado={e}
                asentado={false}
                deshabilitado={guardando}
                onQuitar={() => quitar(e)}
              />
            ))}
            {asentados.map((e) => (
              <FilaEmpleado key={claveEmpleado(e)} empleado={e} asentado />
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Registro de empleados"
        subtitulo="Asigna los empleados de cada nave para hoy"
        onRegresar={() => navigation.goBack()}
      />

      <TarjetaSelectores>
        <SelectorPaso
          paso="1"
          etiqueta="Lote"
          icono={ICONO_LOTE}
          valor={lote}
          placeholder="Seleccionar lote"
          deshabilitado={guardando}
          onPress={() => setModal("lote")}
        />
        <SelectorPaso
          paso="2"
          etiqueta="Nave"
          icono={ICONO_NAVE}
          valor={nave}
          placeholder={lote ? "Seleccionar nave" : "Primero elige un lote"}
          deshabilitado={guardando || !lote || naves.length === 0}
          onPress={() => setModal("nave")}
        />
      </TarjetaSelectores>

      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {aviso && <AvisoResultado tipo={aviso.tipo} texto={aviso.texto} />}
        {renderContenido()}
      </ScrollView>

      {porAsentar.length > 0 && (
        <View style={styles.pie}>
          {porAsentarOtras > 0 && (
            <Text style={styles.notaPie}>
              Incluye {porAsentarOtras} {porAsentarOtras === 1 ? "empleado" : "empleados"} de otras naves
            </Text>
          )}
          <Button
            mode="contained"
            buttonColor={COLORES.verdeOscuro}
            style={styles.botonPrincipal}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: "700" }}
            loading={guardando}
            disabled={guardando}
            onPress={asentar}
          >
            {guardando ? "Asentando…" : `Asentar empleados (${porAsentar.length})`}
          </Button>
        </View>
      )}

      <ModalSelector
        visible={modal === "lote"}
        titulo="Selecciona un lote"
        icono={ICONO_LOTE}
        opciones={opcionesLote}
        seleccionado={lote?.codigo}
        onSeleccionar={elegirLote}
        onCerrar={() => setModal(null)}
      />
      <ModalSelector
        visible={modal === "nave"}
        titulo="Selecciona una nave"
        icono={ICONO_NAVE}
        opciones={opcionesNave}
        seleccionado={nave?.codigo}
        onSeleccionar={elegirNave}
        onCerrar={() => setModal(null)}
      />
      <ModalSelector
        visible={modal === "empleado"}
        titulo="Buscar empleado"
        icono={ICONO_EMPLEADO}
        opciones={catalogo}
        onSeleccionar={(o) => {
          setModal(null);
          agregar(o.codigo, o.nombre);
        }}
        onCerrar={() => setModal(null)}
      />
    </SafeAreaView>
  );
}

function BotonIcono({ icono, onPress }: { icono: ImageSourcePropType; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.botonIcono, pressed && { opacity: 0.7 }]}
    >
      <Image source={icono} style={styles.iconoBoton} />
    </Pressable>
  );
}

function FilaEmpleado({
  empleado,
  asentado,
  deshabilitado,
  onQuitar
}: {
  empleado: IEmpleadoCapturado;
  asentado: boolean;
  deshabilitado?: boolean;
  onQuitar?: () => void;
}) {
  return (
    <View style={[styles.fila, !asentado && styles.filaPendiente]}>
      <View style={styles.circuloEmpleado}>
        <Image source={ICONO_EMPLEADO} style={styles.iconoEmpleado} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.codigoEmpleado}>{empleado.cod_empleado}</Text>
        <Text style={styles.nombreEmpleado} numberOfLines={2}>
          {capitalizar(empleado.Nom_empleado)}
        </Text>
        <View style={[styles.etiqueta, asentado ? styles.etiquetaOk : styles.etiquetaPendiente]}>
          {asentado && <Image source={ICONO_ASENTADO} style={styles.iconoEtiqueta} />}
          <Text style={[styles.textoEtiqueta, { color: asentado ? COLORES.verdeOscuro : "#b45309" }]}>
            {asentado ? "Asentado" : "Sin asentar"}
          </Text>
        </View>
      </View>
      {!asentado && onQuitar && (
        <Pressable
          onPress={onQuitar}
          disabled={deshabilitado}
          hitSlop={8}
          style={({ pressed }) => [styles.botonQuitar, (pressed || deshabilitado) && { opacity: 0.5 }]}
        >
          <Image source={ICONO_QUITAR} style={styles.iconoQuitar} />
        </Pressable>
      )}
    </View>
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
  contenido: {
    padding: 16,
    paddingBottom: 24
  },
  tarjeta: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    padding: 14,
    ...sombra
  },
  tituloTarjeta: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10
  },
  filaAgregar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  inputCodigo: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORES.grisSuave,
    paddingHorizontal: 14,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 2,
    color: COLORES.texto
  },
  botonIcono: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center"
  },
  iconoBoton: {
    width: 24,
    height: 24,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  },
  textoNoEncontrado: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: COLORES.error
  },
  resultado: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#f7fdf9",
    borderWidth: 1,
    borderColor: COLORES.verdeSuave
  },
  filaSeccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  notaSeccion: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b45309"
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
    ...sombra
  },
  filaPendiente: {
    borderColor: "#fcd9a8"
  },
  circuloEmpleado: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  iconoEmpleado: {
    width: 22,
    height: 22,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  },
  codigoEmpleado: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.textoSuave
  },
  nombreEmpleado: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES.texto,
    marginTop: 1
  },
  etiqueta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6
  },
  etiquetaOk: {
    backgroundColor: COLORES.verdeSuave
  },
  etiquetaPendiente: {
    backgroundColor: "#fef3e2"
  },
  iconoEtiqueta: {
    width: 12,
    height: 12,
    tintColor: COLORES.verdeOscuro,
    marginRight: 4,
    resizeMode: "contain"
  },
  textoEtiqueta: {
    fontSize: 11,
    fontWeight: "700"
  },
  botonQuitar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.errorSuave,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8
  },
  iconoQuitar: {
    width: 16,
    height: 16,
    tintColor: COLORES.error,
    resizeMode: "contain"
  },
  pie: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: COLORES.fondo
  },
  notaPie: {
    fontSize: 12,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginBottom: 6
  },
  botonPrincipal: {
    borderRadius: 14
  }
});
