import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { IEmpleadoCapturado } from "../../../src/interfaces/local/IEmpleadoCapturado";

type Props = {
  empleado: IEmpleadoCapturado;
};

export default function CardEmpleadoSeleccionado({ empleado }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.filaEncabezado}>
        <Image source={require("../../../assets/account.png")} style={styles.icono} />
        <Text style={styles.codigo}>{empleado.cod_empleado}</Text>
      </View>
      <Text style={styles.nombre}>{empleado.Nom_empleado}</Text>

      <View style={styles.filaDatos}>
        <Text style={styles.etiqueta}>Lote:</Text>
        <Text style={styles.valor}>{empleado.cod_lote}</Text>
      </View>
      <View style={styles.filaDatos}>
        <Text style={styles.etiqueta}>Nave:</Text>
        <Text style={styles.valor}>{empleado.cod_nave}</Text>
      </View>
      <View style={styles.filaDatos}>
        <Text style={styles.etiqueta}>Semana:</Text>
        <Text style={styles.valor}>{empleado.semana}</Text>
      </View>
      <View style={styles.filaDatos}>
        <Text style={styles.etiqueta}>Fecha:</Text>
        <Text style={styles.valor}>{empleado.FechaRegistro}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "92%",
    elevation: 5,
    marginHorizontal: "auto",
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: "black"
  },
  filaEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  icono: {
    width: 26,
    height: 26,
    tintColor: "#13c044",
    marginRight: 6
  },
  codigo: {
    fontWeight: "500",
    fontSize: 20,
    color: "#fdac3a"
  },
  nombre: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8
  },
  filaDatos: {
    flexDirection: "row",
    marginBottom: 2
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    width: 70
  },
  valor: {
    fontSize: 14,
    color: "#333333"
  }
});
