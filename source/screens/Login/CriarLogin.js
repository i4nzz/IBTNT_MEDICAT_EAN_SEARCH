import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Button, StyleSheet, Image, Alert } from "react-native";

export default function Login({ navigation }) {
  const [username, setUsername] = useState("");
  const [userEmail, setEmail] = useState("");
  const [userNomeCompleto, setNome] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const isFormValid = () => {
    return (
      username.trim().length > 0 &&
      userEmail.trim().length > 0 &&
      userNomeCompleto.trim().length > 0 &&
      password.trim().length >= 6 &&
      password === passwordConfirm
    );
  };

  const handleLogin = () => {
    if (password !== passwordConfirm) {
      Alert.alert("Erro", "As senhas não são iguais.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    Alert.alert("Sucesso", "Conta criada com sucesso!");
    navigation.navigate("TelaInicial");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image 
          source={require('C:/_source/ProjetosFaculdade/ProjetosH1/medicatEanSearch/source/img/MEDICAT_LOGO.png')} 
          style={styles.image}
        />

        <Text style={styles.title}>Criar Acesso</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu nome completo"
          value={userNomeCompleto}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          value={userEmail}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite seu nome de usuário"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Crie uma senha (mínimo 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirme sua senha"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />

        <Button 
          title="Criar Login" 
          onPress={handleLogin} 
          color="#007B83" 
          disabled={!isFormValid()}
        />
        
        <View style={{ height: 10 }} />
        
        <Button 
          title="Voltar" 
          onPress={() => navigation.navigate("TelaInicial")} 
          color="#007B83" 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    alignItems: "center",
    backgroundColor: '#0097b2',
    flex:1
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
