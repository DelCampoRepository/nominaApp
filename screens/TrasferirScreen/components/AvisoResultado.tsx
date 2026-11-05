import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Text } from "react-native-paper";
import { COLORES } from "../utils";

type Props = {
  resumen: { ok: number; error: number };
};

// Aviso con el resultado de la última sincronización.
export default function AvisoResultado({ resumen }: Props) {
  return (
    <View
      style={[
        styles.aviso,
        resumen.error > 0 ? styles.avisoError : styles.avisoOk
      ]}
    >
      <Image
        source={
          resumen.error > 0
            ? require("../../../assets/close.png")
            : require("../../../assets/check-bold.png")
        }
        style={[styles.iconoAviso, { tintColor: resumen.error > 0 ? COLORES.error : COLORES.verdeOscuro }]}
      />
      <Text style={[styles.textoAviso, { color: resumen.error > 0 ? COLORES.error : COLORES.verdeOscuro }]}>
        {resumen.error > 0
          ? `${resumen.error} ${resumen.error === 1 ? "opción terminó" : "opciones terminaron"} con error${resumen.ok > 0 ? ` · ${resumen.ok} correctas` : ""}`
          : "Sincronización completada correctamente"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1
  },
  avisoOk: {
    backgroundColor: COLORES.verdeSuave,
    borderColor: COLORES.verde
  },
  avisoError: {
    backgroundColor: COLORES.errorSuave,
    borderColor: COLORES.error
  },
  iconoAviso: {
    width: 18,
    height: 18,
    marginRight: 10,
    resizeMode: "contain"
  },
  textoAviso: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600"
  }
});
