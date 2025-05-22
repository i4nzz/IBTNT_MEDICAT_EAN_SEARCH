import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TelaInicial from './source/screens/TelaInicial';
import SplashScreen from './source/screens/loading_screen/Loading';
import CriarLogin from './source/screens/Login/CriarLogin';
import FazerLogin from './source/screens/Login/FazerLogin'; // Corrigido o caminho
import Home from './source/screens/Home';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen 
          name="SplashScreen" 
          component={SplashScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="CriarLogin" 
          component={CriarLogin} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="FazerLogin" 
          component={FazerLogin} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TelaInicial" 
          component={TelaInicial} 
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
