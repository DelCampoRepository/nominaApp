import { Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";

type props = {
  columnas: subTipo[];
};

type subTipo = {
  nombre: string;
  tamaño: number;
};

export default function HeaderTablaActiAva({ columnas }: props) {
  return (
    <View style={styles.main}>
      {columnas.map((col, index) => (
        <View key={index} style={styles.colCont}>
          <Text
            variant="bodySmall"
            style={{
              marginVertical: "auto",
              width: col.tamaño,
              height: "100%",
              backgroundColor: "green",
              color: "white",
              textAlign: "center",
              paddingVertical: 5,
              fontSize: 15
            }}
          >
            {col.nombre}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    width: "100%",
    height: "100%",
    backgroundColor: "",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10
  },
  colCont: {
    display: "flex",

    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  }
});
