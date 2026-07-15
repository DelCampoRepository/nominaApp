import { ISecundaryActividades } from "../../../src/interfaces/local/ISecundaryActividades"
import { View,StyleSheet, FlatList, Text, TouchableOpacity } from "react-native"
import { CustomTableRow } from "./CustomTableRow";
import { useEffect, useState } from "react";
import { IdatosActividadesNaves } from "../../../src/interfaces/local/IdatosActNave";

import { fecha } from "../../../src/utils/GenerarFecha";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { actualizarActEnNave } from "../../../src/services/sqlite";
import { SeleccionarActividadesNave } from "../../../src/services/sqlite";
import { IActividadesAvancesSeleccionables } from "../../../src/interfaces/local/iActividadesAvancesSeleccionables";         
     
type props={
   
    codLote: string;
    codNave:string;
    navigation: any
    datosNave:any;
    datosLote:any;
  }
    


export const CustomTable =({codLote,codNave,navigation, datosLote, datosNave}:props) => {

    const [listaSeleccion, setListaSeleccion]= useState<IdatosActividadesNaves[]>([]);
    const [listaActividades, setListaActividades] = useState<IActividadesAvancesSeleccionables[]>([]);
    

  
function handleOnPress(item :IdatosActividadesNaves){
    
   
  
}





useEffect(() => {
   console.log(codNave);
  ConsultarSemanaActiva()
    .then((semana) => {

      return SeleccionarActividadesNave(
        codLote,
        codNave,
        semana
      );

    })
    .then((queryRespuesta) => {
      setListaActividades(queryRespuesta);
    //  console.log(JSON.stringify(queryRespuesta, null, 2));

    })
    .catch((error) => {

      console.error("Error:", error);

    });

}, [codNave]);
  


    return(
    <View style={styles.container}> 
       <View style={styles.header}>
                  <Text style={styles.headerText}>ACTIVIDADES REGISTRADAS</Text>
                 
              </View>
                  <View style={styles.divider} />
              <View style={{ height:"70%"}}>
                
                {listaActividades.length > 0 &&
                    <FlatList
                      data={listaActividades}
                      renderItem={({item}) => <CustomTableRow actividad={item} navigation={navigation} datosLote={datosLote} datosNave={datosNave}/>}
                      keyExtractor={actividad => `${actividad.cod_lote}-${actividad.cod_nave}-${actividad.cod_actividad}-${actividad.nom_actividad}`}
                      
                  />
                }
              </View>
              
        
    </View>)
}




const styles = StyleSheet.create({

    container:{
        marginTop:5,
        width:"100%",
        height:"85%",
        backgroundColor:""
    },
    header:{
        height:"5%",
            flexDirection:'column',
            justifyContent:'space-between',
            alignItems:'center',
            marginBottom:10
    },
    headerText:{
        fontWeight:'500',
        fontSize:16,
        marginHorizontal:'auto',
        padding:5
    },
    submit:{
        marginTop:10,
        width:"95%",
        height:50,
        borderRadius:10,
        backgroundColor:"green",
        margin:'auto',
        alignItems:'center',
        justifyContent:'center'
    },
    submitText:{
        fontWeight:"600",
        color:'white'
    },
  divider: { height: 1, backgroundColor: "#bcb5b5", marginVertical: 12, width:"90%", marginHorizontal:'auto'},

})