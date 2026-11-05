import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Text } from "react-native-paper";
import { COLORES, sombra } from "../utils";

type Props = {
  avancesHoy: number | null;
  textoAvances: string;
};

export default function TarjetaResumenAvances({ avancesHoy, textoAvances }: Props) {
  return (
    <View style={styles.tarjetaResumen}>
      <View style={styles.circuloResumen}>
        <Image source={require("../../../assets/chart-line-variant.png")} style={styles.iconoResumen} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.numeroResumen}>{avancesHoy ?? "–"}</Text>
        <Text style={styles.textoResumen}>{textoAvances}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjetaResumen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    padding: 16,
    ...sombra
  },
  circuloResumen: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORES.verdeOscuro,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  iconoResumen: {
    width: 28,
    height: 28,
    tintColor: "#ffffff",
    resizeMode: "contain"
  },
  numeroResumen: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORES.verdeOscuro
  },
  textoResumen: {
    fontSize: 13,
    color: COLORES.textoSuave
  }
});
