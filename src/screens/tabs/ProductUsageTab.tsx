import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
// @ts-ignore
import { PieChart } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';
import api from '../../services/api';

interface Transaction {
  produit?: string;
  compteBancaire: { id: number };
}

interface Props {
  transactions: Transaction[];
  compteId: number;
}

export default function ProductUsageTab({ transactions, compteId }: Props) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userRes = await api.get('/api/utilisateurs/me');
        const clientId = userRes.data.cli;
        const res = await api.get(`/api/test/recommend?clientId=${clientId}&topN=5`);
        setRecommendations(res.data);
      } catch (error) {
        console.error("Erreur recommandation :", error);
      }
    };
    fetchRecommendations();
  }, []);

  const filtered = transactions.filter(t => t.compteBancaire.id === compteId);
  const produitMap: Record<string, number> = {};
  filtered.forEach(t => {
    const key = t.produit || 'Autre';
    produitMap[key] = (produitMap[key] || 0) + 1;
  });

  const total = filtered.length;
  const entries = Object.entries(produitMap);
  const COLORS = ['#457b9d', '#e63946', '#2a9d8f', '#f4a261', '#a8dadc', '#ffb703'];

  const pieData = entries.map(([key, value], i) => ({
    key: `pie-${i}`,
    value,
    svg: { fill: COLORS[i % COLORS.length] },
    arc: { outerRadius: '100%', padAngle: 0.02 },
    labelName: key,
  }));

  const dominant = entries.find(([_, count]) => count / total > 0.5);

  const Labels = ({ slices }: any) =>
    slices.map((slice: any, index: number) => {
      const { pieCentroid, data } = slice;
      const percent = ((data.value / total) * 100).toFixed(0);
      return (
        <SvgText
          key={`label-${index}`}
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

  const displayedRecommendations = showAll ? recommendations : recommendations.slice(0, 3);

  return (
    <View style={styles.container}>
      {recommendations.length > 0 && (
        <View style={styles.recoBox}>
          <View style={styles.recoHeader}>
            <Text style={styles.recoIcon}>🤖</Text>
            <Text style={styles.recoTitle}>Recommandations personnalisées</Text>
          </View>
          {displayedRecommendations.map((rec, index) => (
            <View key={index} style={styles.recoItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.recoText}>{rec}</Text>
            </View>
          ))}
          {recommendations.length > 3 && (
            <TouchableOpacity onPress={() => setShowAll(!showAll)}>
              <Text style={styles.recoToggle}>{showAll ? '▲ Voir moins' : '🔽 Voir plus...'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={styles.chartTitle}>📦 Produits bancaires utilisés</Text>

      {total === 0 ? (
        <Text style={styles.empty}>Aucune transaction disponible.</Text>
      ) : (
        <>
          <Text style={styles.totalCount}>Total : <Text style={styles.bold}>{total}</Text> transactions</Text>

          <View style={styles.chartWrapper}>
            <PieChart
              style={{ height: 220, width: Dimensions.get('window').width - 40 }}
              data={pieData}
              innerRadius={30}
              outerRadius={80}
              labelRadius={100}
            >
              <Labels />
            </PieChart>
          </View>

          <View style={styles.legendContainer}>
            {pieData.map((entry, i) => {
              const percent = ((entry.value / total) * 100).toFixed(0);
              return (
                <View key={entry.key} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: entry.svg.fill }]} />
                  <Text style={styles.legendLabel}>
                    {percent}% — {entry.labelName}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.alertBox}>
            {dominant ? (
              <Text style={styles.alertText}>
                📌 Le produit <Text style={styles.bold}>{dominant[0]}</Text> représente{' '}
                <Text style={styles.bold}>{((dominant[1] / total) * 100).toFixed(1)}%</Text> de vos
                transactions.
              </Text>
            ) : (
              <Text style={[styles.alertText, { color: '#2a9d8f' }]}>✅ Aucun produit ne domine significativement vos transactions.</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 50,
    backgroundColor: '#fff',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1d3557',
  },
  totalCount: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 10,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  empty: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
  },
  legendContainer: {
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#444',
  },
  alertBox: {
    backgroundColor: '#f1faee',
    borderLeftWidth: 4,
    borderLeftColor: '#1d3557',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  recoBox: {
    backgroundColor: '#e0f7ff',
    borderLeftWidth: 5,
    borderLeftColor: '#0077b6',
    padding: 14,
    borderRadius: 10,
    marginBottom: 25,
  },
  recoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#023e8a',
  },
  recoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 18,
    color: '#0077b6',
    marginRight: 6,
    lineHeight: 20,
  },
  recoText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  recoToggle: {
    marginTop: 10,
    fontSize: 13,
    color: '#0077b6',
    fontStyle: 'italic',
  },
});
