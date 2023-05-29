const $settingsBtn = $('#settingBtn');
const $mainWindow = $('#mainWindow');
const $startParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-success');
const $stopParsingBtn = $('.btn-group.btn-group-sm > .btn.btn-danger');
const $tables = $('#tables');
const $saveBtn = $('#saveBtn');
const $mainTable = $('#mainTable');
const mainAPI = window.api;
const productCount = 0;
const mainTable = $mainTable.DataTable({
  title: 'MainTable',
  info: true,
});



const currentProductList = [];
let currentSelection;

/**
 *
 * @param {Object} product
 */
function renderProduct(product) {
  currentProductList.push(product);
  const templateString = `
  <tr>
  <td>{{counter}}</td>
  <td><a href="{{url}}">{{title}}</a></td>
  <td>{{price}}</td>
  <td>{{seller}}</td>
  </tr> 
  `;
  const template = Handlebars.compile(templateString);
  const row = template(product);
  mainTable.row.add($(row)).draw();
}

/**
 *
 * @param {Array<Object>} data
 */
function renderSecondTable(data) {
  const $secondTable =
      $(
          ` <div class="col-6">
        <table
          id="secondTable"
          class="table table-bordered table-striped table-sm"
        >
          <thead>
            <tr>
              <th scope="col">№</th>
              <th scope="col">Название</th>
              <th scope="col">Цена</th>
              <th scope="col">Продавец</th>
            </tr>
          </thead>
          <tbody id="secondTableBody"></tbody>
        </table>
      </div>
`,
      );
  const secondTable = $secondTable.DataTable();
}

// Listeners and handlers.

// Listeners

// Handlers

/**
 * Listener for data retrieving from main
 */
mainAPI.listenForParsedData((event, data) => {
  renderProduct(data);
});

/**
 * Listener for save:data response
 */

mainAPI.listenForAllDataParsed((event, msg) => {
  $stopParsingBtn.text('Остановить парсинг');
  mainAPI.sendShowDialogRequest('Парсинг закончен', msg);
});

$saveBtn.on('click', () => {
  if (currentProductList !== []) {
    mainAPI.sendSaveRequest(currentProductList);
  } else {
    mainAPI.sendShowDialogRequest('Ошибка',
        'Невозможно сохранить пустой список товаров', 'error');
  }
});

mainAPI.listenForDataSaved((event, selection) => {
      currentSelection = selection;
      $('#mainTableTitle').text(currentSelection.created_time);
    },
);

/**
 * @Description: Listener for opening external links
 */
$(document).on('click', 'a', (event) => {
  event.preventDefault();
  const href = event.target.href;
  mainAPI.openExternal(href);
});

/**
 * @Description: Button listener for stop parsing
 */
$stopParsingBtn.on('click', () => {
  mainAPI.sendStopParsingRequest();
  $startParsingBtn.removeClass('disabled');
  $stopParsingBtn.addClass('disabled');
  $stopParsingBtn.text('Остановка...');
});

/**
 * @Description: Listener for parsing start
 */
$startParsingBtn.on('click', () => {
  mainAPI.sendParsingRequest();
  $startParsingBtn.addClass('disabled');
  $stopParsingBtn.removeClass('disabled');
  // const example = {
  //   "number": 100,
  //   // eslint-disable-next-line max-len
  //   "title": "13.6\" Ноутбук Apple MacBook Air, Apple M2 (8C CPU, 8C GPU), RAM 8 ГБ, SSD 256 ГБ, Apple M2, macOS, (MLXY3RU/A), Silver. Уцененный товар, Российская клавиатура",
  //   "price": "4459,60",
  //   "seller": "ОМК",
  //   // eslint-disable-next-line max-len
  //   "url": "https://ozon.by/product/13-6-noutbuk-apple-macbook-air-apple-m2-8c-cpu-8c-gpu-ram-8-gb-ssd-256-gb-apple-m2-macos-mlxy3ru-986069909/?asb=WaCaGhuHXnu0%252Fdk1r00ZwxfPkK1Go9%252Bemo63yOABEKI%253D&asb2=wD4Nh2NxAJO4nndH9YgG2Gp-2Ix7GuNqBYfhgjIQ47qcVYkw4y9Oh9--Rusf42uT&avtc=1&avte=2&avts=1684662042"
  // };
  // renderProduct(example);
});


