import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

type Props = NativeStackScreenProps<RootStackParamList, "ActividadesNave">;

const ICONO_LOTE = require("../../../assets/land-plots.png");
const ICONO_NAVE = require("../../../assets/hoop-house.png");
const ICONO_ACTIVIDAD = require("../../../assets/sprout.png");

// Las filas de actividadesEnNaves se identifican por nave + actividad + avance
// + nombre (son las columnas que usa actualizarActEnNave).
const claveFila = (a: IdatosActividadesNaves) =>
  `${a.cod_nave}|${a.cod_actividad}|${a.cod_avance}|${a.nom_actividad}`;
const estaSeleccionada = (a: IdatosActividadesNaves) => Number(a.seleccionado) === 1;

export default function ActividadesNaveScreen({ navigation }: Props) {
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
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [modal, setModal] = useState<"lote" | "nave" | null>(null);

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
      const datos = await SeleccionarActEnNaves(codLote, codNave, obtenerFecha(), semana);
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
    try {
      const navesConPendientes = [
        ...new Set(Object.values(pendientesRef.current).map((p) => p.cod_nave))
      ];
      if (navesConPendientes.length > 0) {
        const semana = await ConsultarSemanaActiva();
        const fecha = obtenerFecha();
        const existentes = new Set<string>();
        for (const codNave of navesConPendientes) {
          const filas = await SeleccionarActEnNaves(l.codigo, codNave, fecha, semana);
          filas.forEach((f) => existentes.add(claveFila(f)));
        }
        setPendientes((prev) =>
          Object.fromEntries(Object.entries(prev).filter(([clave]) => existentes.has(clave)))
        );
      }
    } catch {
      // Si falla la consulta se conservan los pendientes; al guardar se
      // reporta el error.
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
    if (!lote || guardando || totalPendientes === 0) return;
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

  const renderContenido = () => {
    if (!lote) {
      return (
        <EstadoVacio
          icono={ICONO_LOTE}
          titulo="Selecciona un lote"
          texto="Elige el lote y la nave para marcar las actividades que se trabajarán hoy."
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
          texto="Elige una nave para ver sus actividades del día."
        />
      );
    }
    if (cargando) {
      return <ActivityIndicator style={{ marginTop: 40 }} color={COLORES.verde} />;
    }
    if (actividades.length === 0) {
      return (
        <View>
          <EstadoVacio
            icono={ICONO_ACTIVIDAD}
            titulo="Sin actividades para hoy"
            texto="Las actividades de las naves se crean al guardar en Actividades en lote. Marca las actividades del lote y presiona Guardar."
          />
          <Button
            mode="outlined"
            textColor={COLORES.verdeOscuro}
            style={styles.botonSecundario}
            onPress={() => navigation.navigate("ActividadesLote")}
          >
            Ir a Actividades en lote
          </Button>
        </View>
      );
    }
    return (
      <>
        <View style={styles.filaSeccion}>
          <Text style={styles.tituloSeccion}>
            Actividades · {seleccionadas} de {actividades.length}
          </Text>
          <Pressable
            hitSlop={8}
            disabled={guardando}
            onPress={() =>
              fijarSeleccion(actividades.map((a) => ({ fila: a, valor: !todasSeleccionadas })))
            }
          >
            <Text style={[styles.enlace, guardando && { opacity: 0.4 }]}>
              {todasSeleccionadas ? "Quitar todo" : "Seleccionar todo"}
            </Text>
          </Pressable>
        </View>
        {actividades.map((a) => (
          <FilaSeleccionable
            key={claveFila(a)}
            codigo={`${a.cod_actividad}-${a.cod_avance}`}
            nombre={a.nom_actividad}
            icono={ICONO_ACTIVIDAD}
            seleccionado={valorActual(a)}
            modificado={!!pendientes[claveFila(a)]}
            deshabilitado={guardando}
            onPress={() => fijarSeleccion([{ fila: a, valor: !valorActual(a) }])}
          />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Actividades en nave"
        subtitulo="Marca las actividades de cada nave para hoy"
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
          etiqueta="Nave"
          icono={ICONO_NAVE}
          valor={nave}
          placeholder={lote ? "Seleccionar nave" : "Primero elige un lote"}
          deshabilitado={guardando || !lote || naves.length === 0}
          onPress={() => setModal("nave")}
        />
      </TarjetaSelectores>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {aviso && <AvisoResultado tipo={aviso.tipo} texto={aviso.texto} />}
        {renderContenido()}
      </ScrollView>

      {totalPendientes > 0 && (
        <View style={styles.pie}>
          {pendientesOtrasNaves > 0 && (
            <Text style={styles.notaPie}>
              Incluye {pendientesOtrasNaves} {pendientesOtrasNaves === 1 ? "cambio" : "cambios"} de otras naves
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
            onPress={guardar}
          >
            {guardando ? "Guardando…" : `Guardar cambios (${totalPendientes})`}
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
  botonSecundario: {
    alignSelf: "center",
    borderRadius: 12,
    borderColor: COLORES.verdeOscuro
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
