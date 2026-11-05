import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { COLORES } from "../utils";

// Íconos PNG de assets/: las fuentes de íconos (@expo/vector-icons) no se
// muestran en la build de la app.
const ICONO_REINTENTAR = require("../../../assets/sync.png");

type Props = {
  // Texto y acción del botón con contorno (izquierda); el de la derecha
  // siempre es "Reintentar".
  textoSecundario: string;
  onSecundario: () => void;
  onReintentar: () => void;
};

export default function BotonesAccion({ textoSecundario, onSecundario, onReintentar }: Props) {
  return (
    <View style={styles.acciones}>
      <Button mode="outlined" textColor={COLORES.verdeOscuro} style={[styles.boton, styles.botonContorno]} onPress={onSecundario}>
        {textoSecundario}
      </Button>
      <Button mode="contained" buttonColor={COLORES.verdeOscuro} style={styles.boton} icon={ICONO_REINTENTAR} onPress={onReintentar}>
        Reintentar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  acciones: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12
  },
  boton: {
    flex: 1,
    borderRadius: 12
  },
  botonContorno: {
    borderColor: COLORES.verdeOscuro
  }
});
