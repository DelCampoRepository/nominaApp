import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import PatronDesbloqueo from "../../../src/components/PatronDesbloqueo";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { EstadoTrazo } from "../types";

type Props = {
  titulo: string;
  mensaje: string;
  mensajeError: boolean;
  tamanoPatron: number;
  estadoTrazo: EstadoTrazo;
  ocupado: boolean;
  onTerminar: (secuencia: number[]) => void;
  onCancelar: () => void;
};

// Paso de dibujo (actual/nuevo/confirmar): título, instrucción, cuadrícula
// del patrón y botón Cancelar.
export default function ZonaPatron({
  titulo,
  mensaje,
  mensajeError,
  tamanoPatron,
  estadoTrazo,
  ocupado,
  onTerminar,
  onCancelar
}: Props) {
  return (
    <View style={styles.zonaPatron}>
      <Text style={styles.tituloPaso}>{titulo}</Text>
      <Text style={[styles.instruccion, mensajeError && { color: COLORES.error }]}>{mensaje}</Text>
      <View style={styles.marcoPatron}>
        <PatronDesbloqueo
          tamano={tamanoPatron}
          estado={estadoTrazo}
          deshabilitado={ocupado}
          onTerminar={onTerminar}
        />
      </View>
      <Button mode="text" textColor={COLORES.textoSuave} onPress={onCancelar} disabled={ocupado}>
        Cancelar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  zonaPatron: {
    alignItems: "center"
  },
  tituloPaso: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORES.texto,
    marginTop: 4
  },
  instruccion: {
    fontSize: 14,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 12
  },
  marcoPatron: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12
  }
});
