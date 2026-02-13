import React, { useRef } from "react";

import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  BackHandler,
  FlatList,
  Animated
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { IconButton, Text, Avatar } from "react-native-paper";
import { RootStackParamList } from "../types/types";
import { theme } from "./theme";
import { useEffect } from "react";
import { useHandleSalir } from "../src/hooks/useHandleSalir";
import { useUser } from "../src/context/userContext";
type Props = NativeStackScreenProps<RootStackParamList, "Inicio">;

//declaramos un typo de nombre boton , quien herede de boton tendra estos elementos
type Boton = {
  index: string;
  icon: ImageSourcePropType;
  label: string;
  label2: string;
  screen: ScreenName;
};

type ScreenName = keyof RootStackParamList;

type ItemProps = {
  icono: ImageSourcePropType;
  label: string;
  label2: string;
  screen: ScreenName;
  navigation: Props["navigation"];
  onPress: (screen: ScreenName) => void;
};

const botones: Boton[] = [
  {
    index: "1",
    icon: require("../assets/land-fieldsw.png"),
    label: "Actividades",
    label2: "en lote",
    screen: "ActividadesLote"
  },
  {
    index: "2",
    icon: require("../assets/hoop-housew.png"),
    label: "Actividades",
    label2: "en nave",
    screen: "ActividadesNave"
  },
  {
    index: "3",
    icon: require("../assets/account-box-edit-outlinew.png"),
    label: "Registrar",
    label2: "empleados",
    screen: "Empleados"
  },
  {
    index: "4",
    icon: require("../assets/chart-line-variantw.png"),
    label: "Avances",
    label2: "",
    screen: "Avances"
  },
  {
    index: "5",
    icon: require("../assets/file-chart-outlinew.png"),
    label: "Reporte",
    label2: "de avances",
    screen: "ReporteAvances"
  },
  {
    index: "6",
    icon: require("../assets/syncw.png"),
    label: "Sincronizar",
    label2: "",
    screen: "Transferir"
  },
  {
    index: "7",
    icon: require("../assets/logoutw.png"),
    label: "Salir",
    label2: "",
    screen: "Login"
  },
  {
    index: "8",
    icon: require("../assets/account-cowboy-hat.png"),
    label: "Obt. avances",
    label2: "jefe de nave",
    screen: "Pagos"
  }
];

const Item = ({
  label,
  label2,
  icono,
  screen,
  navigation,
  onPress
}: ItemProps) => (
  <TouchableOpacity style={styles.item} onPress={() => onPress(screen)}>
    <View
      style={{
        width: "100%",
        height: "50%",
        backgroundColor: "#106c40ff",
        justifyContent: "center",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
      }}
    >
      <View
        style={{
          width: "20%",
          height: "50%",
          backgroundColor: "#106c40ff",
          paddingLeft: 10
        }}
      >
        <Image
          source={icono}
          style={{ width: 30, height: 30, tintColor: "white" }}
        />
      </View>
    </View>
    <View
      style={{
        width: "100%",
        height: "50%",
        backgroundColor: "#106c40ff",
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5
      }}
    >
      <Text
        variant="bodyMedium"
        style={{ paddingLeft: 10, color: "#ffffffff" }}
      >
        {label + " " + label2}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }: Props) {
  const { nombreUsuario } = useUser();
  const fadeAnimInputs = useRef(new Animated.Value(0)).current;
  const translateYInputs = useRef(new Animated.Value(200)).current;

  const { HandleSalir } = useHandleSalir();

  const handleBotones = async (screen: ScreenName) => {
    switch (screen) {
      case "Login":
        await HandleSalir();
        navigation.navigate(screen);
        break;
      default:
        navigation.navigate(screen);
        break;
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimInputs, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(translateYInputs, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={{
            width: "100%",
            height: "100%",
            marginTop: 30,
            display: "flex",
            justifyContent: "center",
            opacity: fadeAnimInputs
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "",
              paddingLeft: 25,
              paddingTop: 10
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row"
              }}
            >
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Avatar.Icon
                  color="black"
                  style={{ backgroundColor: "#e5e9f4ff", paddingLeft: 0 }}
                  size={40}
                  icon={require("../assets/account.png")}
                />
              </View>
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 10
                }}
              >
                <Text
                  variant="bodySmall"
                  style={{ fontWeight: "bold", fontSize: 14, fontFamily: "" }}
                >
                  {nombreUsuario}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flex: 3
            }}
          >
            <FlatList
              data={botones}
              style={{ marginHorizontal: "auto" }}
              renderItem={({ item, index }) => (
                <Item
                  label={item.label}
                  icono={item.icon}
                  label2={item.label2}
                  screen={item.screen}
                  navigation={navigation}
                  onPress={handleBotones}
                />
              )}
              keyExtractor={(item) => item.index}
              numColumns={2}
              horizontal={false}
            />
          </View>
          <View style={{ flex: 1 }}></View>
        </Animated.View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e5e9f4ff",
    flex: 1
  },
  item: {
    borderRadius: 5,
    backgroundColor: "#008445",
    marginVertical: 4,
    marginHorizontal: 4,
    width: 170,
    height: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  title: {
    fontSize: 32
  }
});
