import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Button } from "react-native-paper";
import { COLORES } from "../../../src/components/PantallaSeleccion";

type Props = {
  totalPendientes: number;
  pendientesOtrasNaves: number;
  guardando: boolean;
  ocupado: boolean;
  onGuardar: () => void;
};

// Pie con el botón "Guardar cambios"; solo se muestra si hay pendientes.
export default function PieGuardar({
  totalPendientes,
  pendientesOtrasNaves,
  guardando,
  ocupado,
  onGuardar
}: Props) {
  return (
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
        disabled={ocupado}
        onPress={onGuardar}
      >
        {guardando ? "Guardando…" : `Guardar cambios (${totalPendientes})`}
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
