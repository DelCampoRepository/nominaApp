import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
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
import ModalSelector, { OpcionSelector } from "../../../src/components/ModalSelector";
import FilaSeleccionable from "../../../src/components/FilaSeleccionable";
import {
  COLORES,
  EncabezadoVerde,
  TarjetaSelectores,
  SelectorPaso,
  AvisoResultado,
  EstadoVacio
} from "../../../src/components/PantallaSeleccion";

type Props = NativeStackScreenProps<RootStackParamList, "ActividadesLote">;

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
          <FilaSeleccionable
            key={claveAvance(a)}
            codigo={`${a.cod_actividad}-${a.cod_avance}`}
            nombre={a.nom_actividad}
            icono={ICONO_ACTIVIDAD}
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
      <EncabezadoVerde
        titulo="Actividades en lote"
        subtitulo="Marca las actividades que se trabajarán"
        onRegresar={regresar}
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
          etiqueta="Actividad"
          icono={ICONO_ACTIVIDAD}
          valor={actividad}
          placeholder={lote ? "Seleccionar actividad" : "Primero elige un lote"}
          deshabilitado={guardando || !lote || actividades.length === 0}
          onPress={() => setModal("actividad")}
        />
      </TarjetaSelectores>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {aviso && <AvisoResultado tipo={aviso.tipo} texto={aviso.texto} />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo
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
