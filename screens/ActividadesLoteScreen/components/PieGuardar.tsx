import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import React from "react";
import { COLORES } from "../../../src/components/PantallaSeleccion";

type Props = {
  guardando: boolean;
  totalPendientes: number;
  onGuardar: () => void;
};

export default function PieGuardar({ guardando, totalPendientes, onGuardar }: Props) {
  return (
    <View style={styles.pie}>
      <Button
        mode="contained"
        buttonColor={COLORES.verdeOscuro}
        style={styles.botonPrincipal}
        contentStyle={{ height: 50 }}
        labelStyle={{ fontSize: 16, fontWeight: "700" }}
        loading={guardando}
        disabled={guardando}
        onPress={onGuardar}
      >
        {guardando
          ? "Guardando…"
          : totalPendientes > 0
            ? `Guardar cambios (${totalPendientes})`
            : "Guardar"}
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
  botonPrincipal: {
    borderRadius: 14
  }
});
