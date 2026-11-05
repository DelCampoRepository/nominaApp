import React from "react";
import { View, StyleSheet, Image, ImageSourcePropType, Pressable } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { COLORES, EstadoPaso } from "../utils";

type FilaPasoProps = {
  titulo: string;
  icono: ImageSourcePropType;
  estado: EstadoPaso;
  mensaje: string;
  ultimo: boolean;
  onPress?: () => void;
};

export default function FilaPaso({ titulo, icono, estado, mensaje, ultimo, onPress }: FilaPasoProps) {
  const colorEstado = {
    pendiente: COLORES.gris,
    proceso: COLORES.verde,
    ok: COLORES.verde,
    error: COLORES.error
  }[estado];

  const fondoIcono = {
    pendiente: COLORES.grisSuave,
    proceso: COLORES.verdeSuave,
    ok: COLORES.verdeSuave,
    error: COLORES.errorSuave
  }[estado];

  return (
    <View style={styles.fila}>
      <View style={styles.lineaTiempo}>
        <View style={[styles.circulo, { backgroundColor: fondoIcono, borderColor: colorEstado }]}>
          <Image
            source={icono}
            style={[styles.iconoPaso, { tintColor: estado === "pendiente" ? COLORES.textoSuave : colorEstado }]}
          />
        </View>
        {!ultimo && (
          <View style={[styles.conector, { backgroundColor: estado === "ok" ? COLORES.verde : COLORES.gris }]} />
        )}
      </View>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.tarjetaPaso,
          estado === "error" && styles.tarjetaError,
          estado === "proceso" && styles.tarjetaProceso,
          pressed && { opacity: 0.7 }
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.tituloPaso, estado === "pendiente" && { color: COLORES.textoSuave }]}>
            {titulo}
          </Text>
          <Text
            style={[styles.mensajePaso, estado === "error" && { color: COLORES.error }]}
            numberOfLines={2}
          >
            {mensaje}
          </Text>
          {estado === "error" && <Text style={styles.verDetalle}>Toca para ver el detalle</Text>}
        </View>
        <View style={styles.estado}>
          {estado === "proceso" && <ActivityIndicator size={20} color={COLORES.verde} />}
          {estado === "ok" && (
            <View style={styles.insigniaOk}>
              <Image source={require("../../../assets/check-bold.png")} style={[styles.iconoEstado, { width: 14, height: 14, tintColor: "#ffffff" }]} />
            </View>
          )}
          {estado === "error" && (
            <Image source={require("../../../assets/arrow-left.png")} style={[styles.iconoEstado, styles.flechaDerecha, { tintColor: COLORES.error }]} />
          )}
          {estado === "pendiente" && <View style={styles.puntoPendiente} />}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  lineaTiempo: {
    width: 48,
    alignItems: "center"
  },
  circulo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10
  },
  iconoPaso: {
    width: 20,
    height: 20
  },
  conector: {
    width: 2,
    flex: 1,
    marginVertical: 2
  },
  tarjetaPaso: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginLeft: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }
  },
  tarjetaProceso: {
    borderColor: COLORES.verde
  },
  iconoEstado: {
    resizeMode: "contain"
  },
  insigniaOk: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORES.verde,
    alignItems: "center",
    justifyContent: "center"
  },
  flechaDerecha: {
    width: 20,
    height: 20,
    transform: [{ rotate: "180deg" }]
  },
  puntoPendiente: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORES.gris
  },
  tarjetaError: {
    borderColor: COLORES.error,
    backgroundColor: "#fffafa"
  },
  tituloPaso: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES.texto
  },
  mensajePaso: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2
  },
  verDetalle: {
    fontSize: 12,
    color: COLORES.error,
    fontWeight: "600",
    marginTop: 4
  },
  estado: {
    width: 32,
    alignItems: "center",
    marginLeft: 8
  }
});
