const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const db = require('../util/database')
const { parseAll, sendStop } = require('../util/scrapper')
const { getSelections, getSelectionProducts, saveData } = require(
  '../util/database')

const rendererFolder = path.join(__dirname, '..', 'renderer')

if (require('electron-squirrel-startup')) {
  app.quit()
}
let mainWindow
let settingsWindow

const createSettingsWindow = () => {
  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    modal: true,
    parent: mainWindow,
    show: false,
    autoHideMenuBar: true,
  })
  settingsWindow.loadFile(path.join(rendererFolder, 'settings.html'))

  settingsWindow.once('ready-to-show', () => settingsWindow.show())

  settingsWindow.on('close', () => {
    mainWindow.webContents.send('settingsWindowClosed')
  })

}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1600, height: 1200, webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }, autoHideMenuBar: true,
  })
  mainWindow.loadFile(path.join(rendererFolder, 'index.html'))
  ipcMain.on('open:externalLink', (event, link) => {
    console.log('open:externalLink triggered')
    shell.openExternal(link)
  })
  ipcMain.on('start:parsing', async (event) => await parseAll(event))
}

async function startParsing(event) {
  await parseAll(event)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    db.closeDb()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// My handlers

async function handleCreateSettingWindow(event, ...args) {
  createSettingsWindow()
}

// My listeners

app.whenReady().then(() => {
  createWindow()
})

