import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDB } from "../sqlite";

// Patrón de acceso: permite entrar sin escribir la contraseña usando el
// usuario y la contraseña que ya están guardados en el teléfono
// (tablaDatosUsuario). Solo se guarda un hash del patrón (nunca la
// secuencia), ligado al usuario para el que se creó.

export const MINIMO_PUNTOS = 4;

export type PatronGuardado = {
  usuario: string;
  fecha: string;
};

async function tabla() {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tablaPatronAcceso (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      usuario TEXT NOT NULL,
      hash TEXT NOT NULL,
      fecha TEXT
    );
  `);
  return db;
}

// El usuario forma parte del hash: el mismo trazo de otro usuario no coincide.
async function hashPatron(usuario: string, secuencia: number[]) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${usuario.trim().toLowerCase()}:${secuencia.join("-")}`
  );
}

// Patrón guardado para `usuario`, o null si no hay (o es de otro usuario).
export async function obtenerPatron(usuario: string): Promise<PatronGuardado | null> {
  const db = await tabla();
  const fila = await db.getFirstAsync<{ usuario: string; fecha: string }>(
    `SELECT usuario, fecha FROM tablaPatronAcceso WHERE id = 1`
  );
  if (!fila || fila.usuario.trim().toLowerCase() !== usuario.trim().toLowerCase()) {
    return null;
  }
  return { usuario: fila.usuario, fecha: fila.fecha };
}

export async function guardarPatron(usuario: string, secuencia: number[]) {
  if (secuencia.length < MINIMO_PUNTOS) {
    throw new Error(`El patrón debe unir al menos ${MINIMO_PUNTOS} puntos.`);
  }
  const db = await tabla();
  const hash = await hashPatron(usuario, secuencia);
  await db.runAsync(
    `INSERT OR REPLACE INTO tablaPatronAcceso (id, usuario, hash, fecha) VALUES (1, ?, ?, ?)`,
    [usuario, hash, new Date().toISOString()]
  );
}

export async function verificarPatron(usuario: string, secuencia: number[]): Promise<boolean> {
  const db = await tabla();
  const fila = await db.getFirstAsync<{ usuario: string; hash: string }>(
    `SELECT usuario, hash FROM tablaPatronAcceso WHERE id = 1`
  );
  if (!fila || fila.usuario.trim().toLowerCase() !== usuario.trim().toLowerCase()) return false;
  return fila.hash === (await hashPatron(usuario, secuencia));
}

export async function eliminarPatron() {
  const db = await tabla();
  await db.runAsync(`DELETE FROM tablaPatronAcceso`);
}

// Intentos fallidos al entrar con patrón. Se guardan en el teléfono para que
// cerrar la app no los reinicie; se reinician con un inicio de sesión correcto.
export const INTENTOS_MAXIMOS_PATRON = 5;
const CLAVE_INTENTOS = "patron_intentos_fallidos";

export async function obtenerIntentosFallidos(): Promise<number> {
  try {
    return Number(await AsyncStorage.getItem(CLAVE_INTENTOS)) || 0;
  } catch {
    return 0;
  }
}

export async function registrarIntentoFallido(): Promise<number> {
  const intentos = (await obtenerIntentosFallidos()) + 1;
  try {
    await AsyncStorage.setItem(CLAVE_INTENTOS, String(intentos));
  } catch {
    // Sin almacenamiento el conteo queda solo en esta sesión.
  }
  return intentos;
}

export async function reiniciarIntentosFallidos() {
  try {
    await AsyncStorage.removeItem(CLAVE_INTENTOS);
  } catch {
    // Nada que hacer.
  }
}
