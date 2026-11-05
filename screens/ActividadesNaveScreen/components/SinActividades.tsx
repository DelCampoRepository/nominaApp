import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { COLORES, EstadoVacio } from "../../../src/components/PantallaSeleccion";
import { ICONO_ACTIVIDAD } from "../utils";

type Props = {
  onIrActividadesLote: () => void;
};

// Estado vacío cuando la nave no tiene actividades para hoy, con acceso a
// Actividades en lote.
export default function SinActividades({ onIrActividadesLote }: Props) {
  return (
    <View>
      <EstadoVacio
        icono={ICONO_ACTIVIDAD}
        titulo="Sin actividades para hoy"
        texto="Las actividades de las naves se crean al guardar en Actividades en lote. Marca las actividades del lote y presiona Guardar."
      />
      <Button
        mode="outlined"
        textColor={COLORES.verdeOscuro}
        style={styles.botonSecundario}
        onPress={onIrActividadesLote}
      >
        Ir a Actividades en lote
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  botonSecundario: {
    alignSelf: "center",
    borderRadius: 12,
    borderColor: COLORES.verdeOscuro
  }
});
