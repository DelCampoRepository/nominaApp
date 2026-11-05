import { StyleSheet, Pressable, Image, ImageSourcePropType } from "react-native";
import React from "react";
import { COLORES } from "../../../src/components/PantallaSeleccion";

export default function BotonIcono({ icono, onPress }: { icono: ImageSourcePropType; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.botonIcono, pressed && { opacity: 0.7 }]}
    >
      <Image source={icono} style={styles.iconoBoton} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botonIcono: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center"
  },
  iconoBoton: {
    width: 24,
    height: 24,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  }
});
