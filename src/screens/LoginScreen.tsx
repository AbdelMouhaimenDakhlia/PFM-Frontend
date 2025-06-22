import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { NavigationProps } from '../navigation/routes';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }: NavigationProps<'Login'>) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const { setToken } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', {
        email,
        motDePasse,
      });

      const token = res.data.token;
      await AsyncStorage.setItem('token', token);

      // ✅ Affiche un message avant de rediriger
      if (Platform.OS === 'android') {
        ToastAndroid.show('✅ Connexion réussie', ToastAndroid.SHORT);
      } else {
        Alert.alert('✅ Connexion réussie');
      }

      // ⏳ Attend 1.5 seconde avant de déclencher le changement d'écran
      setTimeout(() => {
        setToken(token); // ← ceci déclenche la redirection automatique via ton AppNavigator
      }, 1000);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        'Connexion échouée';

      Alert.alert('❌ Connexion échouée', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.jpg')} style={styles.logoImage} />
        <Text style={styles.logoText}>TijariWise</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#999"
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Connexion</Text>
      </TouchableOpacity>

      <Text style={styles.link}>Mot de passe oublié ?</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e3b4e',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    backgroundColor: '#e11d48',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    color: '#e11d48',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
