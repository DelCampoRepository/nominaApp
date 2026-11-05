import React, { useRef } from "react";
import {  useWindowDimensions } from 'react-native';
import {
  StyleSheet,
  View,
  Text,
  ImageSourcePropType,
  BackHandler,
  FlatList,
  Animated
} from "react-native";
import {  Avatar } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { RootStackParamList } from "../../../types/types";
import { useEffect } from "react";
import { useHandleSalir } from "../../../src/hooks/useHandleSalir";
import { useUser } from "../../../src/context/userContext";
import { OptionCard } from "../components/OptionCard";

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

const botones: Boton[] = [
  {
    index: "1",
    icon: require("../../../assets/land-plots.png"),
    label: "Actividades",
    label2: "en lote",
    screen: "ActividadesLote"
  },
  {
    index: "2",
    icon: require("../../../assets/hoop-housew.png"),
    label: "Actividades",
    label2: "en nave",
    screen: "ActividadesNave"
  },
  {
    index: "3",
    icon: require("../../../assets/account-box-edit-outlinew.png"),
    label: "Registrar",
    label2: "empleados",
    screen: "Empleados"
  },
  {
    index: "4",
    icon: require("../../../assets/chart-line-variantw.png"),
    label: "Avances",
    label2: "",
    screen: "Avances"
  },
  {
    index: "5",
    icon: require("../../../assets/file-chart-outlinew.png"),
    label: "Reporte",
    label2: "de avances",
    screen: "ReporteAvances"
  },
  {
    index: "6",
    icon: require("../../../assets/syncw.png"),
    label: "Sincronizar",
    label2: "",
    screen: "Transferir"
  },
  {
    index: "7",
    icon: require("../../../assets/logoutw.png"),
    label: "Salir",
    label2: "",
    screen: "Login"
  },{
    index: "8",
    icon: require("../../../assets/account-cowboy-hat.png"),
    label: "Obt. avances",
    label2: "jefe de nave",
    screen: "Pagos"
  }

];

/**
 * 
 * 
 * ,{
    index: "9",
    icon: require("../../../assets/view-list.png"),
    label: "Empleados",
    label2: "seleccionados",
    screen: "EmpleadosSeleccionados"
  }
 * 
 */
export default function HomeScreen({ navigation }: Props) {

 //const { width, height } = useWindowDimensions();
 const { nombreUsuario } = useUser();
 const fadeAnimInputs = useRef(new Animated.Value(0)).current;
 const translateYInputs = useRef(new Animated.Value(100)).current;
 const { HandleSalir } = useHandleSalir();

  const handleBotones = async (screen: ScreenName) => {
    switch (screen) {
      case "Login":
        await HandleSalir();
        navigation.navigate(screen );
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
        duration: 300,
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
        <Animated.View style={[styles.animatedView, { opacity: fadeAnimInputs, transform: [{ translateY: translateYInputs }] }]}> 
          <View style={{flex: 1}}>
            <View style={styles.header}>
              <Avatar.Icon
                color="black"
                style={{ backgroundColor: "#e5e9f4ff", paddingLeft: 0 }}
                size={50}
                icon={require("../../../assets/account.png")}
              />
              <Text style={styles.Text}>{nombreUsuario}</Text>
            </View>
            <FlatList
              data={botones}
              contentContainerStyle={{  justifyContent: 'center', flexGrow: 1 }}
              keyExtractor={(item) => item.index}
              numColumns={  2}
              horizontal={false}
              renderItem={({ item, index }) => (  
                <OptionCard
                  label={item.label}
                  label2={item.label2}
                  icono={item.icon}
                  screen={item.screen}
                  navigation={navigation}
                  onPress={handleBotones}
                />
              )}
            />
          </View>
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
  }, 
  animatedView:{
    flex: 1,
    marginTop: 30,
    display: "flex",
    justifyContent: "center",
           
  }, 
  Text: {
    color: "Black",
   
    fontSize: 18
  },
  header:{width: "100%", height: "10%", flexDirection: "row", alignItems: "center", paddingHorizontal: 10}
  
});
