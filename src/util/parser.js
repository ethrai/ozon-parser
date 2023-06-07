const puppeteer = require('puppeteer')

/**
 * @type puppeteer.Browser
 */
let browser
let page
let counter = 1
let isParsing = true

/**
 * @return {Promise<puppeteer.Browser>}
 */
async function init () {
  browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)' +
        'Chrome/58.0.3029.110 Safari/537.36'
    ]
  })
  page = await browser.newPage()
}

function stopParsing () {
  isParsing = false
}

/**
 * @param {Electron.IpcMainEvent} event
 * @return {Promise<void>}
 */
async function parseAll (event) {
  await init()
  await page.goto('https://ozon.by/category/noutbuki-15692/apple-26303000/', {
    waitUntil: 'domcontentloaded'
  })
  console.log(await page.title())
  const totalProducts = await page.waitForSelector(
    'xpath/html/body/div[1]/div/div[1]/div[2]/div[1]/div/div[2]/div/div/span'
  )
  const totalProductsText = await totalProducts.evaluate((el) => el.textContent)

  let msg
  const navButtonsXpath =
    'xpath/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[2]/div/div[1]/div[1]/a[position()<last()]'
  let navButtons = await page.$$(navButtonsXpath)
  console.log(navButtons.length !== 0)
  for (let i = 0; i < navButtons.length; i++) {
    if (!isParsing) {
      break
    }
    navButtons = await page.$$(navButtonsXpath)
    const btn = navButtons[i]
    const url = await btn.evaluate((b) => b.href)
    try {
      const newPage = await browser.newPage()
      await newPage.goto(url, { waitUntil: 'load' })
      await parsePage(newPage, event)
      console.log(newPage.url())
      await newPage.close()
    } catch (e) {
      console.error(`Error navigating to ${url}`)
      console.error(e)
    }
  }

  await browser.close()
  if (!isParsing) {
    msg =
      'Парсинг остановлен. Получено товаров ' +
      counter +
      ' из ' +
      totalProductsText
    event.sender.send('parse:stopped', msg)

    isParsing = true
  } else {
    msg = `Все страницы просмотрены
Получено товаров ${counter - 1} из ${totalProductsText}}`
    event.sender.send('parse:stopped', msg)
    console.log(msg)
  }
  counter = 1
}

/**
 * @param {puppeteer.Page} page
 * @param {Electron.IpcMainEvent} event
 */
async function parsePage (page, event) {
  const productsXpath =
    'xpath/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[1]/div[1]/div/div[*]'
  const titleXpath = 'xpath/div[2]/div[1]/a'
  const priceXpath = 'xpath/div[3]/div[1]/div[1]'
  const price2Xpath = 'xpath/div[3]/div[1]/span/span[1]'
  const sellerXpath = 'xpath/div[3]/div[2]/div/span/span/font'
  await page.waitForSelector(productsXpath, { timeout: 5000 })

  let products
  await page.waitForSelector(productsXpath, { timeout: 200 })
  for (let i = 0; i < 10; i++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 15))
      products = await page.$$(productsXpath)
    } catch (error) {
      console.error(`Error getting products on page ${page.url()}`)
      console.error(`Retrying... ${i}`)
    }
    if (products) {
      break
    }
  }
  for (let i = 0; i < products.length; i++) {
    // await new Promise((resolve) => setTimeout(resolve, 15));
    for (let j = 0; j < 10; j++) {
      try {
        products = await page.$$(productsXpath)
      } catch (error) {
        console.error(`Error getting products on page ${page.url()}`)
        console.error(`Retrying... ${j}`)
      }
      if (products) break
    }
    const product = products[i]
    const titleEl = await product.waitForSelector(titleXpath, { timeout: 1000 })
    const title = await titleEl.evaluate((e) => e.textContent.trim())

    const url = await titleEl.evaluate((e) => e.href)
    let priceElement
    try {
      priceElement = await product.waitForSelector(priceXpath, { timeout: 1000 })
    } catch (e) {
      priceElement = await product.waitForSelector(price2Xpath)
    }
    let price = await priceElement.evaluate((e) => e.innerText.trim())
    price = parsePrice(price)

    let seller
    try {
      const sellerElement = await product.waitForSelector(sellerXpath, {
        timeout: 5000
      })
      seller = await sellerElement.evaluate((e) => e.innerText.trim())
    } catch (e) {}
    event.sender.send('retrieve:data', {
      title,
      price,
      url,
      seller: seller ?? null
    })
    counter++
  }
}

function parsePrice (price) {
  const regex = /(\d[\d\s,.]*)\s*(BYN)/
  const match = price.match(regex)
  return match[1].replace(/\s/g, '')
}

// (async () => {
//   await parseAll()
// })()

module.exports = {
  parseAll,
  stopParsing
}
