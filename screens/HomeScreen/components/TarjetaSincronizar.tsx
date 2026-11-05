import { StyleSheet, View, Text, Image, Pressable } from "react-native";
import { COLORES } from "../utils";

type Props = {
  textoAvances: string;
  onPress: () => void;
};

export function TarjetaSincronizar({ textoAvances, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tarjetaSincronizar, pressed && styles.presionada]}
    >
      <View style={styles.iconoSincronizar}>
        <Image source={require("../../../assets/syncw.png")} style={styles.imagenSincronizar} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tituloSincronizar}>Sincronizar</Text>
        <Text style={styles.textoSincronizar}>{textoAvances}</Text>
      </View>
      <Image
        source={require("../../../assets/arrow-left.png")}
        style={[styles.iconoImg, styles.flechaDerecha, { tintColor: COLORES.verdeOscuro }]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Íconos PNG de assets/: las fuentes de íconos (@expo/vector-icons) no se
  // muestran en la build de la app.
  iconoImg: {
    resizeMode: "contain"
  },
  flechaDerecha: {
    width: 22,
    height: 22,
    transform: [{ rotate: "180deg" }]
  },
  tarjetaSincronizar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.verde,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  presionada: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
  },
  iconoSincronizar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORES.verdeOscuro,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  imagenSincronizar: {
    width: 26,
    height: 26,
    tintColor: "#ffffff"
  },
  tituloSincronizar: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORES.texto
  },
  textoSincronizar: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2
  }
});
