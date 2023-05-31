/* eslint-disable no-undef */
const $startParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-success')
const $stopParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-danger')
const $saveBtn = $('#saveBtn')
const $historyBtn = $('#historyBtn')
const $mainTable = $('#mainTable')
const $clearBtn = $('#btnGroup > .btn.btn-secondary')
const $historyTable = $('#historyTable')
const mainAPI = window.api
const mainTable = $mainTable.DataTable({
  drawCallback: function (settings) {
    const api = this.api()
    if (api.rows().count() > 0) {
      $clearBtn.removeClass('visually-hidden')
    }
  },
  stateSave: true
})

const historyTable = $historyTable.DataTable({
  stateSave: true,
  paging: false
})

let currentProductList = []
let currentSelection

/**
 *
 * @param {Object} product
 */
function renderProduct(product) {
  currentProductList.push(product)
  const templateString = `
  <tr>
  <td>{{counter}}</td>
  <td><a id="link" href="{{url}}">{{title}}</a></td>
  <td>{{price}}</td>
  <td>{{seller}}</td>
  </tr> 
  `
  const template = Handlebars.compile(templateString)
  const row = template(product)
  mainTable.row.add($(row)).draw()
}

/**
 *
 * @param {Array<Object>} data
 */

function clearTable() {
  mainTable.clear().draw()
  currentProductList = []
  currentProductList.length = 0
}

function updateHistoryTable(selection) {
  const templateString = `
  <tr>
  <td>{{created_time}}</td> 
  <td>{{product_count}}</td> 
  <td><button class="btn btn-danger">Удалить</button></td> 
  </tr>
  `
  const template = Handlebars.compile(templateString)
  const row = template(selection)
  console.log(row)
  historyTable.row.add($(row)).draw()
}

/**
 * Listener for data retrieving from main
 */
mainAPI.listenForParsedData((event, data) => {
  renderProduct(data)
})

/**
 * Listener for save:data response
 */

// Listener for the end of parsing parse:stop
mainAPI.listenForAllDataParsed((event, msg) => {
  $stopParsingBtn.text('Остановить парсинг')
  mainAPI.sendShowDialogRequest('Парсинг закончен', msg)
  $stopParsingBtn.addClass('disabled')
})

// Listener for save button
$saveBtn.on('click', () => {
  if (currentProductList.length > 0) {
    mainAPI.sendSaveRequest(currentProductList)
  } else {
    mainAPI.sendShowDialogRequest('Ошибка',
      'Невозможно сохранить пустой список товаров', 'error')
  }
})

// Listener for save:data response
mainAPI.listenForDataSaved((event, selection) => {
  currentSelection = selection
  $('#mainTableTitle').text(currentSelection.created_time)
  updateHistoryTable(selection)
}
)

// Listeners for buttons for opening external links
$(document).on('click', '#link', (event) => {
  event.preventDefault()
  const href = event.target.href
  mainAPI.openExternal(href)
})

// Listener for parsign stop
$stopParsingBtn.on('click', () => {
  mainAPI.sendStopParsingRequest()
  $startParsingBtn.removeClass('disabled')
  $stopParsingBtn.addClass('disabled')
  $stopParsingBtn.text('Остановка...')
})

// Listener for parsing start
$startParsingBtn.on('click', () => {
  mainAPI.sendParsingRequest()
  $startParsingBtn.addClass('disabled')
  $stopParsingBtn.removeClass('disabled')
})

$clearBtn.click(() => {
  clearTable()
  $clearBtn.addClass('visually-hidden')
})

$historyBtn.click(() => {
  $('#historyPane')
    .removeClass('visually-hidden')
    .animate({ width: 'toggle' }, 200)
})
