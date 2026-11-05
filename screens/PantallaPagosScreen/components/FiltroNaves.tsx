import React from "react";
import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { COLORES } from "../../../src/components/PantallaSeleccion";

type Props = {
  naves: { codigo: string; nombre: string; cantidad: number }[];
  total: number;
  seleccionada: string | null;
  onCambiar: (codigo: string | null) => void;
};

// Chips para filtrar la lista por nave ("Todas" muestra todo).
export default function FiltroNaves({ naves, total, seleccionada, onCambiar }: Props) {
  if (naves.length < 2) return null;
  const chips = [{ codigo: null as string | null, texto: `Todas · ${total}` }].concat(
    naves.map((n) => ({ codigo: n.codigo as string | null, texto: `Nave ${n.codigo} · ${n.cantidad}` }))
  );
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contenido}
      style={styles.scroll}
    >
      {chips.map((c) => {
        const activo = c.codigo === seleccionada;
        return (
          <Pressable
            key={c.codigo ?? "todas"}
            onPress={() => onCambiar(c.codigo)}
            style={[styles.chip, activo && styles.chipActivo]}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>{c.texto}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -16,
    marginBottom: 12
  },
  contenido: {
    paddingHorizontal: 16,
    gap: 8
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORES.tarjeta,
    borderWidth: 1.5,
    borderColor: COLORES.grisSuave
  },
  chipActivo: {
    backgroundColor: COLORES.verdeOscuro,
    borderColor: COLORES.verdeOscuro
  },
  texto: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave
  },
  textoActivo: {
    color: "#ffffff"
  }
});
