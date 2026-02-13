
import { Alert } from 'react-native';
import { IRespuestaTransferenciaCat } from '../../interfaces/IRespuestaTransferenciaCat1';
import { IEmpleadoCapturado } from '../../interfaces/local/IEmpleadoCapturado';
import { getDB } from '../sqlite';




/*export   async function  CrearTablaEmpleadosDeServidor() {
     const database = await getDB();


       await database.execAsync(`
        CREATE TABLE IF NOT EXISTS listaEmpleados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cod_empleado TEXT,
            Nom_empleado TEXT
    );

     CREATE TABLE IF NOT EXISTS listaEmpleadosCapturadosLocal (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cod_empleado TEXT,
            Nom_empleado TEXT,
            cod_lote TEXT,
            cod_nave TEXT,
            FechaRegistro, TEXT
    );
  `);

console.log('TablasCreadas')
}
*/

export async function InsertarEmpleadosASQLite(ListaEmpleados : IRespuestaTransferenciaCat []) {
        try{
           const database = await getDB();
   
  for (let empleado of ListaEmpleados) {
   
    await database.runAsync(
      `INSERT OR REPLACE  INTO listaEmpleados
      (
        cod_empleado ,
        Nom_empleado
        
       )
      VALUES (?, ?)`,
      [
        empleado.cod_empleado ,
        empleado.Nom_empleado
       
      ]
    );
  }

  console.log('Empleado agregado');
  return true
        }
        catch(error :any){
          console.log('Error', error)
          return false
        }
}


export async  function InsertarEmpleadosCapturados(ListaEmpleadosCapturados : IEmpleadoCapturado [] )
{
    try{
      const database = await getDB();
   
    for (let empleado of ListaEmpleadosCapturados) {
    
    await database.runAsync(
      `INSERT OR REPLACE  INTO listaEmpleadosCapturadosLocal
      (
        cod_empleado ,
        Nom_empleado ,
        cod_lote ,
        cod_nave ,
        FechaRegistro 
        
       )
      VALUES (?, ?, ?, ?, ?)`,
      [
        empleado.cod_empleado ,
        empleado.Nom_empleado, 
        empleado.cod_lote,
        empleado.cod_nave,
        empleado.FechaRegistro
       
      ]
    );
  }

  return true;
    }catch(error : any){ 
        Alert.alert('Error', error.message);
      return false;
    } 
}


export async function ConsultarEmpleados() {
    try{
      const database = await getDB();
 
  const result = await database.getAllAsync(
    `SELECT DISTINCT cod_empleado,  Nom_empleado FROM listaEmpleados`
  );
  return result;
    }
    catch(error : any){
      Alert.alert("Error" , error.message);
      return [];
    }
}

export async function ConsultarEmpleadosxFiltro(filtro: string) {
  const database = await getDB();


  const result = await database.getAllAsync(
    `SELECT cod_empleado, Nom_empleado 
     FROM listaEmpleados 
     WHERE Nom_Empleado LIKE ?`,
    [`%${filtro}%`] // 👈 importante: los % van dentro del valor, no del query
  );


  return result;
}

export async function ConsultarEmpleadosCapturados(cod_lote: string, cod_nave: string) {
  try{
  const database = await getDB();
 
  const result = await database.getAllAsync(
    `SELECT DISTINCT   cod_lote,cod_nave, cod_empleado,  Nom_empleado FROM listaEmpleadosCapturadosLocal WHERE  cod_lote = ? AND cod_nave = ?`, [cod_lote, cod_nave]
  );
    return result;
  }catch(error : any){
      Alert.alert("Error" , error.message);
      return [];
  }
}

export async function eliminarDatos() {

     const database = await getDB();
 
  const result = await database.getAllAsync(
    `DELETE FROM listaEmpleados`
  );


  console.log('Se eliminaron');
}

