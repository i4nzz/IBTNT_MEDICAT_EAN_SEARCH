import { initDatabase } from "./database"
import { initMedicinesDatabase } from "./medicinesDatabases"
import { initStoresDatabase } from "./storesDatabase"
import {initPetMedicinesDatabase} from './petMedicinesDatabase'


export const initAllDatabases = async () => {
  try {
    console.log("🔄 Initializing all databases...")

    // Inicializar banco principal (pets) primeiro
    await initDatabase()
    console.log("✅ Pets database initialized")

    // Inicializar tabela de medicamentos
    await initMedicinesDatabase()
    console.log("✅ Medicines database initialized")

    // Inicializar tabela de lojas
    await initStoresDatabase()
    console.log("✅ Stores database initialized")

    await initPetMedicinesDatabase()
    console.log("✅ MedicinesPets database initialized")

    console.log("🎉 All databases initialized successfully!")
    return true
  } catch (error) {
    console.error("❌ Error initializing databases:", error)
    throw error
  }
}

// Função para verificar se os bancos estão funcionando
export const testDatabases = async () => {
  try {
    const { getPets } = await import("./database")
    const { getMedicines } = await import("./medicinesDatabase")
    const { getStores } = await import("./storesDatabase")

    console.log("🧪 Testing databases...")

    const pets = await getPets()
    const medicines = await getMedicines()
    const stores = await getStores()

    console.log(`📊 Database status:`)
    console.log(`   - Pets: ${pets.length} records`)
    console.log(`   - Medicines: ${medicines.length} records`)
    console.log(`   - Stores: ${stores.length} records`)

    return {
      pets: pets.length,
      medicines: medicines.length,
      stores: stores.length,
    }
  } catch (error) {
    console.error("❌ Error testing databases:", error)
    throw error
  }
}
