
import { useState } from "react";
import { StyleSheet,Text,TouchableOpacity, Image,View } from "react-native"
import { IdatosActividadesNaves } from "../../../src/interfaces/local/IdatosActNave";
import { IEmpleadoCapturado } from "../../../src/interfaces/local/IEmpleadoCapturado";
type renderRowProps ={
    empleado:IEmpleadoCapturado;
    onPress: (item : IdatosActividadesNaves)=> void;
}

export const CustomTableRow = ({ empleado, onPress }: renderRowProps) => {

 
 

    const capitalizar = (texto: string) => {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};
  return (

    <View
      style={[
        styles.button,
        {
          borderColor:  "white",
          backgroundColor:"white"
        }
      ]}
      
    >
      
    <View style={{flexDirection:'row', alignItems:'center'}}>
      <Image 
      source={require("../../../assets/account.png")}
      style={styles.image}   
      />
     <Text style={styles.textActividad}>
       {empleado.cod_empleado}
     
    </Text>
    
    </View>
      

      <Text style={{ fontSize:14, marginLeft: 5 }}>
        {capitalizar(empleado.Nom_empleado.toLowerCase())}
      </Text>
      <Text  style={{ marginLeft: 5 }}>
         Lote:{empleado.cod_lote}
      </Text>
      <Text  style={{ marginLeft: 5 }}>
         Nave:{empleado.cod_nave}
      </Text>
      <Text  style={{ marginLeft: 5 }}>
         Semana:{empleado.semana}
      </Text>
      <Text style={{ marginLeft: 5 }}>
        Fecha: {empleado.FechaRegistro}
      </Text>

    </View>

  );
};


const styles = StyleSheet.create({
    button:{
      
       marginTop:5,
        width:"45%",
        borderRadius:5,
        elevation:5,
        backgroundColor:"#f5fff3",
        marginHorizontal:'auto',
        padding:10,
        borderWidth:1,
       
        marginBottom:5
    },
    textActividad:{
       
        paddingLeft:5,
        fontSize:15,
        color:"#fea529",
        fontWeight:'bold'
    },
     image:{
        width: 30,
        height: 30, 
        tintColor: "#13c044",
        marginRight:5,
        marginBottom:5,                                            
    }
});