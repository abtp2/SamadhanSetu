import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppLogo } from './src/components/AppLogo';
import { CustomTabBar } from './src/components/CustomTabBar';
import { SplashScreen } from './src/screens/SplashScreen';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { MyReportsScreen } from './src/screens/MyReportsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ChallengeDetailScreen } from './src/screens/ChallengeDetailScreen';
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { LoginScreen } from './src/screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs({ navigation }) {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const dashboardTitle =
    role === 'university' || role === 'student'
      ? 'University R&D Dashboard'
      : role === 'industry'
      ? 'Industry & CSR Dashboard'
      : role === 'admin'
      ? 'State Nodal Admin Portal'
      : 'Citizen Dashboard';

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f2c59',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 16,
          letterSpacing: 0.2,
        },
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 14, padding: 6, position: 'relative' }}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color="#ffffff" />
            <View
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#f59e0b',
                borderWidth: 1.5,
                borderColor: '#0f2c59',
              }}
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitle: () => <AppLogo size="small" theme="light" />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: 'Explore', headerTitle: 'Explore Challenges' }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{ title: 'Report', headerTitle: 'Report Societal Challenge' }}
      />
      <Tab.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{
          title: user && role !== 'citizen' ? 'Dashboard' : 'My Reports',
          headerTitle: dashboardTitle,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', headerTitle: 'Account & Helplines' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#0f2c59' },
              headerTintColor: '#ffffff',
              headerTitleStyle: { fontWeight: '800', fontSize: 15 },
            }}
          >
            <Stack.Screen
              name="Main"
              component={BottomTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChallengeDetail"
              component={ChallengeDetailScreen}
              options={{ title: 'Challenge Details' }}
            />
            <Stack.Screen
              name="ProjectDetail"
              component={ProjectDetailScreen}
              options={{ title: 'Project Workspace' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: 'Notifications' }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Account Access' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
