"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native"
import {
  insertPetMedicine,
  getPetMedicines,
  deletePetMedicine,
  initPetMedicinesDatabase,
} from "../lib/petMedicinesDatabase"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function MedicinesScreen({ navigation, route }) {
  const { petId, petName } = route.params || { petId: null, petName: "Pet" }

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [medicines, setMedicines] = useState([])
  const [selectedMedicines, setSelectedMedicines] = useState([])
  const [petMedicines, setPetMedicines] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [customEndpoint, setCustomEndpoint] = useState("")
  const [showEndpointConfig, setShowEndpointConfig] = useState(false)

  // Dados de exemplo para teste offline
  const sampleMedicines = [
    {
      id: 1,
      nome: "Dipirona 500mg",
      laboratorio: "EMS",
      tipo: "Analgésico",
      forma_administracao: "Comprimido",
      ean: "7891234567890",
      indicacoes: "Dor e febre",
    },
    {
      id: 2,
      nome: "Paracetamol 750mg",
      laboratorio: "Medley",
      tipo: "Analgésico",
      forma_administracao: "Comprimido",
      ean: "7891234567891",
      indicacoes: "Dor de cabeça e febre",
    },
    {
      id: 3,
      nome: "Ibuprofeno 600mg",
      laboratorio: "Eurofarma",
      tipo: "Anti-inflamatório",
      forma_administracao: "Comprimido",
      ean: "7891234567892",
      indicacoes: "Dor e inflamação",
    },
  ]

  useEffect(() => {
    const initializeMedicinesScreen = async () => {
      if (petId) {
        try {
          // Garantir que a tabela de medicamentos do pet existe
          await initPetMedicinesDatabase()
          await new Promise((resolve) => setTimeout(resolve, 500))
          await loadPetMedicines()
        } catch (error) {
          console.error("❌ Error initializing medicines screen:", error)
          Alert.alert("Erro de Inicialização", "Erro ao inicializar a tela de medicamentos")
        }
      }
    }

    initializeMedicinesScreen()
  }, [petId])

  const loadPetMedicines = async () => {
    try {
      setLoading(true)
      const medicines = await getPetMedicines(petId)
      setPetMedicines(medicines)
      console.log("✅ Pet medicines loaded:", medicines.length)
    } catch (error) {
      console.error("❌ Error loading pet medicines:", error)
      if (error.message.includes("no such table")) {
        Alert.alert("Erro de Banco de Dados", "A tabela de medicamentos não foi criada. Deseja recriar as tabelas?", [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Recriar",
            onPress: async () => {
              try {
                await initPetMedicinesDatabase()
                await loadPetMedicines()
              } catch (err) {
                Alert.alert("Erro", "Não foi possível recriar as tabelas")
              }
            },
          },
        ])
      } else {
        Alert.alert("Erro", "Não foi possível carregar os medicamentos do pet")
      }
    } finally {
      setLoading(false)
    }
  }

  const testEndpoint = async (endpoint) => {
    try {
      console.log(`🧪 Testing endpoint: ${endpoint}`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 segundos timeout

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Endpoint ${endpoint} working! Found ${data.length} medicines`)
        return { success: true, data }
      } else {
        console.log(`❌ Endpoint ${endpoint} returned status: ${response.status}`)
        return { success: false, error: `HTTP ${response.status}` }
      }
    } catch (error) {
      console.log(`❌ Endpoint ${endpoint} failed:`, error.message)
      return { success: false, error: error.message }
    }
  }

  const searchMedicines = async () => {
    try {
      setSearchLoading(true)
      console.log("🔍 Searching for medicines...")

      // Lista de endpoints para testar
      const endpoints = [
        customEndpoint,
        "http://192.168.1.141:3000/Medicamentos",
        "http://10.0.0.141:3000/Medicamentos",
        "http://172.16.0.141:3000/Medicamentos",
        "http://desktop-hv1felh:3000/Medicamentos",
        "http://localhost:3000/Medicamentos",
      ].filter((endpoint) => endpoint && endpoint.trim() !== "")

      let workingEndpoint = null
      let medicinesData = []

      // Testar endpoints configurados
      for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint)
        if (result.success) {
          workingEndpoint = endpoint
          medicinesData = result.data
          break
        }
      }

      // Se nenhum endpoint funcionar, usar dados de exemplo
      if (!workingEndpoint) {
        console.log("🔄 Using sample data for testing...")
        medicinesData = sampleMedicines

        Alert.alert(
          "Modo Offline",
          "Não foi possível conectar ao servidor. Usando dados de exemplo.\n\nPara conectar ao servidor:\n1. Verifique se o servidor está rodando\n2. Configure o IP correto\n3. Verifique a conectividade de rede",
          [{ text: "OK" }, { text: "Configurar IP", onPress: () => setShowEndpointConfig(true) }],
        )
      } else {
        Alert.alert(
          "Sucesso",
          `Conectado ao servidor!\nEndpoint: ${workingEndpoint}\nMedicamentos: ${medicinesData.length}`,
        )
      }

      // Filtrar por texto de busca se houver
      let filteredData = medicinesData
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase()
        filteredData = medicinesData.filter(
          (medicine) =>
            medicine.nome.toLowerCase().includes(searchLower) ||
            (medicine.laboratorio && medicine.laboratorio.toLowerCase().includes(searchLower)) ||
            (medicine.tipo && medicine.tipo.toLowerCase().includes(searchLower)) ||
            (medicine.indicacoes && medicine.indicacoes.toLowerCase().includes(searchLower)),
        )
        console.log("🔍 Filtered results:", filteredData.length)
      }

      setMedicines(filteredData)
      setShowSearchResults(true)
    } catch (error) {
      console.error("❌ Error fetching medicines:", error)
      Alert.alert("Erro", `Erro ao buscar medicamentos: ${error.message}`)
    } finally {
      setSearchLoading(false)
    }
  }

  const toggleMedicineSelection = (medicine) => {
    const isSelected = selectedMedicines.find((m) => m.id === medicine.id)

    if (isSelected) {
      setSelectedMedicines(selectedMedicines.filter((m) => m.id !== medicine.id))
    } else {
      setSelectedMedicines([...selectedMedicines, medicine])
    }
  }

  const savePetMedicines = async () => {
    if (selectedMedicines.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um medicamento")
      return
    }

    if (!petId) {
      Alert.alert("Erro", "Pet não identificado")
      return
    }

    try {
      setLoading(true)

      for (const medicine of selectedMedicines) {
        await insertPetMedicine({
          petId: petId,
          medicineId: medicine.id,
          medicineName: medicine.nome,
          medicineDetails: JSON.stringify({
            ean: medicine.ean,
            tipo: medicine.tipo,
            laboratorio: medicine.laboratorio,
            forma_administracao: medicine.forma_administracao,
            indicacoes: medicine.indicacoes,
          }),
        })
      }

      Alert.alert("Sucesso", `${selectedMedicines.length} medicamento(s) adicionado(s) para ${petName}!`)

      setSelectedMedicines([])
      setShowSearchResults(false)
      setSearchText("")
      await loadPetMedicines()
    } catch (error) {
      console.error("❌ Error saving pet medicines:", error)
      Alert.alert("Erro", "Não foi possível salvar os medicamentos")
    } finally {
      setLoading(false)
    }
  }

  const removePetMedicine = async (medicineId) => {
    Alert.alert("Confirmar remoção", "Tem certeza que deseja remover este medicamento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePetMedicine(petId, medicineId)
            Alert.alert("Sucesso", "Medicamento removido!")
            await loadPetMedicines()
          } catch (error) {
            console.error("❌ Error removing medicine:", error)
            Alert.alert("Erro", "Não foi possível remover o medicamento")
          }
        },
      },
    ])
  }

  const renderMedicineItem = ({ item }) => {
    const isSelected = selectedMedicines.find((m) => m.id === item.id)

    return (
      <TouchableOpacity
        style={[styles.medicineItem, isSelected && styles.selectedMedicineItem]}
        onPress={() => toggleMedicineSelection(item)}
        activeOpacity={0.8}
      >
        <View style={styles.medicineHeader}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{item.nome}</Text>
            {item.laboratorio && <Text style={styles.medicineDetail}>🏭 {item.laboratorio}</Text>}
            {item.tipo && <Text style={styles.medicineDetail}>🏷️ {item.tipo}</Text>}
            {item.forma_administracao && <Text style={styles.medicineDetail}>💊 {item.forma_administracao}</Text>}
            {item.ean && <Text style={styles.medicineEan}>EAN: {item.ean}</Text>}
            {item.indicacoes && (
              <Text style={styles.medicineIndications} numberOfLines={2}>
                ℹ️ {item.indicacoes}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderPetMedicineItem = ({ item }) => (
    <View style={styles.petMedicineItem}>
      <View style={styles.petMedicineInfo}>
        <Text style={styles.petMedicineName}>{item.medicineName}</Text>
        <Text style={styles.petMedicineDate}>
          Adicionado em: {new Date(item.createdAt).toLocaleDateString("pt-BR")}
        </Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removePetMedicine(item.medicineId)}>
        <Text style={styles.removeButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  )

  // Modal de configuração de endpoint
  const EndpointConfigModal = () => {
    if (!showEndpointConfig) return null

    return (
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowEndpointConfig(false)}>
          <TouchableOpacity style={styles.endpointModalContent} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Configurar Servidor</Text>

            <Text style={styles.modalLabel}>URL do Servidor:</Text>
            <TextInput
              style={styles.endpointInput}
              value={customEndpoint}
              onChangeText={setCustomEndpoint}
              placeholder="http://192.168.1.141:3000/Medicamentos"
              placeholderTextColor="#999"
            />

            <Text style={styles.helpText}>
              Dicas:{"\n"}• Descubra seu IP: ipconfig (Windows) ou ifconfig (Mac/Linux){"\n"}• Formato:
              http://SEU_IP:3000/Medicamentos{"\n"}• Exemplo: http://192.168.1.100:3000/Medicamentos
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEndpointConfig(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  setShowEndpointConfig(false)
                  if (customEndpoint.trim()) {
                    searchMedicines()
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Testar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medicamentos</Text>
          <Text style={styles.headerSubtitle}>{petName ? `Medicamentos de ${petName}` : "Gerenciar medicamentos"}</Text>
        </View>

        {/* Busca de Medicamentos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔍 Buscar Medicamentos</Text>
            <TouchableOpacity style={styles.configButton} onPress={() => setShowEndpointConfig(true)}>
              <Text style={styles.configButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Digite para filtrar ou deixe vazio para ver todos..."
              placeholderTextColor="#999"
              onSubmitEditing={searchMedicines}
            />
            <TouchableOpacity style={styles.searchButton} onPress={searchMedicines} disabled={searchLoading}>
              {searchLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Buscar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Botão para buscar todos */}
          <TouchableOpacity
            style={styles.searchAllButton}
            onPress={() => {
              setSearchText("")
              searchMedicines()
            }}
            disabled={searchLoading}
          >
            <Text style={styles.searchAllButtonText}>📋 Ver Todos os Medicamentos</Text>
          </TouchableOpacity>
        </View>

        {/* Resultados da Busca */}
        {showSearchResults && (
          <View style={styles.section}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>📋 Resultados ({medicines.length})</Text>
              {selectedMedicines.length > 0 && (
                <TouchableOpacity style={styles.saveButton} onPress={savePetMedicines}>
                  <Text style={styles.saveButtonText}>Salvar ({selectedMedicines.length})</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.listContainer}>
              {medicines.length > 0 ? (
                <FlatList
                  data={medicines}
                  renderItem={renderMedicineItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Nenhum medicamento encontrado</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Medicamentos do Pet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Medicamentos de {petName}</Text>
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#0097b2" size="large" />
                <Text style={styles.loadingText}>Carregando...</Text>
              </View>
            ) : petMedicines.length > 0 ? (
              <FlatList
                data={petMedicines}
                renderItem={renderPetMedicineItem}
                keyExtractor={(item) => `${item.petId}-${item.medicineId}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhum medicamento cadastrado para {petName}</Text>
                <Text style={styles.emptySubtext}>Use a busca acima para adicionar medicamentos</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Botão Voltar */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      {/* Modal de configuração */}
      <EndpointConfigModal />
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  configButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 8,
  },
  configButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    backgroundColor: "#005f73",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  medicineItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedMedicineItem: {
    backgroundColor: "#e3f2fd",
  },
  medicineHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#0097b2",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: "#0097b2",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  medicineDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  petMedicineItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  petMedicineInfo: {
    flex: 1,
  },
  petMedicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  petMedicineDate: {
    fontSize: 12,
    color: "#666",
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#0097b2",
  },
  bottomSpace: {
    height: 100,
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
  searchAllButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  searchAllButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  medicineEan: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
    fontFamily: "monospace",
  },
  medicineIndications: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
    fontStyle: "italic",
  },
  // Estilos do modal
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  endpointModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#0097b2",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  endpointInput: {
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#0097b2",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
})
