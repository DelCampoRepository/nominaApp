import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";
import { COLORES } from "../utils";

type Props = {
  titulo: string;
  nomUsuario: string;
  semanaActiva: string;
};

export default function EncabezadoCarga({ titulo, nomUsuario, semanaActiva }: Props) {
  return (
    <View style={styles.encabezado}>
      <Image source={require("../../../assets/delcamp.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.subtitulo}>
        {nomUsuario ? `${nomUsuario} · ` : ""}Semana {semanaActiva}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 8
  },
  titulo: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORES.texto
  },
  subtitulo: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2
  }
});
