import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Button } from "react-native-paper";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { formatear, validarAvance } from "../utils";

type Props = {
  visible: boolean;
  titulo: string;
  subtitulo: string;
  valorInicial: string;
  unidad: string;
  rendApli: number;
  rendTop: number;
  onAsignar: (valor: number) => void;
  onCerrar: () => void;
};

// Hoja inferior para escribir un avance (de un empleado o general). Muestra en
// vivo los jornales que representa y no deja asignar si supera el tope.
export default function ModalCapturaAvance({
  visible,
  titulo,
  subtitulo,
  valorInicial,
  unidad,
  rendApli,
  rendTop,
  onAsignar,
  onCerrar
}: Props) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (visible) setTexto(valorInicial);
  }, [visible]);

  const resultado = validarAvance(texto, rendApli, rendTop);
  const asignar = () => {
    if (resultado.valido) onAsignar(resultado.valor);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable style={styles.fondo} onPress={onCerrar} />
        <View style={styles.hoja}>
          <View style={styles.asa} />
          <View style={styles.encabezado}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{titulo}</Text>
              <Text style={styles.subtitulo} numberOfLines={2}>
                {subtitulo}
              </Text>
            </View>
            <Pressable onPress={onCerrar} hitSlop={10} style={styles.botonCerrar}>
              <Image source={require("../../../assets/close.png")} style={styles.iconoCerrar} />
            </Pressable>
          </View>

          <View style={[styles.cajaInput, !resultado.valido && styles.cajaInputError]}>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              onSubmitEditing={asignar}
              placeholder="0"
              placeholderTextColor={COLORES.gris}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
              style={styles.input}
            />
            {!!unidad && <Text style={styles.unidad}>{unidad}</Text>}
          </View>

          <Text style={[styles.ayuda, !resultado.valido && { color: COLORES.error }]}>
            {!resultado.valido
              ? resultado.mensaje
              : Number.isFinite(resultado.jornales)
              ? `= ${formatear(resultado.jornales)} jornales · tope ${formatear(Number(rendTop))}`
              : "Sin rendimiento aplicado: no se calculan jornales."}
          </Text>

          <View style={styles.botones}>
            <Button mode="outlined" textColor={COLORES.textoSuave} style={styles.boton} onPress={onCerrar}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              buttonColor={COLORES.verdeOscuro}
              style={styles.boton}
              disabled={!resultado.valido}
              onPress={asignar}
            >
              Asignar
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  hoja: {
    backgroundColor: COLORES.tarjeta,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  asa: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORES.gris,
    marginTop: 10,
    marginBottom: 12
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORES.texto
  },
  subtitulo: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2
  },
  botonCerrar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORES.grisSuave,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12
  },
  iconoCerrar: {
    width: 16,
    height: 16,
    tintColor: COLORES.textoSuave,
    resizeMode: "contain"
  },
  cajaInput: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORES.verde,
    backgroundColor: "#f7fdf9",
    paddingHorizontal: 16
  },
  cajaInputError: {
    borderColor: COLORES.error,
    backgroundColor: COLORES.errorSuave
  },
  input: {
    flex: 1,
    height: 64,
    fontSize: 32,
    fontWeight: "800",
    color: COLORES.texto,
    textAlign: "center"
  },
  unidad: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.textoSuave,
    marginLeft: 8
  },
  ayuda: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 10
  },
  botones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  boton: {
    flex: 1,
    borderRadius: 12
  }
});
