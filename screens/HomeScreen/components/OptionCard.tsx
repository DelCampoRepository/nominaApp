import { ImageSourcePropType, Pressable, View, StyleSheet, Image, Text } from "react-native";

type ItemProps = {
  icono: ImageSourcePropType;
  titulo: string;
  descripcion: string;
  ancho: number;
  onPress: () => void;
};

export const OptionCard = ({ icono, titulo, descripcion, ancho, onPress }: ItemProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.card,
      { width: ancho },
      pressed && styles.presionada
    ]}
  >
    <View style={styles.circuloIcono}>
      <Image source={icono} style={styles.icono} />
    </View>
    <Text style={styles.titulo} numberOfLines={2}>
      {titulo}
    </Text>
    <Text style={styles.descripcion} numberOfLines={2}>
      {descripcion}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  presionada: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }]
  },
  circuloIcono: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#e3f6e9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  icono: {
    width: 26,
    height: 26,
    tintColor: "#008445"
  },
  titulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2933"
  },
  descripcion: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4
  }
});
