/* eslint-disable no-undef */
const $startParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-success')
const $stopParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-danger')
const $saveBtn = $('#saveBtn')
const $historyBtn = $('#historyBtn')
const $mainTable = $('#mainTable')
const $clearBtn = $('#btnGroup > .btn.btn-secondary')
const $historyTable = $('#historyTable')
const $deleteSelectionBtn = $('#deleteSelection')
const $exportBtn = $('#exportBtn')
const mainAPI = window.api
const dataTableLangOpts = {
  info: 'Показано _START_ - _END_ из _TOTAL_ записей',
  infoEmpty: 'Нет доступных записей',
  infoFiltered: '(отфильтровано из _MAX_ записей)',
  infoPostFix: '',
  thousands: ',',
  lengthMenu: 'Показать _MENU_ записей',
  loadingRecords: 'Загрузка...',
  processing: 'Обработка...',
  search: 'Поиск:',
  zeroRecords: 'Нет подходящих записей',
  paginate: {
    first: 'Первая',
    last: 'Последняя',
    next: 'Следующая',
    previous: 'Предыдущая'
  }
}

const mainTable = $mainTable.DataTable({
  drawCallback: function (settings) {
    const api = this.api()
    if (api.rows().count() > 0) {
      $clearBtn.removeClass('visually-hidden')
    }
  },
  stateSave: true,
  language: dataTableLangOpts
})

const historyTable = $historyTable.DataTable({
  stateSave: true,
  paging: false,
  dom: '<"top"lf>rt<"bottom"ip>',
  language: dataTableLangOpts
})

let currentProductList = []
let currentSelection
let inDatabase = false
// Do not use this at home!
let localCounter = 1
/**
 *
 * @param {Object} product
 */
function renderProduct (product) {
  Handlebars.registerHelper('increment', function (index) {
    return index + 1
  })
  if (!inDatabase) {
    currentProductList.push(product)
  }
  const templateString = `
  <tr>
  <td>${localCounter++}</td>
  <td class="data-cell"><a id="link" href="{{url}}">{{title}}</a></td>
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

function clearTable () {
  mainTable.clear().draw()
  currentProductList = []
  currentProductList.length = 0
  currentSelection = undefined
  inDatabase = false
  localCounter = 1
  $('#mainTableTitle').text('Несохранённая выборка')
  $exportBtn.addClass('visually-hidden')
}

function updateHistoryTable (selection) {
  const templateString = `
  <tr table-sm>
  <td id="selectionId" hidden>{{id}}</td>
  <td >{{timestamp}}</td> 
  <td>{{product_count}}</td> 
  <td><button id="deleteSelection" class="btn btn-danger btn-sm">
   <i class="fa fa-trash"></i>
  </button></td> 
  </tr>
  `
  const template = Handlebars.compile(templateString)
  const row = template(selection)
  historyTable.row.add($(row)).draw()
}

async function renderSavedSelection (data) {
  clearTable()
  for (const row of data) {
    renderProduct(row)
  }
  inDatabase = true
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
  inDatabase = false
  $('.btn-group.btn-group-sm > .btn.btn-danger')
    .find('span')
    .text('Остановить парсинг')
  const opts = {
    title: 'Парсинг закончен',
    message: msg,
    type: 'info'
  }
  mainAPI.sendShowDialogRequest(opts)
  $stopParsingBtn.addClass('disabled')
  $startParsingBtn.removeClass('disabled')
  localCounter = 1
})

// Listener for save button
$saveBtn.on('click', function () {
  if (inDatabase) {
    const opts = {
      title: 'Ошбика сохранения',
      message: 'Выборка уже сохранена',
      type: 'error'
    }
    mainAPI.sendShowDialogRequest(opts)
  } else if (currentProductList.length === 0) {
    const opts = {
      title: 'Ошбика сохранения',
      message: 'Невозможно сохранить пустую выборку',
      type: 'error'
    }
    mainAPI.sendShowDialogRequest(opts)
  } else {
    mainAPI.saveProducts(currentProductList)
  }
})

// Listener for save:data response
mainAPI.listenForDataSaved((event, selection) => {
  currentSelection = selection
  $('#mainTableTitle').text(currentSelection.timestamp)
  updateHistoryTable(selection)
  inDatabase = true
  $exportBtn.removeClass('visually-hidden')
})

// Listeners for buttons for opening external links
$(document).on('click', '#link', (event) => {
  event.preventDefault()
  const href = event.target.href
  mainAPI.openExternal(href)
})

// Listener for parsign stop
$stopParsingBtn.on('click', function () {
  mainAPI.sendStopParsingRequest()
  $(this).removeClass('disabled')
  $(this).addClass('disabled')
  $(this).find('span').text('Остановка...')
})

// Listener for parsing start
$startParsingBtn.on('click', async () => {
  if (currentProductList.length > 0) {
    const opts = {
      title: 'Внимание',
      message:
        'Текущая выборка не сохранена, вы уверены что хотите продолжить?',
      buttons: ['Да', 'Отмена'],
      type: 'question'
    }
    const answer = await mainAPI.sendShowDialogRequest(opts)
    if (answer.response === 1) return
  }
  clearTable()
  await mainAPI.sendParsingRequest()
  $startParsingBtn.addClass('disabled')
  $stopParsingBtn.removeClass('disabled')
})

$clearBtn.on('click', function () {
  clearTable()
  $clearBtn.addClass('visually-hidden')
})

$exportBtn.on('click', async function () {
  console.log(currentProductList)
  await mainAPI.exportData({
    products: currentProductList,
    selection: currentSelection
  })
})

// Listener for history panel
$historyBtn.on('click', () => {
  const $historyPane = $('#historyPane')

  if ($historyPane.hasClass('visually-hidden')) {
    $historyPane
      .removeClass('visually-hidden')
      .css('width', '0')
      .animate({ width: '400px' }, 200)
  } else {
    $historyPane.animate({ width: '0' }, 200, () => {
      $historyPane.addClass('visually-hidden')
    })
  }
})
// Document initialization
$(async () => {
  // Initialize history table
  const selections = await mainAPI.getSelections()
  if (selections) {
    for (const selection of selections) {
      updateHistoryTable(selection)
    }
  }
  console.log($deleteSelectionBtn.parent())
})

// Listener for deleting selection event
$('#historyTable tbody').on('click', '#deleteSelection', function () {
  const row = $(this).closest('tr')
  historyTable.row(row).remove().draw()
  const id = $(row).find('#selectionId').text()
  mainAPI.deleteSelection(id)
})

// Showing selection's products in main table on click on history table row
$('#historyTable tbody').on('click', 'tr', async function () {
  if (!inDatabase && currentProductList.length > 0) {
    const dialogOpts = {
      title: 'Внимание',
      message:
        'Текущая выборка не сохранена, вы уверены что хотите продолжить?',
      type: 'question',
      buttons: ['Да', 'Отмена']
    }
    const answer = await mainAPI.sendShowDialogRequest(dialogOpts)
    console.log(answer)
    if (answer.response !== 0) {
      return
    }
  }
  const rowData = historyTable.row(this).data()
  // eslint-disable-next-line camelcase
  const [selectionId, timestamp, product_count] = rowData
  const products = await mainAPI.getProducts(selectionId)
  console.log(products)
  await renderSavedSelection(products)
  $('#mainTableTitle').text(rowData[1])
  $exportBtn.removeClass('visually-hidden')
  // eslint-disable-next-line camelcase
  currentSelection = { id: selectionId, timestamp, product_count }
})
