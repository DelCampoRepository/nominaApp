/*import React, {useState} from "react";
import { View,Text } from "react-native";
import { DataTable, Checkbox } from "react-native-paper";
//import CheckBox from "@react-native-community/checkbox";

/*export default function CustomTable({children}: {children: React.ReactNode} 
type Props = {
  listaActividades: Item[];
        // opcional: notificar al padre
};


type Item = {   
    key: number;
  codActividad: string;
  codAvance: string;
  nombreActividad: string;
  isSelected?: boolean; // opcional, para manejar selección
};




export default function CustomTable({listaActividades}: Props) {


  const [checked, setChecked] = React.useState(false);
    const [page, setPage] = React.useState<number>(0);
       const [numberOfItemsPerPageList] = React.useState([5,3]);
       const [itemsPerPage, onItemsPerPageChange] = React.useState(
         numberOfItemsPerPageList[0]
       );

       const from = page * itemsPerPage;
   const to = Math.min((page + 1) * itemsPerPage, listaActividades.length);

     React.useEffect(() => {
        setPage(0);
      }, [itemsPerPage]);
  return (
    <View style={{}}>
      <DataTable>
                <DataTable style={{ backgroundColor:"#f2f2f2cc" , height:"100%"}}>
                      <DataTable.Header style={{backgroundColor:"#c4c4c7cc"}}  >               
                        <DataTable.Title >Cod. Actividad</DataTable.Title>
                        <DataTable.Title >Cod. Avance</DataTable.Title>     
                        <DataTable.Title >Nombre Actividad</DataTable.Title>   
                         <DataTable.Title >Seleccionar</DataTable.Title>     
                      </DataTable.Header>
        
                  {listaActividades.slice(from, to).map((item) => (
                    <DataTable.Row key={item.key}>
                      <DataTable.Cell >{item.codActividad + " " + item.codAvance}</DataTable.Cell> 
                      <DataTable.Cell >{}</DataTable.Cell> 
                      <DataTable.Cell onPress={() =>{console.log(item.codActividad + ' '+ item.codAvance )}}>{item.nombreActividad}</DataTable.Cell>
                      <DataTable.Cell  numeric>  <Checkbox
                                                              status={checked ? "checked" : "unchecked"}
                                                               onPress={() => setChecked(!checked)}
                                                    /> </DataTable.Cell> 
                    </DataTable.Row>
                  ))}
        
                  <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(listaActividades.length / itemsPerPage)}
                    onPageChange={(page) => setPage(page)}
                    label={`${from + 1}-${to} of ${listaActividades.length}`}
                  
                    numberOfItemsPerPage={itemsPerPage}
                    onItemsPerPageChange={onItemsPerPageChange}
        
                    selectPageDropdownLabel={'Rows per page'}
                  />
                </DataTable>
      </DataTable>
    </View>
  );
}*/