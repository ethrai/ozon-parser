const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')
const { parseAll, stopParsing } = require('../util/parser')
const {
  // eslint-disable-next-line no-unused-vars
  getSelections,
  // eslint-disable-next-line no-unused-vars
  getSelectionProducts,
  closeDb,
  getLatestSelection,
  saveData,
  deleteSelection
} = require('../util/database')
const ObjectsToCsv = require('objects-to-csv')

const rendererFolder = path.join(__dirname, '..', 'renderer')

if (require('electron-squirrel-startup')) {
  app.quit()
}
let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true
  })
  mainWindow.loadFile(path.join(rendererFolder, 'index.html'))
  ipcMain.on('open:externalLink', (event, link) => {
    shell.openExternal(link)
  })
  ipcMain.on('start:parsing', async (event) => await parseAll(event))
  ipcMain.on('stop:parsing', async (event) => stopParsing())
  ipcMain.on('save:products', async (event, data) =>
    handleSaveData(event, data)
  )
  ipcMain.on('delete:selection', (event, id) => deleteSelection(id))
  ipcMain.handle(
    'show:dialog',
    async (event, opts) => await createDialogInfo(opts)
  )
  ipcMain.handle(
    'get:latestSelection',
    async (event) => await getLatestSelection()
  )
  ipcMain.handle('get:selections', async () => await getSelections())
  ipcMain.handle(
    'get:products',
    async (event, selectionId) => await getSelectionProducts(selectionId)
  )
  ipcMain.handle(
    'export:products',
    async (event, data) => await handleExportData(data)
  )
}

async function createDialogInfo (opts = { type: 'info', buttons: [] }) {
  return await dialog.showMessageBox(opts)
}

async function handleExportData (data) {
  const { selection, products } = data
  const selectionCsv = new ObjectsToCsv([selection])
  console.log(products)
  const productsCsv = new ObjectsToCsv(products)
  const defaultFileName = formatFileName(data.selection.timestamp)
  const path = await dialog.showSaveDialog(mainWindow, {
    title: 'Выберите директорию для сохранения выборки',
    defaultPath: defaultFileName
  })
  if (path.canceled === true) {
    createDialogInfo({
      title: 'Ошибка',
      message: 'Не удалось сохранить выборку. Проверьте правильность пути.'
    })
    return
  }
  // selectionCsv.toDisk(path.filePath, { append: true })
  productsCsv.toDisk(path.filePath, { append: true })
}

function formatFileName (timestamp) {
  let cleanedString = timestamp.replace(/[<>:"/\\|?*]/g, '')
  // Replace illegal characters with underscores
  cleanedString = cleanedString.replace(/:/g, '_')
  return cleanedString
}

async function handleSaveData (event, data) {
  const selectionObject = await saveData(data)
  if (selectionObject) {
    await createDialogInfo(
      'Успех',
      `Данные успешно сохранены: ${selectionObject.created}`
    )
    mainWindow.webContents.send('save:products:ok', selectionObject)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    closeDb()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
})
