import { obtenerSemanaActivaSqLite } from "../services/sqlite";

export async function ConsultarSemanaActiva() {
    const semana: any[] = await obtenerSemanaActivaSqLite();
    const semanaActiva= semana[0].semanaActiva; 
    return semanaActiva;
}

