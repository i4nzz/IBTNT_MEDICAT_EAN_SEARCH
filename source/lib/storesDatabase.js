import { getDatabase } from "./database"

let db

export const initStoresDatabase = async () => {
  try {
    // Usar o mesmo banco de dados
    db = getDatabase()

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        endereco TEXT,
        telefone TEXT,
        email TEXT,
        cnpj TEXT,
        horario_funcionamento TEXT,
        latitude REAL,
        longitude REAL,
        ativa BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log("Stores database initialized successfully")
  } catch (error) {
    console.error("Error initializing stores database:", error)
    throw error
  }
}

export const insertStore = async (store) => {
  try {
    const result = await db.runAsync(
      `INSERT INTO stores (nome, endereco, telefone, email, cnpj, horario_funcionamento, latitude, longitude, ativa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        store.nome,
        store.endereco || "",
        store.telefone || "",
        store.email || "",
        store.cnpj || "",
        store.horario_funcionamento || "",
        store.latitude || null,
        store.longitude || null,
        store.ativa !== undefined ? (store.ativa ? 1 : 0) : 1,
      ],
    )

    console.log("Store inserted with ID:", result.lastInsertRowId)
    return result.lastInsertRowId
  } catch (error) {
    console.error("Error inserting store:", error)
    throw error
  }
}

export const getStores = async () => {
  try {
    const result = await db.getAllAsync(`
      SELECT id, nome, endereco, telefone, email, cnpj, horario_funcionamento, 
             latitude, longitude, ativa
      FROM stores 
      WHERE ativa = 1
      ORDER BY nome ASC
    `)

    const stores = result.map((row) => ({
      ...row,
      ativa: Boolean(row.ativa),
    }))

    console.log("Retrieved stores:", stores.length)
    return stores
  } catch (error) {
    console.error("Error getting stores:", error)
    throw error
  }
}

export const deleteStore = async (id) => {
  try {
    // Soft delete - apenas marca como inativa
    await db.runAsync("UPDATE stores SET ativa = 0 WHERE id = ?", [id])
    console.log("Store deactivated with ID:", id)
  } catch (error) {
    console.error("Error deactivating store:", error)
    throw error
  }
}

export const updateStore = async (id, store) => {
  try {
    const fields = []
    const values = []

    if (store.nome !== undefined) {
      fields.push("nome = ?")
      values.push(store.nome)
    }
    if (store.endereco !== undefined) {
      fields.push("endereco = ?")
      values.push(store.endereco)
    }
    if (store.telefone !== undefined) {
      fields.push("telefone = ?")
      values.push(store.telefone)
    }
    if (store.email !== undefined) {
      fields.push("email = ?")
      values.push(store.email)
    }
    if (store.cnpj !== undefined) {
      fields.push("cnpj = ?")
      values.push(store.cnpj)
    }
    if (store.horario_funcionamento !== undefined) {
      fields.push("horario_funcionamento = ?")
      values.push(store.horario_funcionamento)
    }
    if (store.latitude !== undefined) {
      fields.push("latitude = ?")
      values.push(store.latitude)
    }
    if (store.longitude !== undefined) {
      fields.push("longitude = ?")
      values.push(store.longitude)
    }
    if (store.ativa !== undefined) {
      fields.push("ativa = ?")
      values.push(store.ativa ? 1 : 0)
    }

    if (fields.length === 0) {
      throw new Error("No fields to update")
    }

    values.push(id)

    await db.runAsync(`UPDATE stores SET ${fields.join(", ")} WHERE id = ?`, values)

    console.log("Store updated with ID:", id)
  } catch (error) {
    console.error("Error updating store:", error)
    throw error
  }
}
