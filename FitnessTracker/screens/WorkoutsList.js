import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns'; // Standard date formatting
import LinearGradient from 'react-native-linear-gradient';

const WorkoutsList = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const snapshot = await firestore()
        .collection('workouts')
        .where('userId', '==', currentUser.uid)
        .orderBy('date', 'desc') // Show newest first
        .get();

      const workoutsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setWorkouts(workoutsData);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchWorkouts();
    }
  }, [isFocused]);

  const renderItem = ({ item }) => {
    // Format Date safely
    let dateLabel = "Unknown Date";
    if (item.date) {
        // Handle both Firestore Timestamp and standard JS Date
        const dateObj = item.date.toDate ? item.date.toDate() : new Date(item.date);
        dateLabel = dateObj.toLocaleDateString() + " • " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Count exercises
    const exerciseCount = item.exercises ? item.exercises.length : 0;

    return (
         <LinearGradient
                colors={['#e7c793', '#E8F5E9']} // Required: an array of colors
                style={{flex:1}}
                start={{ x: 1.6, y: 0 }} // Optional: default is {x: 0.5, y: 0}
                end={{ x: 1, y: 1 }} >   
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
             <Text style={{fontSize: 24}}>💪</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.workoutName}>{item.name || "Untitled Workout"}</Text>
            <Text style={styles.workoutDate}>{dateLabel}</Text>
          </View>
          <View style={styles.caloriesBox}>
             <Text style={styles.caloriesText}>{item.calories} kcal</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
           <View style={styles.statItem}>
              {/* <Icon name="timer-outline" size={16} color="#666" />
               */}
               <Text style={{fontSize:16}}>⏱️</Text>
              <Text style={styles.statText}>{item.duration || 0} min</Text>
           </View>
           <View style={styles.statItem}>
              {/* <Icon name="dumbbell" size={16} color="#666" /> */}
              <Text style={{fontSize:16}}>🏋️‍♂️</Text>
              <Text style={styles.statText}>{exerciseCount} Exercises</Text>
           </View>
        </View>
      </View>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
           {/* <Icon name="arrow-left" size={28} color="#333" />
            */}
            <Text style={{fontSize: 20}}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Workouts</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
           <ActivityIndicator size="large" color="#42A5F5" />
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              {/* <Icon name="dumbbell" size={60} color="#DDD" /> */}
              <Text style={{fontSize:30}}>⛹️‍♂️</Text>
              <Text style={styles.emptyText}>No workouts logged yet.</Text>
            </View>
            
          }
        />
        
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddWorkout')}
      >
        <Text style={{fontSize:30, color:'#FFF'}}>＋</Text>
        {/* <Icon name="plus" size={30} color="#FFF" /> */}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  listContent: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  
  // Card Styles
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardContent: { flex: 1 },
  workoutName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  workoutDate: { fontSize: 12, color: '#999', marginTop: 2 },
  caloriesBox: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  caloriesText: { color: '#F57C00', fontWeight: 'bold', fontSize: 12 },
  
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: '#666', fontSize: 14 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#42A5F5', // Blue to match the Workout theme
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 999,
  },
});

export default WorkoutsList;