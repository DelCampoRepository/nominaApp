
import { View,StyleSheet, FlatList, Text, TouchableOpacity } from "react-native"
import { CustomTableRow } from "./CustomTableRow";
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { ActualizarAvances } from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { SeleccionarEmpleadosCapturados } from "../../../src/services/sqlite";
import { IAvanceEmpleado } from "../../../src/interfaces/local/IAvanceEmpleado";
import { Alert } from "react-native";
import ModalAvanceGeneral from "./ModalAvanceGeneral";
import ModalAgregarAvanceindividual from "./ModalAgregarAvanceIndividual";


type props={
    
    codLote: string;
    codNave:string;
    coAct:string;
    codAv:string;
    descNave:string;
    desAct:string;
    rendTop:number;
    rendApli:number;
    setTotalAvance: (avanceT:number) => void;
    setTotalJornal:(jornalTotal:number) => void;
}



export const CustomTable =({setTotalAvance,setTotalJornal,codLote,codNave,coAct, codAv,descNave,desAct,rendApli,rendTop}:props) => {
  const [AvancesEmpleado, setAvancesEmpleado] = useState<IAvanceEmpleado[]>([]);
  const [modaVisible, setModalVisible] = useState(false);
  const [modalAvanceIndi,setModalAvanceIndi] = useState(false);
  const [datosEmpleado, setDatosEmpleado]= useState({
    codigo:"",
    nombre:""
  })
  // Hay avances capturados que aún no se guardan con Guardar.
  const sinGuardar = useRef(false);
  const navigation = useNavigation();

  // Los avances capturados viven solo en este estado hasta presionar Guardar:
  // al salir (flecha del encabezado o botón atrás de Android) se pide
  // confirmación para no perderlos.
  useEffect(() => {
    const quitar = navigation.addListener("beforeRemove", (e) => {
      if (!sinGuardar.current) return;
      e.preventDefault();
      Alert.alert(
        "Avances sin guardar",
        "Si sale ahora se perderán los avances que no ha guardado.",
        [
          { text: "Seguir capturando", style: "cancel" },
          {
            text: "Salir sin guardar",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action)
          }
        ]
      );
    });
    return quitar;
  }, [navigation]);

useEffect(() => {

  async function obtenerEmpleados() {
         
    const semana = await ConsultarSemanaActiva();
  
    console.log(
      codLote,
      codNave,
      obtenerFechaHoy(),
      semana,
      coAct,
      codAv
    )

  console.log(obtenerFechaHoy())
    const Lista = await SeleccionarEmpleadosCapturados(
      codLote,
      codNave,
      obtenerFechaHoy(),
      semana,
      coAct,
      codAv
    );

    const empleados = Lista.map((emp) => ({
      cod_lote: codLote,
      cod_nave: codNave,
      desc_nave: descNave,
      cod_actividad: coAct,
      cod_avance: codAv,
      des_actividad: desAct,
      cod_empleado: emp.cod_empleado,
      nom_empleado: emp.nom_empleado,
      avance: emp.avance,
      avanceA: emp.avanceA,
      fecha:obtenerFechaHoy(),
      semanaActiva: emp.semana
    }));
    
      setAvancesEmpleado(empleados as IAvanceEmpleado[]);
  }
    
  obtenerEmpleados();
}, []);


useEffect(()=>{

  let totalAvance = 0;
  AvancesEmpleado.forEach(empleado => {
      totalAvance += Number(empleado.avanceA);
    
  });
  setTotalAvance(totalAvance);
  setTotalJornal(totalAvance/rendApli);
},[AvancesEmpleado]);

const obtenerFechaHoy = (): string => {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
};


const handleGuardar = async () => {
     const res= await ActualizarAvances(AvancesEmpleado);
     if (res) {
      sinGuardar.current = false;
      Alert.alert("","Se han actualizado los avances");
     }
    else
      Alert.alert("Error","Error al intentar guardar los avances");
};

async function handleChange (avance:string)  {
    const semana =  await ConsultarSemanaActiva();
  sinGuardar.current = true;
  setAvancesEmpleado(prev =>
    prev.map(emp =>
      emp.cod_empleado === datosEmpleado.codigo
        ? {
            ...emp,
            avanceA: avance,
            avance: avance,
             semanaActiva:semana
          }
        : emp
    )
  );

};


async function  AsignarAvanceGenera(avanceGral : string){
  const semana =  await ConsultarSemanaActiva();
    const actualizados :IAvanceEmpleado[] = AvancesEmpleado.map(emp => ({
    ...emp,
    avanceA: String(Number(avanceGral)),
    avance: String(Number(avanceGral)),
    semanaActiva:semana
  }));

  sinGuardar.current = true;
  setAvancesEmpleado(actualizados);
}


    return(
    <View style={styles.container}> 
       <View style={styles.header}>
              <Text style={styles.headerText}>EMPLEADOS CAPTURADOS</Text>               
              </View>
                <View style={styles.divider}/>
              <View style={{ height:"65%"}}>
                
                {AvancesEmpleado.length > 0 &&                   
                  <View >
                    <FlatList
                      data={AvancesEmpleado}
                      renderItem={({item}) => <CustomTableRow setModalVisible={setModalAvanceIndi} setDatosEpleado ={setDatosEmpleado}  avance={item} />}
                      keyExtractor={avance => `${avance.cod_lote}-${avance.cod_nave}-${avance.cod_actividad}-${avance.cod_avance}-${avance.cod_empleado}-${avance.fecha}`}
                      contentContainerStyle={{ paddingBottom: 165 }}
                    />
                  </View>
                }
              </View>
              <View style={{ height:"25%"}}>
                  <TouchableOpacity  style={styles.submit} onPress={handleGuardar}>
                      <Text style={styles.submitText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity  style={styles.agregarAvance} onPress={() =>setModalVisible(true)}>
                      <Text style={styles.submitText}>Agregar avance general</Text>
                  </TouchableOpacity>
              </View>
              
        { modaVisible &&
          <ModalAvanceGeneral modalVisible={modaVisible}  setModalVisible={setModalVisible} setAvance={AsignarAvanceGenera} rendTop={rendTop} rendApli={rendApli}/>
        }
        {modalAvanceIndi &&
          <ModalAgregarAvanceindividual   setAvance={handleChange} modalVisible={modalAvanceIndi} setModalVisible={setModalAvanceIndi} rendTop={rendTop} rendApli={rendApli}/>
        }
    </View>)
}


const styles = StyleSheet.create({

    container:{
        marginTop:5,
        width:"100%",
        height:"70%",
        backgroundColor:""
    },
    header:{
        height:"6%",
            flexDirection:'column',
            justifyContent:'space-between',
            alignItems:'center',
            marginBottom:10
    },
    headerText:{
        fontWeight:'500',
        fontSize:16,
        marginHorizontal:'auto',
        padding:5,
        paddingTop:9
    },
    submit:{
        marginTop:10,
        marginBottom:10,
        width:"95%",
        height:50,
        borderRadius:10,
        backgroundColor:"#13c044",
        marginHorizontal:'auto',
        alignItems:'center',
        justifyContent:'center'
    }
    ,
    agregarAvance:{
        marginTop:0,
        width:"95%",
        height:50,
        borderRadius:10,
        backgroundColor:"#13c044",
        marginHorizontal:'auto',
        alignItems:'center',
        justifyContent:'center'
    }
    ,
    submitText:{
        fontWeight:"600",
        color:'white'
    },
  divider: { height: 1, backgroundColor: "#bcb5b5", marginVertical: 12, width:"90%", marginHorizontal:'auto'},

})