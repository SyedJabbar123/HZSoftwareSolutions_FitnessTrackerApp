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
  Platform,
  ScrollView
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const AddWorkout = ({ navigation }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [exercises, setExercises] = useState(''); // Text input for exercises
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !duration || !calories) {
      Alert.alert('Missing Fields', 'Please fill in Name, Duration, and Calories.');
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth().currentUser;
      
      // 1. Convert "Squats, Lunges" string into an Array ["Squats", "Lunges"]
      const exercisesArray = exercises
        .split(',')
        .map(ex => ex.trim()) // Remove extra spaces
        .filter(ex => ex.length > 0); // Remove empty items

      // 2. Add to 'workouts' collection
      await firestore().collection('workouts').add({
        userId: currentUser.uid,
        name: name,
        duration: parseInt(duration), 
        calories: parseInt(calories),
        exercises: exercisesArray, // Saves as an Array in Firebase
        date: firestore.Timestamp.fromDate(new Date()), 
      });

      Alert.alert('Success', 'Workout Logged!');
      navigation.goBack(); 

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save workout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
       <LinearGradient
              colors={['#e7c793', '#E8F5E9']} // Required: an array of colors
              style={{flex:1}}
              start={{ x: 1.6, y: 0 }} // Optional: default is {x: 0.5, y: 0}
              end={{ x: 1, y: 1 }} >  
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
             <Text style={{fontSize: 20}}>⬅️</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Workout</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Leg Day, Upper Body"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 60"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          <Text style={styles.label}>Calories Burned</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 500"
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />

          {/* Special Input for Exercises Array */}
          <Text style={styles.label}>Exercises (Comma Separated)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Squats, Bench Press, Deadlift..."
            multiline={true}
            value={exercises}
            onChangeText={setExercises}
          />
          <Text style={styles.hint}>Tip: Separate exercises with a comma (,)</Text>

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Workout</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  form: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 8, marginLeft: 5 },
  input: { backgroundColor: '#F5F7FA', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  hint: { fontSize: 12, color: '#999', marginBottom: 25, marginLeft: 5, fontStyle: 'italic' },
  saveButton: { backgroundColor: '#42A5F5', padding: 18, borderRadius: 15, alignItems: 'center', shadowColor: "#42A5F5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default AddWorkout;