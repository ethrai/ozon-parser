const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const dbPath = path.join(__dirname, '..', '..', 'sqlite3.db')
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, err => {
  if (err) console.error(err)
})

async function saveData (data) {
  const productCount = data.length
  db.run(`
      INSERT INTO Selection(product_count)
      VALUES ('${productCount}')

  `, function (err) {
    if (err) console.error(err)
    const lastRowId = this.lastID
    console.log(lastRowId)
    for (const product of data) {
      db.run(`
          INSERT INTO Product (title, price, seller, url, selection_id)
          VALUES ('${product.title}', '${product.price}', '${product.seller}',
                  '${product.url}', '${lastRowId}')
      `, (err) => {
        if (err) console.error(err)
      })
    }
  })
  let timestamp = await new Promise((resolve, reject) => {
    db.get('SELECT created_time FROM Selection WHERE id = last_insert_rowid()', (err, row) => {
      if (err) reject(err)
      else {
        console.log(row.created_time)
        resolve(row.created_time)
      }
    })
  })
  console.log(`Data saved successfully: ${timestamp}`)
  return timestamp
}

const getSelections = async () => await new Promise((resolve, reject) => {
    db.all(`
        SELECT id, created_time, product_count
        FROM Selection;
    `, [], (err, rows) => {
      if (err)
        reject(err)
      else
        resolve(rows)
    })
  }
)

const getSelectionProducts = async (selection_id) => {
  return await new Promise((resolve, reject) => {
    db.all(`SELECT title, price, seller, url
            FROM Product
            WHERE selection_id = ?`, [selection_id], (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

function closeDb () {
  db.close()
}

module.exports = {
  saveData,
  getSelections,
  getSelectionProducts,
  closeDb
}