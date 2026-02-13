
import { getDB } from '../sqlite';
import { IRespuestaObtenerNavesxUsuario } from "../../interfaces/IRespuestaObtenerNavesxUsuario";
import { IActividadesxNave } from '../../interfaces/local/IActividadesxNave';
import { Alert } from 'react-native';

/*export async function CrearTablaNavesxUsuario() {
  try {
    const database = await getDB();
    console.log("Creando tabla de naves");

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS listaDeNavesxUsuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cod_lote TEXT,
        cod_nave TEXT,
        Descripcion_nave TEXT,
        LatY1 NUMERIC,
        LatY2 NUMERIC,
        LongX1 NUMERIC,
        LongX2 NUMERIC,
        UNIQUE(cod_lote, cod_nave)
      );


      CREATE TABLE IF NOT EXISTS listaDeActividadesAsignadasxNave (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cod_lote TEXT,
            cod_nave TEXT,
            Descripcion_nave TEXT,
            cod_actividad TEXT,
            cod_avance TEXT,
            nom_actividad TEXT,
            Nom_Corto TEXT,
            seleccionado INTEGER DEFAULT 0,
            UNIQUE(cod_lote, cod_nave, cod_actividad, cod_avance)
        );
    `);
     console.log("✅ Tabla listaDeNavesxUsuario creada o ya existente");
      return true;
   
  } catch (error) {
    console.error("❌ Error al crear tabla listaDeNavesxUsuario:", error);
  }}*/

export async function guardarListaNave(listaNave : IRespuestaObtenerNavesxUsuario[]) {
try{
  
    const database = await getDB();
   
  for (let nave of listaNave) {
    
    await database.runAsync(
      `INSERT OR REPLACE  INTO listaDeNavesxUsuario
      (
        cod_lote ,
        cod_nave,
        Descripcion_nave ,
        LatY1 ,
        LatY2 ,
        LongX1 ,
        LongX2
       )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
       nave.cod_lote ,
        nave.cod_nave,
        nave.Descripcion_nave ,
        nave.LatY1,
        nave.LatY2 ,
        nave.LongX1 ,
        nave.LongX2
      ]
    );
  }
  console.log('se guardaron las naves')
  return true;
}catch(error: any)
{
  return false;
}
    
}

export  async function guardarListaActividadesxNave(actividades: IActividadesxNave []) {

 
try{
    const database = await getDB();
 
  for (let actividad of actividades) {
      
  const resp =   await database.runAsync(
      `INSERT  OR REPLACE  INTO listaDeActividadesAsignadasxNave (cod_lote,cod_nave, Descripcion_nave, cod_actividad, cod_avance,nom_actividad,Nom_Corto ) VALUES(?,?,?,?,?,?,?)`,
      [actividad.cod_lote, actividad.cod_nave, actividad.Descripcion_nave, actividad.cod_actividad, actividad.cod_avance, actividad.nom_actividad, actividad.Nom_Corto]
    
    )
  } 
   
 return true;
}
catch(error : any)
{
    Alert.alert('Error', error.message);
    return false;
}

    
}


export  async function ConsultarListaActividadesxNave(codLote : string, codNave: string) {


  console.log(codLote, codNave)
 
try{
    const database = await getDB();
     
   const res=  await database.getAllAsync(
      `SELECT DISTINCT
       A.cod_actividad,
       A.cod_avance, 
       A.nom_actividad, 
       B.Rendimiento_Aplic,
       B.Rendimiento_Tope,
       B.Rendimiento_Aplic,
       B.Nom_Corto
        FROM 
         listaDeActividadesAsignadasxNave A INNER JOIN listaActividadesPrincipales B 
         ON A.cod_actividad = B.cod_actividad AND A.cod_avance = B.cod_avance AND A.cod_lote = B.cod_lote
          WHERE  A.cod_lote = ? AND A.cod_nave = ?`,
      [codLote, codNave]

    )
 return res;
 
}
catch(error : any)
{
   Alert.alert('Error', error.message);
  console.log(error)
    return [];
}

    
}

export async function obtenerListaNavesSqlite(cod_lote: string) {
    
      try{
        const database = await getDB();
        const result = await database.getAllAsync(
          `SELECT  DISTINCT  cod_nave, Descripcion_nave FROM listaDeNavesxUsuario  WHERE cod_lote =?`, [cod_lote]
        );
          console.log('naves',result)
        return result;
      }catch(error:any){

        Alert.alert('Error', error.message);
        return [];
      }
    
}

export async function obtenerActividadesxLoteSecundariasLocalesSeleccionados(cod_lote:string) {
   
  
  try{
    const database = await getDB();
    const result = await database.getAllAsync(
      `SELECT  DISTINCT  cod_actividad, cod_avance, nom_actividad, 0 as selecionado  FROM listaActividadesPrincipales  WHERE cod_lote = ?  AND cod_avance <> '000' AND  selecionado = 1`, [cod_lote]
    );

  return result;
  }
  catch(error:any){

    Alert.alert('Error', error.message);
    return [];
  }
}
 

