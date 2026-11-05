import "react-native-gesture-handler";
import "react-native-reanimated";

import { Text, TextInput } from "react-native";

// Algunos usuarios activan "texto grande" o "negritas" en la configuracion de
// accesibilidad del dispositivo. React Native escala el fontSize de todos los
// <Text>/<TextInput> segun esa config., lo que desborda los textos de las
// cards/tablas de esta app (pensadas para un tamano fijo). Se desactiva ese
// escalado globalmente para que el tamano de letra siempre sea el definido
// en los estilos, sin importar la configuracion del dispositivo.
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider, Portal } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./src/context/AuthContext";
import { theme } from "./screens/theme";
import { RootStackParamList } from "./types/types";

import QrScannerScreen from "./screens/QrScannerScreen";

import EmpleadosScreen from "./screens/EmpleadosScreen/screen/EmpleadosScreen";
import LoginScreen from "./screens/LoginScreen/screen/LoginScreen";

import ActividadesLoteScreen from "./screens/ActividadesLoteScreen/screen/ActividadesLotesScreen";
import ActividadesNaveScreen from "./screens/ActividadesNaveScreen/screen/ActividadesNaveScreen";
import HomeScreen from "./screens/HomeScreen/screen/HomeScreen";
import AvancesxActividadesScreen from "./screens/AvancesPorActividadScreen/screen/AvancesxActividadesScreen";

import AvancesScreen from "./screens/AvancesScreen/screen/AvancesScreen";
import ReporteAvancesScreen from "./screens/ReportesScreen/screen/ReporteAvancesScreen"
import TransferirScreen from "./screens/TrasferirScreen/screen/TrasferirScreen";

import { EmployeeProvider } from "./src/context/QrContext";
import { NaveProvider } from "./src/context/NaveContext";
import { UsuarioProvider } from "./src/context/userContext";
import LoadingScreen from "./screens/LoadingScreen/screen/LoadingScreen";

import PatallaPagosScreen from "./screens/PantallaPagosScreen/screen/PantallaPagosScreen";
import EmpleadosSeleccionadosScreen from "./screens/EmpleadosSeleccionadosScreen/screen/EmpleadosSeleccionadosScreen";
import ConfigurarPatronScreen from "./screens/ConfigurarPatronScreen/screen/ConfigurarPatronScreen";
const Stack = createNativeStackNavigator<RootStackParamList>(); // ← GENÉRICO OBLIGATORIO

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <EmployeeProvider>
              <UsuarioProvider>
                <NaveProvider>
                  <NavigationContainer>
                    <Stack.Navigator
                      initialRouteName="Login"
                      screenOptions={{
                        headerShown: false,
                        gestureEnabled: false,
                        fullScreenGestureEnabled: false
                      }}
                    >
                      <Stack.Screen
                        name="Inicio"
                        component={HomeScreen}
                        options={{ gestureEnabled: false }}
                      />
                      <Stack.Screen
                        name="Pagos"
                        component={PatallaPagosScreen}
                        options={{ gestureEnabled: false }}
                      />
                      <Stack.Screen
                        name="Loading"
                        component={LoadingScreen}
                        options={{ gestureEnabled: false }}
                      />
                      <Stack.Screen
                        name="Escaner"
                        component={QrScannerScreen}
                      />
                      <Stack.Screen
                        name="Empleados"
                        component={EmpleadosScreen}
                        options={{ gestureEnabled: false }}
                      />
                      <Stack.Screen name="Login" component={LoginScreen} />
                      {/*<Stack.Screen
                        name="ListaEmpleados"
                        component={ListaEmpleadosScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      
                      <Stack.Screen
                        name="ListaNaves"
                        component={ListaNavesScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      
                      */
                      
                      }
                      
                      <Stack.Screen
                        name="ActividadesLote"
                        component={ActividadesLoteScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      <Stack.Screen
                        name="ActividadesNave"
                        component={ActividadesNaveScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      <Stack.Screen
                        name="ReporteAvances"
                        component={ReporteAvancesScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      <Stack.Screen
                        name="Transferir"
                        component={TransferirScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      <Stack.Screen
                        name="Avances"
                        component={AvancesScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      <Stack.Screen
                        name="AvancesxActividad"
                        component={AvancesxActividadesScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      <Stack.Screen
                        name="EmpleadosSeleccionados"
                        component={EmpleadosSeleccionadosScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      <Stack.Screen
                        name="ConfigurarPatron"
                        component={ConfigurarPatronScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                    </Stack.Navigator>
                  </NavigationContainer>
                </NaveProvider>
              </UsuarioProvider>
            </EmployeeProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
