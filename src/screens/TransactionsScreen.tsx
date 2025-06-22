// TransactionsScreen.tsx avec effet d'agrandissement de la liste au scroll

import React, { useEffect, useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Animated,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { format, parse } from 'date-fns';
import { Menu, IconButton, PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/routes';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
interface Transaction {
  id: number;
  description: string;
  montant: number;
  categorie: string;
  date: string;
  produit: string;
  type: 'Crédit' | 'Débit';
  compteBancaire: {
    id: number;
    iban: string;
  };
  
}

interface TrendData {
  mois: string;
  total: number;
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('Toutes');
  const [search, setSearch] = useState('');
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { logout } = useContext(AuthContext);

  const listScaleAnim = useRef(new Animated.Value(1)).current;
const navigation = useNavigation<NavigationProp>();
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: listScaleAnim } } }],
    { useNativeDriver: false }
  );

  const animatedStyle = {
    paddingBottom: 100,
    transform: [
      {
        scale: listScaleAnim.interpolate({
          inputRange: [0, 150],
          outputRange: [1, 1.05],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  useEffect(() => {
    const load = async () => {
      try {
        const t = await api.get<Transaction[]>('/api/transactions/me');
        const monthly = await api.get<TrendData[]>('/api/transactions/monthly');

        setTransactions(t.data);
        setFiltered(t.data);

        const rawCats = t.data.map(tx => tx.categorie).filter(Boolean);
        const uniqueCats = Array.from(new Set(rawCats));
        setCategories(['Toutes', ...(uniqueCats.length > 0 ? uniqueCats : ['Autres'])]);

        setTrend(
          monthly.data.sort((a, b) => new Date(a.mois).getTime() - new Date(b.mois).getTime())
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const base =
      selectedCat === 'Toutes'
        ? transactions
        : transactions.filter(tx => tx.categorie === selectedCat);
    const filteredSearch = base.filter(tx =>
      tx.description.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredSearch);
  }, [selectedCat, search]);

  const trendFiltered = selectedCat === 'Toutes'
    ? trend
    : trend.map(month => {
        const transactionsInMonth = transactions.filter(tx =>
          tx.date.startsWith(month.mois) && tx.categorie === selectedCat
        );
        const total = transactionsInMonth.reduce((sum, tx) => sum + tx.montant, 0);
        return { mois: month.mois, total };
      });

  const screenWidth = Dimensions.get('window').width - 40;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <TopHeader onLogout={logout} />
      <Animated.ScrollView
        style={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>

        <TextInput
          placeholder="🔍 Rechercher une transaction..."
          style={styles.searchBar}
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.menuRow}>
          <Text style={styles.sectionTitle}>Catégories :</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="filter-menu"
                size={24}
                onPress={() => setMenuVisible(true)}
              />
            }>
            {categories.map(cat => (
              <Menu.Item
                key={cat}
                onPress={() => {
                  setSelectedCat(cat);
                  setMenuVisible(false);
                }}
                title={cat}
              />
            ))}
          </Menu>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
          <Text
            style={{ color: '#457b9d', fontWeight: 'bold' }}
            onPress={() => {
              setSearch('');
              setSelectedCat('Toutes');
            }}>
            🔄 Réinitialiser les filtres
          </Text>
        </View>

        <Text style={styles.chartTitle}>📈 Dépenses par mois</Text>
        <LineChart
          data={{
            labels: trendFiltered.map(t => format(parse(t.mois, 'yyyy-MM', new Date()), 'MMM/yy')),
            datasets: [{ data: trendFiltered.map(t => t.total) }],
          }}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: () => '#e63946',
            labelColor: () => '#000',
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#1d3557',
            },
          }}
          bezier
          style={{ marginBottom: 20 }}
        />

        <Animated.View style={animatedStyle}>
          <FlatList
            data={filtered}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const iconMap = {
                Restaurants: 'silverware-fork-knife',
                Shopping: 'cart',
                Éducation: 'school',
                Santé: 'hospital-box',
                Divertissement: 'movie',
                Autres: 'cash',
              } as const;
              type IconName = typeof iconMap[keyof typeof iconMap];
              const icon: IconName = iconMap[item.categorie as keyof typeof iconMap] || 'bank-transfer';

              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
                  style={styles.txCard}>
                  <MaterialCommunityIcons
                    name={icon}
                    size={28}
                    color="#457b9d"
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txLabel}>{item.description}</Text>
                    <Text style={styles.txDate}>
                      {format(new Date(item.date), 'dd MMM yyyy')}
                    </Text>
                  </View>
                  <Text
                    style={[styles.txAmount, item.montant < 0 ? styles.txNegative : styles.txPositive]}
                  >
                    {item.montant.toFixed(2)} TND
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      </Animated.ScrollView>
    </PaperProvider>
  );
}

// ✅ Styles inchangés
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#fff',
    flex: 1,
    
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 15,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  txLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d3557',
  },
  txDate: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 3,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  txNegative: {
    color: '#e63946',
  },
  txPositive: {
    color: '#2a9d8f',
  },
});
