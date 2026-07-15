import * as SQLite from "expo-sqlite";
import { IRespuestaActividadesxLote } from "../interfaces/IRespuestaActividadesxLote";
import { IListaLotesxUsuario } from "../interfaces/local/IListaLotesxUsuario";
import { ISecundaryActividades } from "../interfaces/local/ISecundaryActividades";
import { IAvanceEmpleado } from "../interfaces/local/IAvanceEmpleado";
import { iNaveSeleccionada } from "../interfaces/local/INaveSeleccionada";
import { IdatosEmpleadoNoInternet } from "../interfaces/local/IDatosUsuarioNoInternet";
import { IdatosActividadesNaves } from "../interfaces/local/IdatosActNave";
import dayjs = require("dayjs");
import { IEmpleadoCapturado } from "../interfaces/local/IEmpleadoCapturado";
import { Alert } from "react-native";
let db: SQLite.SQLiteDatabase | null = null;

 export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("MiBD195.db");
    console.log("📂 Base de datos abierta correctamente");
  }
  return db;
}

export async function initDB() {
  try{
    const database = await getDB();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS listaActividadesPrincipales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cod_lote TEXT,
      nom_actividad TEXT,
      cod_actividad TEXT,
      cod_avance TEXT,
      Rendimiento_Aplic NUMERIC,
      Rendimiento_Tope NUMERIC,
      Rendimiento_Presup NUMERIC,
      salario_jornal_base NUMERIC,
      salario_jornal_extra NUMERIC,
      Cod_unidad TEXT,
      Nom_unidad TEXT,
      Nom_Corto TEXT,
      selecionado INTEGER DEFAULT 0,
      UNIQUE(cod_lote, cod_actividad, cod_avance)
    );
 
      CREATE TABLE IF NOT EXISTS TablaActividadesSecundarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cod_lote TEXT,
      nom_actividad TEXT,
      cod_actividad TEXT,
      cod_avance TEXT,
      Rendimiento_Aplic NUMERIC,
      Rendimiento_Tope NUMERIC,
      Rendimiento_Presup NUMERIC,
      salario_jornal_base NUMERIC,
      salario_jornal_extra NUMERIC,
      Cod_unidad TEXT,
      Nom_unidad TEXT,
      Nom_Corto TEXT,
      selecionado INTEGER DEFAULT 0,
      fechaSeleccion TEXT,
      UNIQUE(cod_lote, cod_actividad, cod_avance)
    );
 


    CREATE TABLE IF NOT EXISTS actividadesEnNaves(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
        cod_lote TEXT, 
        cod_actividad TEXT, 
        cod_avance TEXT, 
        nom_actividad TEXt,  
        cod_nave TEXT, 
        Descripcion_nave TEXT,  
        seleccionado INTEGER DEFAULT 0,
        fecha TEXT,
        semanaActiva TEXT,
         UNIQUE (cod_lote,cod_nave,cod_actividad,cod_avance,semanaActiva,fecha,nom_actividad, Descripcion_nave)
    );

    CREATE TABLE IF NOT EXISTS listaDeLotesxUsuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cod_lote TEXT,
      nom_lote TEXT
    );

     CREATE TABLE IF NOT EXISTS tablaSemanaActiva (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semanaActiva TEXT
    );

      CREATE TABLE IF NOT EXISTS tablaAvances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cod_lote TEXT,
      cod_nave TEXT,
      desc_nave TEXT,
      cod_actividad TEXT,
      cod_avance TEXT,
      des_actividad TEXT,
      cod_empleado TEXT,
      nom_empleado TEXT,
      avance NUMERIC, 
      avanceA NUMERIC,
      semanaActiva TEXT,
      fecha TEXT,
      estadoSincro INTEGER DEFAULT 0,
      MensajeSincro TEXT DEFAULT '',
        UNIQUE (cod_lote,cod_nave,cod_actividad,cod_avance,semanaActiva,fecha,cod_empleado)
    );

    CREATE TABLE IF NOT EXISTS tablaActividadesEnNave (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cod_lote TEXT,
      cod_nave TEXT,
      desc_nave TEXT,
      cod_actividad TEXT,
      cod_avance TEXT,
      des_actividad TEXT,
      semanaActiva TEXT,
      fecha TEXT,
      seleccionado INTEGER DEFAULT 0,
        UNIQUE (cod_lote,cod_nave,cod_actividad,cod_avance,semanaActiva,fecha)
    );

    CREATE TABLE IF NOT EXISTS tablaDatosUsuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
        estado NUMERIC,
        idu_usuario  NUMERIC,
        mensaje TEXT,
        nom_usuario TEXT,
        semana_actual TEXT,
        token TEXT,
        expiration TEXT,
        user TEXT,
        UNIQUE (token,user,semana_actual)
    );
    
 CREATE TABLE IF NOT EXISTS tablajefesNave (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
        Cod_jefe_nave TEXT,
        NombreJefeNave  TEXT,
        UNIQUE (Cod_jefe_nave)
    );


      CREATE TABLE IF NOT EXISTS tablaEmpleadosSeleccionados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
        cod_empleado TEXT,
        nom_empleado TEXT,
        cod_lote TEXT,
        cod_nave TEXT,
        fecha TEXT,
        semana TEXT,
        UNIQUE (cod_empleado,cod_lote,cod_nave,fecha,semana)
    );

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

  console.log("✅ Tabla listaActividadesPrincipales creada o ya existente");
  return true;

  }catch(error : any)
  {
    console.log(error.message)
    return false;
  }
}

import {IAvancesNomina, IAvanceUI} from "../interfaces/IAvancesNomina";

import { IJefeNave } from "../interfaces/local/IJefeNave";
import { IMainActividades } from "../interfaces/local/IMainActividades";
import { fecha } from "../utils/GenerarFecha";
import { IActividadesAvancesSeleccionables } from "../interfaces/local/iActividadesAvancesSeleccionables";


 export async function existeAvanceEnSQLite (
  avance: IAvancesNomina,
  semanaActiva: string
) {
  //console.log(JSON.stringify(avance));
  try{
    
  const database = await getDB();
  const [result] : any = await database.getAllAsync(
    
    `
      SELECT EXISTS(SELECT 1 FROM tablaAvances WHERE
      cod_lote = ? AND
      cod_nave = ? AND
      cod_actividad = ? AND
      cod_avance = ? AND
      cod_empleado = ? AND
      fecha = ? AND 
      semanaActiva = ? AND
      avance = ?
      ) AS existe
      `
    ,

    [
      avance.Cod_lote,
      avance.Cod_nave,
      avance.Cod_actividad,
      avance.Cod_avance,
      avance.Cod_empleado,
      avance.Fecha.substring(0, 10),
      semanaActiva,
      avance.Avance
    ]
  );
  
  //console.log('resultado verificacion', result)
 
   if (result.existe === 1) {
    return true;
  } else {
    return false;
  }

  }catch(error : any){
    Alert.alert('', error.message)
  }
};


export async function SeleccionarJefesNaves() {
    try{

      const database = await getDB();
      
      const avances = await database.getAllAsync(`SELECT * FROM tablajefesNave`);
      return avances as  any[];

    }catch(error: any){
      
    }
}

export async function guardarListajefesNave(
  listaJefes: IJefeNave[]
) {

  try{

     
   const database = await getDB();
   
  for (let jefe of listaJefes) {

    await database.runAsync(
      `INSERT OR REPLACE  INTO tablajefesNave
      (
       Cod_jefe_nave,
       NombreJefeNave
       )
      VALUES (?, ?)`,
      [
        jefe.Cod_jefe_nave,
        jefe.NombreJefeNave,
      ]
    );
    
  }
 

    return true;
  }catch(eror:any){
    Alert.alert('', eror.message)
    console.log("Actividades  no se guardo en SQLite");
    return false;
  }
}



export async function insertarAvanceSQLite  (
  avances: IAvanceUI[],
  semanaActiva: string
)  {

  console.log('para guardar',avances,semanaActiva)
  try{ 
    const database = await getDB();
  
  for (let avance of avances) {
    
    const res =  await database.runAsync(
     `
     INSERT OR IGNORE INTO tablaAvances (
       cod_lote,
       cod_nave,
       desc_nave,
       cod_actividad,
       cod_avance,
       des_actividad,
       cod_empleado,
       nom_empleado,
       avance,
       avanceA,
       semanaActiva,
       fecha,
       estadoSincro,
       MensajeSincro
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(cod_lote,cod_nave,cod_actividad,cod_avance,semanaActiva,fecha,cod_empleado)
      DO UPDATE SET
      avance        = excluded.avance,
      avanceA       = excluded.avanceA,
      estadoSincro  = 0,
      MensajeSincro = ''
     `,
      [
        avance.Cod_lote,
        avance.Cod_nave,
        avance.nom_nave,
        avance.Cod_actividad,
        avance.Cod_avance,
        avance.Nom_Actividad,
        avance.Cod_empleado,
        avance.NombreEmpleado,
        avance.Avance,        
        avance.Avance,
        semanaActiva,
        avance.Fecha.substring(0, 10),
        0,
        ''
      ]
    
    );

    console.log(res.changes)
  }
    
    
  }catch(error : any)
  {
    Alert.alert('', error.message)
  }
};


export async function SeleccionarAvancesNomina() {
    try{

      const database = await getDB();
      
      const avances = await database.getAllAsync(`SELECT * FROM tablaAvances`);
      return avances as  any[];

    }catch(error: any){
      
    }
}


export async function GuardarActEnNaves(
  codLote: string,
  fecha: string,
  semana: string
) {
  try {

    const database = await getDB();

   
    await database.runAsync(
      `DELETE FROM actividadesEnNaves
       WHERE cod_lote = ?
       AND fecha = ?
       AND semanaActiva = ?`,
      [codLote, fecha, semana]
    );

    const datos: any = await database.getAllAsync(
      `SELECT  
        A.cod_lote, 
        A.cod_actividad, 
        A.cod_avance, 
        A.nom_actividad, 
        B.cod_nave, 
        B.Descripcion_nave,  
        0 AS seleccionado,
        ? AS fecha,
        ? AS semanaActiva
      FROM listaActividadesPrincipales A
      INNER JOIN listaDeNavesxUsuario B 
        ON A.cod_lote = B.cod_lote
      WHERE 
        A.cod_lote = ? 
        AND A.selecionado = ?`,
      [fecha, semana, codLote, 1]
    );

    for (let actividad of datos) {

      await database.runAsync(
        `INSERT OR REPLACE INTO actividadesEnNaves
        (
          cod_lote , 
          cod_actividad , 
          cod_avance , 
          nom_actividad ,  
          cod_nave , 
          Descripcion_nave ,  
          seleccionado,
          fecha,
          semanaActiva
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          actividad.cod_lote,
          actividad.cod_actividad,
          actividad.cod_avance,
          actividad.nom_actividad,
          actividad.cod_nave,
          actividad.Descripcion_nave,
          actividad.seleccionado,
          actividad.fecha,
          actividad.semanaActiva
        ]
      );

    }

    return true;

  } catch (error: any) {

    console.log(error.message);
    return false;

  }
}

export async function BuscarEmpleadoPorCodigo(codEmpleado: string) {
    try{

        const database = await getDB();
    
        const empleado = await database.getAllAsync(
          `SELECT Nom_empleado FROM listaEmpleados WHERE  cod_empleado = ?`,[codEmpleado]
        );
        
        return empleado as  any[];
  }
  catch(error: any)
  {
     console.log(error.message)
    return [];
   
  }
  
}

export async function SeleccionarActEnNaves(codLote: string, codNave:string, fecha: string,semana : string) :Promise<IdatosActividadesNaves[]>{
    try{

        const database = await getDB();
       

      
        const datos = await database.getAllAsync(
          `SELECT   
          cod_lote , 
          cod_nave, 
          cod_actividad , 
          cod_avance , 
          nom_actividad ,   
          seleccionado,
          fecha,
          semanaActiva
          FROM actividadesEnNaves 
          WHERE  cod_lote = ? AND cod_nave = ?  AND fecha = ? AND semanaActiva = ?
          `,[codLote, codNave, fecha, semana]
        );

       // console.log('lista',JSON.stringify(datos, null,2))
        return datos as  any[];
  }
  catch(error: any)
  {
     console.log(error.message)
    return [];
   
  }
  
}

export async function actualizarActEnNave(ActivdadesNave: IdatosActividadesNaves []) {
   try{
      const database = await getDB();
  
       console.log("asdasd")
      for (let nave of ActivdadesNave) {
      console.log("sss")
     const res = await database.runAsync( 
        `UPDATE  actividadesEnNaves SET seleccionado = ? WHERE  
        cod_lote = ? AND 
        cod_nave = ? AND
        cod_actividad = ? AND 
        cod_avance = ? AND 
        nom_actividad = ? AND 
        semanaActiva = ? AND 
        fecha = ?`,
        [
          nave.seleccionado,
          nave.cod_lote,
          nave.cod_nave,
          nave.cod_actividad,
          nave.cod_avance,
          nave.nom_actividad,
          nave.semanaActiva,
          nave.fecha   
        ]
      );

      console.log(res.changes)

  }
    console.log('actividades seleccionadas actualizadas')
    return true;
  }catch(error: any)
  {
      console.log(error.message)
      return false;
  }
}

export async function BorraroRegistrosTodasLasTablas() {
  
     const database = await getDB();
 
  const result = await database.getAllAsync(
    `DELETE FROM listaActividadesPrincipales;`
  );
   console.log('Se limpiaron todas las tablas ');
  const result2 = await database.getAllAsync(
    `
     DELETE FROM listaDeLotesxUsuario;
     `
  );
   console.log('Se limpiaron todas las tablas ');
  const result3 = await database.getAllAsync(
    `DELETE FROM tablaSemanaActiva;`
  );
   console.log('Se limpiaron todas las tablas ');
  const result4 = await database.getAllAsync(
    `
     DELETE FROM tablaAvances;
     `
  );
   console.log('Se limpiaron todas las tablas ');
  const result5 = await database.getAllAsync(
    `DELETE FROM tablaActividadesEnNave;`
  );
   console.log('Se limpiaron todas las tablas ');
  const result6 = await database.getAllAsync(
    `DELETE FROM tablaDatosUsuario;
     `
  );
   console.log('Se limpiaron todas las tablas ');
  const result7 = await database.getAllAsync(
    `DELETE FROM tablaEmpleadosSeleccionados;`
  );
   console.log('Se limpiaron todas las tablas ');
  const result8 = await database.getAllAsync(
    `DELETE FROM listaEmpleados;`
  );
   console.log('Se limpiaron todas las tablas ');
  const result9 = await database.getAllAsync(
    `DELETE FROM listaEmpleadosCapturadosLocal;`
  );
   console.log('Se limpiaron todas las tablas ');
  const result10 = await database.getAllAsync(
    `DELETE FROM listaDeLotesxUsuario;`
  );
   console.log('Se limpiaron todas las tablas ');
  const result11 = await database.getAllAsync(
    `DELETE FROM listaDeNavesxUsuario;`
  );
   console.log('Se limpiaron todas las tablas ');

    const result12 = await database.getAllAsync(
    `DELETE FROM listaDeActividadesAsignadasxNave;`
  );
   const result13 = await database.getAllAsync(
    `DELETE FROM actividadesEnNaves;`
  );
  
  
  console.log('Se limpiaron todas las tablas ');
}



export async function GuardarEmpleadosCapturados(dataEmpleados: IEmpleadoCapturado []) {

  try{
    
    const database = await getDB();

    for(const emp  of dataEmpleados)
    {
      console.log(emp)
    const data = await database.runAsync(
        `INSERT OR REPLACE  INTO tablaEmpleadosSeleccionados
        (
          cod_empleado ,
          nom_empleado ,
          cod_lote ,
          cod_nave ,
          fecha ,
          semana
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          emp.cod_empleado ,
          emp.Nom_empleado ,
          emp.cod_lote ,
          emp.cod_nave ,
          emp.FechaRegistro ,
          emp.semana

        ]
      );
      console.log(data.changes)
    }
  
    console.log('datos empleado guardados ')
    return true;
  }catch(error: any)
  {
      console.log(error.message)
      return false;
  }
}

export async function EliminarEmpleadosCapturados() {
  
     const database = await getDB();
 
  const result = await database.getAllAsync(
    `DELETE FROM tablaEmpleadosSeleccionados`
  );
  
  console.log('Se eliminaron EmpleadosDeLaSemana');
}

export async function SeleccionarEmpleadosCapturados(  codLote: string, codNave:string, fecha: string , semana : string, codAct: string, codAvance: string) {
    try{

        const database = await getDB();
       
        const datos = await database.getAllAsync(
          `SELECT  DISTINCT
          A.cod_empleado ,
          A.nom_empleado ,
          A.cod_lote ,
          A.cod_nave ,
          A.fecha ,
          A.semana,
          IFNULL( B.desc_nave, '') AS desc_nave,
          IFNULL(B.cod_actividad, '')AS cod_actividad,
          IFNULL(B.cod_avance,'')AS cod_avance,
          IFNULL(B.des_actividad,'') AS des_actividad,
          IFNULL(B.avance, 0 )AS avance,
          IFNULL(B.avanceA, 0)AS avanceA
          FROM tablaEmpleadosSeleccionados A
          LEFT JOIN tablaAvances AS B ON
          A.cod_lote = B.cod_lote AND
          A.cod_empleado = B.cod_empleado
          AND B.cod_actividad = ? AND B.cod_avance = ? AND A.cod_lote = B.cod_lote AND A.cod_nave = B.cod_nave
          WHERE A.cod_lote = ? AND A.cod_nave = ? AND  A.fecha = ? AND A.semana = ? ORDER BY A.id ASC
          `, [codAct, codAvance, codLote, codNave, fecha,  semana]
        );

 
        
 
       
         return datos as  any[];
  }
  catch(error: any)
  {
     console.log(error.message)
    return [];
   
  }
  
}

export async function GuardarDatosUsuario(datosUser: IdatosEmpleadoNoInternet ) {

  try{
    console.log('para guardar',datosUser)
      const database = await getDB();
      console.log('para guardar',datosUser)
    
      
    const data=     await database.runAsync(
        `INSERT OR REPLACE  INTO tablaDatosUsuario
        (
          estado,
          idu_usuario,
          mensaje,
          nom_usuario,
          semana_actual,
          token,
          expiration,
          user 
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          datosUser.estado,
          datosUser.idu_usuario,
          datosUser.mensaje,
          datosUser.nom_usuario,
          datosUser.semana_actual,
          datosUser.token,
          datosUser.expiration,
          datosUser.user

        ]
      );
      console.log(data.changes)
  
    console.log('datos empleado guardados ')
    return true;
  }catch(error: any)
  {
      console.log(error.message)
      return false;
  }
}

export async function EliminarDatosUsuario() {
  
     const database = await getDB();
 
  const result = await database.getAllAsync(
    `DELETE FROM tablaDatosUsuario`
  );
  
  console.log('Se eliminaron datos usuario');
}

export async function buscarNombreEmpleado(codEmpleado:string) {
  try{
      
       
          const database = await getDB();  
        const datos = await database.getAllAsync(
           `SELECT Nom_empleado 
   FROM listaEmpleados 
   WHERE cod_empleado = ? 
   LIMIT 1`,
  [ codEmpleado])

        return datos as  any[];
  }catch(error : any){
      Alert.alert('', error.message)
  }
}

export async function Seleccionarllenado(codLote : string) {
    try{

        const database = await getDB();
        const datos = await database.getAllAsync(
          `SELECT  
          A.cod_lote, 
          A.cod_actividad, 
          A.cod_avance, 
          A.nom_actividad, 
          B.cod_nave, 
          B.Descripcion_nave,  
          0 AS seleccionado  from listaActividadesPrincipales A   INNER JOIN 
           listaDeNavesxUsuario B ON A.cod_lote = B.cod_lote WHERE A.cod_lote  = ? AND A.selecionado = ?`, [codLote, 1]
        );
        console.log('lista',datos)
         return datos as  any[];
  }
  catch(error: any)
  {
     console.log(error.message)
    return [];
   
  }
  
}

export async function SeleccionarDatosUsuario() {
    try{

        const database = await getDB();

        const datos = await database.getAllAsync(
          `SELECT  * from tablaDatosUsuario`
        );
         return datos as IdatosEmpleadoNoInternet[];
  }
  catch(error: any)
  {
     console.log(error.message)
    return [];
  }
}

export async function actualizarActividadesEnNave(ActivdadesNave: iNaveSeleccionada []) {
   try{
      const database = await getDB();
      console.log(ActivdadesNave)
      for (let nave of ActivdadesNave) {
      
      await database.runAsync( 
        `UPDATE  tablaActividadesEnNave SET seleccionado = ? WHERE  
        cod_lote = ? AND 
        cod_nave =? AND 
        desc_nave = ?  AND 
        cod_actividad = ? AND 
        cod_avance = ? AND 
        des_actividad = ? AND 
        semanaActiva = ? AND 
     
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          0,
          nave.cod_lote,
          nave.cod_nave,
          nave.desc_nave,
          nave.cod_actividad,
          nave.cod_avance,
          nave.des_actividad,
          nave.semanaActiva,
         
          
        ]
      );

  }
    console.log('actividades seleccionadas actualizadas')
    return true;
  }catch(error: any)
  {
      console.log(error.message)
      return false;
  }
}

export async function GuardarActividadesEnNave(ActivdadesNave: iNaveSeleccionada []) {

  try{
      const database = await getDB();
    
      for (let nave of ActivdadesNave) {
      
      await database.runAsync(
        `INSERT OR REPLACE  INTO tablaActividadesEnNave
        (
          cod_lote,
          cod_nave,
          desc_nave,
          cod_actividad,
          cod_avance,
          des_actividad,
          semanaActiva,
          fecha,
          seleccionado
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
        [
          nave.cod_lote,
          nave.cod_nave,
          nave.desc_nave,
          nave.cod_actividad,
          nave.cod_avance,
          nave.des_actividad,
          nave.semanaActiva,
          nave.fecha,
          nave.seleccionado

        ]
      );

  }
  
    return true;
  }catch(error: any)
  {
      console.log(error.message)
      return false;
  }
}

export async function SeleccionarActividadesNave(codLote : string, codNave : string, semana: string):Promise<IActividadesAvancesSeleccionables[]>{
    try{
  
const database = await getDB();

  const ListaEmpleadosFiltrados = await database.getAllAsync<IActividadesAvancesSeleccionables>(
    `SELECT DISTINCT 
      A.cod_lote,
      A.cod_nave,
      A.Descripcion_nave,
      A.cod_actividad,
      A.cod_avance,
      A.nom_actividad,
      A.semanaActiva,
      A.fecha,
      A.seleccionado,
      B.Rendimiento_Aplic,
      B.Rendimiento_Tope,
      B.Nom_Corto
      FROM actividadesEnNaves A INNER JOIN listaActividadesPrincipales B 
      ON A.cod_actividad = B.cod_actividad AND A.cod_avance = B.cod_avance AND A.cod_lote = B.cod_lote
      WHERE A.cod_lote = ? AND  A.cod_nave = ? and A.semanaActiva = ? AND A.seleccionado = ? AND A.fecha = ?`, [codLote, codNave, semana, 1, fecha]
  );


  return ListaEmpleadosFiltrados;
  }
  catch(error: any)
  {
     console.log(error.message)
    return [];
   
  }
  
}

export async function EliminarActividadesEnNave(semanaActiva: string) {
  
     const database = await getDB();
 
  const result = await database.getAllAsync(
    `DELETE FROM tablaActividadesEnNave `, [semanaActiva]
  );
  
  console.log('Se eliminaron lista actividades en nave');
}

export async function AsentarEmpleados(listaEmpleadosAsentar: IAvanceEmpleado []) {

  try{
      const database = await getDB();
   console.log(listaEmpleadosAsentar)
  for (let empleado of listaEmpleadosAsentar) {
   
    await database.runAsync(
      `INSERT OR REPLACE  INTO tablaAvances
      (
      cod_lote,
      cod_nave,
      desc_nave,
      cod_actividad,
      cod_avance,
      des_actividad,
      cod_empleado,
      nom_empleado,
      avance, 
      avanceA,
      semanaActiva,
      fecha
    
       )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empleado.cod_lote,
        empleado.cod_nave,
        empleado.desc_nave,
        empleado.cod_actividad,
        empleado.cod_avance,
        empleado.des_actividad,
        empleado.cod_empleado,
        empleado.nom_empleado,
        Number(empleado.avance),
        Number(empleado.avanceA),
        empleado.semanaActiva,
        empleado.fecha,
        
      ]
    );

  }
    console.log('Empleados asentados')
    return true;
  }catch(error: any)
  {
     Alert.alert('', error.message)
      console.log(error.message)
      return false
  }
}

export async function ActualizarAvances(listaEmpleadosAsentar: IAvanceEmpleado []) {

  try{
      const database = await getDB();
     
  for (let empleado of listaEmpleadosAsentar) {
   
    type ExisteResult = { existe: number };
   
    const res =   await database.getAllAsync<ExisteResult>(`
      SELECT EXISTS(SELECT 1 FROM tablaAvances WHERE
      cod_actividad = ? AND
      cod_avance = ? AND
      cod_empleado = ? AND
      cod_lote =  ? AND
      cod_nave = ? AND
      fecha = ? AND 
      semanaActiva = ?
      ) AS existe
      `, 
      [
      empleado.cod_actividad, 
      empleado.cod_avance, 
      empleado.cod_empleado, 
      empleado.cod_lote, 
      empleado.cod_nave, 
      empleado.fecha, 
      empleado.semanaActiva]
    )
    console.log(res[0].existe )
    const existe = res[0]?.existe
   if (existe === 1) {
    console.log("Sí existe");

      const result= await database.runAsync(
      `UPDATE  tablaAvances set  avance = ? , avanceA = ?  WHERE  
      cod_actividad = ? AND
      cod_avance =    ? AND
      cod_lote =      ? AND 
      cod_nave=       ? AND 
      cod_empleado =  ? AND 
      semanaActiva =  ? AND 
      fecha = ?
      `,

      [
        empleado.avance  === "" ? 0 : Number( empleado.avance),
        empleado.avanceA === "" ? 0 : Number( empleado.avanceA),
         empleado.cod_actividad,
        empleado.cod_avance,
        empleado.cod_lote,
        empleado.cod_nave,
        empleado.cod_empleado,
        empleado.semanaActiva,
        empleado.fecha
      ]
    );
 console.log('Empleados actualizados')
   
} else {
  console.log("No existe");
   await database.runAsync(
      `INSERT INTO tablaAvances
      (
      cod_lote,
      cod_nave,
      desc_nave,
      cod_actividad,
      cod_avance,
      des_actividad,
      cod_empleado,
      nom_empleado,
      avance, 
      avanceA,
      semanaActiva,
      fecha
    
       )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empleado.cod_lote,
        empleado.cod_nave,
        empleado.desc_nave,
        empleado.cod_actividad,
        empleado.cod_avance,
        empleado.des_actividad,
        empleado.cod_empleado,
        empleado.nom_empleado,
        Number(empleado.avance),
        Number(empleado.avanceA),
        empleado.semanaActiva,
        empleado.fecha,
        
      ]
    );
    console.log('Empleados guardado')

    }
  }
  
   
    return true;
  }catch(error: any)
  {
    Alert.alert('', error.message)
      console.log(error.message)
      return false
  }
}

export async function ActualizarAvancesSincro(empleado: IAvanceEmpleado ) {

  try{
      const database = await getDB();
     
  
    console.log('para act',empleado)
   const result= await database.runAsync(
      `UPDATE  tablaAvances set  estadoSincro = ? , MensajeSincro = ?  WHERE  
      cod_actividad = ? AND
      cod_avance = ? AND 
      cod_lote =      ? AND 
      cod_nave=       ? AND 
      cod_empleado =  ? AND 
      semanaActiva =  ? AND 
      fecha = ?
      `,

      [
        empleado.estadoSincro  ,
        empleado.MensajeSincro,
        empleado.cod_actividad,
        empleado.cod_avance,
        empleado.cod_lote,
        empleado.cod_nave,
        empleado.cod_empleado,
        empleado.semanaActiva,
        empleado.fecha
       
      ]
    );
  console.log(result.changes)
  
  
    console.log('estado Empleado  actualizados')
    return true;
  }catch(error: any)
  {
    Alert.alert('', error.message)
      console.log(error.message)
      return false
  }
}

export async function SeleccionarAvancesEmpleadosASyncronizar(semanaActiva: string, fecha : string) {
   try{
    const database = await getDB();

  const ListaEmpleadosFiltrados = await database.getAllAsync(
    `SELECT DISTINCT 
      A.cod_lote,
      A.cod_nave,
      A.desc_nave,
      A.cod_actividad,
      A.cod_avance,
      A.des_actividad,
      A.cod_empleado,
      A.nom_empleado,
      A.avance, 
      A.avanceA,
      A.semanaActiva,
      A.fecha,
      A.estadoSincro,
      A.MensajeSincro,
      B.Rendimiento_Aplic
      FROM tablaAvances A INNER JOIN listaActividadesPrincipales B 
      ON A.cod_actividad = B.cod_actividad AND A.cod_avance = B.cod_avance AND A.cod_lote = B.cod_lote
      
     WHERE A.semanaActiva = ?  AND A.fecha = ?`, [semanaActiva, fecha], 
  );

  
  return ListaEmpleadosFiltrados as IAvanceEmpleado [];
  }
  catch(error: any)
  {
  Alert.alert('', error.message)  
     console.log(error.message)
    return [];
   
  }
  
}

export async function SeleccioarEmpleadosparaAsignarActividad(codLote : string, codNave: string, fecha: string, codAct : string, codAvance:string) : Promise<IAvanceEmpleado[]>{

  console.log('parametros', codLote, codNave, fecha, codAct, codAvance)
  try{
const database = await getDB();

  const ListaEmpleadosFiltrados = await database.getAllAsync(
    `SELECT DISTINCT 
      A.cod_lote,
      A.cod_nave,
      B.desc_nave,
      B.cod_actividad,
      B.cod_avance,
      B.des_actividad,
      B.cod_empleado,
      B.nom_empleado,
      B.avance, 
      B.avanceA,
      B.semanaActiva,
      B.fecha 
     FROM tablaEmpleadosSeleccionados AS A
     LEFT JOIN tablaAvances AS B ON A.cod_empleado = B.cod_empleado AND A.cod_lote = B.cod_lote AND A.cod_nave = B.cod_nave
     WHERE A.cod_lote = ? AND  A.cod_nave = ? AND B.fecha = ? AND B.cod_actividad = ? AND B.cod_avance = ? `, [codLote, codNave, fecha,codAct,codAvance]
  );

  console.log('res',ListaEmpleadosFiltrados)
  return ListaEmpleadosFiltrados as IAvanceEmpleado [];
  }
  catch(error: any)
  {
    Alert.alert('', error.message)
     console.log(error.message)
    return [];
   
  }
  
}

export async function limpiarTablaAvances() {

 try{
  console.log('limpiando tabla avances')  
      const database = await getDB();
 
  const result = await database.getAllAsync(
    `DELETE FROM tablaAvances`
  );
   const result2 = await database.getAllAsync(
    `DELETE FROM   tablaEmpleadosSeleccionados`
  );

  
  console.log('Se eliminaron registros tablaAvances');
 }
 catch(error: any){
   Alert.alert('', error.message) 
   return;
 }
}

export async function verificarTablas() {
  try{

    const database = await getDB();
  const tablas = await database.getAllAsync(
    `SELECT name FROM sqlite_master WHERE type='table'`
  );

  console.log("📋 Tablas existentes en la base de datos:");
  tablas.forEach((t:any) => console.log("•", t.name));

  return tablas;
  }catch(error : any){
        Alert.alert('', error.message)
        return [];
  }
}

export async function guardarListaActividadesxLote(
  listaActividades: IRespuestaActividadesxLote[]
) {

  try{

   const database = await getDB();
   
  for (let actividad of listaActividades) {
   
    await database.runAsync(
      `INSERT OR REPLACE  INTO listaActividadesPrincipales
      (
       cod_lote,
       nom_actividad, 
       cod_actividad, 
       cod_avance, 
       Rendimiento_Aplic, 
       Rendimiento_Tope, 
       Rendimiento_Presup, 
       salario_jornal_base, 
       salario_jornal_extra, 
       Cod_unidad, 
       Nom_unidad, 
       Nom_Corto,
       selecionado
       )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        actividad.cod_lote,
        actividad.nom_actividad,
        actividad.cod_actividad,
        actividad.cod_avance,
        actividad.Rendimiento_Aplic,
        actividad.Rendimiento_Tope,
        actividad.Rendimiento_Presup,
        actividad.salario_jornal_base,
        actividad.salario_jornal_extra,
        actividad.Cod_unidad,
        actividad.Nom_unidad,
        actividad.Nom_Corto,
        0
      ]
    );


  }

  console.log("✅ Actividades guardadas en SQLite");
    return true;
  }catch(eror:any){
    Alert.alert('', eror.message)
    console.log("Actividades  no se guardo en SQLite");
    return false;
  }
}

export async function obtenerActividadesxLoteLocales(cod_lote:string) :Promise<IMainActividades[]>{

try{
     const database = await getDB();
  const result = await database.getAllAsync<IMainActividades>(
    `SELECT DISTINCT cod_actividad,  RTRIM(nom_actividad) as nom_actividad FROM listaActividadesPrincipales WHERE cod_lote = ?  AND  cod_avance = ?`,[cod_lote, '000']
  );
 
  return result;
}
catch(error : any){
    Alert.alert('', error.message)
    return [];
}

}

export async function obtenerActividadesxLoteSecundariasLocales(cod_lote:string, cod_actividad: string): Promise<ISecundaryActividades[]> {
   
  
  try{

     const database = await getDB();
  const result = await database.getAllAsync<ISecundaryActividades>(
    `SELECT DISTINCT  
    cod_actividad, 
    cod_avance, 
    nom_actividad, 
    selecionado 
    FROM listaActividadesPrincipales  
    WHERE cod_lote = ? AND cod_actividad = ?  AND cod_avance <> '000'`,
    [cod_lote, cod_actividad]
  );
  return result;
  }
  catch(error : any){

    Alert.alert('', error.message)
    return [];
  }
}
// `SELECT DISTINCT cod_lote, RTRIM(nom_actividad) as  nom_actividad FROM  listaActividadesPrincipales WHERE cod_avance = ? AND cod_lote = ? `,['000',cod_lote]
// `SELECT DISTINCT cod_actividad,cod_avance,  RTRIM(nom_actividad) as nom_actividad, seleccionado  FROM listaActividadesPrincipales  WHERE cod_lote = ?  AND  cod_actividad = ? AND cod_avance <> '000' ` ,[cod_lote, cod_actividad]
export async function guardarListaLotesXUsuarioSqLite(
  listaDelotes: IListaLotesxUsuario[]
) {
 try{
const database = await getDB();
 
  for (let lote of listaDelotes) {
   
   
     
    await database.runAsync(
      `INSERT INTO listaDeLotesxUsuario (cod_lote, nom_lote) VALUES(?,?)`,[lote.cod_lote, lote.nom_lote]
    
    )

  }

  console.log("✅ lotes guardados en SQLite");
  return true;
 }catch(error : any){

 console.log(error.message);
 return false;
 }
}

export async function  actualizar(cod_lote:string, listaActividadesSec:  ISecundaryActividades []  ) {
  
   const database = await getDB();
    
  try{

//console.log(JSON.stringify(listaActividadesSec,null,2))
 for (let actividad of listaActividadesSec) {
  const res=   await database.runAsync(
      `UPDATE listaActividadesPrincipales 
        SET selecionado = ? 
        WHERE cod_lote = ? AND cod_actividad = ? AND cod_avance = ?`,
      [
        actividad.selecionado,
        cod_lote,
        actividad.cod_actividad,
        actividad.cod_avance
      ]
    );
   
    //console.log('actualizados',res.changes)
  }

   const res2=   await database.getAllAsync(
      `SELECT * FROM listaActividadesPrincipales WHERE selecionado = ?`, [1]
    );
   
    
//console.log(JSON.stringify(res2,null,2))
    return true

  }catch(error :any)
  {
    console.log(error)
    return false;
  }
   
 
}

export async function guardarSemanaActivaSqLite(semanaActiva: string){
 try{
    const database = await getDB();
   await database.runAsync(
      `INSERT INTO tablaSemanaActiva (semanaActiva) VALUES(?)`,[semanaActiva]
    
    )
 }catch(error : any){
      Alert.alert('', error.message)
}
}

export async function obtenerSemanaActivaSqLite() {
   
try{
  
   const database = await getDB();
  const result = await database.getAllAsync(
    `SELECT semanaActiva FROM tablaSemanaActiva`
  );
  return result;
}catch(error : any){
  Alert.alert('', error.message)
  return [];
}}

export async function eliminarDatosTablaSemanaActivaSqLite() {

     const database = await getDB();
 
  const result = await database.getAllAsync(
    `DELETE FROM tablaSemanaActiva`
  );
  
  console.log('Se eliminaron');
}
