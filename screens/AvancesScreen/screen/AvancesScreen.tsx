import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity, View, Text, Image} from "react-native";
import Header from "../../../src/components/Header";
import { useEffect, useState } from "react";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { obtenerListaLotesxUsuarioSqLite } from "../../../src/services/local/guardarListaDeLotesEnDbLocal";
import { obtenerListaNavesSqlite } from "../../../src/services/local/guardarListaDeNavesEnDbLocal";
import { IRespuestaObtenerNavesxUsuario } from "../../../src/interfaces/IRespuestaObtenerNavesxUsuario";
import ModalLotes from "../components/ModalLotes";
import ModalNaves from "../components/ModalNaves";

import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { IdatosActividadesNaves } from "../../../src/interfaces/local/IdatosActNave";
import { SeleccionarActEnNaves } from "../../../src/services/sqlite";
import { CustomTable } from "../components/CustomTable";
type Props = NativeStackScreenProps<RootStackParamList, "Avances">

export default function AvancesScreen({ navigation }: Props) {
 

const [modalLotes, setModalaLotes] = useState(false);
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
   const [listaLotes, setListaLotes]= useState<IListaLotesxUsuario[]>([]);
   const [listaNaves, setListaNaves] = useState<IRespuestaObtenerNavesxUsuario[]>([]);
   const [listaActividadesSec,setListaActividadesSec]= useState<IdatosActividadesNaves[]>([]);

 

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


  useEffect(() => {
    if (datosNave.codNave.trim() !== "") {
      obtenerActividadesSeleccionadas();
    }
    async function obtenerActividadesSeleccionadas() {


      const seleccion = await SeleccionarActEnNaves(
        datosLote.codLote,
        datosNave.codNave,
        obtenerFecha(),
        await ConsultarSemanaActiva()
      );

      const filtro = seleccion.filter(
        (res) =>
          res.cod_lote === datosLote.codLote &&
          res.cod_nave === datosNave.codNave
      );
      // console.log(JSON.stringify(filtro,null,2));
      setListaActividadesSec(filtro as IdatosActividadesNaves[]);
    }
  }, [datosNave.codNave]);
      
  return (
  <SafeAreaProvider>
    <SafeAreaView style={styles.centeredView}>
        <View style={styles.formContainer}>
         <View style={styles.header}>
            <Header titulo="AVANCES" pantalla="Inicio"/>
         </View>
           <View style={{width:'100%', height:'18%', paddingTop:15}}>

            <TouchableOpacity style={styles.buttonContainer} onPress={() =>setModalaLotes(true)}>
                <Text  style={styles.text}>{datosLote.codLote}{" "}{datosLote.descLote}</Text>
                {datosLote.isValid ? ( <Image 
                                 source={require("../../../assets/land-plots.png")}
                                 style={styles.image}   
                                />):( <Text  style={{fontSize:30, fontWeight:"bold", color:"#13c044"}}>+</Text>)}
               
           </TouchableOpacity>

            <TouchableOpacity style={styles.buttonContainer} onPress={() =>setModalNaves(true)} >
                <Text  style={styles.text}>{datosNave.codNave}{" "}{datosNave.desNave}</Text>
                
                { datosNave.isValid ?
                   (
                    <Image 
                       source={require("../../../assets/hoop-house.png")}
                       style={styles.image}   
                     />
                   ) :(<Text  style={{fontSize:30, fontWeight:"bold", color:"#13c044"}}>+</Text>)
                } 

            </TouchableOpacity>
           </View>
          
          { listaLotes.length > 0 && 
          <ModalLotes setLote={handleLoteSeleccionado} lotes={listaLotes} setModalVisible={setModalaLotes} modalVisible={modalLotes} />
          }
           {
            listaNaves.length > 0 &&
            <ModalNaves setNave={handleNaveSeleccionada} naves={listaNaves} setModalVisible={setModalNaves} modalVisible={modalNaves} />
          }
           { listaActividadesSec.length > 0 &&
            <CustomTable navigation={navigation} codNave={datosNave.codNave}  codLote={datosLote.codLote} datosLote={datosLote} datosNave={datosNave}/>
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
        borderWidth:1
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

/*
 { listaActividadesSec.length > 0 &&
            <CustomTable data={listaActividadesSec} codLote={datosLote.codLote}/>
          } 

         
         
*/