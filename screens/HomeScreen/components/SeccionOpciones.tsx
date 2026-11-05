import { StyleSheet, View, Text } from "react-native";
import { COLORES, Opcion, Seccion, SEPARACION } from "../utils";
import { OptionCard } from "./OptionCard";

type Props = {
  seccion: Seccion;
  anchoTarjeta: number;
  onSeleccionar: (opcion: Opcion) => void;
};

export function SeccionOpciones({ seccion, anchoTarjeta, onSeleccionar }: Props) {
  return (
    <View>
      <Text style={styles.tituloSeccion}>{seccion.titulo}</Text>
      <View style={styles.cuadricula}>
        {seccion.opciones.map((opcion) => (
          <OptionCard
            key={opcion.pantalla}
            titulo={opcion.titulo}
            descripcion={opcion.descripcion}
            icono={opcion.icono}
            ancho={anchoTarjeta}
            onPress={() => onSeleccionar(opcion)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tituloSeccion: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 24,
    marginBottom: 10
  },
  cuadricula: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SEPARACION
  }
});
