import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { COLORES } from "../utils";

type Props = {
  fechaHoy: string;
  semana: string;
  onRegresar: () => void;
};

export default function EncabezadoTransferir({ fechaHoy, semana, onRegresar }: Props) {
  return (
    <LinearGradient
      colors={[COLORES.verde, COLORES.verdeOscuro]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.encabezado}
    >
      <SafeAreaView edges={["top"]}>
        <View style={styles.filaEncabezado}>
          <Pressable
            onPress={onRegresar}
            hitSlop={8}
            style={({ pressed }) => [styles.botonRegresar, pressed && { opacity: 0.7 }]}
          >
            <Image source={require("../../../assets/arrow-left.png")} style={styles.iconoRegresar} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.titulo}>Sincronizar</Text>
            <Text style={styles.subtitulo} numberOfLines={1}>
              {fechaHoy}
              {semana ? ` · Semana ${semana}` : ""}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  filaEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12
  },
  botonRegresar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  iconoRegresar: {
    width: 22,
    height: 22,
    tintColor: "#ffffff",
    resizeMode: "contain"
  },
  titulo: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700"
  },
  subtitulo: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2
  }
});
