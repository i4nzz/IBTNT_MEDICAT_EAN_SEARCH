import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function Home({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [petExpanded, setPetExpanded] = useState(false);
  const [medExpanded, setMedExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    // Pode usar seu SplashScreen aqui
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <Text style={{color: '#fff'}}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Meu pet */}
      <TouchableOpacity
        style={styles.box}
        onPress={() => setPetExpanded(!petExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Meu pet</Text>
          <Text style={styles.arrow}>{petExpanded ? "˅" : "˄"}</Text>
        </View>
        {petExpanded && (
          <View style={styles.content}>
            <ScrollView style={{ maxHeight: 150 }}>
              <Text style={styles.text}>
                (opção para cadastrar o pet, Nome, raça, idade, um check box para saber se tem ou não pedigree)
                {"\n\n"}
                uma seleção múltipla que irá buscar um json server listando os produtos que o animal consumirá
              </Text>
            </ScrollView>
          </View>
        )}
      </TouchableOpacity>

      {/* Medicamento */}
      <TouchableOpacity
        style={styles.box}
        onPress={() => setMedExpanded(!medExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Medicamento</Text>
          <Text style={styles.arrow}>{medExpanded ? "˅" : "˄"}</Text>
        </View>
        {/* Conteúdo de medicamento pode ser expandido futuramente */}
      </TouchableOpacity>

      {/* Opções extras */}
      <TouchableOpacity style={styles.optionsBox} activeOpacity={0.7}>
        <Text style={styles.optionsText}>opções extras</Text>
      </TouchableOpacity>

      {/* Botão voltar */}
      <TouchableOpacity
        onPress={() => navigation.navigate('FazerLogin')}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Text style={{color: '#00A4CC'}}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0097b2',
    padding: 16,
    justifyContent: 'center',
  },
  box: {
    borderWidth: 2,
    borderColor: '#fff',
    padding: 10,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: '#fff',
  },
  arrow: {
    fontSize: 24,
    color: '#fff',
  },
  content: {
    marginTop: 12,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
  optionsBox: {
    borderWidth: 2,
    borderColor: '#fff',
    padding: 10,
    alignSelf: "flex-start",
  },
  optionsText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  }
});
