
import { useState } from "react";
import { StyleSheet,Text,TouchableOpacity, Image,View } from "react-native"
import { IdatosActividadesNaves } from "../../../src/interfaces/local/IdatosActNave";
type renderRowProps ={
    actividad: IdatosActividadesNaves;
    onPress: (item : IdatosActividadesNaves)=> void;
}

export const CustomTableRow = ({ actividad, onPress }: renderRowProps) => {

  const [estadoSele, setEstadoSelec] = useState(
    actividad.seleccionado === 1
  );

  const handlePress = () => {

    const nuevoEstado = !estadoSele;

    setEstadoSelec(nuevoEstado);

    const actividadActualizada = {
      ...actividad,
      seleccionado: nuevoEstado ? 1 : 0
    };

    onPress(actividadActualizada);

  };

    const capitalizar = (texto: string) => {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};
  return (

    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor: estadoSele ? "#13c044" : "white",
          backgroundColor: estadoSele ? "#f5fff3" : "white"
        }
      ]}
      onPress={handlePress}
    >
      
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Image 
                source={require("../../../assets/sprout.png")}
                style={styles.image}   
                />
               <Text style={styles.textActividad}>
                 {actividad.cod_actividad}
                 {"-"}
                {actividad.cod_avance}
              </Text>
              </View>
      

      <Text style={{ marginLeft: 5}}>
        {capitalizar(actividad.nom_actividad.toLowerCase())}
      </Text>

    </TouchableOpacity>

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
        color:"#fdac3a",
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