import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useEmployee } from "../../src/context/QrContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/types";

type HeaderProps = {
  titulo: string;
  pantalla: string;
};
export default function Header({ titulo, pantalla }: HeaderProps) {
  const {
    clearEmployeeCode,

    clearNombre
  } = useEmployee();
  const handleBackPress = () => {
    clearEmployeeCode();

    if (pantalla === "") 
      navigation.goBack();
    else navigation.navigate(pantalla);
    clearNombre();
  };

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.headerContainer}>
      <View style={{ width: "20%", backgroundColor: "" }}>
        <IconButton
          icon={require("../../assets/arrow-left.png")}
          iconColor="black"
          size={30}
          onPress={handleBackPress}
          style={{ backgroundColor: "" }}
        />
      </View>
      <View style={{ width: "60%" }}>
        <Text
          variant="titleSmall"
          style={{ width: "100%", textAlign: "center" }}
        >
          {titulo}
        </Text>
      </View>
      <View style={{ width: "20%", backgroundColor: "" }}>
        <IconButton
          icon={""}
          iconColor="black"
          size={30}
          style={{ backgroundColor: "" }}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#e5e9f4ff",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  }
});
