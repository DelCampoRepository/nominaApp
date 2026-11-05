import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity, View, Text, Image, Alert,FlatList} from "react-native";
import Header from "../../../src/components/Header";
import { useEffect, useState } from "react";
import ModalJefes from "../components/ModalJefes";
import { IJefeNave } from "../../../src/interfaces/local/IJefeNave";
import { obtenerJefesNave } from "../../../src/services/ObtenerJefesNave";
import { IRespuestaJefesNave } from "../../../src/interfaces/IRespuestaJefeNave";
import { useUser } from "../../../src/context/userContext";
import { existeAvanceEnSQLite, insertarAvanceSQLite, SeleccionarAvancesNomina } from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { IAvanceUI } from "../../../src/interfaces/IAvancesNomina";
import { ObtenerEmpleadosNomina } from "../../../src/services/ObtenerAvanceEmpleados";
import { IrespuestaAvancesNomina } from "../../../src/services/IrespuestaAvancesNomina";
import { CustomTable } from "../components/CustomTable";
import ModalFiltros from "../components/ModalFiltros";
import { avisarSinInternet, hayInternet } from "../../../src/utils/conexion";
type Props = NativeStackScreenProps<RootStackParamList, "Pagos">

export default function PatallaPagosScreen({ navigation }: Props) {
 

const [modalJefes, setModalaJefes] = useState(false);
const [modalFiltros, setModafiltros] = useState(false);
const { iduUsuario } = useUser();
const [ListaJefes, setListaJefes] = useState<IJefeNave[]>([]);
const [listaAvances, setListaAvances] = useState<IAvanceUI[]>([]);
const [filtro, setFiltro]=useState("Filtrar por nave");
const [listaNaves, setListaNaves]=useState<string[]>([]);
const [jefeSeleccionado,setJefeSeleccionado] = useState<IJefeNave>({NombreJefeNave:"Seleccione jefe de nave",Cod_jefe_nave:""});



useEffect(() => {

  async function fetchJefesNave() {
      const jefes = (await obtenerJefesNave({idu_usuario: String(iduUsuario)})) as IRespuestaJefesNave;

      if (jefes.jefesDeNave.length === 0) {
        Alert.alert("Error", "No hay jefes de nave para este usuario");
        return;
      }

      setListaJefes(jefes.jefesDeNave);
    }
    
        fetchJefesNave();

}, []);

useEffect(()=>{

  if(listaAvances.length>0)
  setListaNaves(obtenerNavesUnicas(listaAvances));
},[listaAvances])
  

function generarFechaConsulta(): string{
   
    const fec = new Date();
    const fecha =
      fec.getFullYear().toString() +
      (fec.getMonth() + 1).toString().padStart(2, "0") +
      fec.getDate().toString().padStart(2, "0");
      return fecha;
}

async function handleConsultar() {
     
       try {
           if (jefeSeleccionado.Cod_jefe_nave === "") {
             alert("Por favor seleccione jefe de nave");
             return;
           }

           // Se avisa aqui para no mostrar ademas "Ocurrió un error al
           // obtener los avances" del catch.
           if (!(await hayInternet())) {
             avisarSinInternet();
             return;
           }

           const semana = await ConsultarSemanaActiva();
           const fechaConsulta = generarFechaConsulta();
          
           const response = await ObtenerEmpleadosNomina({ cod_jefe_nave: jefeSeleccionado.Cod_jefe_nave, fecha:fechaConsulta });
     
         
           
            if (response?.avances.length === 0)
            {
              Alert.alert( "","La base de datos no tiene registros de hoy para ese jefe de nave!" );
              return;
            }

            validarExistenciaEmpleado(response, semana);
         } 
         catch (error: any) 
         {
           Alert.alert("Error", "Ocurrió un error al obtener los avances.");
         }
    
}
   
async function  validarExistenciaEmpleado(listaEmpleados: IrespuestaAvancesNomina, semana: string) {
    
  const avanceEmpleadoUI: IAvanceUI[] = [];

  for (const empleado of listaEmpleados.avances) 
    {
       const existe = await existeAvanceEnSQLite(empleado, semana);
       
       avanceEmpleadoUI.push({
         ...empleado,
         existeEnSqlite: existe ? true : false
       } as IAvanceUI);
    }

    setListaAvances(avanceEmpleadoUI);
}

const obtenerNavesUnicas = (datos: IAvanceUI[]): string[] => {

  return [...new Set(
    datos.map(item => item.Cod_nave)
  )];

};

async function GuardarAvances()
{
    
  const avancesAGuardar = listaAvances.filter(
    (a) => a.Seleccionado === 1 && !a.existeEnSqlite
  );

  if (avancesAGuardar.length === 0) 
  {
      Alert.alert("Aviso", "No hay avances nuevos para guardar");
      return;
  }

  const semana = await ConsultarSemanaActiva();

  await insertarAvanceSQLite(listaAvances, semana);
  
  Alert.alert("Éxito", "Avances guardados correctamente")
  
  setListaAvances((prev) =>
    prev.map((a) =>
      listaAvances.some(
        (x:any) =>
          x.Cod_empleado === a.Cod_empleado &&
          x.Cod_actividad === a.Cod_actividad &&
          x.Cod_avance === a.Cod_avance &&
          x.Cod_nave === a.Cod_nave
      )
        ? { ...a, existeEnSqlite: true }
        : a
      )
    );
}


return (
  <SafeAreaProvider>
    <SafeAreaView style={styles.centeredView}>
        <View style={styles.formContainer}>
         <View style={styles.header}>
            <Header titulo="REGISTROS JEFES DE NAVE" pantalla=""/>
         </View>
         
          <View style={styles.tableContainer}>
            <CustomTable filtro={filtro} listaEmpleados={listaAvances} setListaAvances={setListaAvances} />
          </View>
            <View style={{width:'100%', height:'17%', paddingTop:15}}>

            <TouchableOpacity style={styles.buttonContainer}  onPress={() => setModalaJefes(true)}>
                <Text  style={styles.text}>{jefeSeleccionado.Cod_jefe_nave}{" "}{jefeSeleccionado.NombreJefeNave}</Text>
                  {jefeSeleccionado.NombreJefeNave !== "Seleccione jefe de nave" ? ( <Image 
                                                 source={require("../../../assets/account-cowboy-hat.png")}
                                                 style={styles.image}   
                                                />):( <Text  style={{fontSize:30, fontWeight:"bold", color:"#13c044"}}>+</Text>)}
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainer}  onPress={() => setModafiltros(true)}>
                <Text  style={styles.text}>{"Nave: "}{filtro}</Text>
                  {filtro !== "Filtrar por nave" ? ( <Image 
                                                 source={require("../../../assets/hoop-housew.png")}
                                                 style={styles.image}   
                                                />):( <Text  style={{fontSize:30, fontWeight:"bold", color:"#13c044"}}>+</Text>)}
           </TouchableOpacity>
         
           </View>
          <View style={{flexDirection:'row', height:'15%'}}>
            <TouchableOpacity style={styles.buttonSumbint}  onPress={handleConsultar}>
              <Text  style={styles.textSubmit}>Consultar</Text>      
            </TouchableOpacity>      
            <TouchableOpacity style={styles.buttonSumbint}  onPress={GuardarAvances}>
              <Text  style={styles.textSubmit}>Guardar</Text>      
            </TouchableOpacity>   
          </View>              
          
          {
            <ModalJefes setModalVisible={setModalaJefes} modalVisible={modalJefes} listaJefes={ListaJefes}  setJefeSeleccionado={setJefeSeleccionado}/>
          }
          {<ModalFiltros setFiltro={setFiltro} listaNaves={listaNaves} setModalVisible={setModafiltros} modalVisible={modalFiltros}/>}
           
        </View>
    </SafeAreaView>
  </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
 centeredView: {
    flex: 1,
    backgroundColor:'#e5e9f4ff',
    justifyContent: 'center',
    
  },
  containerButtons:{
    width: '50%',
    backgroundColor:'red',
    height: 50,
    margin:'auto',
    justifyContent: 'center',
    alignItems: 'center',                                                     
  },
  formContainer:{
    width:'100%', 
    height:'100%', 
    backgroundColor:'#e5e9f4ff'
    },
buttonContainer:{
  width:"95%",
  height:50, 
  elevation:5, 
  alignItems:"center", 
  justifyContent:"space-between" ,
  flexDirection:"row", 
  marginHorizontal:'auto',
  backgroundColor:"white", 
  borderRadius:10, 
  marginVertical:5, 
  paddingHorizontal:20},
header:{
  width:'100%',
   height:'7%'},
text:{
  fontSize:13, 
  color:"#333333"
},
image:{
  width: 30,
  height: 30, 
  tintColor: "#13c044",                                        
},
buttonSumbint:{
 width:"45%",
  height:50, 
  elevation:5, 
  alignItems:"center", 
  justifyContent:"center" ,
  flexDirection:"row", 
  marginHorizontal:'auto',
  backgroundColor:"#13c044", 
  borderRadius:10, 
  marginVertical:5, 
  paddingHorizontal:20
},
textSubmit:{
    fontSize:16, 
  
  color:"#ffffff"
},
tableContainer:{
  width:"100%",
  height:"65%",
  backgroundColor:""
}


});

