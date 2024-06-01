import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './screens/HomePage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import AddCategories from './screens/AddCategories';
import AddTransaction from './screens/AddTransaction';
import { AntDesign } from '@expo/vector-icons';
import { auth, logOutUser } from './firebase';
import Transactions from './screens/Transactions';
import LandingScreen from './screens/LandingScreen';
import { Provider, useDispatch } from 'react-redux';
import store from './screens/store/store';
import { setUser } from './screens/store/slice/dbSlice';
import LogOutBtn from './screens/components/LogOutBtn';
import MonthlyExpenseScreen from './screens/MonthlyExpenseScreen';
const Stack = createNativeStackNavigator();

const globalHeaderConfig = {
  headerStyle: {
    backgroundColor: '#fcfdff',
  },
  headerTintColor: '#100d38',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
}

export default App = () => {
  return (
    <Provider store={store}>

      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Expense Tracker" component={LandingScreen}
            options={globalHeaderConfig} />
          <Stack.Screen name="Login" component={LoginScreen}
            options={globalHeaderConfig} />
          <Stack.Screen name="Home" component={HomePage}
            options={({ navigation, route }) => ({
              ...globalHeaderConfig,
              headerRight: () => (
                <LogOutBtn />
              )
            })} />
          <Stack.Screen name="Add Categories" component={AddCategories}
            options={globalHeaderConfig} />
          <Stack.Screen name="Add Transactions" component={AddTransaction}
            options={globalHeaderConfig} />
          <Stack.Screen name="Transactions" component={Transactions}
            options={globalHeaderConfig} />
          <Stack.Screen name="Monthly Expense" component={MonthlyExpenseScreen}
            options={globalHeaderConfig} />

        </Stack.Navigator>


      </NavigationContainer>
    </Provider>
  )
};
