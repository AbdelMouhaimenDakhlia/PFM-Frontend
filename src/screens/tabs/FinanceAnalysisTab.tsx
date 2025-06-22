import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface Transaction {
  montant: number;
  type: string;
  date: string;
}

interface Props {
  transactions: Transaction[];
}

export default function FinanceAnalysisTab({ transactions }: Props) {
  const screenWidth = Dimensions.get('window').width - 40;

  const getLast6Months = () => {
    const labels: string[] = [];
    const keys: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(d.toISOString().slice(0, 7)); // yyyy-MM
      labels.push(d.toLocaleDateString('fr-FR', { month: 'short' }));
    }
    return { keys, labels };
  };

  const { keys, labels } = getLast6Months();

  const revenus = keys.map(k =>
    transactions
      .filter(t => t.type?.toLowerCase().includes('crédit') && t.date.startsWith(k))
      .reduce((sum, t) => sum + t.montant, 0)
  );

  const depenses = keys.map(k =>
    transactions
      .filter(t => t.type?.toLowerCase().includes('débit') && t.date.startsWith(k))
      .reduce((sum, t) => sum + t.montant, 0)
  );

  const fluxNet = revenus.map((r, i) => r - depenses[i]);

  const soldeSimule = fluxNet.reduce<number[]>((acc, cur) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : 1000;
    acc.push(last + cur);
    return acc;
  }, []);

  const alertSoldeBas = soldeSimule.some(v => v < 200);
  const totalRevenus = revenus.reduce((a, b) => a + b, 0);
  const totalDepenses = depenses.reduce((a, b) => a + b, 0);
  const alertDepenseDomine = totalDepenses > 0 && totalDepenses / (totalRevenus + totalDepenses) > 0.8;

  // ✅ Générer alertes mois à flux net négatif
  const moisNegatifs = fluxNet
    .map((v, i) => (v < 0 ? labels[i] : null))
    .filter(m => m !== null) as string[];

  // ✅ Vérifier si tout est OK
  const aucuneAnomalie = moisNegatifs.length === 0 && !alertSoldeBas && !alertDepenseDomine;

  return (
    <View style={styles.container}>
      {/* 💰 Revenus vs Dépenses */}
      <Text style={styles.chartTitle}>💰 Revenus vs Dépenses</Text>
      <LineChart
        data={{
          labels,
          datasets: [
            { data: revenus, color: () => '#2a9d8f' },
            { data: depenses, color: () => '#e76f51' },
          ],
          legend: ['Revenus', 'Dépenses'],
        }}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: () => '#000',
          labelColor: () => '#333',
        }}
        bezier
        style={{ marginBottom: 10 }}
      />

      {/* 🔔 Alerte par mois négatif */}
      {moisNegatifs.map((mois, idx) => (
        <View key={idx} style={[styles.alertBox, { backgroundColor: '#fff3cd' }]}>
          <Text style={styles.alertIcon}>📉</Text>
          <Text style={styles.alertText}>Flux net négatif détecté en {mois}.</Text>
        </View>
      ))}

      {/* 📈 Évolution du solde */}
      <Text style={styles.chartTitle}>📈 Évolution du solde</Text>
      <LineChart
        data={{ labels, datasets: [{ data: soldeSimule }] }}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: () => '#264653',
          labelColor: () => '#333',
          fillShadowGradient: '#457b9d',
          fillShadowGradientOpacity: 0.3,
        }}
        bezier
        style={{ marginBottom: 10 }}
      />

      {/* 🔔 Autres alertes */}
      {alertSoldeBas && (
        <View style={[styles.alertBox, { backgroundColor: '#f8d7da' }]}>
          <Text style={styles.alertIcon}>💸</Text>
          <Text style={styles.alertText}>
            Votre solde prévisionnel pourrait passer sous 200 TND.
          </Text>
        </View>
      )}

      {alertDepenseDomine && (
        <View style={[styles.alertBox, { backgroundColor: '#d1ecf1' }]}>
          <Text style={styles.alertIcon}>🛍️</Text>
          <Text style={styles.alertText}>
            Vos dépenses représentent plus de 80% de vos mouvements totaux.
          </Text>
        </View>
      )}

      {/* ✅ Aucune anomalie détectée */}
      {aucuneAnomalie && (
        <View style={[styles.alertBox, { backgroundColor: '#d4edda' }]}>
          <Text style={styles.alertIcon}>✅</Text>
          <Text style={styles.alertText}>Aucune anomalie détectée ce mois-ci.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 5, paddingTop: 10, paddingBottom: 100 },
  chartTitle: { fontSize: 18, fontWeight: '600', marginVertical: 10, color: '#333' },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertIcon: { fontSize: 20, marginRight: 10 },
  alertText: { fontSize: 14, color: '#333', flexShrink: 1 },
});
