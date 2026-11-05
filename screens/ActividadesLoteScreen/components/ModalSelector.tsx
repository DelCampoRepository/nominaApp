import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";

export type OpcionSelector = {
  codigo: string;
  nombre: string;
};

type Props = {
  visible: boolean;
  titulo: string;
  icono: ImageSourcePropType;
  opciones: OpcionSelector[];
  seleccionado?: string;
  onSeleccionar: (opcion: OpcionSelector) => void;
  onCerrar: () => void;
};

const COLORES = {
  tarjeta: "#ffffff",
  verdeOscuro: "#008445",
  verdeSuave: "#e3f6e9",
  verde: "#13c044",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280"
};

// Hoja inferior con buscador para elegir un lote o una actividad.
export default function ModalSelector({
  visible,
  titulo,
  icono,
  opciones,
  seleccionado,
  onSeleccionar,
  onCerrar
}: Props) {
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (visible) setBusqueda("");
  }, [visible]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return opciones;
    return opciones.filter(
      (o) =>
        o.codigo.toLowerCase().includes(texto) || o.nombre.toLowerCase().includes(texto)
    );
  }, [busqueda, opciones]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.fondo} onPress={onCerrar} />
        <View style={styles.hoja}>
          <View style={styles.asa} />
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>{titulo}</Text>
            <Pressable onPress={onCerrar} hitSlop={10} style={styles.botonCerrar}>
              <Image source={require("../../../assets/close.png")} style={styles.iconoCerrar} />
            </Pressable>
          </View>

          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por código o nombre"
            placeholderTextColor={COLORES.textoSuave}
            style={styles.buscador}
            autoCorrect={false}
          />

          <FlatList
            data={filtradas}
            keyExtractor={(o) => `${o.codigo}_${o.nombre}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={
              <Text style={styles.vacio}>
                {opciones.length === 0 ? "No hay opciones disponibles" : "Sin resultados"}
              </Text>
            }
            renderItem={({ item }) => {
              const activo = item.codigo === seleccionado;
              return (
                <Pressable
                  onPress={() => onSeleccionar(item)}
                  style={({ pressed }) => [
                    styles.fila,
                    activo && styles.filaActiva,
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  <View style={styles.circuloIcono}>
                    <Image source={icono} style={styles.icono} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.codigo}>{item.codigo}</Text>
                    <Text style={styles.nombre} numberOfLines={2}>
                      {item.nombre}
                    </Text>
                  </View>
                  {activo && (
                    <Image source={require("../../../assets/check-bold.png")} style={styles.check} />
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)"
  },
  hoja: {
    maxHeight: "80%",
    backgroundColor: COLORES.tarjeta,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  asa: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginBottom: 12
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORES.texto
  },
  botonCerrar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORES.grisSuave,
    alignItems: "center",
    justifyContent: "center"
  },
  iconoCerrar: {
    width: 16,
    height: 16,
    tintColor: COLORES.texto,
    resizeMode: "contain"
  },
  buscador: {
    backgroundColor: COLORES.grisSuave,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORES.texto,
    marginBottom: 10
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    marginBottom: 6
  },
  filaActiva: {
    borderColor: COLORES.verde,
    backgroundColor: "#f5fff7"
  },
  circuloIcono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  icono: {
    width: 22,
    height: 22,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  },
  codigo: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.verdeOscuro
  },
  nombre: {
    fontSize: 15,
    color: COLORES.texto,
    marginTop: 1
  },
  check: {
    width: 18,
    height: 18,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain",
    marginLeft: 8
  },
  vacio: {
    textAlign: "center",
    color: COLORES.textoSuave,
    paddingVertical: 24
  }
});
