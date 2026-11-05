import { StyleSheet, View, Text } from "react-native";
import { Button } from "react-native-paper";
import React from "react";
import { COLORES } from "../../../src/components/PantallaSeleccion";

type Props = {
  totalPorAsentar: number;
  porAsentarOtras: number;
  guardando: boolean;
  onAsentar: () => void;
};

export default function PieAsentar({ totalPorAsentar, porAsentarOtras, guardando, onAsentar }: Props) {
  return (
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
        onPress={onAsentar}
      >
        {guardando ? "Asentando…" : `Asentar empleados (${totalPorAsentar})`}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
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
