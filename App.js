"use client"

import { useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { Alert } from "react-native"

// Importações das telas
import TelaInicial from "./source/screens/TelaInicial"
import SplashScreen from "./source/screens/loading_screen/Loading"
import CriarLogin from "./source/screens/Login/CriarLogin"
import FazerLogin from "./source/screens/Login/FazerLogin"
import Home from "./source/screens/Home"
import MedicinesScreen from "./source/screens/MedicinesScreen"
import MedicineStoresScreen from "./source/screens/MedicineStoresScreen"


import { initAllDatabases } from "./source/lib/initAllDatabases"

const Stack = createStackNavigator()

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Inicializando aplicação...")
        await initAllDatabases()
        console.log("Banco de dados inicializado com sucesso!")
      } catch (error) {
        console.error("Erro ao inicializar banco de dados:", error)
        Alert.alert(
          "Erro de Inicialização",
          "Não foi possível inicializar o banco de dados. O app pode não funcionar corretamente.",
          [{ text: "OK" }],
        )
      }
    }

    initializeApp()
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="TelaInicial"
          component={TelaInicial}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="CriarLogin"
          component={CriarLogin}
          options={{
            headerShown: false,
            title: "Criar Conta",
          }}
        />

        <Stack.Screen
          name="FazerLogin"
          component={FazerLogin}
          options={{
            headerShown: false,
            title: "Entrar",
          }}
        />

        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
            gestureEnabled: false,
            title: "Gerenciamento de Pets",
          }}
        />

        <Stack.Screen
          name="MedicinesScreen"
          component={MedicinesScreen}
          options={{
            headerShown: false,
            title: "Medicamentos",
          }}
        />

        <Stack.Screen
          name="MedicineStoresScreen"
          component={MedicineStoresScreen}
          options={{
            headerShown: false,
            title: "Preços de Medicamentos",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
