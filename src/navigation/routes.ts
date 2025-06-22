import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';


interface Transaction {
  id: number;
  description: string;
  montant: number;
  categorie: string;
  date: string;
  produit: string;
  type: 'Crédit' | 'Débit'
  compteBancaire: {
    id: number;
    iban: string;
  };
}
interface Compte {
  id: number;
  iban: string;
  solde: number;
  devise: string;
  dateOuverture: string;
}

// Définition des routes et des paramètres attendus
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Transactions: undefined;
  TransactionDetail: { transaction: Transaction };
  CompteDetail: { compte: Compte };
  EditProfile: undefined;
  Profil: undefined;
  Stats: undefined;
  
};

// Types réutilisables dans tous les composants
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};
