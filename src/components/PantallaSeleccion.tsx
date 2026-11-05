import React from "react";
import { View, Text, Image, ImageSourcePropType, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { OpcionSelector } from "./ModalSelector";

// Piezas compartidas por las pantallas de selección (Actividades en lote y
// Actividades en nave): encabezado, selector por pasos, aviso y estado vacío.

export const COLORES = {
  fondo: "#e5e9f4",
  tarjeta: "#ffffff",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeSuave: "#e3f6e9",
  gris: "#c3c3c3",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280",
  error: "#d32f2f",
  errorSuave: "#fdecea"
};

export function EncabezadoVerde({
  titulo,
  subtitulo,
  onRegresar
}: {
  titulo: string;
  subtitulo?: string;
  onRegresar: () => void;
}) {
  return (
    <LinearGradient
      colors={[COLORES.verde, COLORES.verdeOscuro]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.encabezado}
    >
      <SafeAreaView edges={["top"]}>
        <View style={styles.filaEncabezado}>
          <Pressable
            onPress={onRegresar}
            hitSlop={8}
            style={({ pressed }) => [styles.botonRegresar, pressed && { opacity: 0.7 }]}
          >
            <Image source={require("../../assets/arrow-left.png")} style={styles.iconoRegresar} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.titulo}>{titulo}</Text>
            {!!subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Tarjeta que se monta sobre el borde inferior del encabezado y contiene los
// selectores de cada paso.
export function TarjetaSelectores({ children }: { children: React.ReactNode }) {
  return <View style={styles.selectores}>{children}</View>;
}

type SelectorPasoProps = {
  paso: string;
  etiqueta: string;
  icono: ImageSourcePropType;
  valor: OpcionSelector | null;
  placeholder: string;
  deshabilitado?: boolean;
  onPress: () => void;
};

export function SelectorPaso({
  paso,
  etiqueta,
  icono,
  valor,
  placeholder,
  deshabilitado,
  onPress
}: SelectorPasoProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [
        styles.selector,
        !!valor && styles.selectorElegido,
        deshabilitado && { opacity: 0.5 },
        pressed && { opacity: 0.8 }
      ]}
    >
      <View style={[styles.circuloSelector, { backgroundColor: valor ? COLORES.verdeSuave : COLORES.grisSuave }]}>
        <Image
          source={icono}
          style={[styles.iconoSelector, { tintColor: valor ? COLORES.verdeOscuro : COLORES.textoSuave }]}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.etiquetaSelector}>
          {paso} · {etiqueta}
        </Text>
        <Text style={[styles.valorSelector, !valor && { color: COLORES.textoSuave }]} numberOfLines={1}>
          {valor ? `${valor.codigo} · ${valor.nombre}` : placeholder}
        </Text>
      </View>
      <Image source={require("../../assets/arrow-left.png")} style={styles.flecha} />
    </Pressable>
  );
}

export function AvisoResultado({ tipo, texto }: { tipo: "ok" | "error"; texto: string }) {
  const color = tipo === "ok" ? COLORES.verdeOscuro : COLORES.error;
  return (
    <View style={[styles.aviso, tipo === "ok" ? styles.avisoOk : styles.avisoError]}>
      <Image
        source={tipo === "ok" ? require("../../assets/check-bold.png") : require("../../assets/close.png")}
        style={[styles.iconoAviso, { tintColor: color }]}
      />
      <Text style={[styles.textoAviso, { color }]}>{texto}</Text>
    </View>
  );
}

export function EstadoVacio({
  icono,
  titulo,
  texto
}: {
  icono: ImageSourcePropType;
  titulo: string;
  texto: string;
}) {
  return (
    <View style={styles.vacio}>
      <View style={styles.circuloVacio}>
        <Image source={icono} style={styles.iconoVacio} />
      </View>
      <Text style={styles.tituloVacio}>{titulo}</Text>
      <Text style={styles.textoVacio}>{texto}</Text>
    </View>
  );
}

const sombra = {
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 }
};

const styles = StyleSheet.create({
  encabezado: {
    paddingHorizontal: 16,
    paddingBottom: 44,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  filaEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12
  },
  botonRegresar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  iconoRegresar: {
    width: 22,
    height: 22,
    tintColor: "#ffffff",
    resizeMode: "contain"
  },
  titulo: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700"
  },
  subtitulo: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2
  },
  selectores: {
    marginTop: -30,
    marginHorizontal: 16,
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    padding: 8,
    gap: 4,
    ...sombra
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent"
  },
  selectorElegido: {
    backgroundColor: "#f7fdf9"
  },
  circuloSelector: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  iconoSelector: {
    width: 22,
    height: 22,
    resizeMode: "contain"
  },
  etiquetaSelector: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  valorSelector: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES.texto,
    marginTop: 2
  },
  flecha: {
    width: 18,
    height: 18,
    tintColor: COLORES.textoSuave,
    resizeMode: "contain",
    transform: [{ rotate: "180deg" }],
    marginLeft: 8
  },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1
  },
  avisoOk: {
    backgroundColor: COLORES.verdeSuave,
    borderColor: COLORES.verde
  },
  avisoError: {
    backgroundColor: COLORES.errorSuave,
    borderColor: COLORES.error
  },
  iconoAviso: {
    width: 18,
    height: 18,
    marginRight: 10,
    resizeMode: "contain"
  },
  textoAviso: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600"
  },
  vacio: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24
  },
  circuloVacio: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  iconoVacio: {
    width: 36,
    height: 36,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  },
  tituloVacio: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORES.texto,
    textAlign: "center"
  },
  textoVacio: {
    fontSize: 13,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 4
  }
});
