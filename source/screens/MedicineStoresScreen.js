"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native"

import ip from '../config/config'

const { width: screenWidth } = Dimensions.get("window")

export default function MedicineStoresScreen({ navigation, route }) {
  const { petId, petName, petMedicines } = route.params || { petId: null, petName: "Pet", petMedicines: [] }

  const [loading, setLoading] = useState(true)
  const [stores, setStores] = useState([])
  const [medicineDetails, setMedicineDetails] = useState({})
  const [expandedStore, setExpandedStore] = useState(null)
  const [sortBy, setSortBy] = useState("price") // 'price' ou 'store'

  useEffect(() => {
    fetchStoresData()
    fetchMedicineDetails()
  }, [])

  const fetchStoresData = async () => {
    try {
      setLoading(true)
      console.log("🔍 Buscando dados de lojas...")

      
      const endpoints = [
       ip[1]
      ]

      let storesData = []
      let workingEndpoint = null

      // Testar endpoints configurados
      for (const endpoint of endpoints) {
        try {
          console.log(`🧪 Testando endpoint: ${endpoint}`)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos timeout

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
            storesData = data
            workingEndpoint = endpoint
            console.log(`✅ Endpoint ${endpoint} funcionando! Encontradas ${data.length} lojas`)
            break
          }
        } catch (error) {
          console.log(`❌ Endpoint ${endpoint} falhou:`, error.message)
        }
      }

      // Se nenhum endpoint funcionar, usar dados de exemplo
      if (!workingEndpoint) {
        console.log("🔄 Usando dados de exemplo para teste...")
        storesData = sampleStoresData
      }

      setStores(storesData)
    } catch (error) {
      console.error("❌ Erro ao buscar dados de lojas:", error)
      Alert.alert("Erro", "Não foi possível carregar os dados das lojas")
      setStores(sampleStoresData) // Usar dados de exemplo em caso de erro
    } finally {
      setLoading(false)
    }
  }

  const fetchMedicineDetails = async () => {
    try {
      // Extrair detalhes dos medicamentos do pet
      const details = {}

      petMedicines.forEach((medicine) => {
        try {
          const medicineId = medicine.medicineId
          const medicineName = medicine.medicineName
          let medicineInfo = { nome: medicineName }

          // Se houver detalhes adicionais em JSON, extrair
          if (medicine.medicineDetails) {
            const parsedDetails = JSON.parse(medicine.medicineDetails)
            medicineInfo = { ...medicineInfo, ...parsedDetails }
          }

          details[medicineId] = medicineInfo
        } catch (error) {
          console.error(`Erro ao processar detalhes do medicamento ${medicine.medicineName}:`, error)
        }
      })

      setMedicineDetails(details)
    } catch (error) {
      console.error("❌ Erro ao processar detalhes dos medicamentos:", error)
    }
  }

  const toggleStoreExpansion = (storeId) => {
    if (expandedStore === storeId) {
      setExpandedStore(null)
    } else {
      setExpandedStore(storeId)
    }
  }

  const getMedicinePrice = (storeId, medicineId) => {
    const store = stores.find((s) => s.id === storeId)
    if (!store) return null

    const product = store.produtos.find((p) => p.medicamentoId.toString() === medicineId.toString())
    return product ? product.preco : null
  }

  const getBestPriceInfo = (medicineId) => {
    let bestPrice = Number.POSITIVE_INFINITY
    let bestStoreId = null
    let bestStoreName = null

    stores.forEach((store) => {
      const product = store.produtos.find((p) => p.medicamentoId.toString() === medicineId.toString())
      if (product && product.preco < bestPrice) {
        bestPrice = product.preco
        bestStoreId = store.id
        bestStoreName = store.nome
      }
    })

    if (bestStoreId) {
      return { price: bestPrice, storeId: bestStoreId, storeName: bestStoreName }
    }

    return null
  }

  const getAvailableStoresForMedicine = (medicineId) => {
    return stores.filter((store) => store.produtos.some((p) => p.medicamentoId.toString() === medicineId.toString()))
  }

  const renderMedicineItem = ({ item }) => {
    const medicineId = item.medicineId
    const medicineName = item.medicineName
    const medicine = medicineDetails[medicineId] || { nome: medicineName }
    const bestPriceInfo = getBestPriceInfo(medicineId)
    const availableStores = getAvailableStoresForMedicine(medicineId)

    return (
      <View style={styles.medicineCard}>
        <View style={styles.medicineHeader}>
          <Text style={styles.medicineName}>{medicine.nome}</Text>
          {medicine.laboratorio && <Text style={styles.medicineDetail}>🏭 {medicine.laboratorio}</Text>}
        </View>

        {bestPriceInfo ? (
          <View style={styles.bestPriceContainer}>
            <Text style={styles.bestPriceLabel}>Melhor preço:</Text>
            <Text style={styles.bestPrice}>R$ {bestPriceInfo.price.toFixed(2)}</Text>
            <Text style={styles.bestPriceStore}>em {bestPriceInfo.storeName}</Text>
          </View>
        ) : (
          <Text style={styles.notAvailable}>Não disponível nas lojas consultadas</Text>
        )}

        {availableStores.length > 0 && (
          <TouchableOpacity style={styles.viewStoresButton} onPress={() => toggleStoreExpansion(medicineId)}>
            <Text style={styles.viewStoresButtonText}>
              {expandedStore === medicineId ? "Ocultar lojas" : `Ver em ${availableStores.length} lojas`}
            </Text>
          </TouchableOpacity>
        )}

        {expandedStore === medicineId && (
          <View style={styles.storesList}>
            {availableStores.map((store) => {
              const price = getMedicinePrice(store.id, medicineId)
              const isBestPrice = bestPriceInfo && bestPriceInfo.storeId === store.id

              return (
                <View key={store.id} style={[styles.storeItem, isBestPrice && styles.bestPriceStoreItem]}>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{store.nome}</Text>
                    <Text style={styles.storeAddress}>{store.endereco}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, isBestPrice && styles.bestPriceHighlight]}>R$ {price.toFixed(2)}</Text>
                    {isBestPrice && <Text style={styles.bestPriceTag}>Melhor preço</Text>}
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>
    )
  }

  const renderStoreItem = ({ item }) => {
    const store = item
    const availableMedicines = petMedicines.filter((medicine) =>
      store.produtos.some((p) => p.medicamentoId.toString() === medicine.medicineId.toString()),
    )

    if (availableMedicines.length === 0) return null

    return (
      <View style={styles.storeCard}>
        <TouchableOpacity style={styles.storeHeader} onPress={() => toggleStoreExpansion(store.id)}>
          <View style={styles.storeHeaderContent}>
            <Text style={styles.storeTitle}>{store.nome}</Text>
            <Text style={styles.storeSubtitle}>{store.endereco}</Text>
            <Text style={styles.availableMedicines}>{availableMedicines.length} medicamento(s) disponível(is)</Text>
          </View>
          <Text style={styles.expandIcon}>{expandedStore === store.id ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {expandedStore === store.id && (
          <View style={styles.medicinesList}>
            {availableMedicines.map((medicine) => {
              const medicineId = medicine.medicineId
              const medicineName = medicine.medicineName
              const price = getMedicinePrice(store.id, medicineId)
              const bestPrice = getBestPriceInfo(medicineId)
              const isBestPrice = bestPrice && bestPrice.storeId === store.id

              return (
                <View key={medicineId} style={styles.medicineListItem}>
                  <View style={styles.medicineListItemInfo}>
                    <Text style={styles.medicineListItemName}>{medicineName}</Text>
                    {isBestPrice && <Text style={styles.bestPriceTag}>Melhor preço</Text>}
                  </View>
                  <Text style={[styles.medicineListItemPrice, isBestPrice && styles.bestPriceHighlight]}>
                    R$ {price.toFixed(2)}
                  </Text>
                </View>
              )
            })}
          </View>
        )}
      </View>
    )
  }

  const renderContent = () => {
    if (sortBy === "price") {
      return (
        <FlatList
          data={petMedicines}
          renderItem={renderMedicineItem}
          keyExtractor={(item) => item.medicineId.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )
    } else {
      return (
        <FlatList
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Buscando preços nas lojas...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Preços de Medicamentos</Text>
          <Text style={styles.headerSubtitle}>Medicamentos de {petName}</Text>
        </View>

        {/* Opções de visualização */}
        <View style={styles.viewOptions}>
          <TouchableOpacity
            style={[styles.viewOption, sortBy === "price" && styles.viewOptionActive]}
            onPress={() => setSortBy("price")}
          >
            <Text style={[styles.viewOptionText, sortBy === "price" && styles.viewOptionTextActive]}>
              Por Medicamento
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewOption, sortBy === "store" && styles.viewOptionActive]}
            onPress={() => setSortBy("store")}
          >
            <Text style={[styles.viewOptionText, sortBy === "store" && styles.viewOptionTextActive]}>Por Loja</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.content}>{renderContent()}</View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Botão Voltar */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>
    </View>
  )
}

// Dados de exemplo para quando o endpoint não estiver disponível
// const sampleStoresData = [
//   {
//     id: "1",
//     nome: "PetCenter Araxá",
//     endereco: "Rua das Flores, 123 - Araxá, MG",
//     produtos: [
//       {
//         medicamentoId: 1,
//         preco: 42.5,
//       },
//       {
//         medicamentoId: 2,
//         preco: 150,
//       },
//       {
//         medicamentoId: 5,
//         preco: 32,
//       },
//       {
//         medicamentoId: 9,
//         preco: 27.3,
//       },
//       {
//         medicamentoId: 14,
//         preco: 48,
//       },
//       {
//         medicamentoId: 20,
//         preco: 65,
//       },
//       {
//         medicamentoId: 23,
//         preco: 22,
//       },
//       {
//         medicamentoId: 25,
//         preco: 55,
//       },
//       {
//         medicamentoId: 29,
//         preco: 37,
//       },
//     ],
//   },
//   {
//     id: "2",
//     nome: "VetMais Produtos",
//     endereco: "Av. Brasil, 987 - Araxá, MG",
//     produtos: [
//       {
//         medicamentoId: 2,
//         preco: 148,
//       },
//       {
//         medicamentoId: 3,
//         preco: 85,
//       },
//       {
//         medicamentoId: 4,
//         preco: 39,
//       },
//       {
//         medicamentoId: 6,
//         preco: 75,
//       },
//       {
//         medicamentoId: 10,
//         preco: 50,
//       },
//       {
//         medicamentoId: 11,
//         preco: 23.5,
//       },
//       {
//         medicamentoId: 15,
//         preco: 40,
//       },
//       {
//         medicamentoId: 18,
//         preco: 60,
//       },
//       {
//         medicamentoId: 24,
//         preco: 120,
//       },
//       {
//         medicamentoId: 28,
//         preco: 35,
//       },
//     ],
//   },
//   {
//     id: "3",
//     nome: "AnimalVet Shop",
//     endereco: "Praça Central, 45 - Araxá, MG",
//     produtos: [
//       {
//         medicamentoId: 1,
//         preco: 44,
//       },
//       {
//         medicamentoId: 7,
//         preco: 80,
//       },
//       {
//         medicamentoId: 8,
//         preco: 15,
//       },
//       {
//         medicamentoId: 12,
//         preco: 48,
//       },
//       {
//         medicamentoId: 13,
//         preco: 30,
//       },
//       {
//         medicamentoId: 16,
//         preco: 37.5,
//       },
//       {
//         medicamentoId: 17,
//         preco: 22,
//       },
//       {
//         medicamentoId: 19,
//         preco: 45,
//       },
//       {
//         medicamentoId: 21,
//         preco: 29,
//       },
//       {
//         medicamentoId: 30,
//         preco: 50,
//       },
//     ],
//   },
// ]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0097b2",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
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
  viewOptions: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 4,
  },
  viewOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  viewOptionActive: {
    backgroundColor: "#fff",
  },
  viewOptionText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    fontSize: 14,
  },
  viewOptionTextActive: {
    color: "#0097b2",
  },
  content: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  medicineCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineHeader: {
    marginBottom: 12,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  medicineDetail: {
    fontSize: 14,
    color: "#666",
  },
  bestPriceContainer: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bestPriceLabel: {
    fontSize: 12,
    color: "#0097b2",
    fontWeight: "500",
  },
  bestPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0097b2",
    marginVertical: 2,
  },
  bestPriceStore: {
    fontSize: 12,
    color: "#666",
  },
  notAvailable: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 12,
  },
  viewStoresButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  viewStoresButtonText: {
    color: "#0097b2",
    fontWeight: "600",
    fontSize: 14,
  },
  storesList: {
    marginTop: 12,
  },
  storeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bestPriceStoreItem: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    borderBottomWidth: 0,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  storeAddress: {
    fontSize: 12,
    color: "#666",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  bestPriceHighlight: {
    color: "#0097b2",
  },
  bestPriceTag: {
    fontSize: 10,
    color: "#fff",
    backgroundColor: "#0097b2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
  storeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  storeHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storeHeaderContent: {
    flex: 1,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  storeSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  availableMedicines: {
    fontSize: 12,
    color: "#0097b2",
    fontWeight: "500",
  },
  expandIcon: {
    fontSize: 16,
    color: "#0097b2",
    marginLeft: 8,
  },
  medicinesList: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  medicineListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  medicineListItemInfo: {
    flex: 1,
  },
  medicineListItemName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  medicineListItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
})
