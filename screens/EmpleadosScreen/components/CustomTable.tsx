
import { View,StyleSheet, FlatList, Text, TouchableOpacity } from "react-native"
import { CustomTableRow } from "./CustomTableRow";
import { useEffect, useState } from "react";
import { IEmpleadoCapturado } from "../../../src/interfaces/local/IEmpleadoCapturado";

type props={
    
    empleados:IEmpleadoCapturado[];
    codLote:string;
    codNave:string;
}



export const CustomTable =({empleados,codLote,codNave}:props) => {
const [lista,setLista]= useState<IEmpleadoCapturado[]>([]);
 
useEffect(() => {

   if(codLote !="Seleccion" && codNave !=='Seleccione')
   {
    const empleFilter = empleados.filter(emp => Number(emp.cod_lote) === Number(codLote) && Number(emp.cod_nave) === Number(codNave))
    
    setLista(empleFilter);
   }
}, [codLote, codNave,empleados]);




function BorrarEmpleado(){

}
    return(
    <View style={styles.container}> 
       
                <View style={styles.divider}/>
              <View style={{ height:"100%"}}>
                
                {empleados.length > 0 &&                   
                  <View >
                    <FlatList
                      data={lista}
                      renderItem={({item}) => <CustomTableRow empleado={item} onPress={BorrarEmpleado} />}
                      keyExtractor={avance => `${avance.cod_lote}-${avance.cod_nave}-${avance.cod_empleado}-${avance.semana}`}
                      contentContainerStyle={{ paddingBottom: 165 }}
                      numColumns={2}
                    />
                  </View>
                }
              </View> 
    </View>)
}

const styles = StyleSheet.create({

    container:{
        marginTop:5,
        width:"100%",
        height:"100%",
      
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
        backgroundColor:"green",
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
        backgroundColor:"green",
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