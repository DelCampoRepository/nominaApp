import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORES } from "../../../src/components/PantallaSeleccion";

type Props = {
  registros: number;
  empleados: number;
  nuevos: number;
  enTelefono: number;
};

// Totales de lo que devolvió el servidor para el jefe de nave.
export default function ResumenConsulta({ registros, empleados, nuevos, enTelefono }: Props) {
  return (
    <View style={styles.tarjeta}>
      <Dato valor={registros} etiqueta="Registros" />
      <View style={styles.separador} />
      <Dato valor={empleados} etiqueta="Empleados" />
      <View style={styles.separador} />
      <Dato valor={nuevos} etiqueta="Nuevos" color={nuevos > 0 ? "#b45309" : COLORES.texto} />
      <View style={styles.separador} />
      <Dato valor={enTelefono} etiqueta="En teléfono" color={COLORES.verdeOscuro} />
    </View>
  );
}

function Dato({ valor, etiqueta, color = COLORES.texto }: { valor: number; etiqueta: string; color?: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={[styles.valor, { color }]}>{valor}</Text>
      <Text style={styles.etiqueta} numberOfLines={1}>
        {etiqueta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    paddingVertical: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  separador: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: COLORES.grisSuave
  },
  valor: {
    fontSize: 20,
    fontWeight: "800"
  },
  etiqueta: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 2
  }
});
