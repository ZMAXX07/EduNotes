/** @jsxImportSource react */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn, signInAsGuest } = useAuth();

  const handleLogin = async () => {
    try {
      setError('');
      const success = await signIn(username, pin, role);
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  const handleGuestAccess = async () => {
    await signInAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>DocVault</Text>
        <Text style={styles.subtitle}>Your Educational Documents Hub</Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="PIN"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
        />

        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
            onPress={() => setRole('student')}
          >
            <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>
              Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'teacher' && styles.roleButtonActive]}
            onPress={() => setRole('teacher')}
          >
            <Text style={[styles.roleText, role === 'teacher' && styles.roleTextActive]}>
              Teacher
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.guestButton]} 
          onPress={handleGuestAccess}
        >
          <Text style={[styles.buttonText, styles.guestButtonText]}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a73e8',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a73e8',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#1a73e8',
  },
  roleText: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  roleTextActive: {
    color: 'white',
  },
  button: {
    backgroundColor: '#1a73e8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1a73e8',
  },
  guestButtonText: {
    color: '#1a73e8',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
});