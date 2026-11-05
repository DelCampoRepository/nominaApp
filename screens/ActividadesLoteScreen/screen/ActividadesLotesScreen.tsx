import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Alert
} from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
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
import ModalSelector, { OpcionSelector } from "../components/ModalSelector";
import FilaAvance from "../components/FilaAvance";

type Props = NativeStackScreenProps<RootStackParamList, "ActividadesLote">;

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

const ICONO_LOTE = require("../../../assets/land-plots.png");
const ICONO_ACTIVIDAD = require("../../../assets/sprout.png");

const claveAvance = (a: ISecundaryActividades) => `${a.cod_actividad}|${a.cod_avance}`;
const estaSeleccionado = (a: ISecundaryActividades) => Number(a.selecionado) === 1;

export default function ActividadesLoteScreen({ navigation }: Props) {
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
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
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
  const fijarSeleccion = (cambios: { avance: ISecundaryActividades; valor: boolean }[]) => {
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

  // popTo regresa a la Inicio existente (navigate abriría una nueva encima, sin
  // quitar esta pantalla ni disparar la confirmación de cambios sin guardar).
  const regresar = () => navigation.popTo("Inicio");

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

  const renderContenido = () => {
    if (!lote) {
      return (
        <EstadoVacio
          icono={ICONO_LOTE}
          titulo="Selecciona un lote"
          texto="Elige el lote para ver sus actividades y marcar las que se trabajarán."
        />
      );
    }
    if (actividades.length === 0) {
      return (
        <EstadoVacio
          icono={ICONO_ACTIVIDAD}
          titulo="Este lote no tiene actividades"
          texto="Sincroniza Actividades desde la pantalla Sincronizar e intenta de nuevo."
        />
      );
    }
    if (!actividad) {
      return (
        <EstadoVacio
          icono={ICONO_ACTIVIDAD}
          titulo="Selecciona una actividad"
          texto="Elige una actividad para ver sus avances."
        />
      );
    }
    if (cargandoAvances) {
      return <ActivityIndicator style={{ marginTop: 40 }} color={COLORES.verde} />;
    }
    if (avances.length === 0) {
      return (
        <EstadoVacio
          icono={ICONO_ACTIVIDAD}
          titulo="Sin avances"
          texto="Esta actividad no tiene avances registrados para el lote."
        />
      );
    }
    return (
      <>
        <View style={styles.filaSeccion}>
          <Text style={styles.tituloSeccion}>
            Avances · {seleccionadosActividad} de {avances.length}
          </Text>
          <Pressable
            hitSlop={8}
            disabled={guardando}
            onPress={() =>
              fijarSeleccion(avances.map((a) => ({ avance: a, valor: !todosSeleccionados })))
            }
          >
            <Text style={[styles.enlace, guardando && { opacity: 0.4 }]}>
              {todosSeleccionados ? "Quitar todo" : "Seleccionar todo"}
            </Text>
          </Pressable>
        </View>
        {avances.map((a) => (
          <FilaAvance
            key={claveAvance(a)}
            avance={a}
            seleccionado={valorActual(a)}
            modificado={!!pendientes[claveAvance(a)]}
            deshabilitado={guardando}
            onPress={() => fijarSeleccion([{ avance: a, valor: !valorActual(a) }])}
          />
        ))}
      </>
    );
  };

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
              <Image source={require("../../../assets/arrow-left.png")} style={styles.iconoRegresar} />
            </Pressable>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.titulo}>Actividades en lote</Text>
              <Text style={styles.subtitulo}>Marca las actividades que se trabajarán</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.selectores}>
        <Selector
          paso="1"
          etiqueta="Lote"
          icono={ICONO_LOTE}
          valor={lote}
          placeholder="Seleccionar lote"
          deshabilitado={guardando}
          onPress={() => setModal("lote")}
        />
        <Selector
          paso="2"
          etiqueta="Actividad"
          icono={ICONO_ACTIVIDAD}
          valor={actividad}
          placeholder={lote ? "Seleccionar actividad" : "Primero elige un lote"}
          deshabilitado={guardando || !lote || actividades.length === 0}
          onPress={() => setModal("actividad")}
        />
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {aviso && (
          <View style={[styles.aviso, aviso.tipo === "ok" ? styles.avisoOk : styles.avisoError]}>
            <Image
              source={aviso.tipo === "ok" ? require("../../../assets/check-bold.png") : require("../../../assets/close.png")}
              style={[styles.iconoAviso, { tintColor: aviso.tipo === "ok" ? COLORES.verdeOscuro : COLORES.error }]}
            />
            <Text style={[styles.textoAviso, { color: aviso.tipo === "ok" ? COLORES.verdeOscuro : COLORES.error }]}>
              {aviso.texto}
            </Text>
          </View>
        )}
        {renderContenido()}
      </ScrollView>

      {!!lote && (
        <View style={styles.pie}>
          <Button
            mode="contained"
            buttonColor={COLORES.verdeOscuro}
            style={styles.botonPrincipal}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: "700" }}
            loading={guardando}
            disabled={guardando}
            onPress={guardar}
          >
            {guardando
              ? "Guardando…"
              : totalPendientes > 0
                ? `Guardar cambios (${totalPendientes})`
                : "Guardar"}
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
        visible={modal === "actividad"}
        titulo="Selecciona una actividad"
        icono={ICONO_ACTIVIDAD}
        opciones={opcionesActividad}
        seleccionado={actividad?.codigo}
        onSeleccionar={elegirActividad}
        onCerrar={() => setModal(null)}
      />
    </SafeAreaView>
  );
}

type SelectorProps = {
  paso: string;
  etiqueta: string;
  icono: ImageSourcePropType;
  valor: OpcionSelector | null;
  placeholder: string;
  deshabilitado?: boolean;
  onPress: () => void;
};

function Selector({ paso, etiqueta, icono, valor, placeholder, deshabilitado, onPress }: SelectorProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [
        styles.selector,
        !!valor && styles.selectorElegido,
        deshabilitado && { opacity: 0.5 },
        pressed && { opacity: 0.8 }
      ]}
    >
      <View style={[styles.circuloSelector, { backgroundColor: valor ? COLORES.verdeSuave : COLORES.grisSuave }]}>
        <Image
          source={icono}
          style={[styles.iconoSelector, { tintColor: valor ? COLORES.verdeOscuro : COLORES.textoSuave }]}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.etiquetaSelector}>
          {paso} · {etiqueta}
        </Text>
        <Text style={[styles.valorSelector, !valor && { color: COLORES.textoSuave }]} numberOfLines={1}>
          {valor ? `${valor.codigo} · ${valor.nombre}` : placeholder}
        </Text>
      </View>
      <Image source={require("../../../assets/arrow-left.png")} style={styles.flecha} />
    </Pressable>
  );
}

function EstadoVacio({ icono, titulo, texto }: { icono: ImageSourcePropType; titulo: string; texto: string }) {
  return (
    <View style={styles.vacio}>
      <View style={styles.circuloVacio}>
        <Image source={icono} style={styles.iconoVacio} />
      </View>
      <Text style={styles.tituloVacio}>{titulo}</Text>
      <Text style={styles.textoVacio}>{texto}</Text>
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
  encabezado: {
    paddingHorizontal: 16,
    paddingBottom: 44,
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
  selectores: {
    marginTop: -30,
    marginHorizontal: 16,
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    padding: 8,
    gap: 4,
    ...sombra
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent"
  },
  selectorElegido: {
    backgroundColor: "#f7fdf9"
  },
  circuloSelector: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  iconoSelector: {
    width: 22,
    height: 22,
    resizeMode: "contain"
  },
  etiquetaSelector: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  valorSelector: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES.texto,
    marginTop: 2
  },
  flecha: {
    width: 18,
    height: 18,
    tintColor: COLORES.textoSuave,
    resizeMode: "contain",
    transform: [{ rotate: "180deg" }],
    marginLeft: 8
  },
  contenido: {
    padding: 16,
    paddingBottom: 24
  },
  filaSeccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 10
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  enlace: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.verdeOscuro
  },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
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
  vacio: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24
  },
  circuloVacio: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  iconoVacio: {
    width: 36,
    height: 36,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  },
  tituloVacio: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORES.texto,
    textAlign: "center"
  },
  textoVacio: {
    fontSize: 13,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 4
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
