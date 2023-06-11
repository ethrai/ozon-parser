const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const dbPath = path.join(__dirname, '..', '..', 'sqlite3.db')
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) console.error(err)
})

async function saveData (data) {
  const productCount = data.length
  db.run(
    `
      INSERT INTO Selection(product_count)
      VALUES ('${productCount}')

  `,
    function (err) {
      if (err) console.error(err)
      const lastRowId = this.lastID
      for (const product of data) {
        db.run(
          `
          INSERT INTO Product (title, price, seller, url, selection_id)
          VALUES ('${product.title}', '${product.price}', '${product.seller}',
                  '${product.url}', '${lastRowId}')
      `,
          (err) => {
            if (err) console.error(err)
          }
        )
      }
    }
  )
  return await getLatestSelection()
}

async function getLatestSelection () {
  return await new Promise((resolve, reject) =>
    db.get(
      'SELECT id, created_time AS timestamp, product_count FROM Selection WHERE id=last_insert_rowid()',
      (err, row) => {
        if (err) reject(err)
        else {
          resolve(row)
        }
      }
    )
  )
}

async function getSelectionProducts(){
  await new Promise((resolve, reject) => {
    db.all(
      `
          SELECT id, created_time AS timestamp, product_count
          FROM Selection;
      `,
      [],
      (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      }
    )
  })
}

/**
 *
 * @param {number} selectionId
 * @return {Promise<Object[]>}
 */
async function getSelection(selectionId) {
  return await new Promise((resolve, reject) => {
    db.all(
      `SELECT title, price, seller, url
            FROM Product
            WHERE selection_id = ?`,
      selectionId,
      (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      }
    )
  })
}

function deleteSelection(selectionId) {
  db.run('DELETE FROM Selection WHERE id=?', selectionId, (err) => {
    if (err) {
      console.error(err)
    }
    db.run('DELETE FROM Product WHERE selection_id = ?', selectionId, (err) => {
      if (err) {
        console.error(err)
      }
    })
  })
}

function closeDb () {
  db.close()
}

module.exports = {
  saveData,
  getSelectionProducts,
  closeDb,
  getLatestSelection,
  deleteSelection
}
