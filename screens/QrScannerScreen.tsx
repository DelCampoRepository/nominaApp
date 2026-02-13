import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraType,
  type BarcodeScanningResult
} from "expo-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { useEmployee } from "../src/context/QrContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../src/components/Header";
import { buscarNombreEmpleado } from "../src/services/sqlite";

type Props = NativeStackScreenProps<RootStackParamList, "Escaner">;

export default function QrScannerScreen({ navigation }: Props) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { setEmployeeCode, employeeCode, setNombreEmpleado } = useEmployee();

  if (!permission)
    return (
      <View style={styles.center}>
        <Text>Cargando permisos…</Text>
      </View>
    );

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Se requiere permiso de cámara</Text>
        <Button title="Conceder permiso" onPress={requestPermission} />
        <Button title="Volver" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const onScan = async (res: BarcodeScanningResult) => {
    if (scanned) return;
    {
      async function buscar(cod: string) {
        const nom: any = await buscarNombreEmpleado(cod);
        console.log("res");
        setNombreEmpleado(nom[0].Nom_empleado);
        navigation.goBack();
      }
      buscar(res.data.substring(0, 6));
      setScanned(true);
      setEmployeeCode(res.data.substring(0, 6));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          width: "100%",
          height: "10%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white"
        }}
      >
        <Header titulo="ESCANER CREDENCIAL EMPLEADO" pantalla="Inicio" />
      </View>
      <View style={{ width: "100%", height: "70%" }}>
        <CameraView
          style={[
            StyleSheet.absoluteFill,
            { marginHorizontal: 50, marginVertical: 150, borderRadius: 40 }
          ]}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : onScan}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
      </View>
      <View style={{ height: "20%", width: "100%" }}></View>
      <View style={styles.bottom}>
        <Text style={styles.tip}>
          {scanned ? "Procesando…" : "Apunta al QR"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  bottom: {
    height: "20%",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "#e8e9f1ff",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    flex: 1, // ocupa toda la pantalla
    backgroundColor: "#e8e9f1ff",
    justifyContent: "center",
    alignItems: "center"
  },
  tip: { color: "#000000ff", fontSize: 16 }
});
