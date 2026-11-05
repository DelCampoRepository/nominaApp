import { ISecundaryActividades } from "../../../src/interfaces/local/ISecundaryActividades"
import { View,StyleSheet, FlatList, Text, TouchableOpacity, Alert } from "react-native"
import { CustomTableRow } from "./CustomTableRow";
import { useEffect, useState } from "react";
import { IdatosActividadesNaves } from "../../../src/interfaces/local/IdatosActNave";
import { SeleccionarActEnNaves } from "../../../src/services/sqlite";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { actualizarActEnNave } from "../../../src/services/sqlite";
         
type props={
    data : IdatosActividadesNaves[];
    codLote: string;
    codNave:string;
    descrNave:string;
}



export const CustomTable =({codLote,codNave}:props) => {

    const [listaSeleccion, setListaSeleccion]= useState<IdatosActividadesNaves[]>([]);
    const [listaActividades, setListaActividades] = useState<IdatosActividadesNaves[]>([]);
    

  
function handleOnPress(item :IdatosActividadesNaves){
    
         setListaSeleccion(prev => {

     const index = prev.findIndex(x =>
      x.cod_actividad === item.cod_actividad &&
      x.cod_avance === item.cod_avance && x.cod_lote == item.cod_lote &&
      x.cod_nave === item.cod_nave
    );
   
    if (index === -1) {

      //si no existe , agregamos
      return [...prev, item];

    } else {

      //si existe, actualizamos estado
      const nuevaLista = [...prev];

      nuevaLista[index] = {
        ...nuevaLista[index],
        seleccionado: item.seleccionado
      };

      return nuevaLista;
    }

  });
  
}


  const handleGuardar = async () => {
    const res =await  actualizarActEnNave(listaSeleccion );

    if(res)
    {
      Alert.alert("","actividades guardadas en la nave!")
    }
  };


useEffect(() =>{
  console.log(listaSeleccion)
},[listaSeleccion])

useEffect(() => {

  ConsultarSemanaActiva()
    .then((semana) => {

      return SeleccionarActEnNaves(
        codLote,
        codNave,
        obtenerFecha(),
        semana
      );

    })
    .then((queryRespuesta) => {
      setListaActividades(queryRespuesta);
      //console.log(JSON.stringify(queryRespuesta, null, 2));

    })
    .catch((error) => {

      console.error("Error:", error);

    });

}, [codNave]);
  


    return(
    <View style={styles.container}> 
       <View style={styles.header}>
                  <Text style={styles.headerText}>ACTIVIDADES DISPONIBLES</Text>
                 
              </View>
                  <View style={styles.divider} />
              <View style={{ height:"70%"}}>
                
                {listaActividades.length > 0 &&
                    <FlatList
                      data={listaActividades}
                      renderItem={({item}) => <CustomTableRow actividad={item} onPress={handleOnPress} />}
                      keyExtractor={actividad => `${actividad.cod_lote}-${actividad.cod_nave}-${actividad.cod_actividad}-${actividad.nom_actividad}`}
                      numColumns={2}
                  />
                }
              </View>
              <View style={{ height:"15%"}}>
                  <TouchableOpacity  style={styles.submit} onPress={handleGuardar}>
                      <Text style={styles.submitText}>Guardar</Text>
                  </TouchableOpacity>
              </View>
        
    </View>)
}




const styles = StyleSheet.create({

    container:{
        marginTop:5,
        width:"100%",
        height:"75%",
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
        backgroundColor:"#13c044",
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