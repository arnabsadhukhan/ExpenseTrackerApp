import React from 'react';
import { Pressable, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './screens/HomePage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import AddCategories from './screens/AddCategories';
import AddTransaction from './screens/AddTransaction';
import { AntDesign } from '@expo/vector-icons';
import { auth, logOutUser } from './firebase';
import Transactions from './screens/Transactions';
const Stack = createNativeStackNavigator();

const globalHeaderConfig = {
  headerStyle: {
    backgroundColor: '#D4ADFC',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
}

export default App = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen}
        options={globalHeaderConfig} />
      <Stack.Screen name="Home" component={HomePage}
        options={({ navigation, route }) => ({
          ...globalHeaderConfig,
          headerRight: () => (
            <Pressable onPress={() => {
              logOutUser(auth).then(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }]
                })
              }).catch((error) => {
                Alert.alert("Error Signing Out");
              });
            }}>
              <AntDesign name="logout" size={24} color="black" />
            </Pressable>
          )
        })} />
      <Stack.Screen name="Add Categories" component={AddCategories}
        options={globalHeaderConfig} />
      <Stack.Screen name="Add Transactions" component={AddTransaction}
        options={globalHeaderConfig} />
      <Stack.Screen name="Transactions" component={Transactions}
        options={globalHeaderConfig} />
    </Stack.Navigator>


  </NavigationContainer>
);
