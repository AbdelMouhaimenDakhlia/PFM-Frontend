import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/routes';
import { useFocusEffect } from '@react-navigation/native';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const { logout } = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp>();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useFocusEffect(
  React.useCallback(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/utilisateurs/me');
        setUser(res.data);

        const savedUri = await AsyncStorage.getItem('profileImage');
        setProfileImage(savedUri);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [])
);


 

  return (
    
    <View style={styles.container}>
        <View style={styles.appHeader}>
  <View style={styles.logoSection}>
    <Image source={require('../assets/logo.jpg')} style={styles.logo} />
    <Text style={styles.appName}>
      Tijari<Text style={{ color: '#e53935' }}>Wise</Text>
    </Text>
  </View>
</View>
      <View style={styles.header}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />) : (
          <Image source={require('../assets/avatar.png')} style={styles.avatar} />)
        }
        <Text style={styles.name}>{user?.nom || 'Utilisateur'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        
      </View>

      <View style={styles.options}>
        <Option icon="account-edit" label="Modifier le profil" onPress={() => navigation.navigate('EditProfile')} />

        <Option icon="key" label="Changer le mot de passe" />
        <Option icon="cog-outline" label="Paramètres" />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Icon name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const Option = ({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.option} onPress={onPress || (() => {})}>
    <Icon name={icon} size={22} color="#FF6F00" />
    <Text style={styles.optionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 30,
    
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
    
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  cli: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  options: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#222',
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#E53935',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 40,
    
},
logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
logo: {
    width: 30,
    height: 30,
    marginRight: 8,
    resizeMode: 'contain',
  },
appName: {
  fontSize: 22,
  fontWeight: 'bold',
},
});
