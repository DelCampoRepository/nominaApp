

import { StyleSheet,Text, View} from "react-native"

import { Image } from "react-native";

type renderRowProps ={
    empleado: any;
   
}

export const CustomTableRow = ({ empleado }: renderRowProps) => {

console.log('ep',empleado)
  const capitalizar = (texto: string) => {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

  return (

    <View
      style={[
        styles.card,
        {
          borderColor:  "white",
          backgroundColor:  "white"
        }
      ]}
     
    >
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Image 
          source={require("../../../assets/account.png")}
          style={styles.image}   
          />
          <View>
            <Text style={[styles.textActividad,{color:"#fdac3a"}]}>
            {capitalizar(empleado.cod_empleado)}
            </Text>
          </View>
        </View>
      <Text style={{  paddingLeft:5, }}>
        Avance
        {": "}
        {empleado.avanceA}
      </Text>
      <View style={{flexDirection:'row', alignItems:'center'}}>
        <Text> Estado:</Text>
        <Text style={{ fontWeight:'500', paddingLeft:5, color: empleado.estadoSincro === 0? "red":"#42b5cc"}}>
        {empleado.MensajeSincro === ""
                                        ? "No sincronizado"
                                        : capitalizar(empleado.MensajeSincro.toLowerCase())}
      </Text>
      </View>
       <Text style={styles.textActividad}>
        {capitalizar(empleado.nom_empleado.toLowerCase())}
      </Text>
      
     

    </View>

  );
};


const styles = StyleSheet.create({
    card:{
      
       marginTop:5,
        width:"95%",
        borderRadius:5,
        elevation:5,
        marginHorizontal:'auto',
        padding:10,
        borderWidth:1,
       
        marginBottom:5
    },
    textActividad:{
       
        paddingLeft:5,
        fontSize:15,
        color:"#13c044",
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