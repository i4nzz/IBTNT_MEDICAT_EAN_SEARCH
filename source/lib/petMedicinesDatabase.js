import { getDatabase } from "./database"

let db

export const initPetMedicinesDatabase = async () => {
  try {
    // Aguardar a inicialização do banco principal primeiro
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Usar o mesmo banco de dados
    db = getDatabase()

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pet_medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        petId INTEGER NOT NULL,
        medicineId TEXT NOT NULL,
        medicineName TEXT NOT NULL,
        medicineDetails TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(petId, medicineId)
      );
    `)

    console.log("Pet medicines database initialized successfully")
  } catch (error) {
    console.error("Error initializing pet medicines database:", error)
    throw error
  }
}

export const insertPetMedicine = async (petMedicine) => {
  try {
    if (!db) {
      db = getDatabase()
    }

    const result = await db.runAsync(
      `INSERT OR REPLACE INTO pet_medicines (petId, medicineId, medicineName, medicineDetails)
       VALUES (?, ?, ?, ?)`,
      [petMedicine.petId, petMedicine.medicineId, petMedicine.medicineName, petMedicine.medicineDetails || ""],
    )

    console.log("Pet medicine inserted with ID:", result.lastInsertRowId)
    return result.lastInsertRowId
  } catch (error) {
    console.error("Error inserting pet medicine:", error)
    throw error
  }
}

export const getPetMedicines = async (petId) => {
  try {
    if (!db) {
      db = getDatabase()
    }

    const result = await db.getAllAsync(
      `SELECT id, petId, medicineId, medicineName, medicineDetails, createdAt
       FROM pet_medicines 
       WHERE petId = ?
       ORDER BY createdAt DESC`,
      [petId],
    )

    console.log("Retrieved pet medicines:", result.length)
    return result
  } catch (error) {
    console.error("Error getting pet medicines:", error)
    throw error
  }
}

export const deletePetMedicine = async (petId, medicineId) => {
  try {
    if (!db) {
      db = getDatabase()
    }

    await db.runAsync("DELETE FROM pet_medicines WHERE petId = ? AND medicineId = ?", [petId, medicineId])
    console.log("Pet medicine deleted for pet:", petId, "medicine:", medicineId)
  } catch (error) {
    console.error("Error deleting pet medicine:", error)
    throw error
  }
}

export const searchPetMedicines = async (petId, searchTerm) => {
  try {
    const result = await db.getAllAsync(
      `
      SELECT id, petId, medicineId, medicineName, medicineDetails, createdAt
      FROM pet_medicines 
      WHERE petId = ? AND medicineName LIKE ?
      ORDER BY medicineName ASC
    `,
      [petId, `%${searchTerm}%`],
    )

    console.log("Search pet medicines results:", result.length)
    return result
  } catch (error) {
    console.error("Error searching pet medicines:", error)
    throw error
  }
}

export const deleteAllPetMedicines = async (petId) => {
  try {
    await db.runAsync("DELETE FROM pet_medicines WHERE petId = ?", [petId])
    console.log("All medicines deleted for pet:", petId)
  } catch (error) {
    console.error("Error deleting all pet medicines:", error)
    throw error
  }
}
