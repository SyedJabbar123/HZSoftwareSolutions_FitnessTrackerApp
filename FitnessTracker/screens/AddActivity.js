import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';


const AddActivity = ({ navigation }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // 1. Basic Validation
    if (!name || !duration || !calories) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth().currentUser;
      
      // 2. Add to Firestore
      await firestore().collection('activities').add({
        userId: currentUser.uid,
        name: name,
        duration: parseInt(duration), // Convert string to Number
        calories: parseInt(calories), // Convert string to Number
        date: firestore.Timestamp.fromDate(new Date()), // Saves "Now"
      });

      Alert.alert('Success', 'Activity added successfully!');
      navigation.goBack(); // Go back to Dashboard to see the update

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save activity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // style={styles.container}
      style={{flex:1}}
    >
 <LinearGradient
        colors={['#e7c793', '#E8F5E9']} // Required: an array of colors
        style={styles.container}
        start={{ x: 1.6, y: 0 }} // Optional: default is {x: 0.5, y: 0}
        end={{ x: 1, y: 1 }} >  
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          
        </TouchableOpacity> */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
             <Text style={{fontSize: 20}}>⬅️</Text>
           </TouchableOpacity>
        <Text style={styles.headerTitle}>New Activity</Text>
      </View>

      <View style={styles.form}>
        {/* Activity Name Input */}
        <Text style={styles.label}>Activity Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Morning Walk, Cycling"
          value={name}
          onChangeText={setName}
        />

        {/* Duration Input */}
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 30"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        {/* Calories Input */}
        <Text style={styles.label}>Calories Burned</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 150"
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
        />

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Activity</Text>
          )}
        </TouchableOpacity>
      </View>
      </LinearGradient>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  backBtn: {
    padding: 8,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#F5F7FA',
    padding: 15,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  saveButton: {
    backgroundColor: '#42A5F5', // Matches your Blue card
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#42A5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddActivity;