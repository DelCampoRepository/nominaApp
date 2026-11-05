import { StyleSheet, View, Text, Pressable } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import React from "react";
import { IMainActividades } from "../../../src/interfaces/local/IMainActividades";
import { ISecundaryActividades } from "../../../src/interfaces/local/ISecundaryActividades";
import { OpcionSelector } from "../../../src/components/ModalSelector";
import FilaSeleccionable from "../../../src/components/FilaSeleccionable";
import { COLORES, EstadoVacio } from "../../../src/components/PantallaSeleccion";
import { ICONO_LOTE, ICONO_ACTIVIDAD, claveAvance } from "../utils";
import { CambioSeleccion } from "../hooks/useActividadesLote";

type Props = {
  lote: OpcionSelector | null;
  actividades: IMainActividades[];
  actividad: OpcionSelector | null;
  cargandoAvances: boolean;
  avances: ISecundaryActividades[];
  pendientes: Record<string, ISecundaryActividades>;
  guardando: boolean;
  seleccionadosActividad: number;
  todosSeleccionados: boolean;
  valorActual: (a: ISecundaryActividades) => boolean;
  fijarSeleccion: (cambios: CambioSeleccion[]) => void;
};

// Contenido bajo los selectores: un estado vacío según lo que falte elegir, o
// la lista de avances de la actividad.
export default function ContenidoAvances({
  lote,
  actividades,
  actividad,
  cargandoAvances,
  avances,
  pendientes,
  guardando,
  seleccionadosActividad,
  todosSeleccionados,
  valorActual,
  fijarSeleccion
}: Props) {
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
}

const styles = StyleSheet.create({
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
  }
});
