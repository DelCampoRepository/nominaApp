import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { DefinicionOpcion, InfoOpcion } from "../types";
import { COLORES, sombra } from "../utils";

type TarjetaOpcionProps = {
  definicion: DefinicionOpcion;
  info: InfoOpcion;
  deshabilitada: boolean;
  onPress: () => void;
  onVerDetalle: () => void;
};

export default function TarjetaOpcion({ definicion, info, deshabilitada, onPress, onVerDetalle }: TarjetaOpcionProps) {
  const { seleccionada, estado, mensaje } = info;
  const colorMensaje =
    estado === "error" ? COLORES.error : estado === "ok" ? COLORES.verdeOscuro : COLORES.textoSuave;

  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitada}
      style={({ pressed }) => [
        styles.tarjeta,
        seleccionada && styles.tarjetaSeleccionada,
        estado === "error" && styles.tarjetaError,
        pressed && { opacity: 0.85 }
      ]}
    >
      <View style={[styles.circuloIcono, { backgroundColor: seleccionada ? COLORES.verdeSuave : COLORES.grisSuave }]}>
        <Image
          source={definicion.icono}
          style={[styles.iconoOpcion, { tintColor: seleccionada ? COLORES.verdeOscuro : COLORES.textoSuave }]}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.tituloOpcion}>{definicion.titulo}</Text>
        <Text style={styles.descripcionOpcion} numberOfLines={2}>
          {definicion.descripcion}
        </Text>
        {estado !== "inactivo" && !!mensaje && (
          <View style={styles.filaEstado}>
            {estado === "ok" && (
              <Image source={require("../../../assets/check-bold.png")} style={[styles.iconoEstado, { tintColor: COLORES.verdeOscuro }]} />
            )}
            {estado === "error" && (
              <Image source={require("../../../assets/close.png")} style={[styles.iconoEstado, { tintColor: COLORES.error }]} />
            )}
            <Text style={[styles.mensajeEstado, { color: colorMensaje }]} numberOfLines={2}>
              {mensaje}
            </Text>
          </View>
        )}
        {estado === "error" && (
          <Pressable onPress={onVerDetalle} hitSlop={8} style={{ alignSelf: "flex-start" }}>
            <Text style={styles.verDetalle}>Ver detalle ›</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.control}>
        {estado === "proceso" ? (
          <ActivityIndicator size={20} color={COLORES.verde} />
        ) : (
          <View style={[styles.casilla, seleccionada && styles.casillaMarcada]}>
            {seleccionada && (
              <Image source={require("../../../assets/check-bold.png")} style={styles.iconoCasilla} />
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    ...sombra
  },
  tarjetaSeleccionada: {
    borderColor: COLORES.verde
  },
  tarjetaError: {
    borderColor: COLORES.error,
    backgroundColor: "#fffafa"
  },
  circuloIcono: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  iconoOpcion: {
    width: 24,
    height: 24,
    resizeMode: "contain"
  },
  tituloOpcion: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.texto
  },
  descripcionOpcion: {
    fontSize: 12,
    color: COLORES.textoSuave,
    marginTop: 2
  },
  filaEstado: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6
  },
  iconoEstado: {
    width: 14,
    height: 14,
    marginRight: 6,
    resizeMode: "contain"
  },
  mensajeEstado: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600"
  },
  verDetalle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.error,
    marginTop: 4
  },
  control: {
    width: 32,
    alignItems: "center",
    marginLeft: 8
  },
  casilla: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORES.gris,
    alignItems: "center",
    justifyContent: "center"
  },
  casillaMarcada: {
    backgroundColor: COLORES.verdeOscuro,
    borderColor: COLORES.verdeOscuro
  },
  iconoCasilla: {
    width: 14,
    height: 14,
    tintColor: "#ffffff",
    resizeMode: "contain"
  }
});
