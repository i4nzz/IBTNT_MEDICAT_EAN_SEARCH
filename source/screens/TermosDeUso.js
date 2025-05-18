import React, { useState } from "react";
import { View, Text, ScrollView, Button, StyleSheet, Modal } from "react-native";

export default function TelaInicial({ navigation }) {
  const [modalVisible, setModalVisible] = useState(true);
  const [aceitou, setAceitou] = useState(false);

  const textoTermos = `
    Termos de Uso:
    
    1. Ao utilizar este aplicativo, você concorda em não compartilhar informações sensíveis sem consentimento.
    2. Este aplicativo coleta apenas dados necessários para seu funcionamento.
    3. Você é responsável pelo uso correto do aplicativo.
    4. Qualquer violação destes termos pode resultar na suspensão de sua conta.

    Ao aceitar estes termos, você concorda com nossas políticas.
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo(a) ao App</Text>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.termsContainer}>
              <Text style={styles.title}>Termos de Uso</Text>
              <Text style={styles.text}>{textoTermos}</Text>
            </ScrollView>
            <Button
              title="Aceitar Termos"
              onPress={() => {
                setAceitou(true);
                setModalVisible(false);
              }}
              color={aceitou ? "green" : "gray"}
            />
            <Button
              title="Continuar"
              onPress={() => navigation.replace("Home")}
              disabled={!aceitou}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  termsContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333333',
  }
});
