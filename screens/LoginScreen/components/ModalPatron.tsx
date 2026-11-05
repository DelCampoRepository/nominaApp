import { StyleSheet, View, Modal, Pressable } from "react-native";
import { Text, Button } from "react-native-paper";
import PatronDesbloqueo from "../../../src/components/PatronDesbloqueo";
import { EstadoTrazo, SesionConPatron } from "../types";
import { COLORES } from "../utils";

type Props = {
  visible: boolean;
  sesionPatron: SesionConPatron | null;
  estadoTrazo: EstadoTrazo;
  mensajePatron: string;
  verificandoPatron: boolean;
  tamanoPatron: number;
  onCerrar: () => void;
  onTerminar: (secuencia: number[]) => void;
};

// Hoja inferior para dibujar el patrón de acceso.
export default function ModalPatron({
  visible,
  sesionPatron,
  estadoTrazo,
  mensajePatron,
  verificandoPatron,
  tamanoPatron,
  onCerrar,
  onTerminar
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <Pressable style={styles.fondoModal} onPress={() => !verificandoPatron && onCerrar()} />
      <View style={styles.hoja}>
        <View style={styles.asa} />
        <Text style={styles.tituloModal}>Entrar con patrón</Text>
        <Text style={styles.usuarioModal}>
          {sesionPatron?.nombre || sesionPatron?.user}
        </Text>
        <Text
          style={[styles.mensajeModal, estadoTrazo === "error" && { color: COLORES.error }]}
        >
          {mensajePatron}
        </Text>
        <View style={styles.marcoPatron}>
          <PatronDesbloqueo
            tamano={tamanoPatron}
            estado={estadoTrazo}
            deshabilitado={verificandoPatron}
            onTerminar={onTerminar}
          />
        </View>
        <Button
          mode="text"
          textColor={COLORES.textoSuave}
          disabled={verificandoPatron}
          onPress={onCerrar}
        >
          Usar usuario y contraseña
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)"
  },
  hoja: {
    backgroundColor: COLORES.tarjeta,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: "center"
  },
  asa: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginBottom: 14
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORES.texto
  },
  usuarioModal: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORES.verdeOscuro,
    marginTop: 2
  },
  mensajeModal: {
    fontSize: 14,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12
  },
  marcoPatron: {
    backgroundColor: COLORES.grisSuave,
    borderRadius: 24,
    padding: 12,
    marginBottom: 8
  }
});
