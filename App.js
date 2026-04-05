import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useSelector } from 'react-redux';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import store from './screens/store/store';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomePage from './screens/HomePage';
import Transactions from './screens/Transactions';
import AddTransaction from './screens/AddTransaction';
import ManageCategoriesScreen from './screens/ManageCategoriesScreen';
import LendTrackerScreen from './screens/LendTrackerScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import ChartsScreen from './screens/ChartsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const themeSetting = useSelector(state => state.app.theme);
  const isDark = themeSetting === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Dashboard') {
            return <MaterialIcons name="dashboard" size={22} color={color} />;
          } else if (route.name === 'Categories') {
            return <FontAwesome5 name="layer-group" size={18} color={color} />;
          } else if (route.name === 'Charts') {
            return <Ionicons name="bar-chart" size={22} color={color} />;
          } else if (route.name === 'Lends') {
            return <Ionicons name="people" size={22} color={color} />;
          }
        },
        tabBarActiveTintColor: isDark ? '#0A84FF' : '#007AFF',
        tabBarInactiveTintColor: '#86868B',
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={HomePage} />
      <Tab.Screen name="Categories" component={ManageCategoriesScreen} />
      <Tab.Screen name="Charts" component={ChartsScreen} />
      <Tab.Screen name="Lends" component={LendTrackerScreen} />
    </Tab.Navigator>
  );
}

function AppNavigation() {
  const themeSetting = useSelector(state => state.app.theme);
  const isDark = themeSetting === 'dark';

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: '#121212', card: '#1C1C1E', border: '#2C2C2E', text: '#FFFFFF', primary: '#0A84FF' }
  };
  const CustomLightTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#F5F5F7', card: '#FFFFFF', border: '#E5E5EA', text: '#1D1D1F', primary: '#007AFF' }
  };

  const activeTheme = isDark ? CustomDarkTheme : CustomLightTheme;

  const globalHeaderConfig = {
    headerStyle: { backgroundColor: activeTheme.colors.card },
    headerTintColor: activeTheme.colors.text,
    headerTitleStyle: { fontWeight: '600' },
    headerShadowVisible: false,
  };

  return (
    <NavigationContainer theme={activeTheme}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={MainTabs}
          options={({ navigation }) => ({
            ...globalHeaderConfig,
            title: 'Home',
            headerLeft: () => null,
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Profile Settings')} style={{ marginRight: 15 }}>
                <FontAwesome5 name="user-circle" size={24} color={activeTheme.colors.primary} />
              </TouchableOpacity>
            )
          })} 
        />
        <Stack.Screen name="Transactions" component={Transactions} options={globalHeaderConfig} />
        <Stack.Screen name="Add Transactions" component={AddTransaction} options={globalHeaderConfig} />
        <Stack.Screen name="Manage Categories" component={ManageCategoriesScreen} options={globalHeaderConfig} />
        <Stack.Screen name="Lend Tracker" component={LendTrackerScreen} options={globalHeaderConfig} />
        <Stack.Screen name="Profile Settings" component={ProfileSettingsScreen} options={globalHeaderConfig} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <AppNavigation />
    </Provider>
  )
}
