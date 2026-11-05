import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { SeleccionarDatosUsuario } from "../../../src/services/sqlite";
import {
  MINIMO_PUNTOS,
  PatronGuardado,
  obtenerPatron,
  guardarPatron,
  verificarPatron,
  eliminarPatron,
  INTENTOS_MAXIMOS_PATRON,
  obtenerIntentosFallidos,
  registrarIntentoFallido,
  reiniciarIntentosFallidos
} from "../../../src/services/local/patronAcceso";
import { AccionPatron, AvisoPatron, EstadoTrazo, Modo, UsuarioPatron } from "../types";

export function useConfigurarPatron() {
  const [usuario, setUsuario] = useState<UsuarioPatron | null>(null);
  const [patron, setPatron] = useState<PatronGuardado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState<Modo>("resumen");
  const [accion, setAccion] = useState<AccionPatron>("cambiar");
  const [estadoTrazo, setEstadoTrazo] = useState<EstadoTrazo>("normal");
  const [mensaje, setMensaje] = useState("");
  const [mensajeError, setMensajeError] = useState(false);
  const [aviso, setAviso] = useState<AvisoPatron | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const primerTrazo = useRef<number[]>([]);
  // Patrón bloqueado por intentos fallidos (se desbloquea al entrar con la
  // contraseña).
  const [bloqueado, setBloqueado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const datos = await SeleccionarDatosUsuario();
        if (datos.length > 0) {
          setUsuario({ user: datos[0].user, nombre: datos[0].nom_usuario });
          setPatron(await obtenerPatron(datos[0].user));
        }
        setBloqueado((await obtenerIntentosFallidos()) >= INTENTOS_MAXIMOS_PATRON);
      } finally {
        setCargando(false);
      }
    })();
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  // Muestra el color del trazo (ok/error) un momento y vuelve a normal.
  const marcarTrazo = (estado: EstadoTrazo) => {
    setEstadoTrazo(estado);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setEstadoTrazo("normal"), 700);
  };

  const indicar = (texto: string, esError = false) => {
    setMensaje(texto);
    setMensajeError(esError);
  };

  const iniciar = (nuevoModo: Modo, nuevaAccion?: AccionPatron) => {
    setAviso(null);
    primerTrazo.current = [];
    if (nuevaAccion) setAccion(nuevaAccion);
    setModo(nuevoModo);
    indicar(
      nuevoModo === "actual"
        ? "Dibuja tu patrón actual"
        : `Dibuja tu nuevo patrón uniendo al menos ${MINIMO_PUNTOS} puntos`
    );
  };

  const cancelar = () => {
    setModo("resumen");
    setEstadoTrazo("normal");
  };

  const terminarResumen = (tipo: "ok" | "error", texto: string) => {
    setModo("resumen");
    setAviso({ tipo, texto });
  };

  const alTerminarTrazo = async (secuencia: number[]) => {
    if (!usuario || ocupado) return;

    if (modo === "actual") {
      // Un toque o trazo corto no es un intento real: no se cuenta como fallido.
      if (secuencia.length < MINIMO_PUNTOS) {
        marcarTrazo("error");
        indicar(`Une al menos ${MINIMO_PUNTOS} puntos.`, true);
        return;
      }
      setOcupado(true);
      const correcto = await verificarPatron(usuario.user, secuencia);
      if (!correcto) {
        // Mismo contador guardado que el login: no se reinicia al volver a
        // tocar Cambiar/Eliminar ni al cerrar la app.
        const fallidos = await registrarIntentoFallido();
        setOcupado(false);
        marcarTrazo("error");
        const restantes = INTENTOS_MAXIMOS_PATRON - fallidos;
        if (restantes <= 0) {
          setBloqueado(true);
          terminarResumen(
            "error",
            "Demasiados intentos con un patrón incorrecto. El patrón queda bloqueado hasta que entres con tu usuario y contraseña."
          );
          return;
        }
        indicar(`Patrón incorrecto. Te ${restantes === 1 ? "queda 1 intento" : `quedan ${restantes} intentos`}.`, true);
        return;
      }
      await reiniciarIntentosFallidos();
      setOcupado(false);
      marcarTrazo("ok");
      if (accion === "cambiar") {
        iniciar("nuevo");
        return;
      }
      Alert.alert(
        "Eliminar patrón",
        "Ya no podrás entrar con el patrón; tendrás que usar tu usuario y contraseña.",
        [
          { text: "Cancelar", style: "cancel", onPress: cancelar },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              await eliminarPatron();
              setPatron(null);
              terminarResumen("ok", "Se eliminó el patrón de acceso.");
            }
          }
        ]
      );
      return;
    }

    if (modo === "nuevo") {
      if (secuencia.length < MINIMO_PUNTOS) {
        marcarTrazo("error");
        indicar(`Une al menos ${MINIMO_PUNTOS} puntos. Inténtalo de nuevo.`, true);
        return;
      }
      primerTrazo.current = secuencia;
      marcarTrazo("ok");
      setModo("confirmar");
      indicar("Dibuja el mismo patrón otra vez para confirmarlo");
      return;
    }

    if (modo === "confirmar") {
      if (secuencia.join("-") !== primerTrazo.current.join("-")) {
        marcarTrazo("error");
        primerTrazo.current = [];
        setModo("nuevo");
        indicar("Los patrones no coinciden. Dibuja tu nuevo patrón otra vez.", true);
        return;
      }
      setOcupado(true);
      try {
        await guardarPatron(usuario.user, secuencia);
        await reiniciarIntentosFallidos();
        setBloqueado(false);
        setPatron(await obtenerPatron(usuario.user));
        marcarTrazo("ok");
        terminarResumen("ok", "Patrón guardado. Ya puedes usarlo para entrar.");
      } catch (e: any) {
        terminarResumen("error", String(e?.message || "No se pudo guardar el patrón."));
      } finally {
        setOcupado(false);
      }
    }
  };

  const titulos: Record<Modo, string> = {
    resumen: "",
    actual: accion === "cambiar" ? "Cambiar patrón" : "Eliminar patrón",
    nuevo: patron ? "Nuevo patrón" : "Crear patrón",
    confirmar: "Confirmar patrón"
  };

  return {
    usuario,
    patron,
    cargando,
    modo,
    estadoTrazo,
    mensaje,
    mensajeError,
    aviso,
    ocupado,
    bloqueado,
    titulos,
    iniciar,
    cancelar,
    alTerminarTrazo
  };
}
