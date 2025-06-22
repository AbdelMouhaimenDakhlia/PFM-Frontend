import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface Props {
  compte: {
    iban?: string;
    solde?: number;
    devise?: string;
    dateOuverture?: string;
  };
  monthLabels: string[];
  monthValues: number[];
  allTransactionCount: number;
}

export default function GeneralInfoTab({ compte, monthLabels, monthValues, allTransactionCount }: Props) {
  const screenWidth = Dimensions.get('window').width - 40;

  // 🔍 Trouver le mois avec le plus de dépenses
  const maxValue = Math.max(...monthValues);
  const maxIndex = monthValues.findIndex(val => val === maxValue);
  const maxMonth = monthLabels[maxIndex] || '-';

  return (
    <View>
      {/* 📇 Informations générales */}
      <View style={styles.card}>
        <Text style={styles.label}>IBAN</Text>
        <Text style={styles.value}>{compte.iban || '-'}</Text>

        <Text style={styles.label}>Solde</Text>
        <Text style={styles.value}>
          {typeof compte.solde === 'number' ? `${compte.solde.toFixed(2)} ${compte.devise || ''}` : '-'}
        </Text>

        <Text style={styles.label}>Date d'ouverture</Text>
        <Text style={styles.value}>
          {compte.dateOuverture ? new Date(compte.dateOuverture).toLocaleDateString('fr-FR') : '-'}
        </Text>

        <Text style={styles.label}>Nombre total de transactions</Text>
        <Text style={styles.value}>{allTransactionCount}</Text>
      </View>

      {/* 📊 Graphique */}
      <Text style={styles.chartTitle}>📊 Dépenses mensuelles</Text>
      <BarChart
        data={{
          labels: monthLabels,
          datasets: [{ data: monthValues }],
        }}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: () => '#457b9d',
          labelColor: () => '#333',
          barPercentage: 0.6,
        }}
        yAxisLabel=""
        yAxisSuffix=""
        style={{ marginVertical: 20, borderRadius: 12 }}
      />

      {/* ✅ Alerte stylée */}
      <View style={styles.alertBox}>
        <Text style={styles.alertText}>
          📌 Le mois avec le plus de dépenses est <Text style={styles.bold}>{maxMonth}</Text> avec un total de{' '}
          <Text style={styles.bold}>{maxValue.toFixed(2)} TND</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f1f1f1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  alertBox: {
    backgroundColor: '#f1faee',
    borderLeftWidth: 4,
    borderLeftColor: '#1d3557',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
});
