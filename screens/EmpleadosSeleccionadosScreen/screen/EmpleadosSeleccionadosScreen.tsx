import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, FlatList } from "react-native";
import Header from "../../../src/components/Header";
import { useEffect, useState } from "react";
import { SeleccionarTodosEmpleadosCapturados } from "../../../src/services/sqlite";
import { IEmpleadoCapturado } from "../../../src/interfaces/local/IEmpleadoCapturado";
import CardEmpleadoSeleccionado from "../components/CardEmpleadoSeleccionado";

type Props = NativeStackScreenProps<RootStackParamList, "EmpleadosSeleccionados">;

export default function EmpleadosSeleccionadosScreen({ navigation }: Props) {
  const [listaEmpleados, setListaEmpleados] = useState<IEmpleadoCapturado[]>([]);

  useEffect(() => {
    async function cargarEmpleados() {
      const datos = await SeleccionarTodosEmpleadosCapturados();
      setListaEmpleados(datos);
    }

    cargarEmpleados();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Header titulo="EMPLEADOS SELECCIONADOS" pantalla="Inicio" />
          </View>

          <FlatList
            data={listaEmpleados}
            keyExtractor={(item, index) =>
              `${item.cod_empleado}-${item.cod_lote}-${item.cod_nave}-${item.FechaRegistro}-${item.semana}-${index}`
            }
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => <CardEmpleadoSeleccionado empleado={item} />}
            ListEmptyComponent={
              <Text style={styles.textoVacio}>No hay empleados seleccionados</Text>
            }
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: "#e5e9f4ff",
    justifyContent: "center"
  },
  formContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e5e9f4ff"
  },
  header: {
    width: "100%",
    height: "7%"
  },
  textoVacio: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 14,
    color: "#333333"
  }
});
