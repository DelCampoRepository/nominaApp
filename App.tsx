import "react-native-gesture-handler";
import "react-native-reanimated";

import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider, Portal } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./src/context/AuthContext";
import { theme } from "./screens/theme";
import { RootStackParamList } from "./types/types";

import HomeScreen from "./screens/HomeScreen";
import QrScannerScreen from "./screens/QrScannerScreen";
import EmpleadosScreen from "./screens/EmpleadosScreen";
import LoginScreen from "./screens/LoginScreen";
import ListaEmpleadosScreen from "./screens/ListaEmpleadosScreen";
import ListaNavesScreen from "./screens/ListaNavesScreen";
import ActividadesLoteScreen from "./screens/ActividadesLoteScreen";
import ActividadesNaveScreen from "./screens/ActividadesNaveScreen";
import ReporteAvancesScreen from "./screens/ReporteAvancesScreen";
import TransferirScreen from "./screens/TrasferirScreen";
import AvancesSCreen from "./screens/AvancesScreen";
import { EmployeeProvider } from "./src/context/QrContext";
import { NaveProvider } from "./src/context/NaveContext";
import { UsuarioProvider } from "./src/context/userContext";
import LoadingScreen from "./screens/LoadingScreen";
import AvancesxActividadesScreen from "./screens/AvancesxActividadesScreen";
import PatallaPagos from "./screens/PantallaPagos";
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
                        component={PatallaPagos}
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
                      <Stack.Screen
                        name="ListaEmpleados"
                        component={ListaEmpleadosScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      <Stack.Screen
                        name="ListaNaves"
                        component={ListaNavesScreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
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
                        component={AvancesSCreen}
                        options={{ gestureEnabled: false }}
                      ></Stack.Screen>
                      <Stack.Screen
                        name="AvancesxActividad"
                        component={AvancesxActividadesScreen}
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
