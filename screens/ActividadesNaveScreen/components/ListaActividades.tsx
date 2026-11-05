import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { IdatosActividadesNaves } from "../../../src/interfaces/local/IdatosActNave";
import FilaSeleccionable from "../../../src/components/FilaSeleccionable";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { ICONO_ACTIVIDAD, claveFila } from "../utils";

type Props = {
  actividades: IdatosActividadesNaves[];
  pendientes: Record<string, IdatosActividadesNaves>;
  seleccionadas: number;
  todasSeleccionadas: boolean;
  ocupado: boolean;
  valorActual: (a: IdatosActividadesNaves) => boolean;
  fijarSeleccion: (cambios: { fila: IdatosActividadesNaves; valor: boolean }[]) => void;
};

// Encabezado "Actividades · X de Y" con "Seleccionar todo" y las filas de la nave.
export default function ListaActividades({
  actividades,
  pendientes,
  seleccionadas,
  todasSeleccionadas,
  ocupado,
  valorActual,
  fijarSeleccion
}: Props) {
  return (
    <>
      <View style={styles.filaSeccion}>
        <Text style={styles.tituloSeccion}>
          Actividades · {seleccionadas} de {actividades.length}
        </Text>
        <Pressable
          hitSlop={8}
          disabled={ocupado}
          onPress={() =>
            fijarSeleccion(actividades.map((a) => ({ fila: a, valor: !todasSeleccionadas })))
          }
        >
          <Text style={[styles.enlace, ocupado && { opacity: 0.4 }]}>
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
          deshabilitado={ocupado}
          onPress={() => fijarSeleccion([{ fila: a, valor: !valorActual(a) }])}
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
