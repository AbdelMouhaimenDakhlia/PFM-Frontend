import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/routes';
import api from '../services/api';
import GeneralInfoTab from './tabs/GeneralInfoTab';
import FinanceAnalysisTab from './tabs/FinanceAnalysisTab';
import ProductUsageTab from './tabs/ProductUsageTab';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type CompteDetailRouteProp = RouteProp<RootStackParamList, 'CompteDetail'>;

interface Transaction {
  id: number;
  montant: number;
  date: string;
  type: string;
  produit?: string;
  compteBancaire: { id: number };
}

const CompteDetailScreen = () => {
  const route = useRoute<CompteDetailRouteProp>();
  const { compte } = route.params;

  const [activeTab, setActiveTab] = useState<'general' | 'finance' | 'products'>('general');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get<Transaction[]>('/api/transactions/me');
        const filtered = res.data.filter(t => t.compteBancaire.id === compte.id);
        setTransactions(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [compte.id]);

  const monthlySums = (): { [mois: string]: number } => {
    const map: { [mois: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      map[key] = 0;
    }
    for (const t of transactions) {
      const mois = t.date.slice(0, 7);
      if (map[mois] !== undefined) {
        map[mois] += t.montant;
      }
    }
    return map;
  };

  const monthMap = monthlySums();
  const monthLabels = Object.keys(monthMap).map(m =>
    new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'short' })
  );
  const monthValues = Object.values(monthMap);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#457b9d" />
        </View>
      );
    }

    switch (activeTab) {
      case 'general':
        return <GeneralInfoTab compte={compte} monthLabels={monthLabels} monthValues={monthValues} allTransactionCount={transactions.length} />;
      case 'finance':
        return <FinanceAnalysisTab transactions={transactions} />;
      case 'products':
        return <ProductUsageTab transactions={transactions} compteId={compte.id} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>

{/* 🔙 Header avec flèche et titre */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={28} color="#1d3557" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Détail du compte</Text>
    </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'general' && styles.activeTab]}
          onPress={() => setActiveTab('general')}
        >
          <Text style={styles.tabText}>Informations</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'finance' && styles.activeTab]}
          onPress={() => setActiveTab('finance')}
        >
          <Text style={styles.tabText}>Analyse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={styles.tabText}>Produits</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>{renderContent()}</View>
    </ScrollView>
  );
};

export default CompteDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
    marginTop: 15,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#457b9d',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d3557',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginTop: 40,
  marginBottom: 5,
},
headerTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#1d3557',
  marginLeft: 12,
},

});
