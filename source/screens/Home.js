"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Image,
  Alert,
  ScrollView,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { initDatabase, insertPet, getPets, deletePet, updatePet } from "../lib/database"

export default function Home({ navigation }) {
  const [loading, setLoading] = useState(true)
  const [pets, setPets] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingPetId, setEditingPetId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    hasPedigree: false,
    animalType: "cachorro",
    photo: "",
  })

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      await initDatabase()
      await loadPets()
    } catch (error) {
      console.error("Erro ao inicializar app:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPets = async () => {
    try {
      const petsData = await getPets()
      setPets(petsData)
    } catch (error) {
      console.error("Erro ao carregar pets:", error)
    }
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de permissão para acessar suas fotos")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, photo: result.assets[0].uri })
    }
  }

  const handleRemovePet = async (petId) => {
    Alert.alert("Confirmar remoção", "Tem certeza que deseja remover este pet?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePet(petId)
            await loadPets()
            Alert.alert("Sucesso", "Pet removido com sucesso!")
          } catch (error) {
            console.error("Erro ao remover pet:", error)
            Alert.alert("Erro", "Não foi possível remover o pet")
          }
        },
      },
    ])
  }

  const handleEditPet = (pet) => {
    setFormData({
      name: pet.name,
      breed: pet.breed,
      age: pet.age.toString(),
      hasPedigree: pet.hasPedigree,
      animalType: pet.animalType,
      photo: pet.photo || "",
    })
    setEditingPetId(pet.id)
    setEditMode(true)
    setModalVisible(true)
  }

  const handleAddPet = async () => {
    if (!formData.name.trim() || !formData.breed.trim() || !formData.age.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (!editMode && pets.length >= 1) {
      Alert.alert("Limite atingido", "Por enquanto é permitido cadastrar apenas um animal")
      return
    }

    try {
      const petData = {
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        age: Number.parseInt(formData.age),
        hasPedigree: formData.hasPedigree,
        animalType: formData.animalType,
        photo: formData.photo,
      }

      if (editMode) {
        await updatePet(editingPetId, petData)
        Alert.alert("Sucesso", "Pet atualizado com sucesso!")
      } else {
        await insertPet(petData)
        Alert.alert("Sucesso", "Pet cadastrado com sucesso!")
      }

      await loadPets()
      setModalVisible(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar pet:", error)
      Alert.alert("Erro", "Não foi possível salvar o pet")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      breed: "",
      age: "",
      hasPedigree: false,
      animalType: "cachorro",
      photo: "",
    })
    setEditMode(false)
    setEditingPetId(null)
  }

  const getPetListData = () => {
    const items = []

    if (pets.length < 1) {
      items.push({
        id: "add",
        title: "ADICIONAR",
        type: "action",
      })
    }

    pets.forEach((pet) => {
      items.push({
        id: `pet-${pet.id}`,
        title: pet.name,
        type: "pet",
        data: pet,
      })
    })

    if (pets.length > 0) {
      items.push({
        id: "edit",
        title: "EDITAR",
        type: "action",
      })
      items.push({
        id: "remove",
        title: "REMOVER",
        type: "action",
      })
    }

    return items
  }

  const renderPetItem = ({ item }) => {
    if (item.type === "action") {
      return (
        <TouchableOpacity
          style={[styles.listItem, styles.actionItem]}
          onPress={() => {
            if (item.id === "add") {
              setModalVisible(true)
            } else if (item.id === "edit" && pets.length > 0) {
              handleEditPet(pets[0])
            } else if (item.id === "remove" && pets.length > 0) {
              handleRemovePet(pets[0].id)
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>{item.title}</Text>
        </TouchableOpacity>
      )
    }

    const pet = item.data
    return (
      <TouchableOpacity
        style={[styles.listItem, styles.petItem]}
        onPress={() => handleEditPet(pet)}
        activeOpacity={0.8}
      >
        <View style={styles.petHeader}>
          {pet.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.petPhoto} />
          ) : (
            <View style={[styles.petPhoto, styles.placeholderPhoto]}>
              <Text style={styles.placeholderText}>📷</Text>
            </View>
          )}
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petDetail}>Raça: {pet.breed}</Text>
            <Text style={styles.petDetail}>Idade: {pet.age} anos</Text>
            <Text style={styles.petDetail}>Tipo: {pet.animalType}</Text>
            <Text style={styles.petDetail}>Pedigree: {pet.hasPedigree ? "Sim" : "Não"}</Text>
            <Text style={styles.editHint}>Toque para editar</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderMedicineItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.text}>{item.title}</Text>
    </View>
  )

  const renderExtraItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem} activeOpacity={0.8}>
      <Text style={styles.text}>{item.title}</Text>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gerenciamento de Pets</Text>
          <Text style={styles.headerSubtitle}>Cuide bem do seu melhor amigo</Text>
        </View>

        {/* Seção Meu Pet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🐾 Meu Pet</Text>
          <View style={styles.flatListContainer}>
            <FlatList
              data={getPetListData()}
              renderItem={renderPetItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        {/* Seção Medicamentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Medicamentos</Text>
          <View style={styles.flatListContainer}>
            <FlatList
              data={[{ id: "1", title: "Em desenvolvimento..." }]}
              renderItem={renderMedicineItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        {/* Seção Opções Extras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Opções Extras</Text>
          <View style={styles.flatListContainer}>
            <FlatList
              data={[
                { id: "1", title: "Configurações ⚙️" },
                { id: "2", title: "Sobre 📃" },
                {id: "3",title: "Sair 🙋‍♂️"}
              ]}
              renderItem={renderExtraItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        {/* Espaço para o botão voltar */}
        <View style={styles.bottomSpace} />
      </ScrollView>


      {/* Modal de Cadastro */}
    
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editMode ? "Editar Pet" : "Cadastrar Pet"}</Text>

            {/* Foto */}
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
              {formData.photo ? (
                <Image source={{ uri: formData.photo }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>📷</Text>
                  <Text style={styles.photoPlaceholderSubtext}>Adicionar Foto</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nome do pet"
                placeholderTextColor="#999"
              />
            </View>

            {/* Raça */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Raça *</Text>
              <TextInput
                style={styles.input}
                value={formData.breed}
                onChangeText={(text) => setFormData({ ...formData, breed: text })}
                placeholder="Raça do pet"
                placeholderTextColor="#999"
              />
            </View>

            {/* Idade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Idade *</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Idade em anos"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Tipo de Animal */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Animal</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData({ ...formData, animalType: "cachorro" })}
                >
                  <View style={[styles.radio, formData.animalType === "cachorro" && styles.radioSelected]} />
                  <Text style={styles.radioText}>🐕 Cachorro</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData({ ...formData, animalType: "gato" })}
                >
                  <View style={[styles.radio, formData.animalType === "gato" && styles.radioSelected]} />
                  <Text style={styles.radioText}>🐱 Gato</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Pedigree */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setFormData({ ...formData, hasPedigree: !formData.hasPedigree })}
            >
              <View style={[styles.checkbox, formData.hasPedigree && styles.checkboxSelected]}>
                {formData.hasPedigree && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>🏆 Tem Pedigree</Text>
            </TouchableOpacity>

            {/* Botões */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false)
                  resetForm()
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddPet}>
                <Text style={styles.saveButtonText}>{editMode ? "Atualizar" : "Salvar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0097b2",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    color: "#0097b2",
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  flatListContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionItem: {
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  actionText: {
    color: "#0097b2",
    fontSize: 16,
    fontWeight: "bold",
  },
  petItem: {
    backgroundColor: "#fff",
  },
  petHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  petPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: "#0097b2",
  },
  placeholderPhoto: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 28,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    color: "#333",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  petDetail: {
    color: "#666",
    fontSize: 14,
    marginBottom: 3,
  },
  text: {
    color: "#333",
    fontSize: 16,
  },
  editHint: {
    color: "#0097b2",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 6,
    fontWeight: "500",
  },
  bottomSpace: {
    height: 20,
  },
  backButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonText: {
    color: "#0097b2",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0097b2",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#0097b2",
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  photoPlaceholderText: {
    fontSize: 32,
    marginBottom: 4,
  },
  photoPlaceholderSubtext: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    color: "#333",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#0097b2",
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: "#0097b2",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 3,
    borderColor: "#0097b2",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  checkboxSelected: {
    backgroundColor: "#0097b2",
  },
  checkmark: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  checkboxText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 5,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#0097b2",
    shadowColor: "#0097b2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
