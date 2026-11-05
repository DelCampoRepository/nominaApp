import { StyleSheet, View, Text } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import React from "react";
import { IEmpleadoCapturado } from "../../../src/interfaces/local/IEmpleadoCapturado";
import { COLORES, EstadoVacio } from "../../../src/components/PantallaSeleccion";
import { ICONO_EMPLEADO, claveEmpleado } from "../utils";
import FilaEmpleado from "./FilaEmpleado";

type Props = {
  porAsentarNave: IEmpleadoCapturado[];
  asentados: IEmpleadoCapturado[];
  totalNave: number;
  cargando: boolean;
  guardando: boolean;
  onQuitar: (empleado: IEmpleadoCapturado) => void;
};

export default function ListaEmpleadosNave({
  porAsentarNave,
  asentados,
  totalNave,
  cargando,
  guardando,
  onQuitar
}: Props) {
  return (
    <>
      <View style={styles.filaSeccion}>
        <Text style={styles.tituloSeccion}>Empleados en la nave · {totalNave}</Text>
        {porAsentarNave.length > 0 && (
          <Text style={styles.notaSeccion}>{porAsentarNave.length} sin asentar</Text>
        )}
      </View>
      {cargando ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={COLORES.verde} />
      ) : totalNave === 0 ? (
        <EstadoVacio
          icono={ICONO_EMPLEADO}
          titulo="Sin empleados todavía"
          texto="Escribe el código, búscalo por nombre o escanea su credencial."
        />
      ) : (
        <>
          {porAsentarNave.map((e) => (
            <FilaEmpleado
              key={claveEmpleado(e)}
              empleado={e}
              asentado={false}
              deshabilitado={guardando}
              onQuitar={() => onQuitar(e)}
            />
          ))}
          {asentados.map((e) => (
            <FilaEmpleado key={claveEmpleado(e)} empleado={e} asentado />
          ))}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  filaSeccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  notaSeccion: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b45309"
  }
});
