import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView, 
  ScrollView,
  Dimensions
} from 'react-native';

import { useIsFocused } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- CHART LIBRARY ---
import { BarChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get("window").width;

// --- 1. Reusable Stat Card Component ---
const StatCard = ({ title, subTitle, value, unit, colors, emoji }) => (
  <LinearGradient
    colors={colors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.cardContainer}
  >
    <View style={styles.cardLeft}>
      <View style={styles.iconContainer}>
         <Text style={{ fontSize: 28 }}>{emoji}</Text>
      </View>
      <View>
        <Text style={styles.cardSubtitle}>{subTitle}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
    <View style={styles.cardRight}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardUnit}>{unit}</Text>
    </View>
  </LinearGradient>
);

// --- 2. Main Screen Component ---
const Home = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State for Dashboard Stats
  const [stats, setStats] = useState({
    caloriesBurned: 0,
    workoutDuration: 0, 
    calorieIntake: 1800 
  });

  // State for Chart Data
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            setLoading(false);
            return;
        }

        // 1. Fetch Username
        const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) setUsername(userDoc.data().username);

        // 2. Define Time Range (Last 7 Days)
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const endOfToday = new Date(now.setHours(23, 59, 59, 999));
        
        // Calculate 7 days ago
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6); 
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // 3. Fetch Data (Activities & Workouts) for last 7 days
        const activitiesQuery = firestore()
          .collection('activities')
          .where('userId', '==', currentUser.uid)
          .where('date', '>=', sevenDaysAgo)
          .get();

        const workoutsQuery = firestore()
          .collection('workouts')
          .where('userId', '==', currentUser.uid)
          .where('date', '>=', sevenDaysAgo)
          .get();

        const [activitiesSnap, workoutsSnap] = await Promise.all([activitiesQuery, workoutsQuery]);

        // 4. PROCESS DATA
        let todayCalories = 0;
        let todayMinutes = 0;
        
        // Initialize 7 days bucket (Mon, Tue, Wed...)
        const daysChartMap = new Array(7).fill(0).map((_, index) => {
            const d = new Date(now);
            d.setDate(now.getDate() - (6 - index)); // Go back from today
            return {
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), // "M", "T", "W"
                value: 0,
                dateStr: d.toDateString(), // For matching
                frontColor: '#42A5F5' // Default Blue
            };
        });

        // Helper to process items
        const processItem = (doc) => {
            const data = doc.data();
            const itemDate = data.date.toDate(); // Convert Firestore Timestamp to JS Date
            
            // A. Add to Today's Stats?
            if (itemDate >= startOfToday && itemDate <= endOfToday) {
                todayCalories += (data.calories || 0);
                todayMinutes += (data.duration || 0);
            }

            // B. Add to Weekly Chart?
            const dateStr = itemDate.toDateString();
            const dayBucket = daysChartMap.find(d => d.dateStr === dateStr);
            if (dayBucket) {
                dayBucket.value += (data.duration || 0); // Plotting Duration (Minutes)
            }
        };

        activitiesSnap.forEach(processItem);
        workoutsSnap.forEach(processItem);

        // Make Today's bar Orange
        daysChartMap[6].frontColor = '#FFA726'; 

        setStats({
          caloriesBurned: todayCalories,
          workoutDuration: todayMinutes,
          calorieIntake: 1800 
        });

        setWeeklyData(daysChartMap);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) fetchData();
  }, [isFocused]);

  const handleLogout = () => {
    auth().signOut().then(() => {
        Alert.alert('Success', 'Logged out successfully');
        navigation.replace('Login'); 
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#42A5F5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
  <LinearGradient
        colors={['#e7c793', '#E8F5E9']} // Required: an array of colors
        style={styles.linearGradient}
        start={{ x: 1.6, y: 0 }} // Optional: default is {x: 0.5, y: 0}
        end={{ x: 1, y: 1 }} >   

      <ScrollView contentContainerStyle={styles.scrollContent}>
           {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeLabel}>Welcome back!</Text>
            <Text style={styles.usernameText}>{username || 'User'}</Text> 
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.notificationBtn}>
             <Text style={{fontSize:20}}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.cardsWrapper}>
          <StatCard
            colors={['#FFC107', '#F57C00']} 
            emoji="🔥"
            subTitle="Calories"
            title="Burned"
            value={stats.caloriesBurned}
            unit="kcal"
          />
          
          <TouchableOpacity onPress={() => navigation.navigate('WorkoutsList')} activeOpacity={0.9}>
            <StatCard
                colors={['#42A5F5', '#1976D2']} 
                emoji="⏱️"
                subTitle="Workout Time"
                title="" 
                value={formatDuration(stats.workoutDuration)}
                unit="" 
            />
          </TouchableOpacity>

          <StatCard
            colors={['#66BB6A', '#43A047']} 
            emoji="🍏"
            subTitle="Calorie"
            title="Intake"
            value={stats.calorieIntake}
            unit="kcal"
          />
        </View>

        {/* --- WEEKLY PROGRESS CHART --- */}
        <Text style={styles.sectionTitle}>Weekly Activity (Minutes)</Text>
        <View style={styles.chartContainer}>
           {weeklyData.length > 0 && (
             <BarChart
                data={weeklyData}
                barWidth={22}
                noOfSections={3}
                spacing={18}
                barBorderRadius={4}
                frontColor="#42A5F5"
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                isAnimated
                animationDuration={1000}
                height={150}
                scrollToEnd={true}
               width={screenWidth - 120} // Adjust width to fit card
                labelTextStyle={{color: '#999', fontSize: 12}}
             />
           )}
        </View>
        <View style={{height: 20}} /> 

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddActivity')}
      >
        <Text style={{fontSize:25, color: 'white'}}>+</Text>
      </TouchableOpacity>
      </LinearGradient>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 10 },
  welcomeLabel: { fontSize: 16, color: '#666' },
  usernameText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  notificationBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, elevation: 2 },
  cardsWrapper: { gap: 15, marginBottom: 30 },
  
  cardContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20, height: 100, elevation: 4 },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 50, marginRight: 15 },
  cardSubtitle: { color: '#FFF', opacity: 0.9, fontSize: 14 },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  cardRight: { alignItems: 'flex-end' },
  cardValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  cardUnit: { color: '#FFF', fontSize: 12, opacity: 0.8 },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15 },
  
  // NEW CHART STYLES
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#F57C00', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 999 },
linearGradient: {
    flex: 1, // Ensures the gradient fills its container
    // paddingLeft: 15,
    // paddingRight: 15,
    // borderRadius: 5
  },
});

export default Home;