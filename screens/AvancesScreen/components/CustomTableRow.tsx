

import { StyleSheet,Text,TouchableOpacity, View} from "react-native"
import { IActividadesAvancesSeleccionables } from "../../../src/interfaces/local/iActividadesAvancesSeleccionables";   
import { Image } from "react-native";
type renderRowProps ={
    actividad: IActividadesAvancesSeleccionables;
    navigation: any;
    datosLote: any;
    datosNave:any;
}

export const CustomTableRow = ({ actividad,navigation,datosLote,datosNave }: renderRowProps) => {


  const handlePress = () => {
  
   navigation.navigate("AvancesxActividad", {
     lote: datosLote.codLote,
     desLote: datosLote.descLote,
     codNave: datosNave.codNave,
     desNave: datosNave.desNave,
     rendApli: actividad.Rendimiento_Aplic,
     redTop: actividad.Rendimiento_Tope,
     nomAct: actividad.nom_actividad,                                                                   
     coAct: actividad.cod_actividad,
     codAv: actividad.cod_avance,
     rednApl: Number(actividad.Rendimiento_Aplic),
     unidad: actividad.Nom_Corto
   });
                            
    
  };

  const capitalizar = (texto: string) => {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

  return (

    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor:  "white",
          backgroundColor:  "white"
        }
      ]}
      onPress={handlePress}
    >

     
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Image 
          source={require("../../../assets/sprout.png")}
          style={styles.image}   
          />
          <Text style={[styles.textActividad,{color:"#fdac3a"}]}>
            {actividad.cod_actividad}
            {"-"}
            {actividad.cod_avance}
          </Text>
        </View>
      <Text style={{ marginLeft: 5 }}>
         Rendimiento aplicado
        {": "}
        {actividad.Rendimiento_Aplic}
      </Text>
      <Text style={{ marginLeft: 5 }}>
         Rendimiento tope
        {": "}
        {actividad.Rendimiento_Tope}
      </Text>
       <Text style={styles.textActividad}>
        {capitalizar(actividad.nom_actividad.toLowerCase())}
      </Text>
     

    </TouchableOpacity>

  );
};


const styles = StyleSheet.create({
    button:{
      
       marginTop:5,
        width:"95%",
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