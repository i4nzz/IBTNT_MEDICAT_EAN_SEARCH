import { getDatabase } from "./database"

let db

export const initMedicinesDatabase = async () => {
  try {
    // Usar o mesmo banco de dados dos pets
    db = getDatabase()

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        ean TEXT,
        tipo TEXT,
        laboratorio TEXT,
        forma_administracao TEXT,
        indicacoes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log("Medicines database initialized successfully")
  } catch (error) {
    console.error("Error initializing medicines database:", error)
    throw error
  }
}

export const insertMedicine = async (medicine) => {
  try {
    const result = await db.runAsync(
      `INSERT INTO medicines (nome, ean, tipo, laboratorio, forma_administracao, indicacoes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        medicine.nome,
        medicine.ean || "",
        medicine.tipo || "",
        medicine.laboratorio || "",
        medicine.forma_administracao || "",
        medicine.indicacoes || "",
      ],
    )

    console.log("Medicine inserted with ID:", result.lastInsertRowId)
    return result.lastInsertRowId
  } catch (error) {
    console.error("Error inserting medicine:", error)
    throw error
  }
}

export const getMedicines = async () => {
  try {
    const result = await db.getAllAsync(`
      SELECT id, nome, ean, tipo, laboratorio, forma_administracao, indicacoes
      FROM medicines 
      ORDER BY nome ASC
    `)

    console.log("Retrieved medicines:", result.length)
    return result
  } catch (error) {
    console.error("Error getting medicines:", error)
    throw error
  }
}

export const deleteMedicine = async (id) => {
  try {
    await db.runAsync("DELETE FROM medicines WHERE id = ?", [id])
    console.log("Medicine deleted with ID:", id)
  } catch (error) {
    console.error("Error deleting medicine:", error)
    throw error
  }
}

export const updateMedicine = async (id, medicine) => {
  try {
    const fields = []
    const values = []

    if (medicine.nome !== undefined) {
      fields.push("nome = ?")
      values.push(medicine.nome)
    }
    if (medicine.ean !== undefined) {
      fields.push("ean = ?")
      values.push(medicine.ean)
    }
    if (medicine.tipo !== undefined) {
      fields.push("tipo = ?")
      values.push(medicine.tipo)
    }
    if (medicine.laboratorio !== undefined) {
      fields.push("laboratorio = ?")
      values.push(medicine.laboratorio)
    }
    if (medicine.forma_administracao !== undefined) {
      fields.push("forma_administracao = ?")
      values.push(medicine.forma_administracao)
    }
    if (medicine.indicacoes !== undefined) {
      fields.push("indicacoes = ?")
      values.push(medicine.indicacoes)
    }

    if (fields.length === 0) {
      throw new Error("No fields to update")
    }

    values.push(id)

    await db.runAsync(`UPDATE medicines SET ${fields.join(", ")} WHERE id = ?`, values)

    console.log("Medicine updated with ID:", id)
  } catch (error) {
    console.error("Error updating medicine:", error)
    throw error
  }
}
