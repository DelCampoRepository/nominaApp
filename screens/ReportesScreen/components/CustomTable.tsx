
import { View,StyleSheet, Text, SectionList,Image } from "react-native"
import { useEffect, useState } from "react";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { SeleccionarAvancesEmpleadosASyncronizar } from "../../../src/services/sqlite";
import { CustomTableRow } from "./CustomTableRow";
import { IAvanceEmpleado } from "../../../src/interfaces/local/IAvanceEmpleado";
     
type props={
   
    codLote: string;
    codNave:string;
 
  }


interface ISeccionAvance {
  title: string;
  codAcv:string;
  data: IAvanceEmpleado[];
  total: number;
}   

export const obtenerFechaHoy = (): string => {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
};

export const CustomTable =({codLote,codNave}:props) => {

const [sections, setSections] = useState<ISeccionAvance[]>([]);
  
useEffect(() => {
  const cargarDatos = async () => {
    const semana = await ConsultarSemanaActiva();
        console.log();
       
    const datos = await SeleccionarAvancesEmpleadosASyncronizar(
      semana,
      obtenerFechaHoy()
    );


    const datosAmostrar = datos.filter(res =>
      res.cod_lote === codLote &&
      res.cod_nave === codNave &&
      +res.avance !== 0 &&
      +res.avanceA !== 0
    );

   const secciones=  agruparPorActividad(datosAmostrar);
      
   setSections(secciones);
  
  };

  cargarDatos();
}, [codNave]);

 const agruparPorActividad = (
  data: IAvanceEmpleado[]
): ISeccionAvance[] => {

  const grupos: Record<string, IAvanceEmpleado[]> = {};

  data.forEach(item => {
    const key = `${item.des_actividad}-${item.cod_actividad}-${item.cod_avance}`;

    if (!grupos[key]) {
      grupos[key] = [];
    }

    grupos[key].push(item);
  });

  return Object.entries(grupos).map(([key, items]) => {
    const [title, cod_actividad, cod_avance] = key.split('-');

    const total = items.reduce(
      (sum, item) => sum + Number(item.avanceA),
      0
    );

    return {
      title,
      codAcv: `${cod_actividad}-${cod_avance}`,
      data: items,
      total
    };
  });
};

    return(
    <View style={styles.container}> 
       <View style={styles.header}>
              <Text style={styles.headerText}>REGISTROS</Text>
                 
              </View>
                  <View style={styles.divider} />
              <View style={{ height:"89%"}}>
                <SectionList<any, ISeccionAvance>
                  sections={sections}
                  keyExtractor={(item) =>
                  `${item.cod_empleado}-${item.cod_avance}`
                  }
                renderItem={({ item }) =><CustomTableRow empleado={item}/>}
                
                renderSectionHeader={({ section }) => (
                  <View style={{alignItems:'center'}}>
                    <View style={styles.sectionHeader}>
                         <Image 
                              source={require("../../../assets/sprout.png")}
                              style={styles.image}   
                              />
                    <Text style={{marginLeft:10,fontWeight:'bold' }}>
                    {section.codAcv}{" "}{section.title.trim()}
                   
                  </Text>
                    </View>
                    <View style ={{width:"90%", flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                      <Text style={{ fontWeight: 'bold', fontSize:15 }}>
                        Total avance:  {section.total.toFixed(2)}
                      </Text>
                       <Text style={{ fontWeight: 'bold', fontSize:15, paddingRight:0 }}>
                        Total jornal: {(section.total/section.data[0].Rendimiento_Aplic).toFixed(2)}
                      </Text>
                    </View>
                    
                  </View>
                  
  )}
  
/>
              
              </View>
              
        
    </View>)
}




const styles = StyleSheet.create({

    container:{
    
        marginTop:5,
        width:"100%",
        height:"100%",
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
     image:{
        width: 30,
        height: 30, 
        tintColor: "#13c044",
        marginRight:5,
        marginBottom:5,                                            
    },
    sectionHeader:{alignItems:'center', flexDirection:'row', backgroundColor:"white", paddingHorizontal:50, borderRadius:10, fontSize:15, marginVertical:15, paddingVertical:10}

})