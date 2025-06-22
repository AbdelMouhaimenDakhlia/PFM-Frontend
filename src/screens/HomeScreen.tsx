// HomeScreen.tsx — vue mobile améliorée avec effets visuels (ombres, animations)

import React, { useEffect, useState, useContext, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-chart-kit";
import api from "../services/api";
import TopHeader from "../components/TopHeader";
import { AuthContext } from "../context/AuthContext";

interface Transaction {
  id: number;
  description: string;
  montant: number;
  date: string;
  categorie?: string;
  compteBancaire: {
    id: number;
    iban: string;
    solde: number;
    devise: string;
  };
}

interface Compte {
  id: number;
  iban: string;
  solde: number;
  devise: string;
}

const categoryIcons: Record<string, string> = {
  Restaurants: "silverware-fork-knife",
  Shopping: "cart",
  Éducation: "school",
  Autre: "dots-horizontal",
};

const getLastSixMonths = (): string[] => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toISOString().slice(0, 7));
  }
  return labels;
};

const monthShortName = (mois: string): string => {
  const d = new Date(mois + "-01");
  return d.toLocaleString("fr-FR", { month: "short" }).replace(".", "");
};

const AnimatedCompteCard = ({
  compte,
  index,
  onPress,
  selected,
}: {
  compte: Compte;
  index: number;
  onPress: () => void;
  selected: boolean;
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.accountCard,
          selected && { borderColor: "#457b9d", borderWidth: 2 },
        ]}
      >
        <Text style={styles.accountIban}>{compte.iban}</Text>
        <Text style={styles.accountSolde}>
          {compte.solde.toFixed(2)} {compte.devise}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [prenom, setPrenom] = useState("Utilisateur");
  const [soldeTotal, setSoldeTotal] = useState(0);
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [monthly, setMonthly] = useState<number[]>([]);
  const [monthlyLabels, setMonthlyLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [compteFiltre, setCompteFiltre] = useState<number | null>(null);
  const chartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      try {
        const u = await api.get("/api/utilisateurs/me");
        setPrenom(u.data.nom);
        const s = await api.get("/api/comptes/solde/total");
        setSoldeTotal(s.data);
        const c = await api.get("/api/comptes/me");
        setComptes(c.data);
        const recent = await api.get("/api/transactions/recentes");
        setTransactions(recent.data);
        const ta = await api.get("/api/transactions/me");
        setAllTransactions(ta.data);
        const txForStats =
          compteFiltre !== null
            ? ta.data.filter(
                (tx: Transaction) => tx.compteBancaire?.id === compteFiltre
              )
            : ta.data;
        const statCalc: Record<string, number> = {};
        for (const tx of txForStats) {
          const cat = tx.categorie || "Autre";
          statCalc[cat] = (statCalc[cat] || 0) + tx.montant;
        }
        setStats(statCalc);
        const fullMonths = getLastSixMonths();
        const monthMap: Record<string, number> = {};
        for (const mois of fullMonths) monthMap[mois] = 0;
        for (const tx of txForStats) {
          const m = tx.date.slice(0, 7);
          if (monthMap[m] !== undefined) monthMap[m] += tx.montant;
        }
        setMonthly(fullMonths.map((m) => monthMap[m]));
        setMonthlyLabels(fullMonths.map(monthShortName));
        Animated.timing(chartAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } catch (e) {
        console.error(e);
        Alert.alert("Erreur", "Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [compteFiltre]);

  const screenWidth = Dimensions.get("window").width - 40;
  const colors = ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"];
  const pieData = Object.entries(stats).map(([name, value], i) => ({
    name,
    population: value,
    color: colors[i % colors.length],
    legendFontColor: "#333",
    legendFontSize: 12,
  }));
  const barData = { labels: monthlyLabels, datasets: [{ data: monthly }] };
  const transactionsFiltrees =
    compteFiltre !== null
      ? transactions.filter((t) => t.compteBancaire?.id === compteFiltre)
      : transactions;
  const compteSelected = comptes.find((c) => c.id === compteFiltre);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <SafeAreaView style={styles.flex}>
      <TopHeader onLogout={logout} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>
          Bonjour <Text style={styles.name}>{prenom}</Text>{" "}
          <Text style={styles.wave}>👋</Text>
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Solde total</Text>
          <Text style={styles.cardAmount}>{soldeTotal.toFixed(2)} TND</Text>
        </View>
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          📊 Répartition des dépenses
        </Text>
        <Animated.View
          style={{ opacity: chartAnim, transform: [{ scale: chartAnim }] }}
        >
          <PieChart
            data={pieData}
            width={screenWidth}
            height={200}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: () => "#000",
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Animated.View>
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          📈 Dépenses mensuelles
        </Text>
        <BarChart
          data={barData}
          width={screenWidth}
          height={230}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(70, 70, 70, ${opacity})`,
            labelColor: () => "#000",
            barPercentage: 0.5,
            decimalPlaces: 2,
            propsForLabels: {
              fontSize: 11,
            },
            propsForBackgroundLines: {
              strokeDasharray: "", // lignes continues
            },
          }}
          verticalLabelRotation={0}
          style={{
            marginTop: 10,
            marginLeft: 5, // ✅ Espace pour ne plus couper les chiffres
            borderRadius: 12,
          }}
          withInnerLines={true}
          withHorizontalLabels={true}
        />

        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="bank" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Mes comptes</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 10 }}
        >
          <TouchableOpacity
            onPress={() => setCompteFiltre(null)}
            style={[styles.accountCard, { backgroundColor: "#eee" }]}
          >
            <Text style={styles.accountIban}>Tous les comptes</Text>
          </TouchableOpacity>
          {comptes.map((c, i) => (
            <AnimatedCompteCard
              key={c.id}
              compte={c}
              index={i}
              selected={compteFiltre === c.id}
              onPress={() => setCompteFiltre(c.id)}
            />
          ))}
        </ScrollView>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={20}
            color="#333"
          />
          <Text style={styles.sectionTitle}>Dernières transactions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Transactions" as never)}
            style={{ marginLeft: "auto", paddingRight: 8 }}
          >
            <Text style={{ color: "#457b9d", fontWeight: "bold" }}>
              Voir tout
            </Text>
          </TouchableOpacity>
        </View>
        {compteSelected && (
          <Text
            style={{ marginVertical: 8, textAlign: "center", color: "#444" }}
          >
            Affichage des transactions pour le compte : {compteSelected.iban}
          </Text>
        )}
        <FlatList
          data={transactionsFiltrees.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 10, color: "#999" }}>
              Aucune transaction
            </Text>
          }
          renderItem={({ item }) => {
            const iconName = categoryIcons[item.categorie || "Autre"] || "cash";
            return (
              <View style={styles.txRow}>
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={24}
                  color={item.montant < 0 ? "red" : "green"}
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.txLabel}>{item.description}</Text>
                  <Text style={{ fontSize: 12, color: "#999" }}>
                    {item.date}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    item.montant < 0 ? styles.txNegative : styles.txPositive,
                  ]}
                >
                  {item.montant.toFixed(2)} TND
                </Text>
              </View>
            );
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { paddingHorizontal: 20, paddingBottom: 120 },
  greeting: { fontSize: 22, fontWeight: "600", marginTop: 10 },
  name: { fontWeight: "bold", color: "#e53935" },
  wave: { fontSize: 22 },
  card: {
    backgroundColor: "#F9C70B",
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, color: "#333" },
  cardAmount: { fontSize: 24, fontWeight: "bold", marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginLeft: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginTop: 25 },
  accountCard: {
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 15,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 2,
  },
  accountIban: { fontSize: 13, color: "#555" },
  accountSolde: { fontSize: 16, fontWeight: "bold", marginTop: 2 },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  txLabel: { fontSize: 15, fontWeight: "500", color: "#333" },
  txAmount: { fontSize: 15, fontWeight: "600" },
  txNegative: { color: "red" },
  txPositive: { color: "green" },
});
