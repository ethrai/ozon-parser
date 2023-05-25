const $settingsBtn = $('#settingBtn')
const $mainWindow = $('#mainWindow')
const $startParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-success')
const $stopParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-danger')
const $tables = $('#tables')
const $leftTable = $('#tableLeft')
const $rightTable = $('#tableRight')
const $saveBtn = $('#saveBtn')

let mainAPI = window.api


// Listeners and handlers. Beware of changes
$startParsingBtn.on('click', () => {
  console.log('Parsing request sent');
  mainAPI.sendParsingRequest()
})

mainAPI.handleParsingData((event, data) => {
  console.log(`Data retrieved on renderer: ${data.seller}`)
})


