import React, { useState } from "react";
import { View, Text, Button, Image, StyleSheet ,ActivityIndicator } from "react-native";


export default function TelaInicial({ navigation }) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../img/MEDICAT_LOGO.png')}

        style={styles.image}
      />
      <Text style={styles.title}>Bem-vindo(a) ao Medicat</Text>

      <View style={styles.buttonContainer}>
        <Button 
          title="Já Tenho Acesso" 
          onPress={() => navigation.navigate('FazerLogin')} 
          color="#007B83"
        />
        <View style={{ height: 10 }} /> 
        <Button 
          title="Criar Acesso" 
          onPress={() => navigation.navigate('CriarLogin')} 
          color="#00A4CC"
        />
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Sunny LTDA</Text>
      </View>
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
    color: '#FFFFFF'
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    flex: 1
  },
  footerText: {
    fontSize: 14,
    color: '#FFFFFF',
  }
});
