import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabase('pets.db')

export const createMedicinesTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY NOT NULL,
        nome TEXT,
        ean TEXT,
        tipo TEXT,
        laboratorio TEXT,
        forma_administracao TEXT,
        indicacoes TEXT
      );`
    )
  })
}

export const insertMedicine = (medicine) => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO medicines (id, nome, ean, tipo, laboratorio, forma_administracao, indicacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        medicine.id,
        medicine.nome,
        medicine.ean,
        medicine.tipo,
        medicine.laboratorio,
        medicine.forma_administracao,
        medicine.indicacoes,
      ]
    )
  })
}

export const getMedicines = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM medicines`, [], (_, { rows }) => {
        resolve(rows._array)
      }, reject)
    })
  })
}

export const deleteAllMedicines = () => {
  db.transaction(tx => {
    tx.executeSql(`DELETE FROM medicines`)
  })
}
