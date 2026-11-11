import React from "react";
import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { IAvanceEmpleado } from "../../../src/interfaces/local/IAvanceEmpleado";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { horaDe } from "../../../src/utils/GenerarFecha";
import { ICONO_EMPLEADO, calcularJornales, capitalizar, formatear } from "../utils";

type Props = {
  empleado: IAvanceEmpleado;
  rendApli: number;
  unidad: string;
  modificado: boolean;
  deshabilitado?: boolean;
  onPress: () => void;
};

// Empleado con su avance del día. Al tocarlo se edita el avance.
export default function FilaAvanceEmpleado({ empleado, rendApli, unidad, modificado, deshabilitado, onPress }: Props) {
  const avance = Number(empleado.avanceA || 0);
  const sinAvance = avance === 0;
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [styles.fila, modificado && styles.filaModificada, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.circulo}>
        <Image source={ICONO_EMPLEADO} style={styles.icono} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.codigo}>
          {empleado.cod_empleado}
          {horaDe(empleado.fechaRegistro) ? ` · ${horaDe(empleado.fechaRegistro)}` : ""}
        </Text>
        <Text style={styles.nombre} numberOfLines={2}>
          {capitalizar(empleado.nom_empleado)}
        </Text>
        {modificado && (
          <View style={styles.etiqueta}>
            <Text style={styles.textoEtiqueta}>Sin guardar</Text>
          </View>
        )}
      </View>
      <View style={styles.cajaAvance}>
        <Text style={[styles.avance, sinAvance && { color: COLORES.gris }]}>{formatear(avance)}</Text>
        <Text style={styles.detalle} numberOfLines={1}>
          {sinAvance ? unidad || "avance" : `${formatear(calcularJornales(avance, rendApli))} jornales`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  filaModificada: {
    borderColor: "#fcd9a8"
  },
  circulo: {
    width: 42,
    height: 42,
    borderRadius: 13,
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
    color: COLORES.textoSuave
  },
  nombre: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES.texto,
    marginTop: 1
  },
  etiqueta: {
    alignSelf: "flex-start",
    backgroundColor: "#fef3e2",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6
  },
  textoEtiqueta: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309"
  },
  cajaAvance: {
    minWidth: 84,
    alignItems: "flex-end",
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORES.grisSuave
  },
  avance: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORES.verdeOscuro
  },
  detalle: {
    fontSize: 11,
    color: COLORES.textoSuave,
    marginTop: 1
  }
});
