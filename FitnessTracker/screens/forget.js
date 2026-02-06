// screens/forget.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { getAuth, sendPasswordResetEmail } from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
const ForgetPassword = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = () => {
        if (email === '') {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        const auth = getAuth();

        sendPasswordResetEmail(auth, email)
            .then(() => {
                Alert.alert('Success', 'Password reset email sent! Check your inbox.');
                // Optionally navigate back to login
                navigation.goBack();
            })
            .catch((error) => {
                Alert.alert('Error', error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
         <LinearGradient
                colors={['#f9edfc', '#ffffff']} // Required: an array of colors
                style={{flex:1}}
                start={{ x: 0, y: 0 }} // Optional: default is {x: 0.5, y: 0}
                end={{ x: 1, y: 1 }}   // Optional: default is {x: 0.5, y: 1}
              >
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>

            <TextInput 
                placeholder="Enter your email" 
                style={styles.input} 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleResetPassword}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>
        </View>
           </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#f3f2f7',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#c4f4f3', // Keeping your theme color
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backText: {
        color: '#007AFF',
        marginTop: 10,
    }
});

export default ForgetPassword;