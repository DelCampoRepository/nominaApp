import { StyleSheet, View, Text, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { COLORES, MARGEN } from "../utils";

type Props = {
  nombreUsuario: string | null | undefined;
  fechaHoy: string;
  semana: string;
  onSalir: () => void;
};

export function EncabezadoInicio({ nombreUsuario, fechaHoy, semana, onSalir }: Props) {
  return (
    <LinearGradient
      colors={[COLORES.verde, COLORES.verdeOscuro]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.encabezado}
    >
      <SafeAreaView edges={["top"]}>
        <View style={styles.filaEncabezado}>
          <View style={styles.avatar}>
            <Image
              source={require("../../../assets/account.png")}
              style={[styles.iconoImg, { width: 28, height: 28, tintColor: COLORES.verdeOscuro }]}
            />
          </View>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.saludo}>Hola,</Text>
            <Text style={styles.nombre} numberOfLines={1}>
              {nombreUsuario ?? "Usuario"}
            </Text>
          </View>
          <Pressable
            onPress={onSalir}
            hitSlop={8}
            style={({ pressed }) => [styles.botonSalir, pressed && { opacity: 0.7 }]}
          >
            <Image
              source={require("../../../assets/logout.png")}
              style={[styles.iconoImg, { width: 22, height: 22, tintColor: "#ffffff" }]}
            />
          </Pressable>
        </View>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Image source={require("../../../assets/calendar-range.png")} style={styles.iconoChip} />
            <Text style={styles.textoChip}>{fechaHoy}</Text>
          </View>
          {!!semana && (
            <View style={styles.chip}>
              <Image source={require("../../../assets/calendar-range.png")} style={styles.iconoChip} />
              <Text style={styles.textoChip}>Semana {semana}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    paddingHorizontal: MARGEN,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  filaEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center"
  },
  saludo: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13
  },
  nombre: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700"
  },
  botonSalir: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  // Íconos PNG de assets/: las fuentes de íconos (@expo/vector-icons) no se
  // muestran en la build de la app.
  iconoImg: {
    resizeMode: "contain"
  },
  iconoChip: {
    width: 14,
    height: 14,
    tintColor: "#ffffff",
    resizeMode: "contain"
  },
  textoChip: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600"
  }
});
