import React from "react"
import {View, TouchableOpacity,Text,Image,ImageSourcePropType,StyleSheet, FlatList} from 'react-native'

type boton = {
  nombre: string;
  nombre2: string;
  icono: ImageSourcePropType;
};

export const CustomMenu= ()=>{

  const botones = [
    {
        id:"0",
      nombre: "Agregar",
      nombre2: "Empleado",
      icono: require("../../../assets/account-box-edit-outline.png")
    },
    {  id:"1",
      nombre: "Asentar",
      nombre2: "Empleados",
      icono: require("../../../assets/database-plus-outline.png")
    },
    {  id:"2",
      nombre: "Escanear",
      nombre2: "QR Empleado",
      icono: require("../../../assets/qrcode-scan.png")
    }
  ];

    return(<View style={styles.container}>
        <View>
            <FlatList
                data={botones}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                <View style={{
                    width: 60,
                    height: 50,
                    marginHorizontal:22,
                  
                    justifyContent: 'space-between',
                    alignItems: 'center',
                 
                    
                }}>
                <TouchableOpacity style={styles.imagecontainer}>
                    <Image style={styles.image} source={item.icono}/>
                </TouchableOpacity>
      
                </View>
                )}
            />
            
        </View>
    </View>)
    
}


const styles = StyleSheet.create({

    container:
    {
        width:"85%",
        height:75,
        borderRadius:10,
        backgroundColor:'white',
        padding:10, 
        marginHorizontal:'auto',   
        flexDirection:'row' 
    },
image:{
  width: 40,
  height: 40, 
  tintColor: "#13c044",   
  
},
imagecontainer:{
     width:"85%",
     padding:10,

    borderRadius:50,
    alignItems:'center',
    justifyContent:'center'
},


});

