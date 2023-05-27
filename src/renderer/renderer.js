const $settingsBtn = $('#settingBtn')
const $mainWindow = $('#mainWindow')
const $startParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-success')
const $stopParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-danger')
const $tables = $('#tables')
const $leftTable = $('#tableLeft')
const $rightTable = $('#tableRight')
const $saveBtn = $('#saveBtn')
const mainAPI = window.api
let productCount = 0

function renderProduct(product) {
  Handlebars.registerHelper('inc', (value) => parseInt(value + 1))
  console.log('rendering product')
  const templateString = `
  <tr>
  <td>{{ number }}</td>
  <td><a href="{{url}}">{{title}}</a></td>
  <td>{{price}}</td>
  <td>{{seller}}</td>
  </tr> 
  `
  productCount++
  const template = Handlebars.compile(templateString)
  const row = template(product)
  $('#leftTableBody').append(row)

}

// Listeners and handlers. Beware of changes
$startParsingBtn.on('click', () => {
  console.log('Parsing request sent');
  mainAPI.sendParsingRequest()
  // const example = {
  //   "number": 100,
  //   "title": "13.6\" Ноутбук Apple MacBook Air, Apple M2 (8C CPU, 8C GPU), RAM 8 ГБ, SSD 256 ГБ, Apple M2, macOS, (MLXY3RU/A), Silver. Уцененный товар, Российская клавиатура",
  //   "price": "4459,60",
  //   "seller": "ОМК",
  //   "url": "https://ozon.by/product/13-6-noutbuk-apple-macbook-air-apple-m2-8c-cpu-8c-gpu-ram-8-gb-ssd-256-gb-apple-m2-macos-mlxy3ru-986069909/?asb=WaCaGhuHXnu0%252Fdk1r00ZwxfPkK1Go9%252Bemo63yOABEKI%253D&asb2=wD4Nh2NxAJO4nndH9YgG2Gp-2Ix7GuNqBYfhgjIQ47qcVYkw4y9Oh9--Rusf42uT&avtc=1&avte=2&avts=1684662042"
  // }
})

mainAPI.handleParsingData((event, data) => {
  console.log(`Data retrieved on renderer: ${data.seller}`)
  renderProduct(data)
})


