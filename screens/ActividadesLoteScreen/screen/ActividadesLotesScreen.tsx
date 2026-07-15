import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity, View, Text, Image} from "react-native";
import Header from "../../../src/components/Header";
import { useEffect, useState } from "react";
import CustomModal from "../components/CustomModal";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { IMainActividades } from "../../../src/interfaces/local/IMainActividades";
import { obtenerListaLotesxUsuarioSqLite } from "../../../src/services/local/guardarListaDeLotesEnDbLocal";
import { obtenerActividadesxLoteLocales, obtenerActividadesxLoteSecundariasLocales } from "../../../src/services/sqlite";
import CustomModalActividades from "../components/CustomModalActividades";
import { ISecundaryActividades } from "../../../src/interfaces/local/ISecundaryActividades";
import { CustomTable } from "../components/CustomTable";


type Props = NativeStackScreenProps<RootStackParamList, "ActividadesLote">

export default function ActividadesLoteScreen({ navigation }: Props) {
 

   const [modalVisible, setModalVisible] = useState(false);
      const [modalActVisible, setModalActVisible] = useState(false);
   const [datosLote, setDatosLote   ] = useState({
     codLote:"Seleccione",
     descLote:"lote",
     isValid:false
   });
  const [datosActividad, setDatosActividad] = useState({
    codActividad:'Seleccione',
    desActividad:'actividad',
      isValid:false
  });
   const [listaLotes, setListaLotes]= useState<IListaLotesxUsuario[]>([]);
   const [listaActividades, setListaActividades] = useState<IMainActividades[]>([]);
   const [listaActividadesSec,setListaActividadesSec]= useState<ISecundaryActividades[]>([]);
  function handleLoteSeleccionado(codLote: string, descLote: string, isValid : boolean)
  {
        setDatosLote({
          codLote:codLote,
          descLote:descLote,
          isValid: isValid
        })
  }

  function handleActividadSeleccionada(codActividad: string, desActividad: string,isValid : boolean)
  {
   
    setDatosActividad({
      codActividad:codActividad,
      desActividad:desActividad, 
      isValid:isValid
    })
  }
   useEffect(() => {
       (async () => { 
        const list = await obtenerListaLotesxUsuarioSqLite(); 
        setListaLotes(list);})();
     }, []);
   
  
  
     

  useEffect(()=>{
     if(!datosLote.isValid && !datosActividad.isValid ) return;
      
      obtenerActividadesxLoteSecundariasLocales(datosLote.codLote, datosActividad.codActividad)
      .then(setListaActividadesSec);

  },[ datosActividad.codActividad])


   
    useEffect(() => {
      if (!datosLote.isValid) return;
        
        obtenerActividadesxLoteLocales(datosLote.codLote)
        .then(setListaActividades);

}, [datosLote.codLote]);
       console.log(JSON.stringify(listaActividades,null,2));
  return (
  <SafeAreaProvider>
    <SafeAreaView style={styles.centeredView}>
        <View style={styles.formContainer}>
         <View style={styles.header}>
            <Header titulo="ACTIVIDADES EN LOTE" pantalla="Inicio"/>
         </View>
           <View style={{width:'100%', height:'18%', paddingTop:15}}>

            <TouchableOpacity style={styles.buttonContainer} onPress={() =>{
              setModalVisible(true);
              console.log('asdasd');
            }}>
                <Text  style={styles.text}>{datosLote.codLote}{" "}{datosLote.descLote}</Text>
                {datosLote.isValid ? ( <Image 
                                 source={require("../../../assets/land-plots.png")}
                                 style={styles.image}   
                                />):( <Text  style={{fontSize:30, fontWeight:"bold", color:"#13c044"}}>+</Text>)}
               
           </TouchableOpacity>

            <TouchableOpacity style={styles.buttonContainer} onPress={() =>setModalActVisible(true)}>
                <Text  style={styles.text}>{datosActividad.codActividad}{" "}{datosActividad.desActividad}</Text>
                
                { datosActividad.isValid ?
                   (
                    <Image 
                       source={require("../../../assets/sprout.png")}
                       style={styles.image}   
                     />
                   ) :(<Text  style={{fontSize:30, fontWeight:"bold", color:"#13c044"}}>+</Text>)
                } 

            </TouchableOpacity>
           </View>

          { listaActividadesSec.length > 0 &&
            <CustomTable data={listaActividadesSec} codLote={datosLote.codLote}/>
          } 

          { listaLotes.length > 0 && 
            <CustomModal setLote={handleLoteSeleccionado} lotes={listaLotes} setModalVisible={setModalVisible} modalVisible={modalVisible} />
          }
          {
            listaActividades.length > 0 &&
            <CustomModalActividades setActividad={handleActividadSeleccionada} actividades={listaActividades} setModalVisible={setModalActVisible} modalVisible={modalActVisible} />
          }
         
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
  paddingHorizontal:20,
 borderWidth:1,
},
header:{
  width:'100%',
   height:'7%'},
text:{
  fontSize:14, 
  fontWeight:"bold", 
  color:"#333333"
},
image:{
  width: 30,
  height: 30, 
  tintColor: "#13c044",                                        
}


});