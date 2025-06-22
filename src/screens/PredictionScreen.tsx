import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
// @ts-ignore
import { PieChart } from "react-native-svg-charts";
import api from "../services/api";
import TopHeader from "../components/TopHeader";
import { AuthContext } from "../context/AuthContext";
import * as Animatable from "react-native-animatable";
import { useFocusEffect } from "@react-navigation/native";
import { Text as SvgText } from "react-native-svg";

interface Prediction {
  categorie: string;
  prediction: number;
  historique?: number;
  color?: string;
}

const emojiMap: { [key: string]: string } = {
  Alimentation: "🍔",
  Transport: "🚗",
  Logement: "🏠",
  Loisirs: "🎮",
  Santé: "💊",
  Revenu: "🍎",
  Shopping: "🛍️",
  Divertissement: "🍿",
  "Agios et Frais Bancaires": "📦",
  Factures: "🧾",
  Restaurants: "🍽️",
  Retrait: "🏧",
  "Sport & Santé": "🤸",
  Voyage: "✈️",
  Éducation: "🎓",
  Autres: "📁",
};

export default function PredictionTab() {
  const [data, setData] = useState<Prediction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [mois, setMois] = useState<number | null>(null);
  const [annee, setAnnee] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { logout } = useContext(AuthContext);
  const contentRef = useRef<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (contentRef.current) {
        contentRef.current.fadeIn(500);
      }
    }, [])
  );

  const colors = [
    "#FF7043",
    "#42A5F5",
    "#66BB6A",
    "#AB47BC",
    "#FFCA28",
    "#26C6DA",
    "#EF5350",
    "#5C6BC0",
    "#FFA726",
    "#26A69A",
  ];

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const userRes = await api.get("/api/utilisateurs/me");
        const clientId = userRes.data.cli;

        const res = await api.get(
          `/api/test/predict-montant?clientId=${clientId}`
        );
        const predictions = res.data.resultats.map(
          (item: Prediction, index: number) => ({
            ...item,
            color: colors[index % colors.length],
          })
        );

        setData(predictions);
        setMois(res.data.mois);
        setAnnee(res.data.annee);
        const sum = predictions.reduce(
          (acc: number, item: Prediction) => acc + item.prediction,
          0
        );
        setTotal(sum);
      } catch (error) {
        console.error("Erreur prédictions :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  const moisNom = mois
    ? new Date(0, mois).toLocaleString("fr-FR", { month: "long" })
    : "";
  const displayedLegend = showAll ? data : data.slice(0, 4);

  const Labels = ({ slices }: any) => {
    return slices.map((slice: any, index: number) => {
      const { pieCentroid, data } = slice;
      const percent = ((data.value / total) * 100).toFixed(0);
      return (
        <SvgText
          key={index}
          x={pieCentroid[0]}
          y={pieCentroid[1]}
          fill="white"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={12}
          fontWeight="bold"
        >
          {percent}%
        </SvgText>
      );
    });
  };

  return (
    <Animatable.View style={styles.container} ref={contentRef}>
      <TopHeader onLogout={logout} />
      {loading ? (
        <ActivityIndicator size="large" color="#E53935" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 20, paddingBottom: 20 }}
        >
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>📊 Prédictions Totales</Text>

            {mois && annee && (
              <View style={styles.dateRow}>
                <Text style={styles.calendarEmoji}>📅</Text>
                <Text style={styles.summaryDate}>
                  {moisNom.charAt(0).toUpperCase() + moisNom.slice(1)} {annee}
                </Text>
              </View>
            )}

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total prévisionnel</Text>
              <Text style={styles.totalValue}>{total.toFixed(2)} TND</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Répartition des prévisions</Text>
          <View style={styles.chartContainer}>
            <PieChart
              style={styles.chart}
              data={data.map((item, i) => ({
                value: item.prediction,
                svg: { fill: item.color || colors[i % colors.length] },
                key: `pie-${i}`,
              }))}
              innerRadius={30}
              labelRadius={60}
            >
              <Labels />
            </PieChart>
            <View style={styles.legend}>
              {displayedLegend.map((item, i) => {
                const percentage = ((item.prediction / total) * 100).toFixed(0);
                return (
                  <View key={i} style={styles.legendItem}>
                    <View
                      style={[styles.colorDot, { backgroundColor: item.color }]}
                    />
                    <Text style={styles.legendText}>
                      {emojiMap[item.categorie] || "📁"} {item.categorie} –{" "}
                      {percentage}%
                    </Text>
                  </View>
                );
              })}
              {data.length > 4 && (
                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                  <Text
                    style={[
                      styles.legendText,
                      { color: "#E53935", marginTop: 4 },
                    ]}
                  >
                    Voir {showAll ? "moins" : "plus"}...
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Liste des prévisions par catégorie
          </Text>
          {data.map((item, index) => {
            const evolution =
              item.historique !== undefined
                ? item.prediction - item.historique
                : 0;
            let badge = "⏸️ Stable";
            let badgeColor = "#FBBF24";
            if (evolution > 5) {
              badge = "↗️ Hausse";
              badgeColor = "#EF4444";
            } else if (evolution < -5) {
              badge = "↘️ Baisse";
              badgeColor = "#10B981";
            }

            return (
              <Animatable.View
                key={item.categorie}
                style={styles.item}
                animation="fadeInRight"
                delay={index * 80}
              >
                <Text style={styles.emoji}>
                  {emojiMap[item.categorie] || "📁"}
                </Text>
                <Text style={styles.itemText}>{item.categorie}</Text>
                <Text style={styles.itemAmount}>
                  {item.prediction.toFixed(2)} TND
                </Text>
                <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              </Animatable.View>
            );
          })}
        </ScrollView>
      )}
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 12,
  },
  highlight: {
    fontWeight: "bold",
    color: "#E53935",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  chartContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chart: {
    height: 180,
    width: 180,
  },
  legend: {
    flex: 1,
    marginRight: 5,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: "#111827",
    fontSize: 12.5,
  },
  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  summaryContainer: {
    alignItems: "center",
    backgroundColor: "#fffffd",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    textAlign: "center",
  },
  summaryDate: {
    fontSize: 17,
    color: "#E53935",
    fontWeight: "600",
    marginBottom: 12,
  },
  totalBox: {
    backgroundColor: "#FDECEA",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#E53935",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#374151",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E53935",
    marginTop: 2,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  calendarEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
});
