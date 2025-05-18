import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TelaInicial from './source/screens/TelaInicial';
import SplashScreen from './source/screens/loading_screen/Loading'
import TermosDeUso from "./source/screens/TermosDeUso";

const Stack = createStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TermosDeUso" component={TermosDeUso} options={{ headerShown: false }} />
        <Stack.Screen name="TelaInicial" component={TelaInicial} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
