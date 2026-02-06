import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity, Image, Pressable, ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddActivity from './screens/AddActivity';
import WorkoutsList from './screens/WorkoutsList';
import AddWorkout from './screens/AddWorkout';
import LinearGradient from 'react-native-linear-gradient';

import ForgetPassword from './screens/forget';
// Import your Home screen
import Home from './screens/home'; 

const Stack = createNativeStackNavigator();

// --- 1. SEPARATE THE LOGIN SCREEN LOGIC ---
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('Login');
  const [username, setUsername]= useState('');

  // Ensure these paths exist in your project
  const localImageSource = require('./assets/logo.png');
  const EmailLogo = require('./assets/emlLogo.png');
  const PassLogo = require('./assets/passLogo.png');

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // --- NAVIGATION LOGIC HERE ---
        // We use .replace() so the user can't press "Back" to return to login
        navigation.replace('Home'); 
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSignup = async () => {
    if (email === '' || password === '' || confirmPassword === ''|| username === '') {
    Alert.alert('Error', 'Please fill in all fields including Username');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    const firebaseAuth = getAuth();
    const db = getFirestore();
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        username: username,
        email: email,
        role: 'user',
        createdAt: new Date()
      });
      Alert.alert('Success', 'Account created successfully!');
      // Switch back to login tab after signup
      setActiveTab('Login');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f2f7' }}>
     <LinearGradient
        colors={['#c0f3fa', '#ffffff']} // Required: an array of colors
        style={{flex:1}}
        start={{ x: 0.02, y: 0 }} // Optional: default is {x: 0.5, y: 0}
        end={{ x: 1, y: 1 }}   // Optional: default is {x: 0.5, y: 1}
      >
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      
      <View style={styles.header}>
        <View style={styles.container}>
          <Image source={localImageSource} style={styles.image} />
        </View>

        <View style={styles.logSignBtn}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Login' && styles.activeTab]}
            onPress={() => setActiveTab('Login')}
          >
            <Text style={[styles.tabText, activeTab === 'Login' && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'Signup' && styles.activeTab]}
            onPress={() => setActiveTab('Signup')}
          >
            <Text style={[styles.tabText, activeTab === 'Signup' && styles.activeTabText]}>Signup</Text>
          </TouchableOpacity>
        </View>

        <View>
          {activeTab === 'Signup' && (
    <View style={styles.credentials}>
      {/* You can use EmailLogo or a specific UserLogo here */}
      <Image source={EmailLogo} style={styles.icon} />
      <TextInput 
        placeholder="Username" 
        style={styles.input} 
        value={username} 
        onChangeText={setUsername} 
      />
    </View>
  )}
          <View style={styles.credentials}>
            <Image source={EmailLogo} style={styles.icon} />
            <TextInput 
                placeholder="Email" 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
            />
          </View>

          <View style={styles.credentials}>
            <Image source={PassLogo} style={styles.icon} />
            <TextInput 
                placeholder="Password" 
                style={styles.input} 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword} 
            />
          </View>
          {activeTab === 'Signup' && (
            <View style={styles.credentials}>
              <Image source={PassLogo} style={styles.icon} />
              <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          )}
        </View>

        <View style={styles.forgetPass}>
  <Pressable onPress={() => navigation.navigate('ForgetPassword')}>
    <Text style={{color:'#c05050', fontSize:12, fontStyle:'italic'}}>
       Forget Password
    </Text>
  </Pressable>
</View>

        <View style={styles.loginBtn}>
          <TouchableOpacity onPress={activeTab === 'Login' ? handleLogin : handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="black" /> : (
              <Text style={{ color: 'black', fontWeight: 'bold' }}>
                {activeTab === 'Login' ? 'LOGIN' : 'SIGNUP'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
    </View>
    </LinearGradient>
  );
};

// --- 2. MAIN APP COMPONENT (Only Handles Navigation) ---
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Screen 1: Login */}
        <Stack.Screen name="Login" component={LoginScreen} />
        
        {/* Screen 2: Home */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
        <Stack.Screen name="AddActivity" component={AddActivity}
         options={{title: '',
            headerTransparent: true, // <--- Makes the header invisible
            headerTintColor: '#333',}}
          />
            <Stack.Screen name="WorkoutsList" component={WorkoutsList} />
            <Stack.Screen name="AddWorkout" component={AddWorkout} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {},
  image: {
    width: 200,
    height: 200,
  },
  logSignBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
    width: 200,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#c4f4f3'
  },
  credentials: {
    margin: 10,
    borderWidth: 2,
    borderColor: 'grey',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    width: 250,
  },
  loginBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c4f4f3',
    height: 50,
    width: 100,
    borderRadius: 10,
    margin: 13
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 5,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  activeTab: {
    backgroundColor: '#abd856',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  forgetPass: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width: 250
  }
});

export default App;