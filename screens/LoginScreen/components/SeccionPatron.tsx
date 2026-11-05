import { StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { SesionConPatron } from "../types";
import { COLORES } from "../utils";

type Props = {
  sesionPatron: SesionConPatron;
  patronBloqueado: boolean;
  bloqueado: boolean;
  onAbrir: () => void;
};

// Separador "o" + botón "Entrar con patrón" y la nota debajo.
export default function SeccionPatron({
  sesionPatron,
  patronBloqueado,
  bloqueado,
  onAbrir
}: Props) {
  return (
    <>
      <View style={styles.separador}>
        <View style={styles.linea} />
        <Text style={styles.textoSeparador}>o</Text>
        <View style={styles.linea} />
      </View>
      <Button
        mode="outlined"
        textColor={COLORES.verdeOscuro}
        style={[styles.botonPatron, patronBloqueado && { opacity: 0.5 }]}
        contentStyle={{ height: 48 }}
        icon={require("../../../assets/pattern.png")}
        disabled={bloqueado || patronBloqueado}
        onPress={onAbrir}
      >
        Entrar con patrón
      </Button>
      <Text style={styles.notaPatron}>
        {patronBloqueado
          ? "Patrón bloqueado por intentos fallidos. Entra con tu contraseña."
          : `Como ${sesionPatron.nombre || sesionPatron.user}`}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  separador: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16
  },
  linea: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb"
  },
  textoSeparador: {
    marginHorizontal: 12,
    color: COLORES.textoSuave,
    fontSize: 13
  },
  botonPatron: {
    borderRadius: 14,
    borderColor: COLORES.verdeOscuro
  },
  notaPatron: {
    fontSize: 12,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 8
  }
});
