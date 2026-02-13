import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";

import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Modal
} from "react-native-paper";
import {
  ConsultarEmpleados,
  ConsultarEmpleadosxFiltro,
  eliminarDatos
} from "../src/services/local/guardarListaDeEmpleadosEnDbLocal";
import { useEmployee } from "../src/context/QrContext";

import { IRespuestaTransferenciaCat } from "../src/interfaces/IRespuestaTransferenciaCat1";
import Header from "../src/components/Header";
type Props = NativeStackScreenProps<RootStackParamList, "ListaEmpleados">;

export default function ListaEmpleadosScreen({ navigation }: Props) {
  const [nombrAbuscar, setNombreABuscar] = useState<string>("");
  const {
    setEmployeeCode,
    employeeCode,
    clearEmployeeCode,

    setNombreEmpleado,
    nombreEmpleadoState,
    clearNombre
  } = useEmployee();

  const [ListaEmpleados, setListaEmpleados] = useState(
    [] as IRespuestaTransferenciaCat[]
  );

  const [visibleModal, setVisibleModal] = React.useState(false);
  const [loading, setLoading] = useState(true);

  const showModal = () => setVisibleModal(true);
  const hideModal = () => setVisibleModal(false);
  const containerStyle = { backgroundColor: "#ffffff03", padding: 20 };
  useEffect(() => {
    clearEmployeeCode();
    clearNombre();
    HandleCarcarListaDeEmpleados();
    setNombreABuscar("");
  }, []);

  useEffect(() => {
    if (ListaEmpleados.length > 0) setLoading(false);
  }, [ListaEmpleados]);
  async function HandleCarcarListaDeEmpleados() {
    const response = await ConsultarEmpleados();

    setListaEmpleados(response as IRespuestaTransferenciaCat[]);
  }

  useEffect(() => {
    if (employeeCode != null) hideModal();
  }, [employeeCode]);
  function handleEmployeeSelection(
    employeeCode: string,
    nombresEmpleado: string
  ) {
    showModal();

    setEmployeeCode(employeeCode);
    setNombreEmpleado(nombresEmpleado);
  }

  const handleAceptar = async () => {
    navigation.goBack();
  };

  const handleBuscarEmpleadoEnListaLocal = async () => {
    const res = await ConsultarEmpleadosxFiltro(nombrAbuscar);
    if (res.length > 0) setListaEmpleados(res as IRespuestaTransferenciaCat[]);
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", height: "12%" }}>
        <Header titulo="LISTA DE EMPLEADOS" pantalla="" />
      </View>
      <View style={styles.searchContainer}>
        <View
          style={{
            width: "60%",
            display: "flex",
            justifyContent: "center"
          }}
        >
          <TextInput
            value={nombrAbuscar}
            onChangeText={(tex) => setNombreABuscar(tex)}
            label="Nombre de empleado"
            style={styles.inputText}
            mode="outlined"
            maxLength={150}
            underlineColor="green"
            activeUnderlineColor="green"
            textColor="#150000ff"
            placeholder=""
            dense={true}
            outlineColor="#2730267e"
          />
        </View>
        <View
          style={{
            width: "40%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Button
            mode="contained"
            onPress={handleBuscarEmpleadoEnListaLocal}
            buttonColor="#2e6926ff"
            loading={false}
            icon={require("../assets/account-search.png")}
          >
            {"Buscar"}
          </Button>
        </View>
      </View>

      <View
        style={{ width: "100%", height: "48%", backgroundColor: "#e8e9f1ff" }}
      >
        <View style={styles.headerTabla}>
          <View style={{ width: "50%" }}>
            <Text
              variant="bodyLarge"
              style={{ paddingLeft: 10, fontWeight: "bold", color: "white" }}
            >
              Cod. emp.
            </Text>
          </View>
          <View style={{ width: "50%" }}>
            <Text
              variant="bodyLarge"
              style={{ paddingLeft: 10, fontWeight: "bold", color: "white" }}
            >
              Nombre
            </Text>
          </View>
        </View>

        {!loading ? (
          <ScrollView horizontal style={styles.table}>
            <ScrollView>
              {ListaEmpleados.map((empleado, index) => (
                <TouchableOpacity
                  onPress={() =>
                    handleEmployeeSelection(
                      empleado.cod_empleado,
                      empleado.Nom_empleado
                    )
                  }
                  key={index}
                  style={[
                    styles.userContainer,
                    {
                      backgroundColor:
                        index % 2 === 0 ? "#fffffffc" : " #afafafff"
                    }
                  ]}
                >
                  <Text variant="bodyLarge" style={{ paddingLeft: 10 }}>
                    {empleado.cod_empleado + "          "}

                    {empleado.Nom_empleado}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              marginHorizontal: 10,
              borderLeftWidth: 1,
              borderRightWidth: 1,

              backgroundColor: "#e8e9f1ff"
            }}
          >
            <ActivityIndicator animating={true} color="green" />
            <Text
              variant="bodyLarge"
              style={{
                paddingLeft: 10,
                fontWeight: "bold",
                color: "black",
                marginTop: 20
              }}
            >
              Cargando lista...
            </Text>
          </View>
        )}
      </View>
      <View
        style={{
          width: "100%",
          height: "29%",
          paddingHorizontal: 10,
          paddingTop: 10,
          backgroundColor: "#e8e9f1ff"
        }}
      >
        <TextInput
          value={employeeCode ?? ""}
          label="codigo "
          style={styles.inputText}
          mode="outlined"
          maxLength={6}
          underlineColor="green"
          activeUnderlineColor="green"
          textColor="#150000ff"
          placeholder=""
          dense={true}
          outlineColor="#2730267e"
          editable={false}
        />
        <TextInput
          value={nombreEmpleadoState ?? ""}
          label="Nombre "
          style={styles.inputText}
          mode="outlined"
          maxLength={150}
          underlineColor="green"
          activeUnderlineColor="green"
          textColor="#150000ff"
          placeholder=""
          dense={true}
          outlineColor="#2730267e"
          editable={false}
        />
        <View style={{ paddingTop: 10 }}>
          <Button
            mode="contained"
            onPress={handleAceptar}
            buttonColor="green"
            loading={false}
          >
            Aceptar
          </Button>
        </View>
      </View>
      <Modal
        visible={visibleModal}
        onDismiss={hideModal}
        contentContainerStyle={containerStyle}
      >
        <ActivityIndicator animating={true} color="green" />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  inputText: {
    backgroundColor: "#e8e9f1ff"
  },
  headerTabla: {
    backgroundColor: "green",
    height: 30,
    marginHorizontal: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  searchContainer: {
    width: "100%",
    height: "12%",
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#e8e9f1ff",
    paddingHorizontal: 10
  },
  table: {
    marginHorizontal: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: "#e8e9f1ff"
  },

  table2: {
    marginHorizontal: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,

    backgroundColor: "#e8e9f1ff"
  },
  userContainer: {
    width: "100%",
    height: 30,
    display: "flex",
    justifyContent: "center"
  }
});
