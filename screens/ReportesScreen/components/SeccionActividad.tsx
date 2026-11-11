import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { horaDe } from "../../../src/utils/GenerarFecha";
import {
  ICONO_ACTIVIDAD,
  ICONO_EMPLEADO,
  SeccionActividad as Seccion,
  capitalizar,
  capitalizarNombre,
  estadoRegistro,
  formatear,
  jornales,
  textoEstado
} from "../utils";

const COLOR_ESTADO = {
  sincronizado: { texto: COLORES.verdeOscuro, fondo: COLORES.verdeSuave },
  pendiente: { texto: "#b45309", fondo: "#fef3e2" },
  rechazado: { texto: COLORES.error, fondo: COLORES.errorSuave }
};

// Una actividad con sus totales y los registros de cada empleado.
export default function SeccionActividad({ seccion }: { seccion: Seccion }) {
  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <View style={styles.circulo}>
          <Image source={ICONO_ACTIVIDAD} style={styles.icono} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.codigo}>{seccion.codigo}</Text>
          <Text style={styles.nombre} numberOfLines={2}>
            {capitalizar(seccion.nombre)}
          </Text>
        </View>
      </View>

      <View style={styles.totales}>
        <Total etiqueta="Total avance" valor={formatear(seccion.total)} />
        <View style={styles.separador} />
        <Total etiqueta="Total jornales" valor={formatear(seccion.jornales)} />
        <View style={styles.separador} />
        <Total etiqueta="Empleados" valor={String(seccion.registros.length)} />
      </View>

      {seccion.registros.map((r, i) => {
        const estado = estadoRegistro(r);
        const color = COLOR_ESTADO[estado];
        const avance = Number(r.avanceA);
        return (
          <View key={`${r.cod_empleado}-${r.cod_avance}`} style={[styles.fila, i > 0 && styles.filaBorde]}>
            <Image source={ICONO_EMPLEADO} style={styles.iconoEmpleado} />
            <View style={{ flex: 1 }}>
              <Text style={styles.nombreEmpleado} numberOfLines={1}>
                {capitalizarNombre(r.nom_empleado)}
              </Text>
              <View style={styles.filaEstado}>
                <Text style={styles.codigoEmpleado}>
                  {r.cod_empleado}
                  {horaDe(r.fechaRegistro) ? ` · ${horaDe(r.fechaRegistro)}` : ""}
                </Text>
                <View style={[styles.chip, { backgroundColor: color.fondo }]}>
                  <Text style={[styles.textoChip, { color: color.texto }]} numberOfLines={1}>
                    {textoEstado(r)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
              <Text style={styles.avance}>{formatear(avance)}</Text>
              <Text style={styles.jornales}>{formatear(jornales(avance, r.Rendimiento_Aplic))} jorn.</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Total({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.valorTotal}>{valor}</Text>
      <Text style={styles.etiquetaTotal} numberOfLines={1}>
        {etiqueta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center"
  },
  circulo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  icono: {
    width: 22,
    height: 22,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  },
  codigo: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.textoSuave
  },
  nombre: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.texto,
    marginTop: 1
  },
  totales: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORES.verdeSuave
  },
  separador: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#bfe5cb"
  },
  valorTotal: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORES.verdeOscuro
  },
  etiquetaTotal: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 2
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10
  },
  filaBorde: {
    borderTopWidth: 1,
    borderTopColor: COLORES.grisSuave
  },
  iconoEmpleado: {
    width: 20,
    height: 20,
    tintColor: COLORES.textoSuave,
    resizeMode: "contain",
    marginRight: 10
  },
  nombreEmpleado: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORES.texto
  },
  filaEstado: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 6
  },
  codigoEmpleado: {
    fontSize: 12,
    color: COLORES.textoSuave
  },
  chip: {
    flexShrink: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1
  },
  textoChip: {
    fontSize: 11,
    fontWeight: "700"
  },
  avance: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORES.verdeOscuro
  },
  jornales: {
    fontSize: 11,
    color: COLORES.textoSuave
  }
});
