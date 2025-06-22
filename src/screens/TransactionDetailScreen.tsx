import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/routes';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

// 🎯 Catégories avec icône + couleur
const categoryIcons: Record<string, { icon: string; color: string }> = {
  'Alimentation': { icon: 'food', color: '#f4a261' },
  'Télécommunications': { icon: 'cellphone', color: '#1d3557' },
  'Factures': { icon: 'file-document-outline', color: '#e76f51' },
  'Éducation': { icon: 'school-outline', color: '#2a9d8f' },
  'Sport & Santé': { icon: 'heart-pulse', color: '#e63946' },
  'Dépôt': { icon: 'bank-transfer-in', color: '#4caf50' },
  'Retrait': { icon: 'bank-transfer-out', color: '#ef233c' },
  'Revenu': { icon: 'cash-plus', color: '#43aa8b' },
  'Restaurants': { icon: 'silverware-fork-knife', color: '#ff9f1c' },
  'Shopping': { icon: 'shopping-outline', color: '#3a86ff' },
  'Voyage': { icon: 'airplane', color: '#023047' },
  'Divertissement': { icon: 'netflix', color: '#e71d36' },
  'Agios et Frais Bancaires': { icon: 'cash-minus', color: '#6c757d' },
  'Crédits et Prêts': { icon: 'credit-card', color: '#0096c7' },
  'Cartes et Services Bancaires': { icon: 'credit-card-outline', color: '#8d99ae' },
  'Pharmacie': { icon: 'pill', color: '#9d4edd' },
  'Autres Services': { icon: 'cog-outline', color: '#adb5bd' },
};

type Props = {
  route: RouteProp<RootStackParamList, 'TransactionDetail'>;
};

export default function TransactionDetailScreen({ route }: Props) {
  const { transaction } = route.params;
  const navigation = useNavigation();
  const catInfo = categoryIcons[transaction.categorie] || {
    icon: 'bookmark-outline',
    color: '#1d3557',
  };

  const bgColor = transaction.type === 'Crédit' ? '#e8f5e9' : '#fdecea'; // vert ou rouge clair

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 🔙 En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1d3557" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail de la transaction</Text>
      </View>

      {/* 💳 Libellé + montant animé */}
      <Animated.View entering={FadeInUp.duration(500)} style={styles.headerBox}>
        <Text style={styles.title}>{transaction.description}</Text>
        <Text style={styles.amount}>
          {transaction.type === 'Débit' ? '-' : '+'}
          {transaction.montant.toFixed(2)} TND
        </Text>

        {/* 🎨 Badge animé catégorie */}
        <Animated.View entering={ZoomIn.delay(300)} style={[styles.categoryBadge, { backgroundColor: catInfo.color }]}>
          <MaterialCommunityIcons name={catInfo.icon as any} size={16} color="#fff" />
          <Text style={styles.badgeText}>{transaction.categorie}</Text>
        </Animated.View>
      </Animated.View>

      {/* 📋 Détails */}
      <Animated.View entering={FadeInUp.delay(300)} style={styles.detailBox}>
        {[
          { icon: 'calendar', label: 'Date', value: transaction.date },
          { icon: 'swap-horizontal', label: 'Type', value: transaction.type },
          {
            icon: 'bank-outline',
            label: 'Compte',
            value: transaction.compteBancaire?.iban || 'N/A',
          },
          {
            icon: 'cube-outline',
            label: 'Produit',
            value: transaction.produit || 'N/A',
          },
        ].map((item, idx) => (
          <View style={styles.row} key={idx}>
            <MaterialCommunityIcons name={item.icon as any} size={20} color="#555" />
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// 🧼 Styles modernisés
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  backIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d3557',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d3557',
    marginBottom: 6,
    textAlign: 'center',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e63946',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 13,
  },
  detailBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  value: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    color: '#1d3557',
  },
});
