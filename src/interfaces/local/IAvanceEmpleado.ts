export interface IAvanceEmpleado{
    

      cod_lote: string,
      cod_nave: string,
      desc_nave: string
      cod_actividad: string,
      cod_avance: string,
      des_actividad : string,
      cod_empleado : string,
      nom_empleado : string,
      avance : string, 
      avanceA :string,
      semanaActiva : string,
      fecha: string,
      Rendimiento_Aplic: number,
      estadoSincro: number,
      MensajeSincro: number,
      // Fecha y hora del registro (AAAA-MM-DD HH:mm:ss.SSS); null si no tiene.
      fechaRegistro?: string | null
    
}
