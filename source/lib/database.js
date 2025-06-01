import * as SQLite from "expo-sqlite"

let db

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync("pets.db")

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        breed TEXT NOT NULL,
        age INTEGER NOT NULL,
        hasPedigree BOOLEAN NOT NULL,
        animalType TEXT NOT NULL,
        photo TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log("Pets database initialized successfully")
  } catch (error) {
    console.error("Error initializing pets database:", error)
    throw error
  }
}

export const insertPet = async (pet) => {
  try {
    const result = await db.runAsync(
      `INSERT INTO pets (name, breed, age, hasPedigree, animalType, photo) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [pet.name, pet.breed, pet.age, pet.hasPedigree ? 1 : 0, pet.animalType, pet.photo || ""],
    )

    console.log("Pet inserted with ID:", result.lastInsertRowId)
    return result.lastInsertRowId
  } catch (error) {
    console.error("Error inserting pet:", error)
    throw error
  }
}

export const getPets = async () => {
  try {
    const result = await db.getAllAsync(`
      SELECT id, name, breed, age, hasPedigree, animalType, photo 
      FROM pets 
      ORDER BY createdAt DESC
    `)

    const pets = result.map((row) => ({
      id: row.id,
      name: row.name,
      breed: row.breed,
      age: row.age,
      hasPedigree: Boolean(row.hasPedigree),
      animalType: row.animalType,
      photo: row.photo || undefined,
    }))

    console.log("Retrieved pets:", pets.length)
    return pets
  } catch (error) {
    console.error("Error getting pets:", error)
    throw error
  }
}

export const deletePet = async (id) => {
  try {
    await db.runAsync("DELETE FROM pets WHERE id = ?", [id])
    console.log("Pet deleted with ID:", id)
  } catch (error) {
    console.error("Error deleting pet:", error)
    throw error
  }
}

export const updatePet = async (id, pet) => {
  try {
    const fields = []
    const values = []

    if (pet.name !== undefined) {
      fields.push("name = ?")
      values.push(pet.name)
    }
    if (pet.breed !== undefined) {
      fields.push("breed = ?")
      values.push(pet.breed)
    }
    if (pet.age !== undefined) {
      fields.push("age = ?")
      values.push(pet.age)
    }
    if (pet.hasPedigree !== undefined) {
      fields.push("hasPedigree = ?")
      values.push(pet.hasPedigree ? 1 : 0)
    }
    if (pet.animalType !== undefined) {
      fields.push("animalType = ?")
      values.push(pet.animalType)
    }
    if (pet.photo !== undefined) {
      fields.push("photo = ?")
      values.push(pet.photo)
    }

    if (fields.length === 0) {
      throw new Error("No fields to update")
    }

    values.push(id)

    await db.runAsync(`UPDATE pets SET ${fields.join(", ")} WHERE id = ?`, values)

    console.log("Pet updated with ID:", id)
  } catch (error) {
    console.error("Error updating pet:", error)
    throw error
  }
}

// Função para obter a instância do banco (para usar em outros arquivos)
export const getDatabase = () => {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.")
  }
  return db
}
