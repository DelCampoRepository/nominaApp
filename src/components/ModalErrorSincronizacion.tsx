import React from "react";
import { Modal, Pressable, View, Image, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";

type Props = {
  visible: boolean;
  titulo: string;
  mensaje?: string;
  detalle?: string;
  onCerrar: () => void;
  onReintentar: () => void;
  reintentarDeshabilitado?: boolean;
};

const COLORES = {
  tarjeta: "#ffffff",
  verdeOscuro: "#008445",
  error: "#d32f2f",
  errorSuave: "#fdecea",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280"
};

// Detalle del error de un paso de sincronización (LoadingScreen y Transferir).
export default function ModalErrorSincronizacion({
  visible,
  titulo,
  mensaje,
  detalle,
  onCerrar,
  onReintentar,
  reintentarDeshabilitado
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={styles.fondo} onPress={onCerrar}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <View style={styles.circuloIcono}>
            <Image source={require("../../assets/close.png")} style={styles.icono} />
          </View>
          <Text style={styles.titulo}>Error en {titulo}</Text>
          {!!mensaje && <Text style={styles.mensaje}>{mensaje}</Text>}
          {!!detalle && (
            <View style={styles.cajaDetalle}>
              <Text style={styles.etiqueta}>Detalle</Text>
              <Text style={styles.textoDetalle}>{detalle}</Text>
            </View>
          )}
          <View style={styles.acciones}>
            <Button
              mode="outlined"
              textColor={COLORES.verdeOscuro}
              style={[styles.boton, { borderColor: COLORES.verdeOscuro }]}
              onPress={onCerrar}
            >
              Cerrar
            </Button>
            <Button
              mode="contained"
              buttonColor={COLORES.verdeOscuro}
              style={styles.boton}
              icon={require("../../assets/sync.png")}
              disabled={reintentarDeshabilitado}
              onPress={onReintentar}
            >
              Reintentar
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    justifyContent: "center",
    padding: 24
  },
  modal: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 20,
    padding: 20,
    alignItems: "center"
  },
  circuloIcono: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORES.errorSuave,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  icono: {
    width: 30,
    height: 30,
    tintColor: COLORES.error,
    resizeMode: "contain"
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORES.texto,
    textAlign: "center"
  },
  mensaje: {
    fontSize: 14,
    color: COLORES.texto,
    textAlign: "center",
    marginTop: 8
  },
  cajaDetalle: {
    alignSelf: "stretch",
    backgroundColor: COLORES.grisSuave,
    borderRadius: 12,
    padding: 12,
    marginTop: 14
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.textoSuave,
    marginBottom: 4,
    textTransform: "uppercase"
  },
  textoDetalle: {
    fontSize: 13,
    color: COLORES.texto
  },
  acciones: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    alignSelf: "stretch"
  },
  boton: {
    flex: 1,
    borderRadius: 12
  }
});
