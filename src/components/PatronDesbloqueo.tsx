import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, PanResponder, StyleSheet } from "react-native";

type EstadoPatron = "normal" | "error" | "ok";

type Props = {
  tamano?: number;
  estado?: EstadoPatron;
  deshabilitado?: boolean;
  // Se llama al levantar el dedo con los índices (0-8) de los puntos unidos.
  onTerminar: (secuencia: number[]) => void;
};

const COLORES: Record<EstadoPatron, { trazo: string; suave: string }> = {
  normal: { trazo: "#008445", suave: "#e3f6e9" },
  ok: { trazo: "#13c044", suave: "#e3f6e9" },
  error: { trazo: "#d32f2f", suave: "#fdecea" }
};

// Cuadrícula 3x3 para dibujar un patrón con el dedo. Usa PanResponder y Views
// (sin librerías nativas). Los puntos se numeran 0-8 por filas.
export default function PatronDesbloqueo({
  tamano = 280,
  estado = "normal",
  deshabilitado = false,
  onTerminar
}: Props) {
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [dedo, setDedo] = useState<{ x: number; y: number } | null>(null);

  const paso = tamano / 3;
  const centros = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: (i % 3) * paso + paso / 2,
        y: Math.floor(i / 3) * paso + paso / 2
      })),
    [paso]
  );

  // El PanResponder se crea una vez: lee los valores actuales desde refs.
  const seleccionRef = useRef<number[]>([]);
  const centrosRef = useRef(centros);
  centrosRef.current = centros;
  const deshabilitadoRef = useRef(deshabilitado);
  deshabilitadoRef.current = deshabilitado;
  const onTerminarRef = useRef(onTerminar);
  onTerminarRef.current = onTerminar;
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  const tamanoRef = useRef(tamano);
  tamanoRef.current = tamano;
  // Esquina superior izquierda de la cuadrícula en coordenadas de pantalla.
  const origen = useRef({ x: 0, y: 0 });

  const puntoEn = (x: number, y: number) => {
    const lado = tamanoRef.current;
    if (x < 0 || y < 0 || x > lado || y > lado) return -1;
    const radio = (lado / 3) * 0.32;
    return centrosRef.current.findIndex((c) => Math.hypot(c.x - x, c.y - y) <= radio);
  };

  // En Android, locationX/Y de los movimientos se miden desde la vista que
  // queda bajo el dedo (si el trazo sale de la cuadrícula, desde otra vista),
  // así que la posición se calcula con pageX/Y menos el origen de la cuadrícula
  // tomado al tocarla (en ese momento la vista tocada es la cuadrícula).
  const posicion = (e: { nativeEvent: { pageX: number; pageY: number } }) => ({
    x: e.nativeEvent.pageX - origen.current.x,
    y: e.nativeEvent.pageY - origen.current.y
  });

  const agregar = (indice: number) => {
    const actual = seleccionRef.current;
    if (indice < 0 || actual.includes(indice)) return;
    const siguiente = [...actual];
    const anterior = actual[actual.length - 1];
    // Como en Android: si el trazo pasa sobre un punto intermedio (p. ej. de 0
    // a 2 pasa por 1), ese punto también se une.
    if (anterior !== undefined) {
      const f1 = Math.floor(anterior / 3), c1 = anterior % 3;
      const f2 = Math.floor(indice / 3), c2 = indice % 3;
      if ((f1 + f2) % 2 === 0 && (c1 + c2) % 2 === 0) {
        const medio = ((f1 + f2) / 2) * 3 + (c1 + c2) / 2;
        if (!siguiente.includes(medio)) siguiente.push(medio);
      }
    }
    siguiente.push(indice);
    seleccionRef.current = siguiente;
    setSeleccion(siguiente);
  };

  const terminar = () => {
    setDedo(null);
    const secuencia = seleccionRef.current;
    if (secuencia.length > 0) onTerminarRef.current(secuencia);
    // El trazo queda visible un momento (con el color de `estado`) y se borra.
    temporizador.current = setTimeout(() => {
      seleccionRef.current = [];
      setSeleccion([]);
    }, 700);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !deshabilitadoRef.current,
      onStartShouldSetPanResponderCapture: () => !deshabilitadoRef.current,
      // Solo se toma el gesto si empieza sobre la cuadrícula: si se tomara a
      // mitad del movimiento, el origen calculado no sería el de la cuadrícula.
      onMoveShouldSetPanResponder: () => false,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        if (temporizador.current) clearTimeout(temporizador.current);
        seleccionRef.current = [];
        setSeleccion([]);
        const { pageX, pageY, locationX, locationY } = e.nativeEvent;
        origen.current = { x: pageX - locationX, y: pageY - locationY };
        agregar(puntoEn(locationX, locationY));
        setDedo({ x: locationX, y: locationY });
      },
      onPanResponderMove: (e) => {
        const { x, y } = posicion(e);
        agregar(puntoEn(x, y));
        setDedo({ x, y });
      },
      onPanResponderRelease: terminar,
      onPanResponderTerminate: terminar
    })
  ).current;

  const color = COLORES[estado];
  const radioPunto = paso * 0.09;
  const radioAnillo = paso * 0.24;
  const ultimo = seleccion[seleccion.length - 1];

  return (
    <View
      {...responder.panHandlers}
      style={[styles.contenedor, { width: tamano, height: tamano, opacity: deshabilitado ? 0.5 : 1 }]}
    >
      {/* Los hijos no reciben toques: así locationX/Y siempre son relativos
          al contenedor. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {seleccion.slice(1).map((indice, i) => (
          <Segmento
            key={`${seleccion[i]}-${indice}`}
            desde={centros[seleccion[i]]}
            hasta={centros[indice]}
            color={color.trazo}
          />
        ))}
        {dedo && ultimo !== undefined && (
          <Segmento desde={centros[ultimo]} hasta={dedo} color={color.trazo} />
        )}
        {centros.map((c, i) => {
          const activo = seleccion.includes(i);
          return (
            <View key={i}>
              {activo && (
                <View
                  style={[
                    styles.circulo,
                    {
                      left: c.x - radioAnillo,
                      top: c.y - radioAnillo,
                      width: radioAnillo * 2,
                      height: radioAnillo * 2,
                      borderRadius: radioAnillo,
                      backgroundColor: color.suave,
                      borderColor: color.trazo
                    }
                  ]}
                />
              )}
              <View
                style={[
                  styles.circulo,
                  {
                    left: c.x - radioPunto,
                    top: c.y - radioPunto,
                    width: radioPunto * 2,
                    height: radioPunto * 2,
                    borderRadius: radioPunto,
                    backgroundColor: activo ? color.trazo : "#9ca3af",
                    borderWidth: 0
                  }
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Segmento({
  desde,
  hasta,
  color
}: {
  desde: { x: number; y: number };
  hasta: { x: number; y: number };
  color: string;
}) {
  const largo = Math.hypot(hasta.x - desde.x, hasta.y - desde.y);
  const angulo = Math.atan2(hasta.y - desde.y, hasta.x - desde.x);
  const grosor = 6;
  return (
    <View
      style={{
        position: "absolute",
        left: (desde.x + hasta.x) / 2 - largo / 2,
        top: (desde.y + hasta.y) / 2 - grosor / 2,
        width: largo,
        height: grosor,
        borderRadius: grosor / 2,
        backgroundColor: color,
        transform: [{ rotate: `${angulo}rad` }]
      }}
    />
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignSelf: "center"
  },
  circulo: {
    position: "absolute",
    borderWidth: 2
  }
});
