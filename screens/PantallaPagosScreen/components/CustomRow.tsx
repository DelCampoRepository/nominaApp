
import { StyleSheet,Text,TouchableOpacity, Image,View } from "react-native"
import { IAvanceUI } from "../../../src/interfaces/IAvancesNomina";

type renderRowProps ={
    empleado:IAvanceUI;
   
    handleSelecction: ( codEmpleado: string,
                       codActividad: string,
                       codAvance: string,
                       codlote: string,
                       codNave: string     ) => void;
}

export const CustomRow = ({ empleado, handleSelecction }: renderRowProps) => {


const capitalizar = (texto: string) => {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};



return (

    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor: empleado.existeEnSqlite? "#47f6ff": "white" ,
          backgroundColor: empleado.existeEnSqlite? "#ccf8f8": "white", 
          borderWidth:2
        }
      ]}
      onPress={() => handleSelecction(empleado.Cod_empleado, empleado.Cod_actividad, empleado.Cod_avance, empleado.Cod_lote, empleado.Cod_nave)}
    >
        {empleado.Seleccionado === 1 &&
        <View>
                 <Image 
                source={require("../../../assets/check-bold.png")}
                style={[styles.check,{tintColor: empleado.existeEnSqlite? "#000000":'#13c044'}]}   
            />
        </View>

       }
      <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image 
                source={require("../../../assets/calendar-range.png")}
                style={[styles.image,{tintColor: empleado.existeEnSqlite? "black":"#13c044"}]}   
            />
            <Text style={styles.textnombres}>
               {empleado.Fecha}
            </Text>
        </View>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image 
                source={require("../../../assets/account.png")}
               style={[styles.image,{tintColor: empleado.existeEnSqlite? "black":"#13c044"}]}   
            />
            <Text style={styles.textnombres}>
                {empleado.Cod_empleado}{" "}{capitalizar(empleado.NombreEmpleado.toLowerCase())}
            </Text>
        </View>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image 
                source={require("../../../assets/sprout.png")}
                 style={[styles.image,{tintColor: empleado.existeEnSqlite? "black":"#13c044"}]}   
            />
            <Text style={styles.textnombres}>
                {empleado.Cod_actividad}{"-"}{empleado.Cod_avance} {capitalizar(empleado.Nom_Actividad.toLowerCase())}
            </Text>
        </View>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image 
                source={require("../../../assets/land-plots.png")}
                 style={[styles.image,{tintColor: empleado.existeEnSqlite? "black":"#13c044"}]}   
            />
            <Text style={styles.textnombres}>
                {empleado.Cod_lote}{" "}{capitalizar(empleado.Nom_lote.toLowerCase())}
            </Text>
        </View>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image 
                source={require("../../../assets/hoop-house.png")}
                 style={[styles.image,{tintColor: empleado.existeEnSqlite? "black":"#13c044"}]}   
            />
            <Text style={styles.textnombres}>
                {empleado.Cod_nave}{" "}{capitalizar(empleado.nom_nave.toLowerCase())}
            </Text>
        </View>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image 
                source={require("../../../assets/chart-line-variant.png")}
                 style={[styles.image,{tintColor: empleado.existeEnSqlite? "black":"#13c044"}]}   
            />
            <Text style={styles.textnombres}>
                {"Avn:"}{" "}{empleado.Avance.toFixed(2)}{" / "} {"Jrnl:"}{" "}{(empleado.Avance/empleado.Rendimiento).toFixed(2)}
            </Text>
        </View>
       
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
    textnombres:{
        paddingLeft:5,
        fontSize:15,
        color:"#000000",
        fontWeight:'bold'
    },
     image:{
        width: 30,
        height: 30, 
        tintColor: "#13c044",
        marginRight:5,
        marginBottom:5,                                            
    }
    ,
     check:{
        width: 30,
        height: 30, 
        
        position:'absolute',
        top: 0,
        right:0
    }
});