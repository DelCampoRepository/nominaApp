import { StyleSheet, View, Image } from "react-native";
import { Text } from "react-native-paper";

// Logo y saludo sobre el fondo verde.
export default function EncabezadoMarca() {
  return (
    <View style={styles.marca}>
      <View style={styles.circuloLogo}>
        <Image
          style={styles.logo}
          source={require("../../../assets/delcamp.png")}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.bienvenida}>Bienvenido</Text>
      <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marca: {
    alignItems: "center",
    marginBottom: 24
  },
  circuloLogo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  logo: {
    width: 76,
    height: 76
  },
  bienvenida: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800"
  },
  subtitulo: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4
  }
});
