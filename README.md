Fitness Tracker Mobile App 🏃‍♂️🏋️‍♀️
A comprehensive React Native application designed to help users track their daily physical activities, log detailed workouts, and visualize their progress through interactive charts.

📱 Features
User Authentication: Secure Login, Signup, and "Forget Password" functionality powered by Firebase Auth.

Personalized Dashboard:

Real-time daily tracking of calories burned and workout duration.

Dynamic greeting that fetches the user's name from Firestore.

Interactive Analytics:

7-day activity bar chart using react-native-gifted-charts.

Auto-scrolling to the current day for instant focus.

Activity Logging:

Quickly add daily activities like walking or cycling.

Workout Management:

View a historical list of all recorded workouts.

Detailed workout logging including an array of specific exercises.

Modern UI/UX:

Beautiful Linear Gradient backgrounds on every screen.

Custom-built navigation headers and floating action buttons (FAB).

🛠 Tech Stack
Framework: React Native

Database & Auth: Firebase (Firestore & Authentication)

Navigation: React Navigation Stack

Charts: React Native Gifted Charts

Icons: Material Community Icons

Styling: React Native Linear Gradient

🚀 Getting Started
Prerequisites
Node.js & npm

React Native CLI

Android Studio (for Android) or Xcode (for iOS)

A Firebase Project

Installation
Clone the repository:

Bash
git clone https://github.com/your-username/fitness-tracker-app.git
cd fitness-tracker-app
Install dependencies:

Bash
npm install
Firebase Setup:

Add your google-services.json (Android) to android/app/

Add your GoogleService-Info.plist (iOS) to the project via Xcode.

Run the application:

Bash
# For Android
npx react-native run-android

# For iOS
cd ios && pod install && cd ..
npx react-native run-ios
📁 Project Structure
Plaintext
├── assets/             # Images, logos, and icons
├── screens/            # Application screens
│   ├── home.js         # Dashboard with Chart and Stats
│   ├── AddActivity.js  # Form to add daily activities
│   ├── AddWorkout.js   # Form to log detailed workouts
│   ├── WorkoutsList.js # List of past workouts
│   └── forget.js       # Password reset screen
├── App.js              # Navigation setup and Main Entry
└── index.js            # App registration and LogBox config
📄 Database Schema (Firestore)
users: uid, username, email, createdAt

activities: userId, name, duration, calories, date

workouts: userId, name, duration, calories, exercises (Array), date

👨‍💻 Author
Syed Jabbar Powered by React Native & Firebase
