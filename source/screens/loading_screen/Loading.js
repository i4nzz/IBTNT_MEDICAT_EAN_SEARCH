import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated, Easing } from "react-native";

export default function SplashScreen({ navigation }) {
  const rotateValue = useRef(new Animated.Value(0)).current;
  const rotateCounterValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de rotação do círculo
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Animação de rotação do gatinho (sentido contrário)
    Animated.loop(
      Animated.timing(rotateCounterValue, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Timer para navegar automaticamente para a TelaInicial após 5 segundos
    const timer = setTimeout(() => {
      navigation.replace("TelaInicial");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  // Valor da rotação
  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const rotateCounter = rotateCounterValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  return (
    
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Animated.Image 
          source={require('C:/_source/ProjetosFaculdade/ProjetosH1/medicatEanSearch/source/img/gatinho.png')} 
          style={[styles.image, { transform: [{ rotate: rotateCounter }] }]}
        />
        <Animated.View style={[styles.loadingCircle, { transform: [{ rotate }] }]} />
      </View>
      <Text style={styles.text}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0097b2',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  loadingCircle: {
    width: 180,
    height: 180,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 90,
    position: 'absolute',
    borderStyle: 'solid',
    borderTopColor: 'transparent',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 220,
  },
});