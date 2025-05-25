import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Button, StyleSheet, Image, Alert } from "react-native";


export default function FazerLogin({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
const isFormValid = () => {
    return (
      username.trim().length > 0 &&
      password.trim().length >= 6 
      
    );
  };

  return (
    
      <View style={styles.container}>
        <Image 
          source={require('../../img/MEDICAT_LOGO.png')}
          style={styles.image}
        />

        <Text style={styles.title}>Fazer Acesso</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu nome de usuário"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button 
          title="Acessar" 
          onPress={()=> navigation.navigate('Home')}
          disabled={!isFormValid()}
          color="#007B83"
        />
        <View style={{ height: 10 }} /> {/* Espaço entre os botões */}
        <Button 
          title="Voltar" 
          onPress={() => navigation.navigate('TelaInicial')} 
          color="#00A4CC"
        />

        
      </View>

  );
}

const styles = StyleSheet.create({
  scrollContainer: {
  flex: 1,
  justifyContent: 'center', // opcional para centralizar verticalmente
},
  container: {
    alignItems: "center",
    flex:1,
    backgroundColor: '#0097b2',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#fff'
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
});
