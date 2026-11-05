import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ProgressBar } from "react-native-paper";
import { COLORES, PASOS } from "../utils";

type Props = {
  progreso: number;
  terminados: number;
  conError: number;
};

export default function TarjetaProgreso({ progreso, terminados, conError }: Props) {
  return (
    <View style={styles.tarjetaProgreso}>
      <View style={styles.filaProgreso}>
        <Text style={styles.porcentaje}>{Math.round(progreso * 100)}%</Text>
        <Text style={styles.textoSuave}>
          {terminados} de {PASOS.length} pasos
          {conError > 0 ? ` · ${conError} con error` : ""}
        </Text>
      </View>
      <ProgressBar
        progress={progreso}
        color={conError > 0 ? COLORES.error : COLORES.verdeBarra}
        style={styles.barra}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjetaProgreso: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  filaProgreso: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10
  },
  porcentaje: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORES.verdeOscuro
  },
  textoSuave: {
    fontSize: 13,
    color: COLORES.textoSuave
  },
  barra: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORES.gris
  }
});
