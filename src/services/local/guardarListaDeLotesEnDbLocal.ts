import { Alert } from 'react-native';
import { getDB } from '../sqlite';



/*export async function CrearTablaLotesxUsuario() {
  const database = await getDB();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS listaDeLotesxUsuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cod_lote TEXT,
      nom_lote TEXT
    );
  `);

  console.log("✅ Tabla listaDeLotesxUsuario creada o ya existente");
}*/

export async function verificarTablas() {
  const database = await getDB();
  const tablas = await database.getAllAsync(
    `SELECT name FROM sqlite_master WHERE type='table'`
  );

  console.log("📋 Tablas existentes en la base de datos:");
  tablas.forEach((t:any) => console.log("•", t.name));

  return tablas;
}



export async function obtenerListaLotesxUsuarioSqLite() {

 try{
    const database = await getDB();
 
    const result = await database.getAllAsync(
    `SELECT DISTINCT cod_lote,  RTRIM(nom_lote) as nom_lote FROM listaDeLotesxUsuario`
    );
    return result;
 }catch(error : any){

  Alert.alert("Error" ,error.message);
 }
}

