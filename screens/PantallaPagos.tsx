import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {  useState } from "react";
import { RootStackParamList } from "../types/types";
import { Text, IconButton, List, Divider, Button } from "react-native-paper";
import { useEffect } from "react";
import {  ScrollView } from "react-native-gesture-handler";
import HeaderTablaActiAva from "../src/components/HeaderTablaActiAva";
import { obtenerJefesNave } from "../src/services/ObtenerJefesNave";
import { useUser } from "../src/context/userContext";
import { IRespuestaJefesNave } from "../src/interfaces/IRespuestaJefeNave";
import { IJefeNave } from "../src/interfaces/local/IJefeNave";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ObtenerEmpleadosNomina } from "../src/services/ObtenerAvanceEmpleados";
import {IAvanceUI } from "../src/interfaces/IAvancesNomina";
import {
  existeAvanceEnSQLite,
  insertarAvanceSQLite,
  obtenerSemanaActivaSqLite,
  SeleccionarAvancesNomina
} from "../src/services/sqlite";
type Props = NativeStackScreenProps<RootStackParamList, "Pagos">;

type props = {
  columnas: subTipo[];
};

type subTipo = {
  nombre: string;
  tamaño: number;
};

export default function PatallaPagos({ route, navigation }: Props) {
  const { iduUsuario } = useUser();
  const [ListaJefes, setListaJefes] = useState<IJefeNave[]>([]);
  const [expandirLista, setExpandirLista] = useState<boolean>(false);
  const [listaAvances, setListaAvances] = useState<IAvanceUI[]>([]);
  const [fecha, setFecha] = useState<Date>(new Date());
  const [mostrar, setMostrar] = useState(false);
  const [AvancesAgrupados, setAvancesAgrupados] = useState<
    { codNave: string; avances: IAvanceUI[] }[]
  >([]);
  const [datosform, setDatosform] = useState({
    jefeNave: "",
    cod_jefe_nave: "",
    fecha: ""
  });

  useEffect(() => {
    async function fetchJefesNave() {
      const jefes = (await obtenerJefesNave({
        idu_usuario: String(iduUsuario)
      })) as IRespuestaJefesNave;

      if (jefes.jefesDeNave.length === 0) {
        Alert.alert("Error", "No hay jefes de nave para este usuario");
        return;
      }
      setListaJefes(jefes.jefesDeNave);
    }

    fetchJefesNave();
  }, []);

  useEffect(() => {
    if (listaAvances.length > 0) {
      const avancesPorNave = listaAvances.reduce<Record<string, IAvanceUI[]>>(
        (acc, avance) => {
          const nave = avance.Cod_nave;

          if (!acc[nave]) {
            acc[nave] = [];
          }

          acc[nave].push(avance);

          return acc;
        },
        {}
      );

      const avancesAgrupados = Object.entries(avancesPorNave).map(
        ([codNave, avances]) => ({
          codNave,
          avances
        })
      );
      setAvancesAgrupados(avancesAgrupados);
     

    }

  }, [listaAvances]);

  const handleObtenerAvances = async () => {
    // Lógica para obtener avances de empleados

    try {
      if (datosform.cod_jefe_nave === "" || datosform.fecha === "") {
        alert("Por favor, complete todos los campos.");
        return;
      }

      const semana: any[] = await obtenerSemanaActivaSqLite();
      const avanceUI: IAvanceUI[] = [];

      const response = await ObtenerEmpleadosNomina({
        cod_jefe_nave: datosform.cod_jefe_nave,
        fecha: datosform.fecha
      });

      //console.log("response", response);

      if (response?.avances.length === 0)
        Alert.alert(
          "Error",
          "La base de datos no tiene registros con esos parametros!"
        );
      for (const avance of response?.avances || []) {
        const existe = await existeAvanceEnSQLite(
          avance,
          semana[0].semanaActiva
        );
        //  console.log("existe", existe);
        avanceUI.push({
          ...avance,
          existeEnSqlite: existe ? true : false
        } as IAvanceUI);
      }
      //  console.log(avanceUI);
      setListaAvances(avanceUI);
    } catch (error: any) {
      Alert.alert("Error", "Ocurrió un error al obtener los avances.");
    }
  };

  const handleGuardarAvancesNomina = async () => {
    try {
      const semana: any[] = await obtenerSemanaActivaSqLite();

      const avancesAGuardar = AvancesAgrupados.flatMap((g) => g.avances).filter(
        (a) => a.Seleccionado === 1 && !a.existeEnSqlite
      );

       console.log('flat',JSON.stringify(avancesAGuardar,null,2))
      
       if (avancesAGuardar.length === 0) {
        Alert.alert("Aviso", "No hay avances nuevos para guardar");
        return;
      }

     // await insertarAvanceSQLite(avancesAGuardar, semana[0].semanaActiva);

      Alert.alert("Éxito", "Avances guardados correctamente");
      setListaAvances((prev) =>
        prev.map((a) =>
          avancesAGuardar.some(
            (x) =>
              x.Cod_empleado === a.Cod_empleado &&
              x.Cod_actividad === a.Cod_actividad &&
              x.Cod_avance === a.Cod_avance &&
              x.Cod_nave === a.Cod_nave
          )
            ? { ...a, existeEnSqlite: true }
            : a
        )
      );

      const rest = await SeleccionarAvancesNomina();

      //  console.log("avances para sincronizar", JSON.stringify(rest, null, 2));
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al guardar los avances.");
    }
  };

  const onChange = (_: any, selectedDate?: Date) => {
    setMostrar(false);
    if (!selectedDate) return;
 const fec = new Date();
    const fecha =
      fec.getFullYear().toString() +
      (fec.getMonth() + 1).toString().padStart(2, "0") +
      fec.getDate().toString().padStart(2, "0");

    // setFecha(selectedDate);
   console.log(fecha);
    setDatosform({
      ...datosform,
      fecha: " 20260509" // YYYYMMDD
    });
    // Alert.alert("", fecha);
  };

   
  const handleSeleccion = (
    codEmpleado: string,
    codActividad: string,
    codAvance: string
  ) => {
    setListaAvances((prev) =>
      prev.map((a) =>
        a.Cod_empleado === codEmpleado &&
        a.Cod_actividad === codActividad &&
        a.Cod_avance === codAvance
          ? { ...a, Seleccionado: a.Seleccionado === 1 ? 0 : 1 }
          : a
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={{ width: "20%" }}>
          <IconButton
            icon={require("../assets/arrow-left.png")}
            iconColor="black"
            size={30}
            onPress={() => navigation.navigate("Inicio")}
            style={{ backgroundColor: "" }}
          />
        </View>
        <View style={{ width: "80%" }}>
          <Text variant="titleSmall" style={{ marginLeft: 45 }}>
            AVANCES JEFES DE NAVE
          </Text>
        </View>
      </View>
      <View style={styles.form}>
        <View>
          <List.Section
            title=""
            style={{ borderRadius: 5, backgroundColor: "white" }}
          >
            <List.Accordion
              title={
                datosform.jefeNave === ""
                  ? "Seleccionar Jefe de Nave"
                  : datosform.cod_jefe_nave + " " + datosform.jefeNave
              }
              expanded={expandirLista}
              onPress={() => {
                setExpandirLista(!expandirLista);
              }}
            >
              <ScrollView
                style={{
                  backgroundColor: "white",
                  height: 200
                }}
              >
                {ListaJefes.length > 0 &&
                  ListaJefes.map((jefe) => (
                    <View key={jefe.Cod_jefe_nave}>
                      <List.Item
                        title={jefe.Cod_jefe_nave + " " + jefe.NombreJefeNave}
                        onPress={() => {
                          setDatosform({
                            ...datosform,
                            cod_jefe_nave: jefe.Cod_jefe_nave,
                            jefeNave: jefe.NombreJefeNave
                          });

                          setExpandirLista(false);
                        }}
                      />
                      <Divider />
                    </View>
                  ))}
              </ScrollView>
            </List.Accordion>
          </List.Section>
          <TouchableOpacity
            onPress={() => setMostrar(true)}
            style={{
              backgroundColor: "green",
              height: 40,
              width: "100%",
              borderRadius: 1,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10
            }}
          >
            <Text
              style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              variant="bodyMedium"
            >
              Seleccionar Fecha
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleObtenerAvances}
            style={{
              backgroundColor: "green",
              height: 40,
              width: "100%",
              borderRadius: 2,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10
            }}
          >
            <Text
              style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              variant="bodyMedium"
            >
              Consultar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleGuardarAvancesNomina}
            style={{
              backgroundColor: "green",
              height: 40,
              width: "100%",
              borderRadius: 2,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10
            }}
          >
            <Text
              style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              variant="bodyMedium"
            >
              Guardar avances
            </Text>
          </TouchableOpacity>
          <View style={{ marginTop: 10 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "bold" }}
              variant="bodyMedium"
            >
              Fecha: {fecha ? fecha.toLocaleDateString() : ""}
            </Text>
          </View>
          {mostrar && (
            <DateTimePicker
              value={fecha}
              mode="date"
              display="default"
              onChange={onChange}
            />
          )}
        </View>
      </View>
      <View style={styles.table}>
        <ScrollView>
          <ScrollView horizontal={true} style={{ flex: 1 }}>
            <View>
              <View style={{ width: "100%", height: 30 }}>
                <HeaderTablaActiAva
                  columnas={[
                    { nombre: "Revisado", tamaño: 100 },
                    { nombre: "Cod. Emp.", tamaño: 100 },
                    { nombre: "Nom. Empleado", tamaño: 350 },
                    { nombre: "Actividad", tamaño: 100 },
                    { nombre: "Avance", tamaño: 100 },
                    { nombre: "Jornal", tamaño: 100 },
                    { nombre: "Rend A.", tamaño: 100 }
                  ]}
                />
              </View>
              <View>
                {AvancesAgrupados.map((grupo) => (
                  <View key={grupo.codNave} style={{ marginBottom: 20 }}>
                    <Text
                      variant="bodyMedium"
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        marginLeft: 10,
                        marginBottom: 10
                      }}
                    >
                      Nave: {grupo.codNave}
                    </Text>
                    {grupo.avances.map((avance, index) => (
                      <TouchableOpacity
                        key={`${avance.Cod_actividad}-${avance.Cod_avance}-${avance.Cod_empleado}`}
                        onPress={() =>
                          handleSeleccion(
                            avance.Cod_empleado,
                            avance.Cod_actividad,
                            avance.Cod_avance
                          )
                        }
                      >
                        <View style={{ flexDirection: "row" }}>
                          <View style={styles.ViewTablarev}>
                            <IconButton
                              icon={
                                avance.Seleccionado === 1
                                  ? require("../assets/check-bold.png")
                                  : ""
                              }
                              iconColor="green"
                              size={20}
                              style={{
                                width: 15,
                                height: 15,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            />
                          </View>
                          <View
                            style={[
                              styles.ViewTabla,
                              {
                                backgroundColor: !avance.existeEnSqlite
                                  ? "lightgray"
                                  : "green"
                              }
                            ]}
                          >
                            <Text
                              variant="bodyMedium"
                              style={styles.textoTabla}
                            >
                              {avance.Cod_empleado}{" "}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.ViewTablaNombreEmp,
                              {
                                backgroundColor: !avance.existeEnSqlite
                                  ? "lightgray"
                                  : "green"
                              }
                            ]}
                          >
                            <Text
                              variant="bodyMedium"
                              style={styles.textoTabla}
                            >
                              {avance.NombreEmpleado}{" "}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.ViewTabla,
                              {
                                backgroundColor: !avance.existeEnSqlite
                                  ? "lightgray"
                                  : "green"
                              }
                            ]}
                          >
                            <Text
                              variant="bodyMedium"
                              style={styles.textoTabla}
                            >
                              {avance.Cod_actividad}
                              {"-"}
                              {avance.Cod_avance}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.ViewTabla,
                              {
                                backgroundColor: !avance.existeEnSqlite
                                  ? "lightgray"
                                  : "green"
                              }
                            ]}
                          >
                            <Text
                              variant="bodyMedium"
                              style={styles.textoTabla}
                            >
                              {avance.Avance.toFixed(2)}{" "}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.ViewTabla,
                              {
                                backgroundColor: !avance.existeEnSqlite
                                  ? "lightgray"
                                  : "green"
                              }
                            ]}
                          >
                            <Text
                              variant="bodyMedium"
                              style={styles.textoTabla}
                            >
                              {(avance.Avance / avance.Rendimiento).toFixed(
                                2
                              )}{" "}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.ViewTabla,
                              {
                                backgroundColor: !avance.existeEnSqlite
                                  ? "lightgray"
                                  : "green"
                              }
                            ]}
                          >
                            <Text
                              variant="bodyMedium"
                              style={styles.textoTabla}
                            >
                              {avance.Rendimiento.toFixed(2)}{" "}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8e9f1ff"
  },
  form: {
    width: "90%",
    height: "30%",
    backgroundColor: "#e8e9f1ff"
  },
  table: {
    width: "90%",
    height: "60%",
    backgroundColor: "#ffffff"
  },

  headerContainer: {
    backgroundColor: "",
    width: "100%",
    height: "6%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  textoTabla: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
    color: "white"
  },
  ViewTabla: {
    width: 100,
    height: 30,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  ViewTablarev: {
    width: 100,
    height: 30,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white"
  },
  ViewTablaNombreEmp: {
    width: 350,
    height: 30,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 5
  }
});
