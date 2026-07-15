import React from "react"
import { IAvanceUI } from "../../../src/interfaces/IAvancesNomina"
import {View,StyleSheet, SectionList,Text, Alert} from "react-native"
import { CustomRow } from "./CustomRow";


type Props={
    listaEmpleados:IAvanceUI[];
    filtro:string;
     setListaAvances : React.Dispatch<React.SetStateAction<IAvanceUI[]>>;
    
}

interface ISection {
  title: string;
  totalAvance: number;
  data: IAvanceUI[];
 
}


const crearSecciones = (datos: IAvanceUI[]): ISection[] => {

  const agrupado: Record<string, IAvanceUI[]> = {};

  datos.forEach((item) => {

    if (!agrupado[item.Cod_nave]) {
      agrupado[item.Cod_nave] = [];
    }

    agrupado[item.Cod_nave].push(item);
  });

  return Object.keys(agrupado).map((nave) => {

    const empleados = agrupado[nave];

    const totalAvance = empleados.reduce(
      (total, item) => total + Number(item.Avance),
      0
    );

    return {
      title: nave,
      totalAvance,
      data: empleados,
    };
  });
};


export const CustomTable =({listaEmpleados,filtro,setListaAvances}:Props)=>{

     let sections = crearSecciones(listaEmpleados);

    if(filtro !=="Filtrar por nave")
    {
         Filtrar(filtro);
    }


function Filtrar(filtro : string){
const naveSeleccionada = filtro;

    const datosFiltrados = listaEmpleados.filter(
    item => item.Cod_nave === naveSeleccionada
    );

    sections = crearSecciones(datosFiltrados);
}  


const handleSeleccion = (
    codEmpleado: string,
    codActividad: string,
    codAvance: string,
    codlote: string,
    codNave:string
  ) => {
setListaAvances((prev: IAvanceUI[]) =>
  prev.map((a) =>
    a.Cod_empleado === codEmpleado &&
    a.Cod_actividad === codActividad &&
    a.Cod_lote == codlote && 
    a.Cod_nave === codNave &&
    a.Cod_avance === codAvance 
      ? { ...a, Seleccionado: a.Seleccionado === 1 ? 0 : 1 }
      : a
  )
);
  };


return(
        
    <View>
        <SectionList
            sections={sections}
            keyExtractor={empleado => `${empleado.Cod_actividad}-${empleado.Cod_avance}-${empleado.Cod_lote}-${empleado.Cod_nave}-${empleado.Cod_empleado}`}
            renderSectionHeader={({ section }) => (
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Nave: {section.title}
          </Text>
          <Text style={styles.headerText}>
             Total avance: {section.totalAvance.toFixed(2)}
          </Text>
        </View>
      )}
      renderItem={({item}) => <CustomRow empleado={item} handleSelecction={handleSeleccion}/>}
    />
       
    </View>
    );
}

const styles = StyleSheet.create({

    container:{
        width:"90%",
        height:'100%'
    }, 
    header: 
    {
        backgroundColor: "#ddd",
        padding: 10,
        flexDirection:"row",
        justifyContent:'space-between',
        width:"95%",
        marginHorizontal:'auto'
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
   
  },
})