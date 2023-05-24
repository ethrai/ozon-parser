const $settingsBtn = $('#settingBtn')
const $mainWindow = $('#mainWindow')
const $startParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-success')
const $stopParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-danger')
const $tables = $('#tables')
const $leftTable = $('#tableLeft')
const $rightTable = $('#tableRight')
const $saveBtn = $('#saveBtn')

let currentParsedData
let currentParsedDataTimeStamp
let mainAPI = window.api

async function parseData () {
  currentParsedData = await mainAPI.parseData()
  console.log(currentParsedData)
  showData()
}

function getData () {

}

/* 
  1) Renders table with parsed data
*/
function showData () {
  if (!currentParsedData) {
    console.error('There is no parsed data in local storage')
    return
  }
  Handlebars.registerHelper('inc', function (value) {
    return parseInt(value) + 1
  })
  const tableTemplateString = `
{{#each products}}
    <tr>
    <td>{{inc @index}}</td>
    <td><a href="{{url}}">{{title}}</a></td>
    <td>{{price}} BYN</td>
    <td>{{seller}}</td>
</tr>
{{/each}}
  `
  const template = Handlebars.compile(tableTemplateString)
  const html = template({ products: currentParsedData })
  let $leftTableBody = $('#leftTableBody')
  $leftTableBody.html(html)
}

function stopParsing () {
  mainAPI.stopParsing()
}

async function saveData () {
  currentParsedDataTimeStamp = await mainAPI.saveData(currentParsedData)
  console.log(currentParsedDataTimeStamp)
}

$startParsingBtn.on('click', parseData)
$stopParsingBtn.on('click', stopParsing)
$saveBtn.on('click', saveData)

$(document).on('click', 'a', (event) => {
  event.preventDefault()
  const href = event.target.href
  console.log(href)
  mainAPI.openExternal(href)
})
