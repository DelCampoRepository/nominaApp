import {ImageSourcePropType,  TouchableOpacity, View, StyleSheet, Image, Text} from "react-native";
import { RootStackParamList } from "../../../types/types";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { Alert, useWindowDimensions } from 'react-native';
type ScreenName = keyof RootStackParamList;
type Props = NativeStackScreenProps<RootStackParamList, "Inicio">;

type ItemProps = {
  icono: ImageSourcePropType;
  label: string;
  label2: string;
  screen: ScreenName;
  navigation: Props["navigation"];
  onPress: (screen: ScreenName) => void;
};


export const OptionCard = ({
  label,
  label2,
  icono,
  screen,
  onPress
}: ItemProps) =>{

     const { width, height } = useWindowDimensions();
    
    // Alert.alert("Vista",`Ancho: ${width}, Alto: ${height}`);
    return(<TouchableOpacity style={[styles.Card,{width: "45%",  height: width <500?  120 :180,  marginVertical:10, elevation:5}]} onPress={() => onPress(screen)}>
        <View style={{flexDirection:  "column", alignItems: "flex-start", justifyContent: "space-between"}}>
           <View style={{marginRight: 10, paddingBottom:width < 500 ? 20 : 45}}>
             <Image source={icono} style={{width: width < 500 ? 40 : 60, height: width < 500 ? 40 : 60 ,tintColor: "#13c044" }} />
           </View>
            <View>
                <Text style={[styles.Text,{fontSize: width < 500 ? 13 : 15.5}]}>{label} {label2}</Text>
            </View>
            
        </View>
    </TouchableOpacity>);

}

const styles = StyleSheet.create({
    Card: {
        backgroundColor: "#ffffff",
        borderRadius:3,
        padding: 20,
        borderWidth:1,
        borderColor:"black",
        justifyContent: "center",
        alignItems:'flex-start',
        marginHorizontal: "auto", 
    }, 
    Text: {
        color: "black",
      
    }
})