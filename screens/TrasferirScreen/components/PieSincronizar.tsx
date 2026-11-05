import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { COLORES } from "../utils";

type Props = {
  sincronizando: boolean;
  seleccionadas: number;
  onSincronizar: () => void;
};

export default function PieSincronizar({ sincronizando, seleccionadas, onSincronizar }: Props) {
  return (
    <View style={styles.pie}>
      <Button
        mode="contained"
        buttonColor={COLORES.verdeOscuro}
        style={styles.botonPrincipal}
        contentStyle={{ height: 50 }}
        labelStyle={{ fontSize: 16, fontWeight: "700" }}
        icon={sincronizando ? undefined : require("../../../assets/sync.png")}
        loading={sincronizando}
        disabled={sincronizando || seleccionadas === 0}
        onPress={onSincronizar}
      >
        {sincronizando
          ? "Sincronizando…"
          : seleccionadas === 0
            ? "Seleccione una opción"
            : `Sincronizar (${seleccionadas})`}
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
