import { ISecundaryActividades } from "../../../src/interfaces/local/ISecundaryActividades"
import { View,StyleSheet, FlatList, Text, Touchable, TouchableOpacity, Alert } from "react-native"
import { RenderRow } from "./RenderRow"
import { useState } from "react";
import { actualizar, GuardarActEnNaves, obtenerSemanaActivaSqLite } from "../../../src/services/sqlite";
import { fecha } from "../../../src/utils/GenerarFecha";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
type props={
    data : ISecundaryActividades[];
    codLote: string;
    
}


export const CustomTable =({data,codLote}:props) => {

  const [listaSeleccion, setListaSeleccion]= useState<ISecundaryActividades[]>([]);

    function handleOnPress(item :ISecundaryActividades){

         setListaSeleccion(prev => {

     const index = prev.findIndex(x =>
      x.cod_actividad === item.cod_actividad &&
      x.cod_avance === item.cod_avance
    );

    if (index === -1) {

      // No existe → agregar
      return [...prev, item];

    } else {

      // Existe → actualizar seleccion
      const nuevaLista = [...prev];

      nuevaLista[index] = {
        ...nuevaLista[index],
        selecionado: item.selecionado
      };

      return nuevaLista;
    }

  });

        
    }

    
async function handleGuardar() {
     await actualizar(codLote, listaSeleccion);    
    const semana = await ConsultarSemanaActiva();
    await GuardarActEnNaves(codLote,fecha,semana);
        if (true) Alert.alert("", `Se guardaron los cambios para el lote ${codLote}`);
    
};

    return(
    <View style={styles.container}> 
        <View style={styles.header}>
            <Text style={styles.headerText}>ACTIVIDADES DISPONIBLES</Text>
           
        </View>
            <View style={styles.divider} />
        <View style={{ height:"70%"}}>
          
            <FlatList
                data={data}
                renderItem={({item}) => <RenderRow onPress={handleOnPress} actividad={item} />}
                keyExtractor={actividad => `${actividad.cod_actividad}-${actividad.cod_actividad}-${actividad.nom_actividad}`}
                numColumns={2}
            />
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