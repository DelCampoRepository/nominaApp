import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";
import { SeleccionarDatosUsuario, initDB } from "../../../src/services/sqlite";
import {
  INTENTOS_MAXIMOS_PATRON,
  MINIMO_PUNTOS,
  obtenerPatron,
  verificarPatron,
  obtenerIntentosFallidos,
  registrarIntentoFallido
} from "../../../src/services/local/patronAcceso";
import { EstadoTrazo, SesionConPatron } from "../types";

/**
 * Patrón de acceso: revisa si hay patrón guardado para el usuario del
 * teléfono, controla el modal y verifica el trazo. Si es correcto entra con
 * `iniciarSesion` usando el usuario y contraseña guardados.
 */
export function usePatronLogin(
  iniciarSesion: (username: string, password: string) => Promise<void>
) {
  // Patrón de acceso
  const [sesionPatron, setSesionPatron] = useState<SesionConPatron | null>(null);
  // Empieza bloqueado hasta leer el conteo de intentos fallidos.
  const [patronBloqueado, setPatronBloqueado] = useState(true);
  const [modalPatron, setModalPatron] = useState(false);
  const [estadoTrazo, setEstadoTrazo] = useState<EstadoTrazo>("normal");
  const [mensajePatron, setMensajePatron] = useState("");
  const [verificandoPatron, setVerificandoPatron] = useState(false);

  // Se revisa al mostrar la pantalla si hay un patrón para el usuario guardado
  // en el teléfono (y su contraseña, que es con la que se inicia sesión).
  const revisarPatron = useCallback(async () => {
    try {
      if (!(await initDB())) return;
      const datos = await SeleccionarDatosUsuario();
      const registro = datos[0];
      if (!registro?.user || !registro?.contra || !(await obtenerPatron(registro.user))) {
        setSesionPatron(null);
        return;
      }
      // Se lee el bloqueo antes de mostrar el botón para que no quede activo
      // ni un momento si el patrón está bloqueado.
      const bloqueadoAhora = (await obtenerIntentosFallidos()) >= INTENTOS_MAXIMOS_PATRON;
      setPatronBloqueado(bloqueadoAhora);
      setSesionPatron({ user: registro.user, nombre: registro.nom_usuario, contra: registro.contra });
    } catch {
      setSesionPatron(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      revisarPatron();
    }, [revisarPatron])
  );

  const abrirPatron = () => {
    setEstadoTrazo("normal");
    setMensajePatron("Dibuja tu patrón para entrar");
    setModalPatron(true);
  };

  const cerrarPatron = () => setModalPatron(false);

  const alTerminarPatron = async (secuencia: number[]) => {
    if (!sesionPatron || verificandoPatron) return;
    // Un toque o trazo corto no es un intento real: no se cuenta como fallido.
    if (secuencia.length < MINIMO_PUNTOS) {
      setEstadoTrazo("error");
      setMensajePatron(`Une al menos ${MINIMO_PUNTOS} puntos.`);
      setTimeout(() => setEstadoTrazo("normal"), 700);
      return;
    }
    setVerificandoPatron(true);
    try {
      // Se vuelve a leer el conteo guardado: el estado en pantalla podría no
      // estar al día.
      if ((await obtenerIntentosFallidos()) >= INTENTOS_MAXIMOS_PATRON) {
        setPatronBloqueado(true);
        setModalPatron(false);
        return;
      }
      if (await verificarPatron(sesionPatron.user, secuencia)) {
        setEstadoTrazo("ok");
        setModalPatron(false);
        await iniciarSesion(sesionPatron.user, sesionPatron.contra);
        return;
      }
      setEstadoTrazo("error");
      const intentos = await registrarIntentoFallido();
      const restantes = INTENTOS_MAXIMOS_PATRON - intentos;
      if (restantes <= 0) {
        setPatronBloqueado(true);
        setModalPatron(false);
        Alert.alert(
          "Patrón bloqueado",
          "Demasiados intentos con un patrón incorrecto. Entra con tu usuario y contraseña para volver a usar el patrón."
        );
        return;
      }
      setMensajePatron(
        `Patrón incorrecto. Te ${restantes === 1 ? "queda 1 intento" : `quedan ${restantes} intentos`}.`
      );
    } finally {
      setVerificandoPatron(false);
      setTimeout(() => setEstadoTrazo("normal"), 700);
    }
  };

  return {
    sesionPatron,
    patronBloqueado,
    modalPatron,
    estadoTrazo,
    mensajePatron,
    verificandoPatron,
    abrirPatron,
    cerrarPatron,
    alTerminarPatron
  };
}
