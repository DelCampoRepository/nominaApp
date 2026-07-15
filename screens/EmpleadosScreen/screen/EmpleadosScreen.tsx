import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity, View, Text, Image, Alert,ImageSourcePropType, FlatList} from "react-native";
import Header from "../../../src/components/Header";
import { useEffect, useState,useRef, use } from "react";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { obtenerListaLotesxUsuarioSqLite } from "../../../src/services/local/guardarListaDeLotesEnDbLocal";
import { obtenerListaNavesSqlite } from "../../../src/services/local/guardarListaDeNavesEnDbLocal";
import { IRespuestaObtenerNavesxUsuario } from "../../../src/interfaces/IRespuestaObtenerNavesxUsuario";
import ModalLotes from "../components/ModalLotes";
import ModalNaves from "../components/ModalNaves";
import { TextInput } from "react-native-gesture-handler";
import { BuscarEmpleadoPorCodigo, GuardarEmpleadosCapturados, obtenerSemanaActivaSqLite } from "../../../src/services/sqlite";
import { useUser } from "../../../src/context/userContext";
import { IEmpleadoCapturado } from "../../../src/interfaces/local/IEmpleadoCapturado";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { CustomTable } from "../components/CustomTable";
import ModalBuscarEmpleados from "../components/ModalBuscaEmpleado";
import ModalDatosManual from "../components/modalDatosManual";
import { fecha } from "../../../src/utils/GenerarFecha";
//import { CustomTable } from "../components/CustomTable";


type Props = NativeStackScreenProps<RootStackParamList, "Empleados">;
type boton = {
  nombre: string;
  nombre2: string;
  icono: ImageSourcePropType;
};

export default function EmpleadosScreen({ navigation }: Props) {


const inputRef = useRef<TextInput>(null);
const [modalLotes, setModalaLotes] = useState(false);
const [modalEmpleados,setModalEmpleados] = useState(false);
const [modalNaves, setModalNaves] = useState(false);
const [datosLote, setDatosLote   ] = useState({
     codLote:"Seleccione",
     descLote:"lote",
     isValid:false
   });

const [datosNave, setDatosNave] = useState({
    codNave:'Seleccione',
    desNave:'nave',
      isValid:false
  });

const [listaLotes, setListaLotes]  = useState<IListaLotesxUsuario[]>([]);
const [listaNaves, setListaNaves]  = useState<IRespuestaObtenerNavesxUsuario[]>([]);
const [codEmpleado,setCodEmpleado] = useState("");
const [nombreEmpleado,setNombreEmpleado] = useState("");
 const [visible, setVisible] = useState(false);
const [modalDatosManual, setModalDatosManual] = useState(false);
const { listaEmpleadosCapturados, setEmpleadosCap, clearEmpleados } =useUser();

    const botones = [
    {
        id:"0",
      nombre: "Agregar",
      nombre2: "Empleado",
      icono: require("../../../assets/account-box-edit-outline.png")
    },
    {  id:"1",
      nombre: "Asentar",
      nombre2: "Empleados",
      icono: require("../../../assets/database-plus-outline.png")
    },
    {  id:"3",
      nombre: "",
      nombre2: "",
      icono: require("../../../assets/account-search.png")
    },
    {  id:"2",
      nombre: "Escanear",
      nombre2: "QR Empleado",
      icono: require("../../../assets/qrcode-scan.png")
    }
  ];

function handleLoteSeleccionado(codLote: string, descLote: string, isValid : boolean)
  {
        setDatosLote({
          codLote:codLote,
          descLote:descLote,
          isValid: isValid
        })
  }


function handleNaveSeleccionada(codNave: string, desNave: string,isValid : boolean)
  {
   
    setDatosNave({
      codNave:codNave,
      desNave:desNave, 
      isValid:isValid
    })
  }

  
useEffect(() => {
       (async () => { 
        const list = await obtenerListaLotesxUsuarioSqLite(); 
        setListaLotes(list);})();
  }, []);
   
 useEffect(() => {
    async function obtenerNaves() {
      const listaNaves = await obtenerListaNavesSqlite(datosLote.codLote);
      setListaNaves(listaNaves as IRespuestaObtenerNavesxUsuario[]);
    }

    if (datosLote.codLote.trim() !== "") obtenerNaves();
  }, [datosLote.codLote]);




const handleBotonPresionado = async (id: string) => {
      if (id === "2") {
        navigation.navigate("Escaner");
      } 
      else if (id === "0") {
      
       setModalDatosManual(true);
      }
      else if (id === "3") {
      setModalEmpleados(true);
      }
      else{
        guardar();
        clearEmpleados();
      }
  };
  
async function handleSubmit(codEmpleado:string, nombre:string){
    if(codEmpleado.length < 6)
    {
      Alert.alert("",'El codigo de empleado debe tener 6 digitos');
      return;
    }
    if(datosLote.codLote === "Seleccione" || datosNave.codNave === "Seleccione")
    {
      Alert.alert("",'no hay lote o nave seleccionado aun');
      return;
    }
    await AgregarEmpleado(codEmpleado,nombre);
}


 async function AgregarEmpleado(codEmpleado:string, nombreEmpleado:string) {

    const  semana = await ConsultarSemanaActiva()
    //evaluamos si existe en la lista
    setEmpleadosCap((prev: IEmpleadoCapturado[]) => {
      const existe = prev.some(
        (emp) =>
          emp.cod_empleado === codEmpleado &&
          emp.cod_lote === datosLote.codLote &&
          emp.cod_nave === datosNave.codNave &&
          emp.FechaRegistro === fecha
      );

      //si existe, retornamos
      if (existe) {
        alert(
          `El empleado ${nombreEmpleado} (código ${codEmpleado}) ya está asignado al lote ${datosLote.codLote} y nave ${datosNave.codNave}.`
          
        );
        
        return prev;
      }
      setVisible(true);
      
      //si no existe , agregamos
      return [
        ...prev,
        {
          cod_empleado: codEmpleado,
          Nom_empleado: nombreEmpleado,
          cod_lote: datosLote.codLote,
          cod_nave: datosNave.codNave,
          FechaRegistro: fecha,
          semana: semana
        }
      ];
    });
  }
     
  async function guardar() {
  
    const guardarEm = await GuardarEmpleadosCapturados(listaEmpleadosCapturados);
    if (guardarEm) {
      console.log("empleados asentados");
      Alert.alert("", "Los empleados se guardaron correctamente!");
     // clearEmpleados();
     
    }
  }
     

  return (
  <SafeAreaProvider>
    <SafeAreaView style={styles.centeredView}>
        <View style={styles.formContainer}>
         <View style={styles.header}>
            <Header titulo="REGISTRO DE EMPLEADOS" pantalla="Inicio"/>
         </View>
            <View style={{width:'100%', height:'100%', paddingTop:15, backgroundColor:''}}>

              <View>
                   <TouchableOpacity style={styles.buttonContainer} onPress={() =>setModalaLotes(true)}>
                <Text  style={styles.text}>{datosLote.codLote}{" "}{datosLote.descLote}</Text>
                {datosLote.isValid ? ( <Image 
                                 source={require("../../../assets/land-plots.png")}
                                 style={styles.imageInputs}   
                                />):( <Text  style={{fontSize:30, fontWeight:"bold", color:"#13c044"}}>+</Text>)}
               
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonContainer} onPress={() =>setModalNaves(true)} >
                <Text  style={styles.text}>{datosNave.codNave}{" "}{datosNave.desNave}</Text>
                { datosNave.isValid ?
                   (
                    <Image 
                       source={require("../../../assets/hoop-house.png")}
                       style={styles.imageInputs}   
                     />
                   ) :(<Text  style={{fontSize:30, fontWeight:"bold", color:"#13c044"}}>+</Text>)
                } 
              </TouchableOpacity>
           
              
            
              </View>
              <View style={{height:'70%'}}>                    
                <CustomTable empleados={listaEmpleadosCapturados} codLote={datosLote.codLote} codNave={datosNave.codNave}/>  
              </View>
            </View>
          
          { listaLotes.length > 0 && 
          <ModalLotes setLote={handleLoteSeleccionado} lotes={listaLotes} setModalVisible={setModalaLotes} modalVisible={modalLotes} />
          }
           {
            listaNaves.length > 0 &&
            <ModalNaves setNave={handleNaveSeleccionada} naves={listaNaves} setModalVisible={setModalNaves} modalVisible={modalNaves} />
          }
          {
            <ModalBuscarEmpleados  handelSubmit={handleSubmit} setModalVisible={setModalEmpleados} modalVisible={modalEmpleados} />
          }
        {modalDatosManual &&
          <ModalDatosManual setVisible={setVisible} visible={visible} handelSubmit={handleSubmit} modalVisible={modalDatosManual}setModalVisible={setModalDatosManual}/>
        }
        </View>
        <View style={{height:"15%", alignItems:'center',  justifyContent:'center'}}>
            <View style={styles.container}>
                    <View>
                        <FlatList
                            data={botones}
                            horizontal
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                            <View style={{
                                width: 60,
                                height: 50,
                                marginHorizontal:22,
                              
                                justifyContent: 'space-between',
                                alignItems: 'center',
                             
                                
                            }}>
                            <TouchableOpacity style={styles.imagecontainer} onPress={()=>handleBotonPresionado(item.id)}>
                                <Image style={styles.image} source={item.icono}/>
                            </TouchableOpacity>
                  
                            </View>
                            )}
                        />
                        
                    </View>
                </View>
        </View>
    </SafeAreaView>
  </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
   container:
    {
        width:"85%",
        height:75,
        borderRadius:10,
        backgroundColor:'white',
        padding:10, 
        marginHorizontal:'auto',   
        flexDirection:'row' 
    },
image:{
  width: 40,
  height: 40, 
  tintColor: "#13c044",   
  
},
imagecontainer:{
     width:"85%",
     padding:10,

    borderRadius:50,
    alignItems:'center',
    justifyContent:'center'
},
imageInputs:{
  width: 30,
  height: 30, 
  tintColor: "#13c044",                                        
},
imageInputcontainer:{
    width:'17%',
    backgroundColor:"white",
    height:50,
    borderTopRightRadius:10, 
    borderBottomRightRadius:10,
   
    alignItems:'center',
    justifyContent:'center'
    },

 centeredView: {
    flex: 1,
    backgroundColor:'#e5e9f4ff',
    justifyContent: 'center',
    
  },
  formContainer:{
    width:'100%', 
    height:'85%', 
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
  paddingHorizontal:20,
        borderWidth:1
},
header:{
  width:'100%',
  height:'7%'
},
text:{
  fontSize:14, 
  fontWeight:"bold", 
  color:"#333333"
},

TextInput:{
    fontWeight:"600",
    paddingLeft:10,
    width:"83%",
    height:50, 
    marginHorizontal:'auto',
    backgroundColor:"white", 
    borderTopLeftRadius:10,
    borderBottomLeftRadius:10,
    marginVertical:5, 
},
TextInputNombre:{
    fontWeight:"600",
    paddingLeft:10,
    width:"95%",
    height:50, 
    marginHorizontal:'auto',
    elevation:5,
    backgroundColor:"white",
    marginVertical:5,
    borderRadius:10
}


});

/*
 { listaActividadesSec.length > 0 &&
            <CustomTable data={listaActividadesSec} codLote={datosLote.codLote}/>
          } 

         
         
*/