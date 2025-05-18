import React from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";

export default function TelaInicial({ navigation }) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('C:/_source/ProjetosFaculdade/ProjetosH1/medicatEanSearch/source/img/MEDICAT_LOGO.png')} 
        style={styles.image}
      />
      <Text style={styles.title}>Bem-vindo(a) ao App</Text>
      <Button title="Iniciar" onPress={() => navigation.navigate('Home')} />
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
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
