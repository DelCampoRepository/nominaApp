import React from "react";
import { Pressable, View, Text, Image, ImageSourcePropType, StyleSheet } from "react-native";

type Props = {
  codigo: string;
  nombre: string;
  icono: ImageSourcePropType;
  seleccionado: boolean;
  modificado: boolean;
  deshabilitado?: boolean;
  onPress: () => void;
};

const COLORES = {
  tarjeta: "#ffffff",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeSuave: "#e3f6e9",
  gris: "#c3c3c3",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280",
  ambar: "#b45309"
};

const capitalizar = (texto: string) => {
  const t = (texto ?? "").trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// Fila con casilla para marcar una actividad/avance. `modificado` muestra la
// etiqueta "Sin guardar".
export default function FilaSeleccionable({
  codigo,
  nombre,
  icono,
  seleccionado,
  modificado,
  deshabilitado,
  onPress
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [
        styles.fila,
        seleccionado && styles.filaSeleccionada,
        deshabilitado && { opacity: 0.6 },
        pressed && { opacity: 0.85 }
      ]}
    >
      <View style={[styles.circuloIcono, { backgroundColor: seleccionado ? COLORES.verdeSuave : COLORES.grisSuave }]}>
        <Image
          source={icono}
          style={[styles.icono, { tintColor: seleccionado ? COLORES.verdeOscuro : COLORES.textoSuave }]}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.filaCodigo}>
          <Text style={styles.codigo}>{codigo}</Text>
          {modificado && <Text style={styles.sinGuardar}>Sin guardar</Text>}
        </View>
        <Text style={styles.nombre} numberOfLines={2}>
          {capitalizar(nombre)}
        </Text>
      </View>

      <View style={[styles.casilla, seleccionado && styles.casillaMarcada]}>
        {seleccionado && (
          <Image source={require("../../assets/check-bold.png")} style={styles.iconoCasilla} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  filaSeleccionada: {
    borderColor: COLORES.verde
  },
  circuloIcono: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  icono: {
    width: 24,
    height: 24,
    resizeMode: "contain"
  },
  filaCodigo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  codigo: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.verdeOscuro
  },
  sinGuardar: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORES.ambar,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: "hidden"
  },
  nombre: {
    fontSize: 15,
    color: COLORES.texto,
    marginTop: 2
  },
  casilla: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORES.gris,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10
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
